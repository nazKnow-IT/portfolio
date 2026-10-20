# Mirza Nazeef bin Mansor — portfolio site

A hand-written, dependency-free portfolio site with a searchable project gallery,
deep project write-ups, a technology explorer that links every skill back to the
projects that used it, and an embedded 3D world (`/game`) as a second way in.

No framework, no bundler, no build step. Every path is relative, so the folder
works from a double-click, from any static host, and from a subdirectory such as
`https://user.github.io/portfolio/`.

---

## 1. Run it

Any of these is enough:

```bash
node tools/serve.js            # http://localhost:8123
node tools/serve.js 8080       # pick a port
```

Open <http://localhost:8123>. The server sets `Cache-Control: no-store`, which is
the reason it exists: while you are editing CSS, Python's `http.server` lets
Chrome reuse the old stylesheet and your edits look like they had no effect.

You can also just open `index.html` from Explorer — everything renders, filters
and navigates. Only two things need a real origin: the contact form (it POSTs to
an external service) and the web fonts (they need a network).

---

## 2. What lives where

```
index.html                 one page, semantic landmarks, empty mount points
css/
  base.css                 tokens (colours, spacing, fonts), reset, typography
  layout.css               page grid, header/nav, section rhythm, breakpoints
  components.css           cards, chips, modal, lightbox, form, showcase frame
  print.css                the Ctrl/Cmd+P document (see §7)
js/
  main.js                  boot, shared App state, renders nav/hero/about/
                           education/certifications/footer, print sheet
  modules/
    util.js                DOM helpers, placeholders, verify notes, icons
    nav.js                 sticky header, scroll spy, mobile drawer, smooth scroll
    projects.js            filters, search, cards, detail modal, lightbox, deep links
    skills.js              technology explorer, tech -> project links
    showcase.js            3D slot: mount / restart / fullscreen
    contact.js             contact rows, copy-email, validated FormSubmit call
    icons.js               hand-drawn glyphs + App.iconSvg() lookup
    icons.brand.js         GENERATED — real product marks, do not hand edit
  content/                 <-- everything you edit lives in these three files
    site.config.js         identity, links, navigation, contact wiring, showcase
    skills.data.js         skill categories + skills, education, experience,
                           certifications, awards, spoken languages
    projects.data.js       categories + the six projects (full write-ups)
assets/
  img/profile.png          hero portrait
  covers/<id>.svg          card artwork (hand-drawn concept covers)
  diagrams/<id>-flow.svg   architecture / workflow diagrams shown in detail views
  cv/Mirza-Nazeef-CV.pdf   the download behind the CV buttons
game/                      the standalone 3D portfolio (see §6)
tools/
  serve.js                 preview server described above
  check-content.js         offline validator (see §3.8)
  fetch-tech-icons.js      re-downloads the brand marks into icons.brand.js
  preview-lab.html         width harness for responsive + print checking
```

`index.html` contains the section structure and empty containers; the content is
rendered by JS from `js/content/`. That is what keeps the presentation reusable:
adding a project never means editing markup.

---

## 3. Editing content

### 3.1 Identity, links, navigation — `js/content/site.config.js`

| block | what it controls |
|---|---|
| `PROFILE` | name, title, tagline, role, location, availability, photo, the About text (`intro`), the "At a glance" rows (`glance`), hero counters |
| `LINKS` | email, phone, LinkedIn, GitHub, CV file + label |
| `NAV` | section order and labels; add a row here when you add a `<section>` with the same `id` |
| `CONTACT_FORM` | whether the form exists, its endpoint, subject line |
| `SHOWCASE` | 3D slot source, blurb, control legend, frame height |

**The blank-means-empty rule.** Any link field you leave as `''` renders as a
dashed *"not linked yet"* state, not a dead hyperlink, and `tools/check-content.js`
lists it as a note. Never paste a guessed URL — fill the field or leave it blank.

Hero counters in `PROFILE.stats` must stay countable from the data below them.
If you delete a project, change the `6`.

`PROFILE.intro` is the About text, in reading order. A plain string becomes a
paragraph; `{ label: '…', text: '…' }` becomes a labelled point (the small
amber-ruled entries). `PROFILE.glance` is the "At a glance" sidebar — delete a
row to drop it, add one to get a new label/value pair. Both are content, so
neither needs a change to `js/main.js`.

### 3.2 Add a project — `js/content/projects.data.js`

Copy any object in `PROJECTS`, give it a new `id` (lowercase-hyphen; it becomes
the deep link `#/project/<id>`), and fill what you can honestly answer.
**Delete any field you cannot answer** — the renderer hides empty sections rather
than printing a stub, so an unfinished project never shows "N/A".

