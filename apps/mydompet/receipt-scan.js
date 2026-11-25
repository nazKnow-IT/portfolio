(() => {
  const input = document.querySelector('#receipt');
  if (!input) return;

  const status = document.querySelector('#receiptScanStatus');
  const scanButton = document.querySelector('#scanReceipt');
  let workerPromise;

  function setStatus(message, busy = false) {
    status.textContent = message;
    status.classList.toggle('busy', busy);
    scanButton.disabled = busy;
  }

  function loadOcr() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (!workerPromise) {
      workerPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => resolve(window.Tesseract);
        script.onerror = () => {
          workerPromise = null;
          reject(new Error('Could not load the receipt reader. Check your internet connection and try again.'));
        };
        document.head.appendChild(script);
      });
    }
    return workerPromise;
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const source = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(source);
        const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not prepare this image.')), 'image/jpeg', .84);
      };
      image.onerror = () => {
        URL.revokeObjectURL(source);
        reject(new Error('Could not open this image.'));
      };
      image.src = source;
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not save the compressed receipt image.'));
      reader.readAsDataURL(blob);
    });
  }

  function parseReceipt(text) {
    const lines = text.split(/\r?\n/).map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const merchant = lines.find(line => line.length > 2 && line.length < 48 && !/^(receipt|tax invoice|invoice|cash|copy|customer copy|thank you|www\.|tel\b)/i.test(line) && !/\b\d{2,}[-/]\d{2,}/.test(line));
    const datePatterns = [
      /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/,
      /\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/
    ];
    let date = null;
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (!match) continue;
        if (match[0].startsWith('20') && match[1].length === 4) {
          date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        } else {
          let year = Number(match[3]);
          if (year < 100) year += year < 70 ? 2000 : 1900;
          let day = Number(match[1]), month = Number(match[2]);
          if (month > 12 && day <= 12) [day, month] = [month, day];
          if (day <= 31 && month <= 12) date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (date) break;
      }
      if (date) break;
    }
    // Amounts may be printed as "RM14.70", "RM 14.70" or "14.70". The lookarounds
    // stop a match inside a longer number without needing a word boundary after "RM".
    const MONEY = /(?<![\d.,])(\d{1,5}(?:,\d{3})*\.\d{2})(?!\d)/g;
    const RM_MONEY = /RM\s*(\d{1,5}(?:,\d{3})*\.\d{2})(?!\d)/gi;
    const toNumber = value => Number(value.replace(/,/g, ''));
    let amount = null;
    // Prefer the strongest total label; a plain "total" must not be a "subtotal".
    const totalPatterns = [
      /\b(grand\s*total|amount\s*due|total\s*due|net\s*total|balance\s*due|total\s*amount)\b/i,
      /(?<!sub\s?)\btotal\b/i
    ];
    for (const pattern of totalPatterns) {
      const totalLines = lines.filter(line => pattern.test(line));
      for (const line of totalLines.reverse()) {
        const values = [...line.matchAll(MONEY)];
        if (values.length) { amount = toNumber(values.at(-1)[1]); break; }
      }
      if (amount != null) break;
    }
    if (amount == null) {
      const values = [...text.matchAll(RM_MONEY)];
      if (values.length) amount = toNumber(values.at(-1)[1]);
    }
    return { merchant, date, amount };
  }

  async function scan() {
    const file = input.files?.[0];
    if (!file) {
      setStatus('Take a photo or choose a receipt image first.');
      return;
    }
    try {
      setStatus('Preparing receipt image…', true);
      const image = await compressImage(file);
      window.myDompetReceiptData = await blobToDataUrl(image);
      const tesseract = await loadOcr();
      setStatus('Reading receipt text… this may take a little while on the first scan.', true);
      const worker = await tesseract.createWorker('eng', 1, {
        logger: event => {
          if (event.status === 'recognizing text' && event.progress) {
            setStatus(`Reading receipt… ${Math.round(event.progress * 100)}%`, true);
          }
        }
      });
      let text;
      try {
        ({ data: { text } } = await worker.recognize(image));
      } finally {
        await worker.terminate();
      }
      if (!text.trim()) throw new Error('No text found. Try a clearer, well-lit photo.');

      const fields = parseReceipt(text);
      if (fields.merchant) document.querySelector('#merchant').value = fields.merchant;
      if (fields.amount != null && fields.amount > 0) document.querySelector('#amount').value = fields.amount.toFixed(2);
      if (fields.date) document.querySelector('#date').value = fields.date;
      const category = document.querySelector('#category');
      const merchantInput = document.querySelector('#merchant');
      merchantInput.dispatchEvent(new Event('input', { bubbles: true }));
      const found = [merchantInput.value, ...text.split(/\r?\n/).slice(0, 8)].join(' ');
      const suggested = window.myDompetSuggest?.(found);
      if (suggested) category.value = suggested;

      const foundFields = [fields.merchant && 'merchant', fields.date && 'date', fields.amount != null && 'total'].filter(Boolean);
      setStatus(foundFields.length
        ? `Found ${foundFields.join(', ')}. Check the details before saving.`
        : 'Receipt text was read, but the main details were unclear. Fill them in and check the image.');
    } catch (error) {
      setStatus(error.message || 'Receipt scan failed. You can still enter the details manually.');
    }
  }

  input.addEventListener('change', () => {
    if (input.files?.[0]) {
      setStatus('Receipt selected. Scan it to fill in the expense details.');
      compressImage(input.files[0]).then(blobToDataUrl).then(data => { window.myDompetReceiptData = data; }).catch(() => {});
    }
  });
  scanButton.addEventListener('click', scan);
})();
