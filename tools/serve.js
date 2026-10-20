/* ===========================================================================
   tools/serve.js — local preview server, no dependencies, no install step.

     node tools/serve.js            → http://localhost:8123
     node tools/serve.js 8130       → a different port

   Sends Cache-Control: no-store so a CSS or content edit shows up on the next
   reload instead of being served from the browser cache. Python's http.server
   does not do this, which makes it a poor choice while editing styles.
   ========================================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.argv[2], 10) || 8123;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer(function (req, res) {
  let file;
  try {
    file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (file.endsWith('/')) file += 'index.html';

  /* never let ../ walk out of the site folder */
  const target = path.resolve(ROOT, '.' + file);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(target, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found: ' + file);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(target).pipe(res);
  });
}).listen(PORT, function () {
  console.log('portfolio preview  →  http://localhost:' + PORT + '/');
  console.log('width harness      →  http://localhost:' + PORT + '/tools/preview-lab.html?w=1400&h=900');
  console.log('served from ' + ROOT + ' (no caching)');
});