```js
{
  id: 'my-new-app',
  title: 'My New App',
  subtitle: 'One line about what it is',
  status: 'In development',           // shown as the badge on the cover
  period: '2026',
  role: 'Backend and database design', // keeps group work from looking solo
  solo: false,                         // true -> "built independently" badge
  categories: ['personal', 'web'],     // ids from CATEGORIES at the top of the file
  featured: false,
  cover: 'assets/covers/my-new-app.svg',
  tech: ['php', 'mysql', 'rest-api'],  // ids from skills.data.js -> powers the explorer
  summary: 'One or two sentences for the card.',
  overview: ['Paragraph one.', 'Paragraph two.'],
  problem: 'Why the project existed.',
  objectives: ['…'],
  features: ['…'],
  methodology: { name: 'Iterative build–measure–replace', steps: ['…'] },
  architecture: { caption: '…', diagram: 'assets/diagrams/my-new-app-flow.svg', flow: ['…'] },
  gallery: [{ src: '…', alt: '…', caption: '…', kind: 'screenshot' }],
  challenges: [{ problem: '…', solution: '…' }],
  results: { metrics: [{ k: '…', v: '…' }], outcomes: ['…'] },  // real numbers only
  learnings: '…',
  links: { repo: '', demo: '' },
  verify: 'Internal note — only visible at index.html?edit=1'
}
```

`tech` is the important one: the Skills explorer builds its "projects using this
technology" list from every project's `tech` array, so a skill id that no project
references shows as *studied outside the projects listed here*.

### 3.3 Add a technology — `js/content/skills.data.js`

```js
{ id: 'vue', name: 'Vue.js', cat: 'web', blurb: 'What you actually used it for.', source: 'self-taught' }
```

`cat` must be a key of `SKILL_CATS` (lang, web, mobile, ai, data, db, tools,
design). `source` is one of `academic | industry | self-taught | certified` and
renders as a small tag. There are deliberately **no proficiency bars, ratings or
percentages** anywhere in this site — keep it that way; a self-assigned 90%
invites the wrong question in an interview.

Then add that id to a project's `tech` array and the link appears.

Same file holds `EDUCATION` (institution, programme, period, coursework, academic
projects, achievements), `EXPERIENCE`, `CERTIFICATIONS` and `AWARDS`.
Certifications and awards **hide themselves when empty** — a card with no date and
no verification URL prints only the title and issuer, and the whole
"Certifications & Achievements" section disappears if both lists are empty.

### 3.4 Icons for a technology, certificate or award

Every skill tile, every technology chip (on cards, in the detail view and under a
certificate), the selected-technology panel, the certification seals, the award
rows and the education achievement lines all draw from one lookup,
`App.iconSvg(id)`, which returns an inline `<svg>` tinted by `currentColor` — so
an icon always wears the colour of the category it sits in, and it prints in black.

Two sources feed it:

* **`js/modules/icons.brand.js`** — generated. Real product marks (Python, React,
  MySQL, Flutter, MediaPipe, Git, Google…) vendored from simpleicons.org by
  `node tools/fetch-tech-icons.js`. Never hand edit it; add the id to the `SLUGS`
  table in that tool and re-run it.
* **`js/modules/icons.js`** — hand-drawn line glyphs for the things that are not a
  product (`rest-api`, `cnn`, `lstm`, `rbac`, `uat`, `responsive-ui`,
  `dataset-pipeline`…) and for the brands whose artwork is no longer available to
  reuse (Microsoft, Adobe, AWS, Canva, Tableau, SAS, SPSS).

Add a new technology: give it an entry in one of those two tables. If you skip it,
the tile falls back to its initials — it never shows an empty box, and
`node tools/check-content.js` fails the build with the exact id to fix, so an
iconless skill cannot survive an edit.

Two honesty rules built into this: a glyph is chosen for what the technology *is*,
never an invented logo for a brand we could not fetch, and an icon is not a claim
of endorsement — path data from Simple Icons is CC0 while the trademarks stay with
their owners and are used only to name the technology you actually use.

### 3.5 Pictures

* Card artwork: `assets/covers/<something>.svg` — point `cover` at it. A 16:9 or
  1:1 raster works too.
* Real screenshots: put them in `assets/projects/` and add a `gallery` entry with
  `kind: 'screenshot'`. Captions must say what the image is; the current covers
  are labelled *"concept illustration, not a screenshot"* precisely so nobody
  mistakes hand-drawn art for shipped UI.
* Architecture: `assets/diagrams/<id>-flow.svg`, plus a `flow` array of text
  steps — that array is what prints and what screen readers get.
* Portrait: replace `assets/img/profile.png` (keep it near-square, 284×282).

### 3.6 CV

Drop the file in `assets/cv/` and update `LINKS.cvFile` and `LINKS.cvLabel`. The
header button, the hero button and the contact row all read those two values.
`index.html` also carries the same href on the header button as a no-JavaScript
fallback, so change it there too or a visitor with JS disabled gets the old file.
PDF is the better format: phones offer "save" rather than a broken preview for
`.docx`, and recruiters cannot accidentally edit it.
Keep the filename free of spaces (`Mirza-Nazeef-CV.pdf`) — URLs encode spaces as
`%20` and some hosts mishandle them.

### 3.7 Authoring mode

Open `index.html?edit=1` while working. It reveals the `.verify-note` prompts —
"add the completion date here", "this project has no repo URL", "no screenshots
published yet" — that are otherwise invisible to visitors. Recruiters never see
them; they are for you.

### 3.8 Check your edits

```bash
node tools/check-content.js
```

Runs without a browser. It verifies every `categories` id exists, every `tech` id
resolves to a real skill, every skill and certificate icon exists in one of the two
icon tables, every referenced image and CV file exists on disk, every project id is
unique, and it prints the placeholder list. It exits non-zero if you broke a
reference; the `notes:` lines are the honest gaps, not errors.

---

## 4. Contact form

The form posts to **FormSubmit.co** — no account, no API key, nothing to install.
It is wired in `js/content/site.config.js → CONTACT_FORM.endpoint`.

**Do this once, after deploying:**

1. Deploy the site (see §8) so the form has a real origin.
2. Open the live page, submit a test message from the form.
3. FormSubmit emails `mmirzanazeeff@gmail.com` an activation link. **Open it from
   the same browser.** Until you click it, submissions get FormSubmit's own
   "please confirm" notice back to the sender.
4. Send a second message and check it lands in the inbox.

Worth knowing: the first-activation email goes to *your* address, so run step 2
after the site is public, not while it is on `localhost` — FormSubmit records the
origin that submitted it.

Extras already in place: a `_honey` honeypot field (a filled hidden input means a
bot, and the message is discarded), inline validation on blur with `aria-invalid`
and `role="alert"` messages, a JSON/AJAX post so the visitor stays on the page, and
honest failure text that offers the direct email address if the relay is
unreachable. With JavaScript off the page still prints the email and the readable
version of the showcase in a `<noscript>` note, though the contact rows and the
form itself are rendered by JS. Set `CONTACT_FORM.enabled = false` to remove the
form and keep only the direct links.

Never test the form by submitting junk to your own inbox from automation — the
endpoint is live the moment `enabled` is true.

---

## 5. Skills explorer and project detail behaviour (reference)

* Projects: instant category filter + free-text search across title, subtitle,
  summary, technology names and features; both combine; the result count and an
  empty state are announced through `role="status"`.
* Detail view: opens as a modal with `#/project/<id>` in the URL, so it is
  linkable and survives refresh and Back. Prev/Next walk the filtered set;
  gallery images open in a lightbox.
* Skills: category chips + search; selecting a technology reveals its description,
  where it was learned and the projects that use it — clicking one opens that
  project's detail view.
* The Ctrl/Cmd+P document replaces the cards with the complete project text, so a
  printed or PDF-exported copy is a readable portfolio, not a screenshot of a
  gallery.

---

## 6. The 3D showcase (`/game`)

`/game` is a self-contained three.js world with its own HTML, CSS, JS and a
bundled `libs/three.min.js`. The main site only ever points an iframe at it, so
**swapping in a new build means replacing the files inside `/game` and touching no
site code.** Open it directly at `/game/index.html` to work on it alone.

Configure the slot in `site.config.js → SHOWCASE`:

| key | effect |
|---|---|
| `src` | what to embed — `game/index.html` by default |
| `height` | frame height in px (the frame scales to width) |
| `blurb` | the paragraph above the frame |
| `controls` | the key legend under the frame |

Behaviour: on a desktop with motion allowed the world starts automatically when
the section scrolls near the viewport; on touch devices and for
`prefers-reduced-motion` visitors it stays a poster with a **Load the 3D world**
button, so nobody's GPU wakes up unasked. **Restart world** reloads the scene,
**Open fullscreen** requests fullscreen on the frame (with a text fallback if the
browser blocks it), and the game hides its own "← Portfolio site" link when it
detects it is framed. Inside the game, `P` switches to the readable page version —
the same content without WebGL — which is also the automatic fallback if the
context cannot start.

To change the world itself, edit `game/js/data.js`: `STOPS` holds the seven
checkpoints (position, colour, title, copy, the skills each one unlocks). It is
independent of the site's data files by design; keep the wording consistent when
you change one.

Backup: the pre-move copy of the original game lives at
`D:\portfolio-backups\playable-portfolio-backup-2026-10-19.zip`, outside this
site folder so it never gets deployed.

---

## 7. Print / PDF

`css/print.css` strips the header, nav, toolbars, chips, modals and the 3D frame,
forces black-on-white, prints the full text of external links after each URL, and
swaps the card grid for `#print-sheet` — the complete project write-ups built by
`js/modules/projects.js`. `Ctrl/Cmd+P` therefore produces a document a recruiter
can read on paper. A4 with 14/13 mm margins is the target; cards use
`break-inside: avoid`.

The one trap in here: `print.css` is linked with `media="print"`, so nothing in it
applies while browsing. A rule that must hide something on screen but show it on
paper (`.print-only`) therefore lives in `base.css` — put it in `print.css` instead
and the entire project text reappears below the footer.

---

## 8. Deploy

Any static host. Nothing to build, so the build command stays empty and the
publish directory is the project root.

### Netlify (recommended — free HTTPS, deploy previews)

* **Drag and drop:** <https://app.netlify.com/drop> → drag the whole `portfolio`
  folder in. Live in seconds at `your-site.netlify.app`.
* **Or from Git:** *Add new site → Import an existing project*, then
  *Build command:* **(empty)** and *Publish directory:* **`.`** (a single dot).
  Push to deploy.
* Then do §4 (activate FormSubmit) from the live URL.

### GitHub Pages

```bash
cd portfolio
git init && git add -A && git commit -m "portfolio site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Repo → **Settings → Pages → Source: Deploy from a branch → `/ (root)` → Save**.
The site appears at `https://<you>.github.io/<repo>/`.

Because every path is relative it also works served from that subdirectory. Two
follow-ups: create an empty file named `.nojekyll` in the root (Pages runs Jekyll
and can otherwise mishandle `_`-prefixed files), and put the personal-site URL in
`LINKS` if you keep one.

### Cloudflare Pages / Vercel / S3 / cPanel

Upload or point at the repo with no build step and the root as the output
directory. On object-storage hosts, enable static-site hosting with
`index.html` as the index document.

### Your own host / ISP

`scp -r portfolio/* user@host:/var/www/html/` — or FTP the folder contents. No
server-side runtime is needed.

---

## 9. After deploying — the five-minute checklist

1. `https://your-domain/` loads, header nav scrolls to every section, mobile
   drawer opens and closes.
2. Open a project, copy the address bar URL, paste it in a new tab, refresh —
   the same project opens.
3. Skills → search `PHP` → select it → the POS project appears.
4. Scroll to **3D Showcase** — the world starts (desktop) or the Load button
   works (phone). Tap **Open fullscreen**.
5. Filter **AI & Machine Learning**, then clear, then search `barcode` — the
   result count updates and the empty state appears for a nonsense query.
6. Submit the contact form once and click FormSubmit's activation email (§4).
7. Click **CV** — the file downloads instead of opening in the browser.
8. `Ctrl/Cmd+P` → preview is a clean text document with URLs printed inline.
9. Paste the URL into <https://pagespeed.web.dev/> — a static page with no
   framework should be comfortable.
10. Fill the JSON-LD `"url"` field at the top of `index.html` with the live
    address so search engines get the right canonical person record.

---

## 10. Things that still need real information from you

These are content gaps, not bugs. Each renders as an honest placeholder today; the
site never invents an answer.

* **GitHub profile URL** (`LINKS.github`) and a **repo URL per project**
  (`links.repo`). Six projects currently show "repository not linked".
* **A live demo URL** where one exists. Client work (`Fizar`, `ClickPixel`) should
  stay unpublished until the company approves it.
* **Certificate dates and verification URLs** — the five certifications carry no
  date or URL yet, so those cards print title + issuer only.
* **Coursework/module titles** for the degree entry, if you want them listed.
* **Real project screenshots** — app screens for SignSpeak, the POS dashboard, the
  MediaPipe skeleton overlay. Concept covers and flow diagrams are placeholders
  for art, not for evidence.
* **`game/assets/favicon.svg`** is a copy of the site's — change one, change both.

---

## 11. Accessibility and responsive testing you can repeat

```
http://localhost:8123/tools/preview-lab.html?w=390&h=844
                                     ?w=1060&h=800    &page=../index.html
                                     ?w=1400&print=1  -> the print document, no dialog
```

`preview-lab.html` renders the site inside a frame of the width you ask for and
sizes the outer page to match, so a full-page screenshot is exactly that viewport.
It was used to sweep 1400 / 1240 / 1060 / 900 / 768 / 620 / 480 / 390 / 360 / 320
with the modal open: zero horizontal overflow at every width. Keyboard: Tab order
follows the DOM, a skip link precedes the header, and focus is always visible.
`Esc` closes one layer at a time — the lightbox first, then the project modal
(which hands focus back to the card you opened it from and clears the
`#/project/…` URL), then the mobile drawer. The modal and the lightbox each trap
their own Tab cycle, so keyboard focus cannot leak behind an open overlay.
