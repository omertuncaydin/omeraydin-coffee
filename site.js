/* omeraydin.coffee v2026-11-27a
   Reads window.siteContent (content.js) and fills the film, portrait and learner cards.
   Asks the store behind the site manager which blocks are switched off, which classes are on the calendar,
   which photos were uploaded for the learner cards and which texts were written there, and sends the message form there.
   Plays the recording of the research block when its button is pressed.
   Keeps the glass menu readable: sets data-tone on the header from what is under its labels.
   Serves both pages: index.html in English and tr.html in Turkish (see TR below). */
(() => {
  'use strict';
  const content = window.siteContent || {};
  const root = document.documentElement;
  /* The Turkish page (tr.html) says lang="tr". Its texts stand in tr.html, each with a key "tr:…" of its own in the
     store; pictures, the recording, the switched-off blocks and the orders are the same for both pages. What this
     script writes itself (dates, the lines of the form, a few labels) and the words of the cards follow TR. */
  const TR = root.lang === 'tr';
  const SAY = TR ? {
    menuOpen: 'Menüyü aç', menuClose: 'Menüyü kapat', film: 'Film: Ömer Aydın ile kahve eğitimi',
    more: 'Devamını oku', less: 'Daha az göster', logoOf: (company) => company + ' logosu', photoOf: (name) => name + ' fotoğrafı',
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    to: '–', toWide: ' – ', langs: { turkish: 'Türkçe', english: 'İngilizce' }, inLang: (lang) => lang, details: 'eğitim ayrıntıları',
    email: 'Lütfen e-posta adresini kontrol edip yeniden deneyin.', message: 'Lütfen birkaç kelime yazın (en fazla 4.000 karakter).',
    busy: 'Şu anda çok fazla mesaj var. Lütfen birkaç dakika sonra yeniden deneyin.', sending: 'Gönderiliyor…',
    thanks: 'Teşekkürler. Mesajınız Ömer’e ulaştı.', failed: 'Mesaj gönderilemedi. Lütfen biraz sonra yeniden deneyin ya da Instagram’dan yazın.'
  } : {
    menuOpen: 'Open menu', menuClose: 'Close menu', film: 'Film: coffee education with Ömer Aydın',
    more: 'Read more', less: 'Show less', logoOf: (company) => 'Logo of ' + company, photoOf: (name) => 'Photo of ' + name,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    to: ' to ', toWide: ' to ', langs: {}, inLang: (lang) => 'in ' + lang, details: 'course details',
    email: 'Please check the email address and try again.', message: 'Please write a few words (up to 4,000 characters).',
    busy: 'Too many messages just now. Please try again in a few minutes.', sending: 'Sending…',
    thanks: 'Thank you. Your message has reached Ömer.', failed: 'That did not go through. Please try again in a moment, or write on Instagram.'
  };
  const $ = (sel) => document.querySelector(sel);
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  const arrow = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const set = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
    for (const key of Object.keys(set)) svg.setAttribute(key, set[key]);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M6.5 17.5l11-11M8 6.5h9.5V16');
    svg.append(path);
    return svg;
  };
  const plainClick = (event) => !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button);

  /* menu button on small screens */
  const header = $('.hd');
  const menuBtn = $('.menu-btn');
  if (header && menuBtn) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? SAY.menuClose : SAY.menuOpen);
    };
    menuBtn.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    header.addEventListener('click', (event) => {
      if (event.target.closest('.nav a, .hd-cta a')) setOpen(false);
    });
    /* the open menu lies over the page: a tap anywhere else closes it */
    document.addEventListener('click', (event) => {
      if (header.classList.contains('is-open') && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        menuBtn.focus();
      }
    });
  }

  /* The language switch of the top bar is a link to the other page. A press also tells this browser which language
     was chosen (the English page sends a visitor who chose Turkish on to the Turkish one, see the head of
     index.html), and notes the block in the middle of the window, so that the other page opens at the same block. */
  const PLACE = 'oa-place';
  const pageBlocks = () => [...document.querySelectorAll('main > section, footer')];
  for (const go of document.querySelectorAll('.lang-go')) {
    go.addEventListener('click', (event) => {
      try { localStorage.setItem('oa-lang', TR ? 'en' : 'tr'); } catch (error) { /* private mode: the link works without it */ }
      if (!plainClick(event)) return;
      try {
        sessionStorage.removeItem(PLACE);
        const blocks = pageBlocks();
        const middle = window.innerHeight / 2;
        const n = blocks.findIndex((el) => el.getClientRects().length && el.getBoundingClientRect().bottom > middle);
        if (n < 0 || window.scrollY < 8) return;   /* at the very top the other page opens at its top */
        const box = blocks[n].getBoundingClientRect();
        sessionStorage.setItem(PLACE, JSON.stringify({ n, part: (middle - box.top) / Math.max(1, box.height), at: Date.now() }));
      } catch (error) { /* without it the other page opens at its top */ }
    });
  }
  const arrive = () => {
    let from = null;
    try {
      from = JSON.parse(sessionStorage.getItem(PLACE) || 'null');
      sessionStorage.removeItem(PLACE);
    } catch (error) {
      from = null;
    }
    if (!from || typeof from.n !== 'number' || typeof from.part !== 'number' || !(Date.now() - from.at < 30000) || location.hash.length > 1) return;
    const block = pageBlocks()[from.n];
    if (!block || !block.getClientRects().length) return;
    const box = block.getBoundingClientRect();
    root.style.scrollBehavior = 'auto';   /* arriving must not glide */
    window.scrollTo(0, Math.max(0, window.scrollY + box.top + Math.min(1, Math.max(0, from.part)) * box.height - window.innerHeight / 2));
    root.style.scrollBehavior = '';
  };

  /* glass menu: label colour follows what passes under the labels.
     No tone at the top of the page, "page" once scrolled, "media" over a photo or the film, "dark" over dark panels.
     The blocks that count as media or dark carry data-surface in index.html. */
  let retone = () => {};
  if (header) {
    const inkBox = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return range.getBoundingClientRect();
    };
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    let queued = false;
    const setTone = () => {
      queued = false;
      const labels = [];
      for (const node of header.querySelectorAll('.brand, .nav a, .menu-btn svg')) {
        const box = node.matches('svg') ? node.getBoundingClientRect() : inkBox(node);
        if (box.width && box.height) labels.push({ left: box.left - 4, right: box.right + 4, top: box.top - 4, bottom: box.bottom + 4 });
      }
      let tone = window.scrollY > 8 ? 'page' : '';
      for (const zone of document.querySelectorAll('[data-surface]')) {
        const box = zone.getBoundingClientRect();
        if (!box.width || !box.height || !labels.some((label) => overlaps(label, box))) continue;
        tone = zone.dataset.surface === 'media' && tone !== 'dark' ? 'media' : 'dark';
      }
      if (tone) header.dataset.tone = tone;
      else delete header.dataset.tone;
    };
    const queueTone = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(setTone);
    };
    retone = queueTone;
    window.addEventListener('scroll', queueTone, { passive: true });
    window.addEventListener('resize', queueTone);
    window.addEventListener('load', queueTone);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueTone);
    setTone();
  }

  let hush = () => {};   /* stops the recording of the research block (set further down) */
  let refit = () => {};  /* fits the open sheet of the research block to its size again (set further down) */

  /* film: nothing loads from YouTube until the visitor presses play */
  const film = $('#film');
  const videoId = /^[\w-]{11}$/.test(content.youtubeId || '') ? content.youtubeId : '';
  if (film && videoId) {
    const watchUrl = 'https://youtu.be/' + videoId;
    film.href = watchUrl;
    const filmLink = $('#film-link');
    if (filmLink) filmLink.href = watchUrl;
    film.addEventListener('click', (event) => {
      if (!plainClick(event)) return;
      event.preventDefault();
      hush();
      const player = document.createElement('iframe');
      player.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
      player.title = SAY.film;
      player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      player.allowFullscreen = true;
      const frame = make('div', 'film-frame');
      frame.dataset.surface = 'media';
      frame.append(player);
      const box = make('div', 'film is-playing');
      box.id = 'film';
      box.append(frame);
      film.replaceWith(box);
      player.focus();
    });
  } else if (film) {
    /* no video set: keep the photo, drop the play sticker and the film link */
    const still = make('div', 'film');
    still.id = 'film';
    const frame = film.querySelector('.film-frame');
    if (frame) still.append(frame);
    film.replaceWith(still);
    const caption = $('#film-caption');
    if (caption) caption.hidden = true;
  }

  /* portrait file from content.js, shown uncropped */
  const portrait = $('#portrait');
  if (portrait && content.portrait && portrait.getAttribute('src') !== content.portrait) {
    const probe = new Image();
    probe.onload = () => {
      portrait.removeAttribute('width');
      portrait.removeAttribute('height');
      portrait.src = content.portrait;
    };
    probe.src = content.portrait;
  }

  /* background pop-up: the CoffeeNutz button under "Your instructor" opens it.
     Without scripts, with a modifier key or in a browser without <dialog>, the button stays a link to coffeenutz.net. */
  const card = $('#bg');
  const cardBtn = $('#bg-open');
  if (card && cardBtn && typeof card.showModal === 'function') {
    cardBtn.setAttribute('aria-haspopup', 'dialog');
    cardBtn.addEventListener('click', (event) => {
      if (!plainClick(event)) return;
      event.preventDefault();
      card.showModal();
      card.scrollTop = 0;
    });
    card.addEventListener('click', (event) => {
      if (event.target === card || event.target.closest('[data-close]')) card.close();   /* the dark surround, or a close button */
    });
  }

  /* learners: every entry with a quote and a name, three to a row on a wide screen.
     A card with a headline or an id: photo (if any), headline (if any), the quote in small type (three lines, the
     rest behind "Read more", see fitQuotes), then the name in bold with "position · company" under it (without
     a headline: the course), and before them the logo of the card when the site manager holds one that is switched on.
     An entry with neither: the quote in large type and "name · course", as before v2026-11-20d.
     The photo of a card is the one uploaded in the site manager, else the file named in content.js (see setPhotos).
     A card with an id carries data-vis="learner:<id>", so the site manager can switch it off like any other block.
     starts: "hidden" turns that around: the card stays off until the site manager switches it on (see setHidden).
     For a card with an id the site manager can also write another headline, name, title, company or quote, and
     another order for the cards (see setCards): what it wrote is laid over what content.js says. */
  const text = (v) => (typeof v === 'string' ? v.trim() : '');
  const LEARNER_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const PHOTO_PATH = /^learners\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/;
  const PHOTO_AT = /^(?:100|\d{1,2})% (?:100|\d{1,2})%$/;
  const CARD_TEXT = { headline: 200, name: 80, position: 80, company: 120, quote: 1500 };   /* what can be written for a card, and how long it may be */
  const LOGO_PATH = /^logos\/[a-z0-9]+(?:-[a-z0-9]+)*-([1-9]\d{0,3})x([1-9]\d{0,3})\.(?:png|webp)$/;   /* a logo uploaded in the site manager; its size in pixels is part of its name */
  /* how large a logo stands next to its name: never taller than 48 px or wider than 96 px, and a wide one a little
     lower, so that a wide logo and a tall one weigh about the same */
  const logoSize = (w, h) => {
    const shape = w / h;
    const high = Math.min(48, 96 / shape, Math.sqrt(2400 / shape));
    return [Math.max(1, Math.round(high * shape)), Math.max(1, Math.round(high))];
  };
  const cards = [];    /* one entry per card that can carry a photo: { figure, slot, alt, file, fileAt, img, want } */
  const people = [];   /* one entry per card: { id, q (its entry in content.js), figure, laid, card, drawn } */
  const quotes = (content.testimonials || []).filter((q) => q && text(q.quote) && text(q.name))
    .filter((q) => q.starts !== 'hidden' || LEARNER_ID.test(text(q.id)));   /* a card that starts hidden and has no id could never be switched on */
  const quoteSection = $('#quotes');
  const quoteGrid = $('#quote-grid');
  /* the words of one card: what the site manager wrote for it (texts), else what content.js says. Only the words
     are put in again; the photo stays where it is. */
  const drawCard = (person, texts) => {
    const q = person.q;
    const english = (field) => {
      const over = person.id && texts ? texts['learner:' + person.id + ':' + field] : null;
      if (typeof over !== 'string' || over.length > CARD_TEXT[field]) return text(q[field]);
      const clean = over.replace(/\s+/g, ' ').trim();
      return clean || (field === 'name' || field === 'quote' ? text(q[field]) : '');   /* a card always has a name and a quote */
    };
    /* On the Turkish page: what the site manager holds under "tr:l-<id>-<field>", else the Turkish of content.js
       (tr: {…}; for the quote also the review as it was written, when that is kept there), else the English words.
       The name is the same on both pages. */
    const said = (field) => {
      if (!TR || field === 'name') return english(field);
      const own = q.tr && typeof q.tr === 'object' ? text(q.tr[field]) : '';
      const base = own || (field === 'quote' ? text(q.original) : '') || english(field);
      const over = person.id && texts ? texts['tr:l-' + person.id + '-' + field] : null;
      if (typeof over !== 'string' || over.length > CARD_TEXT[field]) return base;
      const clean = over.replace(/\s+/g, ' ').trim();
      return clean || (field === 'quote' ? base : '');
    };
    const headline = said('headline'), name = said('name'), position = said('position'), company = said('company'), quote = said('quote');
    /* the logo: the file the site manager uploaded for this card, unless it is switched off there */
    const logoPath = person.id && texts && typeof texts['learner:' + person.id + ':logo'] === 'string' && texts['learner:' + person.id + ':logo-off'] !== '1' ? texts['learner:' + person.id + ':logo'] : '';
    const logo = person.laid && logoPath.length <= 120 ? logoPath.match(LOGO_PATH) : null;
    const print = JSON.stringify([headline, name, position, company, quote, logo ? logo[0] : '']);
    if (person.drawn === print) return;
    person.drawn = print;
    const figure = person.figure;
    figure.className = person.laid ? 'quote has-hl' + (headline ? '' : ' no-head') : 'quote';
    for (const part of [...figure.children]) if (!part.classList.contains('quote-ph')) part.remove();
    const second = headline ? company : (person.laid && company) || text(q.course) || text(q.role);
    const words = make('blockquote', '', '“' + quote + '”');
    const by = make('figcaption');
    if (!person.laid) {
      by.textContent = [name, second].filter(Boolean).join(' · ');
      if (text(q.note)) by.append(make('span', 'quote-note', text(q.note)));
      figure.append(words, by);
    } else {
      if (headline) figure.append(make('h3', 'quote-hl', headline));
      /* the quote and, for a quote longer than three lines, the button that opens and closes it */
      const say = make('div', 'quote-say');
      const more = make('button', 'quote-more', SAY.more);
      more.type = 'button';
      more.setAttribute('aria-expanded', 'false');
      more.addEventListener('click', () => {
        const open = !figure.classList.contains('is-open');
        figure.classList.toggle('is-open', open);
        more.setAttribute('aria-expanded', open ? 'true' : 'false');
        more.textContent = open ? SAY.less : SAY.more;
        if (!open && more.getBoundingClientRect().top < 96) more.scrollIntoView({ block: 'center' });   /* closed from below: the button went up behind the menu */
      });
      say.append(words, more);
      /* the name in bold, title and company under it */
      const who = make('span', 'quote-id');
      who.append(make('b', '', name));
      const under = [position, second].filter(Boolean).join(' · ');
      if (under) who.append(' ', make('span', position ? 'quote-role' : '', under));   /* a line that opens with the title starts with a capital (style.css); the space keeps name and title apart for whoever reads the page as plain text */
      if (text(q.note)) who.append(make('span', 'quote-note', text(q.note)));
      if (logo) {
        const mark = make('img', 'quote-logo');
        mark.alt = company ? SAY.logoOf(company) : '';
        [mark.width, mark.height] = logoSize(+logo[1], +logo[2]);
        mark.loading = 'lazy';
        mark.decoding = 'async';
        mark.addEventListener('error', () => {   /* the file is gone: the name line stands without it */
          mark.remove();
          by.classList.remove('has-logo');
        }, { once: true });
        mark.src = storeFile(logo[0]);
        by.className = 'has-logo';
        by.append(mark);
      }
      by.append(who);
      figure.append(say, by);
    }
    if (person.card) {
      person.card.alt = text(q.photoAlt) || SAY.photoOf(name);
      if (person.card.img) person.card.img.alt = person.card.alt;
    }
  };
  if (quotes.length && quoteSection && quoteGrid) {
    for (const q of quotes) {
      const id = LEARNER_ID.test(text(q.id)) ? text(q.id) : '';
      const figure = make('figure', 'quote');
      if (id) figure.dataset.vis = 'learner:' + id;
      if (id && q.starts === 'hidden') figure.dataset.starts = 'hidden';
      const person = { id, q, figure, laid: !!(text(q.headline) || id), card: null, drawn: null };
      if (person.laid) {
        person.card = {
          figure,
          slot: id ? 'learner:' + id : '',
          alt: '',
          file: /^assets\/[\w./-]+\.(?:jpe?g|png|webp|avif)$/i.test(text(q.photo)) ? text(q.photo) : '',
          fileAt: PHOTO_AT.test(text(q.photoAt)) ? text(q.photoAt) : '50% 50%',
          img: null,
          want: null
        };
        cards.push(person.card);
      }
      people.push(person);
      drawCard(person, null);
      quoteGrid.append(figure);
    }
    quoteGrid.classList.toggle('has-hl', people.some((person) => person.laid));
    quoteSection.hidden = false;
  }
  /* what the site manager wrote for the cards: their words (see drawCard) and their order. "learners:order" names
     card ids in the order wanted; a card it does not name follows after them, in the order of content.js. */
  const setCards = (texts) => {
    if (!quoteGrid || !people.length) return;
    for (const person of people) drawCard(person, texts);
    const named = typeof texts['learners:order'] === 'string' && texts['learners:order'].length <= 4000
      ? texts['learners:order'].split(' ').filter((id) => LEARNER_ID.test(id)) : [];
    const place = (person, n) => {
      const at = person.id ? named.indexOf(person.id) : -1;
      return at < 0 ? named.length + n : at;
    };
    const sorted = people.map((person, n) => ({ person, at: place(person, n) })).sort((a, b) => a.at - b.at).map((x) => x.person.figure);
    const now = [...quoteGrid.children];
    if (sorted.length === now.length && sorted.every((figure, n) => figure === now[n])) return;
    quoteGrid.append(...sorted);
  };
  /* the order of the courses in "Explore the courses". "courses:order" names them (the part after "course:" in
     their data-vis) in the order the site manager gave them; a course it does not name comes after those it names,
     in the order of the file. Without that text the order of the file stays. */
  const courseList = $('.course-list');
  const courseRows = courseList ? [...courseList.children].filter((row) => /^course:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.dataset.vis || '')) : [];
  const setCourses = (texts) => {
    if (courseRows.length < 2 || courseRows.length !== courseList.children.length) return;
    const named = typeof texts['courses:order'] === 'string' && texts['courses:order'].length <= 400
      ? texts['courses:order'].split(' ').filter((id) => LEARNER_ID.test(id)) : [];
    const place = (row, n) => {
      const at = named.indexOf(row.dataset.vis.slice(7));
      return at < 0 ? named.length + n : at;
    };
    const sorted = courseRows.map((row, n) => ({ row, at: place(row, n) })).sort((x, y) => x.at - y.at).map((x) => x.row);
    const now = [...courseList.children];
    if (sorted.every((row, n) => row === now[n])) return;
    courseList.append(...sorted);
  };
  /* a quote shows three lines; a longer one gets "Read more". Each quote is measured at its full length, so this
     is done again whenever the width of the cards or their words may have changed. */
  const fitQuotes = () => {
    const shown = people.filter((person) => person.laid && person.figure.getClientRects().length);
    for (const person of shown) person.figure.classList.remove('can-open');   /* every quote at its full length */
    const long = shown.map((person) => {
      const words = person.figure.querySelector('.quote-say > blockquote');
      const line = words ? parseFloat(getComputedStyle(words).lineHeight) : 0;
      return line > 0 && Math.round(words.getBoundingClientRect().height / line) > 3;
    });
    shown.forEach((person, n) => {
      const figure = person.figure;
      figure.classList.toggle('can-open', long[n]);
      if (long[n] || !figure.classList.contains('is-open')) return;
      const more = figure.querySelector('.quote-more');   /* it was open and now fits in three lines */
      figure.classList.remove('is-open');
      more.setAttribute('aria-expanded', 'false');
      more.textContent = SAY.more;
    });
  };

  /* texts the site manager can replace. An element that carries data-edit="key" in index.html shows what the
     store holds under that key, written in a small notation: **bold**, [words](https://address), a new line for a
     line break, and in a list one line per entry. With nothing in the store the element stays as index.html has it.
     An emptied text hides its element (not one marked data-edit-need), and a box (data-edit-box) whose texts are all
     emptied goes with them. What comes from the store is put in as text and as these few elements, never as HTML. */
  const EDIT_KEY = /^[a-z0-9]+:[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const edits = [...document.querySelectorAll('[data-edit]')]
    .map((el) => ({ el, key: el.getAttribute('data-edit'), list: el.tagName === 'UL' || el.tagName === 'OL', need: el.hasAttribute('data-edit-need'), first: [...el.childNodes].map((node) => node.cloneNode(true)), now: null }))
    .filter((edit) => EDIT_KEY.test(edit.key));
  const inline = (line) => {
    const out = [];
    const marks = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s()"'<>\\]+)\)/g;
    let at = 0;
    for (let found = marks.exec(line); found; found = marks.exec(line)) {
      if (found.index > at) out.push(line.slice(at, found.index));
      if (found[1] != null) out.push(make('b', '', found[1]));
      else {
        const link = make('a', 'u', found[2]);
        link.href = found[3];
        out.push(link);
      }
      at = marks.lastIndex;
    }
    if (at < line.length) out.push(line.slice(at));
    return out;
  };
  const setTexts = (texts) => {
    let changed = false;
    for (const edit of edits) {
      let value = typeof texts[edit.key] === 'string' && texts[edit.key].length <= 4000 ? texts[edit.key].replace(/\r\n?/g, '\n').trim() : null;
      if (value === '' && edit.need) value = null;
      if (value === edit.now) continue;
      edit.now = value;
      changed = true;
      if (value === null) {
        edit.el.replaceChildren(...edit.first.map((node) => node.cloneNode(true)));
        edit.el.hidden = false;
        continue;
      }
      const lines = value.split('\n').map((line) => line.trim());
      if (edit.list) {
        edit.el.replaceChildren(...lines.filter(Boolean).map((line) => {
          const item = make('li');
          item.append(...inline(line));
          return item;
        }));
      } else {
        const parts = [];
        lines.forEach((line, n) => {
          if (n) parts.push(make('br'));
          parts.push(...inline(line));
        });
        edit.el.replaceChildren(...parts);
      }
      edit.el.hidden = !value;
    }
    if (!changed) return;
    for (const box of document.querySelectorAll('[data-edit-box]')) {
      const inside = edits.filter((edit) => box.contains(edit.el));
      box.hidden = inside.length > 0 && inside.every((edit) => edit.el.hidden);
    }
  };
  /* what the store (or this browser's memory) says about texts: keys and words only, nothing oversized */
  const cleanTexts = (given) => {
    const clean = {};
    if (!given || typeof given !== 'object' || Array.isArray(given)) return clean;
    let room = 60000;
    for (const key of Object.keys(given)) {
      const value = given[key];
      if (!/^[a-z0-9]+(?::[a-z0-9]+(?:-[a-z0-9]+)*){1,2}$/.test(key) || typeof value !== 'string' || value.length > 4000) continue;
      room -= key.length + value.length;
      if (room < 0) break;
      clean[key] = value;
    }
    return clean;
  };

  /* ---------- what the site manager controls: hidden blocks, training dates, the message form ---------- */

  const store = {
    url: typeof content.storeUrl === 'string' && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(content.storeUrl.trim()) ? content.storeUrl.trim() : '',
    key: typeof content.storeKey === 'string' ? content.storeKey.trim() : ''
  };
  const storeOn = !!(store.url && store.key);
  const storeFile = (path) => store.url + '/storage/v1/object/public/site/' + path;
  const ask = async (name, args) => {
    const options = {
      method: 'POST',
      headers: { apikey: store.key, Authorization: 'Bearer ' + store.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) options.signal = AbortSignal.timeout(9000);
    const response = await fetch(store.url + '/rest/v1/rpc/' + name, options);
    if (!response.ok) throw new Error(name + ' ' + response.status);
    return response.json();
  };
  /* The recording of the research block. Its play button plays the recording chosen in the site manager (the text
     "rm:sound" names its file in the store), else the recording that comes with the site files (roastSound in
     content.js). The button shows only while there is one of the two, and nothing is fetched before it is pressed.
     The sheet behind the first step has a second button for the same player, and a picture of the recording with
     a line that runs along it while it plays. */
  const SOUND_PATH = /^sounds\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:mp3|m4a|wav)$/;
  const SOUND_FILE = /^assets\/sounds\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:mp3|m4a|wav)$/;
  const ownSound = typeof content.roastSound === 'string' && SOUND_FILE.test(content.roastSound.trim()) ? content.roastSound.trim() : '';
  const hear = $('#hear');
  const hear2 = $('#hear2');
  const soundFig = $('#fig-sound');
  const wave = soundFig ? soundFig.querySelector('.wave') : null;
  const pops = wave ? [...wave.querySelectorAll('.wave-pops i')] : [];
  const acts = hear ? hear.parentElement : null;
  let sound = null;
  let soundFrom = '';   /* "store:<path>" for an uploaded recording, "file:<path>" for the one of the site files */
  let lost = '';        /* an uploaded recording that could not be fetched on this visit */
  let hostOff = false;
  /* the row of the two buttons leaves no gap when neither shows: no recording, and "Host a course" switched off */
  const setActs = (hide) => {
    if (typeof hide === 'string') hostOff = (' ' + hide + ' ').includes(' host ');
    if (acts) acts.hidden = hear.hidden && hostOff;
  };
  const clock = (seconds) => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  /* where the recording stands: the line on its picture, the pops it has passed, the time */
  const paint = () => {
    if (!soundFig) return;
    const known = !!sound && isFinite(sound.duration) && sound.duration > 0;
    const at = known ? Math.min(1, sound.currentTime / sound.duration) : 0;
    const live = !!sound && (at > 0 || !sound.paused);
    soundFig.style.setProperty('--at', at.toFixed(4));
    soundFig.classList.toggle('is-live', live);
    for (const pop of pops) pop.classList.toggle('is-on', live && sound.currentTime >= +pop.dataset.t);
    const time = soundFig.querySelector('.wave-time');
    const drawn = wave && !soundFig.classList.contains('no-wave') ? +wave.dataset.seconds : 0;   /* the length of the recording the outline was drawn from */
    if (time) time.textContent = known ? clock(sound.currentTime) + ' / ' + clock(sound.duration) : drawn > 0 ? clock(0) + ' / ' + clock(drawn) : '';
  };
  let ticking = 0;
  const tick = () => {
    paint();
    ticking = sound && !sound.paused ? requestAnimationFrame(tick) : 0;
  };
  const mark = (playing) => {
    for (const button of [hear, hear2]) {
      if (!button) continue;
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }
    if (playing && !ticking) ticking = requestAnimationFrame(tick);
    if (!playing) paint();
  };
  const quiet = () => mark(false);
  /* the button, and the picture in the sheet, show while there is a recording; the drawn outline only for the file it was drawn from */
  const soundShown = (on) => {
    if (hear) hear.hidden = !on;
    if (soundFig) {
      soundFig.hidden = !on;
      soundFig.classList.toggle('no-wave', !wave || soundFrom !== 'file:' + wave.dataset.for);
      paint();
      refit();
    }
  };
  hush = () => { if (sound && !sound.paused) sound.pause(); };
  const setSound = (texts) => {
    if (!hear) return;
    const named = texts && typeof texts['rm:sound'] === 'string' ? texts['rm:sound'] : '';
    const path = named.length <= 120 && SOUND_PATH.test(named) ? named : '';
    const from = path && path !== lost ? 'store:' + path : ownSound ? 'file:' + ownSound : '';
    if (from === soundFrom) return;
    soundFrom = from;
    if (sound) {
      sound.pause();
      sound = null;
    }
    quiet();
    soundShown(!!from);
  };
  /* the player: made at the first press, so nothing is fetched before */
  const player = () => {
    if (sound) return sound;
    const made = new Audio();
    made.preload = 'auto';
    made.addEventListener('playing', () => { if (sound === made) mark(true); });
    made.addEventListener('pause', () => { if (sound === made) quiet(); });
    made.addEventListener('seeked', () => { if (sound === made) paint(); });
    made.addEventListener('ended', () => {
      if (sound !== made) return;
      made.currentTime = 0;
      quiet();
    });
    made.addEventListener('error', () => {
      if (sound !== made) return;
      sound = null;
      quiet();
      if (soundFrom.startsWith('store:')) {
        lost = soundFrom.slice(6);
        if (ownSound) {
          /* the uploaded file is gone or the store is away: the recording of the site files takes its place */
          soundFrom = 'file:' + ownSound;
          soundShown(true);
          hear.click();
          return;
        }
      }
      soundShown(false);   /* nothing to play: the button goes */
      setActs();
      if (typeof setSteps === 'function') setSteps();
    });
    made.src = soundFrom.startsWith('store:') ? storeFile(soundFrom.slice(6)) : soundFrom.slice(5);
    sound = made;
    return made;
  };
  const start = (made) => {
    const started = made.play();
    if (started && started.catch) started.catch(() => {});
  };
  if (hear) {
    hear.addEventListener('click', () => {
      if (!soundFrom) return;
      const made = player();
      if (made.paused) start(made);
      else made.pause();
    });
  }
  if (hear && hear2) hear2.addEventListener('click', () => hear.click());
  if (hear && wave) {
    /* a press on the picture plays from that place */
    wave.addEventListener('click', (event) => {
      if (!soundFrom) return;
      const box = wave.getBoundingClientRect();
      const part = box.width > 0 ? Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) : 0;
      const made = player();
      const seek = () => {
        if (sound !== made || !isFinite(made.duration) || !(made.duration > 0) || !made.seekable.length) return;   /* a recording that cannot be searched plays on from where it is */
        made.currentTime = Math.max(0, Math.min(made.duration - 0.05, part * made.duration));
      };
      if (made.readyState >= 1) seek();
      else made.addEventListener('loadedmetadata', seek, { once: true });
      if (made.paused) start(made);
    });
  }

  /* A picture for a figure of the page (a figure with data-photo="key"). The text under that key names the file chosen
     for it in the site manager, "pictures/<name>-<width>x<height>.jpg" in the store. Without one the figure shows the
     picture that comes with the site files, if it names one (data-photo-file="assets/<name>-<width>x<height>.jpg");
     the text "none" leaves the figure out. A chosen file that cannot be fetched gives way to the picture of the site
     files; with neither the figure is left out. The picture is shown whole: the size in the name of the file goes to
     the figure as --pw, --ph and --pr (width, height, width over height), and the style sheet sets the width of the
     picture from them. Nothing is fetched before the figure is on the screen. */
  const PICTURE_PATH = /^pictures\/[a-z0-9]+(?:-[a-z0-9]+)*-([1-9]\d{0,3})x([1-9]\d{0,3})\.(?:jpg|png|webp)$/;
  const PICTURE_FILE = /^assets\/[a-z0-9]+(?:[\/-][a-z0-9]+)*-([1-9]\d{0,3})x([1-9]\d{0,3})\.(?:jpg|png|webp)$/;
  const pictureFigs = [...document.querySelectorAll('figure[data-photo]')];
  const pictureLost = new Set();   /* files that could not be fetched */
  let pictureTexts = null;
  const setPictures = (texts) => {
    pictureTexts = texts;
    for (const fig of pictureFigs) {
      const named = texts && typeof texts[fig.dataset.photo] === 'string' ? texts[fig.dataset.photo] : '';
      const file = fig.dataset.photoFile || '';
      const chosen = storeOn && named.length <= 120 && PICTURE_PATH.test(named) && !pictureLost.has('store:' + named) ? named : '';
      const own = !chosen && named !== 'none' && PICTURE_FILE.test(file) && !pictureLost.has('file:' + file) ? file : '';
      const from = chosen ? 'store:' + chosen : own ? 'file:' + own : '';
      const size = chosen ? PICTURE_PATH.exec(chosen) : own ? PICTURE_FILE.exec(own) : null;
      let img = fig.querySelector('img');
      if ((fig.dataset.from || '') !== from) {
        fig.dataset.from = from;
        if (img) img.remove();
        img = null;
        if (from) {
          img = make('img');
          img.loading = 'lazy';
          img.decoding = 'async';
          /* whole and in its own shape; how wide it is shown is written in the style sheet */
          img.style.aspectRatio = size[1] + ' / ' + size[2];
          fig.style.setProperty('--pw', size[1]);
          fig.style.setProperty('--ph', size[2]);
          fig.style.setProperty('--pr', (size[1] / size[2]).toFixed(4));
          fig.classList.toggle('tall', +size[2] > size[1] * 1.15);   /* an upright picture stands beside the line that belongs under it */
          img.addEventListener('error', () => {
            if (fig.dataset.from !== from) return;
            pictureLost.add(from);   /* the file is gone or the store is away: the picture of the site files takes its place, or the figure goes */
            setPictures(pictureTexts);
            refit();
          });
          img.src = chosen ? storeFile(chosen) : own;
          fig.prepend(img);
        }
      }
      fig.hidden = !from;
      if (!from) {
        fig.classList.remove('tall');
        for (const name of ['--pw', '--ph', '--pr', '--fit']) fig.style.removeProperty(name);
      }
      const said = fig.querySelector('.photo-alt');
      if (img) img.alt = said && !said.hidden ? said.textContent.replace(/\s+/g, ' ').trim() : '';
    }
  };

  /* ---------- the steps of the research block: each of the first four can open a sheet (the dialogs with class
     "step" inside the block). A sheet shows the number and name of its step, a headline, a text, a figure, and the
     way back to the sheet before it and on to the next one. Its words stand in index.html as first drafts and can be changed in the site manager.
     A step opens while its sheet has a headline or a text and is not switched off in the site manager; otherwise it
     is a plain name. The address of an open sheet is the name of its step (#acoustic-stages), so a link can open
     the page at that sheet; #sheet-2 does the same whatever the step is called. ---------- */
  const stepList = $('.research-steps');
  const sheets = [...document.querySelectorAll('dialog.step:not(.extra)')];   /* the sheets of the numbered steps; the sheet of the entry under them is handled further down */
  const canSheet = !!stepList && sheets.length > 0 && typeof sheets[0].showModal === 'function';
  const NS = 'http://www.w3.org/2000/svg';
  const draw = (tag, set) => {
    const node = document.createElementNS(NS, tag);
    for (const key of Object.keys(set || {})) node.setAttribute(key, set[key]);
    return node;
  };
  const rowsOf = (list) => (list && !list.hidden ? [...list.children].map((item) => item.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 12) : []);
  /* a bell with named points along it: drawn at the size it is shown, so its letters stay readable on a phone */
  const drawBell = () => {
    const fig = $('#fig-bell');
    if (!fig) return false;
    const box = fig.querySelector('.bell');
    const key = fig.querySelector('.bell-key');
    const axes = rowsOf(fig.querySelector('.bell-axes'));   /* the word for the axis that points up, then the one for the axis along the bottom */
    const points = rowsOf(fig.querySelector('.step-data:not(.bell-axes)')).map((line) => {
      const cut = line.indexOf(':');
      return cut < 0 ? [line, ''] : [line.slice(0, cut).trim(), line.slice(cut + 1).trim()];
    }).filter((point) => point[0]);
    fig.hidden = points.length < 2;
    if (fig.hidden) return false;
    const told = points.filter((point) => point[1]);
    key.hidden = !told.length;
    key.replaceChildren(...told.map((point) => {
      const row = make('div');
      row.append(make('dt', '', point[0]), make('dd', '', point[1]));
      return row;
    }));
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', points.map((point) => point[0]).join(', '));
    const W = Math.round(box.clientWidth);
    if (!W) return true;   /* not on the screen yet: drawn when its sheet opens */
    const small = W < 420;
    const size = small ? 14 : 17;
    /* how high the bell stands for its width, and at most: 0.34 and 210 px unless the style sheet says otherwise
       (--bell-rise, --bell-cap); smaller by the factor its sheet was fitted with (--fit, see fitSheet) */
    const look = getComputedStyle(box);
    const rise = parseFloat(look.getPropertyValue('--bell-rise')) || 0.34;
    const cap = parseFloat(look.getPropertyValue('--bell-cap')) || 210;
    const fit = parseFloat(look.getPropertyValue('--fit')) || 1;
    const high = Math.max(90, Math.round(Math.max(110, Math.min(cap, W * rise)) * fit));
    const base = 12 + high;
    const x0 = W * 0.04, x1 = W * 0.96, peak = x0 + (x1 - x0) * 0.45;
    const y = (x) => base - (high - 6) * Math.exp(-1.55 * Math.pow((x - peak) / (x < peak ? (peak - x0) * 0.41 : (x1 - peak) * 0.5), 2));
    const first = x0 + (x1 - x0) * 0.03, last = x1 - (x1 - x0) * 0.05;
    const crown = Math.floor(points.length / 2);
    const xs = points.map((point, n) => (n <= crown
      ? first + (peak - first) * Math.pow(crown ? n / crown : 1, 0.7)
      : peak + (last - peak) * Math.pow((n - crown) / (points.length - 1 - crown), 1.3)));
    /* names that would touch their neighbour stand one line lower */
    const gap = size * 0.68 * Math.max(...points.map((point) => point[0].length)) + 8;
    const lower = [];
    xs.forEach((x, n) => { lower.push(n > 0 && x - xs[n - 1] < gap && !lower[n - 1]); });
    const H = base + size + 10 + (lower.some(Boolean) ? size + 4 : 0) + 4;
    const svg = draw('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'aria-hidden': 'true' });
    let line = '';
    for (let x = x0; x <= x1 + 0.01; x += Math.max(2, (x1 - x0) / 160)) line += (line ? ' L' : 'M') + x.toFixed(1) + ' ' + y(x).toFixed(1);
    svg.append(draw('path', { d: line + ' L' + x1.toFixed(1) + ' ' + base + ' L' + x0.toFixed(1) + ' ' + base + ' Z', fill: 'currentColor', opacity: '.07' }));
    svg.append(draw('path', { d: line, fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    svg.append(draw('path', { d: 'M' + (x0 - 4).toFixed(1) + ' ' + base + 'H' + (x1 + 4).toFixed(1), stroke: 'currentColor', 'stroke-width': '1', opacity: '.45' }));
    const word = (said, x, at, anchor) => {
      if (!said) return;
      const label = draw('text', { x: x.toFixed(1), y: at, 'text-anchor': anchor, class: 'bell-axis', 'font-size': small ? 11 : 12 });
      label.textContent = said;
      svg.append(label);
    };
    word(axes[0], x0 - 4, 11, 'start');           /* up: in the free corner at the top left */
    word(axes[1], x1 + 4, base - 9, 'end');       /* along: at the right end, above the line */
    points.forEach((point, n) => {
      const x = xs[n], top = y(x);
      svg.append(draw('path', { d: 'M' + x.toFixed(1) + ' ' + top.toFixed(1) + 'V' + base, stroke: 'currentColor', 'stroke-width': '1', opacity: '.3' }));
      svg.append(draw('circle', { cx: x.toFixed(1), cy: top.toFixed(1), r: small ? '4.5' : '5.5', class: 'bell-dot' }));
      const name = draw('text', { x: Math.min(W - 2, Math.max(2, x)).toFixed(1), y: base + size + 6 + (lower[n] ? size + 4 : 0), 'text-anchor': x < size ? 'start' : x > W - size ? 'end' : 'middle', class: 'bell-name', 'font-size': size });
      name.textContent = point[0];
      svg.append(name);
    });
    box.replaceChildren(svg);
    return true;
  };
  /* measured roasts on one scale: a dot per roast with its value and its label, and a band where a line names two values */
  const NUM = '-?\\d+(?:[.,]\\d+)?';
  const BAND = new RegExp('^(' + NUM + ')\\s*(?:-|–|to)\\s*(' + NUM + ')$');
  const ONE = new RegExp('^(' + NUM + ')$');
  const number = (written) => parseFloat(written.replace(',', '.'));
  const drawRoasts = () => {
    const fig = $('#fig-roasts');
    if (!fig) return false;
    const box = fig.querySelector('.roasts');
    const roasts = [], bands = [];
    for (const line of rowsOf(fig.querySelector('.step-data'))) {
      const cut = line.indexOf('|');
      const head = (cut < 0 ? line : line.slice(0, cut)).trim();
      const label = cut < 0 ? '' : line.slice(cut + 1).trim();
      const two = BAND.exec(head), one = ONE.exec(head);
      if (two && number(two[1]) !== number(two[2])) bands.push([Math.min(number(two[1]), number(two[2])), Math.max(number(two[1]), number(two[2])), label]);
      else if (one) roasts.push([number(one[1]), one[1], label]);
    }
    fig.hidden = !roasts.length;
    if (fig.hidden) return false;
    const all = roasts.map((roast) => roast[0]).concat(...bands.map((band) => [band[0], band[1]]));
    let low = Math.min(...all), top = Math.max(...all);
    const least = low;
    const room = top > low ? (top - low) * 0.35 : Math.max(Math.abs(top) * 0.04, 1);   /* air at both ends; a single value gets a scale around it */
    const rough = (top - low + 2 * room) / 5;
    const ten = Math.pow(10, Math.floor(Math.log10(rough)));
    const step = [1, 2, 5, 10].map((k) => k * ten).find((k) => k >= rough * 0.999);
    low = Math.floor((low - room) / step + 1e-9) * step;
    top = Math.ceil((top + room) / step - 1e-9) * step;
    if (least >= 0 && low < 0) low = 0;   /* values that are not below zero get no scale below zero */
    const at = (value) => ((value - low) / (top - low) * 100).toFixed(2) + '%';
    const digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    const plot = make('div', 'roasts-plot');
    for (const band of bands) {
      const strip = make('div', 'roasts-band');
      strip.style.left = at(band[0]);
      strip.style.width = ((band[1] - band[0]) / (top - low) * 100).toFixed(2) + '%';
      plot.append(strip);
    }
    const axis = make('div', 'roasts-axis');
    for (let value = low; value <= top + step / 1000; value += step) {
      const grid = make('i', 'roasts-grid');
      grid.style.left = at(value);
      plot.append(grid);
      const tick = make('span', '', value.toFixed(digits));
      tick.style.left = at(value);
      axis.append(tick);
    }
    for (const roast of roasts) {
      const row = make('div', 'roast' + ((roast[0] - low) / (top - low) > 0.56 ? ' left' : ''));
      row.style.setProperty('--x', at(roast[0]));
      row.append(make('b', '', roast[1]));
      if (roast[2]) row.append(make('span', '', roast[2]));
      plot.append(row);
    }
    plot.append(axis);
    const keys = bands.filter((band) => band[2]).map((band) => {
      const row = make('p', 'roasts-key');
      row.append(make('i'), make('span', '', band[2]));
      return row;
    });
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', roasts.map((roast) => roast[1] + (roast[2] ? ' (' + roast[2] + ')' : '')).join(', '));
    box.replaceChildren(...keys, plot);
    return true;
  };

  const slug = (name) => name.toLowerCase().replace(/ı/g, 'i').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let stepNames = [];   /* the steps as the block lists them */
  let openable = [];    /* which of them open a sheet (0 for the first step) */
  let stepOpen = -1;
  let stepHide = '';
  const addressOf = (n) => {
    const name = slug(stepNames[n] || '');
    return name && !document.getElementById(name) ? name : 'sheet-' + (n + 1);
  };
  /* The entry under the steps stands outside their numbering and opens a sheet of its own (#further). It shows while
     that sheet has a headline or a text and is not switched off; it carries its name and the headline of the sheet.
     The address of the open sheet is the name of the entry in plain letters (#further-research); #further works too. */
  const entry = $('#more-open');
  const further = $('#further');
  const canMore = canSheet && !!entry && !!further;
  let moreOpen = false;

  /* One size for the sheets: the style sheet gives every sheet of the block the same width and height (not on
     phones), and what a sheet holds has to keep to it. A sheet that is too high for its size gets its figures a little
     smaller (--fit on a figure: its picture, the outline of the recording, the bell): first all by one factor, never
     below the floor the style sheet names for that width of window (--fit-floor; none on a phone, where nothing is
     fitted), then each one as large again as the sheet still has room for, the first figure first. Where words and
     figure stand side by side and that is not enough, the words get the wider of the two columns (the mark
     "words-wide" on the sheet) and the same is tried again. A sheet that holds more than that scrolls as a whole at
     full size; its first picture is then made just small enough (not below 0.6) to stand whole, with the lines under
     it, in what shows when the sheet opens. Nothing is laid over the content and no picture is cut. Factors are
     counted in thousandths. */
  const FIRST_VIEW_ROOM = 18;     /* px left free between that picture's figure and the bottom edge of the sheet */
  const FIRST_VIEW_FLOOR = 600;
  const fitSheet = (sheet) => {
    if (!sheet || !sheet.open) return;
    const inner = sheet.firstElementChild;
    if (!inner) return;
    const figs = [...inner.children].filter((node) => node.tagName === 'FIGURE');
    const set = (fig, k) => {
      if (k >= 1000) fig.style.removeProperty('--fit');
      else fig.style.setProperty('--fit', (k / 1000).toFixed(3));
      if (fig.id === 'fig-bell') drawBell();   /* the bell is drawn, not scaled: again at its new height */
    };
    sheet.classList.remove('words-wide');
    for (const fig of figs) set(fig, 1000);
    const floor = Math.round(parseFloat(getComputedStyle(sheet).getPropertyValue('--fit-floor')) * 1000);
    if (!(floor >= 100 && floor < 1000)) return;
    const shown = figs.filter((fig) => !fig.hidden);
    const fits = () => sheet.scrollHeight <= sheet.clientHeight && inner.getBoundingClientRect().height - sheet.clientHeight < 0.05;
    /* the largest factor from "low" (which passes) up to "high" (which does not) that passes, for these figures */
    const largest = (group, low, high, passes) => {
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        for (const fig of group) set(fig, mid);
        if (passes()) low = mid;
        else high = mid;
      }
      for (const fig of group) set(fig, low);
      return low;
    };
    /* true when the sheet keeps its size: as it is, or with its figures made smaller */
    const keeps = () => {
      if (fits()) return true;
      for (const fig of shown) set(fig, floor);
      if (!fits()) {
        for (const fig of shown) set(fig, 1000);
        return false;
      }
      const all = largest(shown, floor, 1000, fits);
      for (const fig of shown) {   /* one figure may have room to be larger again while another holds the sheet to its size */
        set(fig, 1000);
        if (!fits()) largest([fig], all, 1000, fits);
      }
      return true;
    };
    if (keeps()) return;
    if (shown.length && getComputedStyle(inner).display === 'grid') {
      /* two columns side by side, and the sheet is too high: the words get the wider column (style sheet) */
      sheet.classList.add('words-wide');
      if (shown.some((fig) => fig.id === 'fig-bell')) drawBell();
      if (keeps()) return;
      sheet.classList.remove('words-wide');
      if (shown.some((fig) => fig.id === 'fig-bell')) drawBell();
    }
    for (const fig of shown) set(fig, 1000);   /* it holds much more than its size: it scrolls, at full size */
    const first = shown.find((fig) => fig.hasAttribute('data-photo'));
    if (!first) return;
    const whole = () => first.getBoundingClientRect().bottom - sheet.getBoundingClientRect().top + sheet.scrollTop <= sheet.clientHeight - FIRST_VIEW_ROOM;
    if (whole()) return;
    set(first, FIRST_VIEW_FLOOR);
    if (!whole()) return set(first, 1000);   /* it cannot stand in the first view at any size worth showing: full size */
    largest([first], FIRST_VIEW_FLOOR, 1000, whole);
  };
  const fitOpen = () => {
    if (!canSheet) return;
    const sheet = stepOpen >= 0 ? sheets[stepOpen] : moreOpen ? further : null;
    if (sheet) fitSheet(sheet);
  };
  refit = fitOpen;
  const moreAddress = () => {
    const name = slug(entry.querySelector('.more-label').textContent);
    return name && !document.getElementById(name) && !openable.some((n) => addressOf(n) === name) ? name : 'further';
  };
  const setMore = () => {
    if (!canMore) return;
    const head = further.querySelector('.statement');
    const said = [...further.querySelectorAll('.statement, .step-text')].some((part) => !part.hidden && part.textContent.trim());
    const on = said && !stepHide.includes(' research ') && !stepHide.includes(' sheet:further ');
    entry.hidden = !on;
    const headline = head && !head.hidden ? head.textContent.replace(/\s+/g, ' ').trim() : '';
    entry.querySelector('.more-name').textContent = headline;
    entry.classList.toggle('bare', !headline);   /* its name alone: the arrow follows the name */
    further.querySelector('.step-name').textContent = entry.querySelector('.more-label').textContent.replace(/\s+/g, ' ').trim();
    if (!on && further.open) further.close();
  };
  const setSteps = (hide) => {
    if (!canSheet) return;
    if (typeof hide === 'string') stepHide = ' ' + hide + ' ';
    const items = [...stepList.children].filter((item) => item.tagName === 'LI');
    stepNames = stepList.hidden ? [] : items.map((item) => [...item.childNodes].filter((node) => !(node.nodeType === 1 && node.classList.contains('step-go'))).map((node) => node.textContent).join('').replace(/\s+/g, ' ').trim());
    drawBell();
    drawRoasts();
    const blockOn = !stepHide.includes(' research ');
    /* a step opens while its sheet has a headline or a text: a sheet emptied of both is not put before visitors */
    openable = sheets.map((sheet, n) => n).filter((n) => blockOn && !!stepNames[n] && !stepHide.includes(' sheet:' + (n + 1) + ' ')
      && [...sheets[n].querySelectorAll('.statement, .step-text')].some((part) => !part.hidden && part.textContent.trim()));
    items.forEach((item, n) => {
      const can = openable.includes(n);
      let go = item.querySelector('.step-go');
      item.classList.toggle('has-sheet', can);
      if (can && !go) {
        go = make('button', 'step-go');
        go.type = 'button';
        go.setAttribute('aria-haspopup', 'dialog');
        go.append(arrow());
        item.append(go);
      }
      if (!can && go) go.remove();
      if (can) go.setAttribute('aria-label', stepNames[n]);
    });
    const coursesName = ($('#courses .label') || {}).textContent || '';
    const hostName = ($('[data-edit="' + (TR ? 'tr:rm-host' : 'rm:host') + '"]') || {}).textContent || '';   /* the Turkish page has keys of its own */
    const hearName = ($('[data-edit="' + (TR ? 'tr:rm-hear' : 'rm:hear') + '"]') || {}).textContent || '';
    if (hear2) hear2.querySelector('span').textContent = hearName.trim();
    sheets.forEach((sheet, n) => {
      const next = openable.find((m) => m > n);
      const put = (sel, value) => { const node = sheet.querySelector(sel); if (node) node.textContent = value; };
      put('.step-name', stepNames[n] || '');
      put('.next-name', next === undefined ? '' : stepNames[next]);
      put('.courses-name', coursesName.trim());
      put('.host-name', hostName.trim());
      const on = sheet.querySelector('[data-next]');
      if (on) on.hidden = next === undefined;
      const back = sheet.querySelector('[data-back]');
      if (back) back.hidden = !openable.some((m) => m < n);   /* nothing to go back to from the first sheet that opens */
      const dots = sheet.querySelector('.step-dots');
      if (dots) {
        dots.hidden = openable.length < 2;
        dots.replaceChildren(...openable.map((m) => make('i', m === n ? 'on' : '')));
      }
    });
    if (stepOpen >= 0 && !openable.includes(stepOpen) && sheets[stepOpen].open) sheets[stepOpen].close();
    setMore();
    fitOpen();   /* words or figures of the open sheet may have changed */
  };
  const setAddress = (n) => {   /* the number of a step, the address of the entry under the steps, or -1 for none */
    try {
      const hash = typeof n === 'string' ? '#' + n : n >= 0 ? '#' + addressOf(n) : '';
      if (location.hash !== hash) history.replaceState(history.state, '', location.pathname + location.search + hash);
    } catch (error) { /* the address stays as it is */ }
  };
  const openStep = (n) => {
    if (!canSheet || !openable.includes(n)) return;
    const before = stepOpen;
    stepOpen = n;
    if (canMore && moreOpen && further.open) {
      moreOpen = false;
      further.close();
    }
    if (before >= 0 && before !== n && sheets[before].open) sheets[before].close();
    if (!sheets[n].open) sheets[n].showModal();
    const name = sheets[n].querySelector('.step-kicker');
    if (name && document.activeElement !== name) name.focus({ preventScroll: true });   /* a browser that does not know autofocus in a dialog starts at the close button */
    sheets[n].scrollTop = 0;
    drawBell();
    drawRoasts();
    paint();
    fitSheet(sheets[n]);
    setAddress(n);
  };
  const openMore = () => {
    if (!canMore || entry.hidden) return;
    if (stepOpen >= 0 && sheets[stepOpen].open) {
      const was = stepOpen;
      stepOpen = -1;   /* so the step's sheet does not take the focus and the address with it */
      sheets[was].close();
    }
    moreOpen = true;
    if (!further.open) further.showModal();
    const name = further.querySelector('.step-kicker');
    if (name && document.activeElement !== name) name.focus({ preventScroll: true });
    further.scrollTop = 0;
    fitSheet(further);
    setAddress(moreAddress());
  };
  if (canMore) {
    entry.addEventListener('click', (event) => { if (plainClick(event)) openMore(); });
    further.addEventListener('click', (event) => {
      if (event.target === further || event.target.closest('[data-close]')) further.close();   /* the dark surround, or a close button */
    });
    further.addEventListener('close', () => {
      if (!moreOpen) return;   /* a sheet of a step took its place */
      moreOpen = false;
      if (location.hash === '#' + moreAddress() || location.hash === '#further') setAddress(-1);
      if (!entry.hidden) entry.focus({ preventScroll: true });
    });
  }

  let hashSeen = '';
  const tryHash = () => {
    if (!canSheet || !location.hash || location.hash === hashSeen) return;
    let named = '';
    try { named = decodeURIComponent(location.hash.slice(1)).toLowerCase(); } catch (error) { named = ''; }
    if (canMore && !entry.hidden && (named === 'further' || named === moreAddress())) {
      if (moreOpen) return;
      hashSeen = location.hash;
      const panel = $('#research');
      if (stepOpen < 0 && panel) {
        root.style.scrollBehavior = 'auto';
        panel.scrollIntoView();
        root.style.scrollBehavior = '';
      }
      return openMore();
    }
    const numbered = /^sheet-([1-9])$/.exec(named);
    const n = numbered ? +numbered[1] - 1 : openable.find((m) => addressOf(m) === named);
    if (n === undefined || n === stepOpen || !openable.includes(n)) return;
    hashSeen = location.hash;
    const block = $('#research');
    if (stepOpen < 0 && block) {
      /* the sheet opens over its block, so the visitor stands there when it closes */
      root.style.scrollBehavior = 'auto';
      block.scrollIntoView();
      root.style.scrollBehavior = '';
    }
    openStep(n);
  };
  if (canSheet) {
    stepList.addEventListener('click', (event) => {
      const item = event.target.closest('li.has-sheet');
      if (!item || !plainClick(event) || (event.target.closest('a') && !event.target.closest('.step-go'))) return;
      openStep([...stepList.children].indexOf(item));
    });
    sheets.forEach((sheet, n) => {
      sheet.addEventListener('click', (event) => {
        if (event.target === sheet || event.target.closest('[data-close]')) return sheet.close();   /* the dark surround, or a close button */
        if (event.target.closest('[data-back]')) return openStep([...openable].reverse().find((m) => m < n));
        if (event.target.closest('[data-next]')) openStep(openable.find((m) => m > n));
      });
      sheet.addEventListener('close', () => {
        if (stepOpen !== n) return;   /* the next sheet is open already */
        stepOpen = -1;
        if (location.hash === '#' + addressOf(n) || location.hash === '#sheet-' + (n + 1)) setAddress(-1);
        const go = stepList.children[n] ? stepList.children[n].querySelector('.step-go') : null;
        if (go) go.focus({ preventScroll: true });
      });
    });
    window.addEventListener('hashchange', () => { hashSeen = ''; tryHash(); });
    let drawQueued = false;
    const drawOpen = () => {
      if ((stepOpen < 0 && !moreOpen) || drawQueued) return;
      drawQueued = true;
      requestAnimationFrame(() => { drawQueued = false; drawBell(); drawRoasts(); fitOpen(); });
    };
    window.addEventListener('resize', drawOpen);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawOpen);   /* the web fonts change how the words of an open sheet run */
  }

  /* what this browser saw last time: applied at once, so nothing jumps while the store answers */
  const MEMORY = 'oa-site';
  const recall = () => {
    try {
      const kept = JSON.parse(localStorage.getItem(MEMORY) || 'null');
      return kept && typeof kept === 'object' ? kept : null;
    } catch (error) {
      return null;
    }
  };
  const remember = (value) => {
    try {
      if (value) localStorage.setItem(MEMORY, JSON.stringify(value));
      else localStorage.removeItem(MEMORY);
    } catch (error) { /* private mode: the page works without it */ }
  };
  /* a change above the visitor's place must not push what they are looking at: the block in the middle of the window stays put */
  const steady = (change) => {
    const blocks = [...document.querySelectorAll('main > section, footer')];
    const middle = window.innerHeight / 2;
    const mark = blocks.find((el) => el.getClientRects().length && el.getBoundingClientRect().bottom > middle);
    const before = mark ? mark.getBoundingClientRect().top : 0;
    change();
    if (!mark || !mark.getClientRects().length) return;
    const moved = mark.getBoundingClientRect().top - before;
    if (Math.abs(moved) < 1) return;
    root.style.scrollBehavior = 'auto';   /* this correction must not glide */
    window.scrollBy(0, moved);
    root.style.scrollBehavior = '';
  };

  /* the photos of the learner cards. "over" is what the site manager holds: { "learner:<id>": { path, at } }.
     A photo uploaded there exists for sure, so its place is kept free at once and it loads when it comes near.
     A file named in content.js may be missing, so it joins its card only once it has arrived: no hole, no jump. */
  const cleanPhotos = (given) => {
    const clean = {};
    if (!given || typeof given !== 'object' || Array.isArray(given)) return clean;
    for (const slot of Object.keys(given)) {
      const one = given[slot];
      if (!/^learner:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slot) || !one || typeof one.path !== 'string' || !PHOTO_PATH.test(one.path)) continue;
      clean[slot] = { path: one.path, at: typeof one.at === 'string' && PHOTO_AT.test(one.at) ? one.at : '50% 50%' };
    }
    return clean;
  };
  const putPhoto = (card, src, at, sure) => {
    const old = card.img && card.img.isConnected ? card.img : null;
    if (!src) {
      card.img = null;
      if (old) steady(() => old.remove());
      return;
    }
    const img = make('img', 'quote-ph');
    img.alt = card.alt;
    img.width = 800; img.height = 600;   /* 4:3, the shape the card shows */
    img.decoding = 'async';
    img.style.objectPosition = at;
    img.dataset.src = src;
    card.img = img;
    const place = () => steady(() => { if (old && old.isConnected) old.replaceWith(img); else card.figure.prepend(img); });
    if (sure) {
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        if (card.img !== img) return;
        card.img = null;
        steady(() => img.remove());
        card.want = card.file ? card.file + '|' + card.fileAt : '';
        putPhoto(card, card.file, card.fileAt, false);   /* the uploaded file is gone: back to the one named in content.js */
      }, { once: true });
      img.src = src;
      place();
    } else {
      img.addEventListener('load', () => { if (card.img === img && img.naturalWidth) place(); }, { once: true });
      img.addEventListener('error', () => {
        if (card.img !== img) return;
        card.img = null;
        if (old && old.isConnected) steady(() => old.remove());
      }, { once: true });
      img.src = src;
    }
  };
  const setPhotos = (over) => {
    for (const card of cards) {
      const pick = over && card.slot && over[card.slot] ? over[card.slot] : null;
      const src = pick ? storeFile(pick.path) : card.file;
      const at = pick ? pick.at : card.fileAt;
      const want = src ? src + '|' + at : '';
      if (card.want === want) continue;
      card.want = want;
      if (card.img && card.img.dataset.src === src) card.img.style.objectPosition = at;   /* only the crop changed */
      else putPhoto(card, src, at, !!pick);
    }
  };

  /* hidden blocks. Every switchable block carries data-vis="key" in index.html; the keys that are switched off
     become one style rule (the line in the head of the page writes the same rule from the last visit).
     Links that point at a hidden block go with it.
     The list from the site manager names what differs from the page as written: "key" for a block that is switched
     off, and "shown:<id>" for a learner card that starts hidden and was switched on. */
  const KEY = /^[a-z0-9]+(?::[a-z0-9-]+)?$/;
  const setHidden = (list) => {
    const given = (Array.isArray(list) ? list : []).filter((key) => typeof key === 'string' && KEY.test(key));
    const on = new Set(given.filter((key) => key.startsWith('shown:')));
    const off = new Set(given.filter((key) => !key.startsWith('shown:')));
    const courses = [...document.querySelectorAll('.course[data-vis]')];
    for (const course of courses) {
      /* a course with no level left to show goes too, and so does the whole block when no course is left */
      const levels = [...course.querySelectorAll('.lvl[data-vis]')];
      if (levels.length && levels.every((level) => off.has(level.dataset.vis))) off.add(course.dataset.vis);
    }
    if (courses.length && courses.every((course) => off.has(course.dataset.vis))) off.add('courses');
    /* the same for the learner cards: with every card switched off, the block and its menu link go too */
    const figures = [...document.querySelectorAll('#quote-grid > .quote')];
    for (const figure of figures) {
      if (figure.dataset.starts === 'hidden' && !on.has('shown:' + figure.dataset.vis.slice(8))) off.add(figure.dataset.vis);
    }
    if (figures.length && figures.every((figure) => figure.dataset.vis && off.has(figure.dataset.vis))) off.add('quotes');
    const keys = [...off].sort();
    const record = keys.concat([...on].sort()).join(' ');   /* what the next visit starts from: the same list gives the same page */
    let rule = document.getElementById('vis');
    if (!keys.length) {
      if (rule) rule.remove();
      return record;
    }
    if (!rule) {
      rule = document.createElement('style');
      rule.id = 'vis';
      document.head.append(rule);
    }
    const text = keys.map((key) => '[data-vis="' + key + '"],a[href="#' + key + '"]').join(',') + '{display:none!important}';
    if (rule.textContent !== text) rule.textContent = text;
    return record;
  };

  /* training dates: the classes on the CoffeeNutz calendar that are open or confirmed and have not started */
  const dateSection = $('#dates');
  const dateBox = $('#dates-list');
  const noDates = dateBox ? dateBox.firstElementChild : null;
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const MONTHS = SAY.months;
  const FIELDS = { barista: 'Barista Skills', roasting: 'Roasting', sensory: 'Sensory Skills', brewing: 'Brewing', 'green coffee': 'Green Coffee' };
  const LEVELS = { 'f+i': 'Foundation + Intermediate', pro: 'Professional', professional: 'Professional', foundation: 'Foundation', intermediate: 'Intermediate' };
  const todayIn = (zone) => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      const part = (type) => parts.find((p) => p.type === type).value;
      return part('year') + '-' + part('month') + '-' + part('day');
    } catch (error) {
      return new Date().toISOString().slice(0, 10);
    }
  };
  /* On the Turkish page the names of a course and of its level are the ones its list of courses shows (the texts
     "tr:course-…" and "tr:level-…" of tr.html, as the site manager may have changed them). */
  const LEVEL_KEYS = { 'f+i': 'fi', pro: 'pro', professional: 'pro', foundation: 'foundation' };
  const shownAs = (key, otherwise) => {
    if (!TR || !key) return otherwise;
    const el = document.querySelector('[data-edit="tr:' + key + '"]');
    const words = el && !el.hidden ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    return words || otherwise;
  };
  /* "SCA Barista F+I" on the calendar is "Barista Skills" + "Foundation + Intermediate" here */
  const courseOf = (name) => {
    const plain = String(name).replace(/^SCA\s+/i, '').trim();
    if (/^q[\s-]*grader/i.test(plain)) return { field: shownAs('course-q', 'Q Grader'), level: shownAs('level-programme', 'Certification programme') };
    const parts = plain.match(/^(.+?)\s+(F\+I|Pro|Professional|Foundation|Intermediate)$/i);
    if (parts && FIELDS[parts[1].toLowerCase()]) {
      const field = parts[1].toLowerCase(), level = parts[2].toLowerCase();
      return { field: shownAs(/^[a-z]+$/.test(field) ? 'course-' + field : '', FIELDS[field]), level: shownAs(LEVEL_KEYS[level] ? 'level-' + LEVEL_KEYS[level] : '', LEVELS[level]) };
    }
    return { field: plain, level: '' };
  };
  const period = (from, to, spoken) => {
    const a = { y: +from.slice(0, 4), m: +from.slice(5, 7), d: +from.slice(8, 10) };
    const b = { y: +to.slice(0, 4), m: +to.slice(5, 7), d: +to.slice(8, 10) };
    const month = (m) => (spoken ? MONTHS[m - 1] : MONTHS[m - 1].slice(0, 3));
    if (from === to) return a.d + ' ' + month(a.m) + ' ' + a.y;
    if (a.y === b.y && a.m === b.m) return a.d + (spoken ? SAY.to : '–') + b.d + ' ' + month(a.m) + ' ' + a.y;
    const join = spoken ? SAY.toWide : ' – ';
    if (a.y === b.y) return a.d + ' ' + month(a.m) + join + b.d + ' ' + month(b.m) + ' ' + a.y;
    return a.d + ' ' + month(a.m) + ' ' + a.y + join + b.d + ' ' + month(b.m) + ' ' + b.y;
  };
  const upcoming = (trainings) => {
    const today = todayIn('Europe/Istanbul');
    return (Array.isArray(trainings) ? trainings : [])
      .filter((x) => x && typeof x.name === 'string' && x.name.trim() && ISO.test(x.start) && ISO.test(x.end) && x.end >= x.start)
      .filter((x) => (x.status === 'Registration open' || x.status === 'Confirmed') && x.start > today)
      .sort((x, y) => (x.start < y.start ? -1 : x.start > y.start ? 1 : x.name < y.name ? -1 : x.name > y.name ? 1 : 0))
      .slice(0, 8);
  };
  const manualDates = (content.dates || []).filter((d) => d && d.date && d.course && d.location);
  let datesDrawn = null;
  const drawDates = (trainings) => {
    if (!dateSection || !dateBox) return;
    const place = typeof content.datesPlace === 'string' ? content.datesPlace.trim() : '';
    const rows = upcoming(trainings).map((x) => {
      const course = courseOf(x.name);
      const lang = typeof x.lang === 'string' && /^[A-Za-zÀ-ɏ ]{2,30}$/.test(x.lang.trim()) ? x.lang.trim() : '';
      return {
        when: period(x.start, x.end, false),
        said: period(x.start, x.end, true),
        course: course.field,
        lines: [course.level, [place, lang ? SAY.inLang(SAY.langs[lang.toLowerCase()] || lang) : ''].filter(Boolean).join(' · ')].filter(Boolean),
        url: x.url
      };
    });
    /* nothing from the calendar: the rows written by hand in content.js, if any */
    if (!rows.length) for (const d of manualDates) rows.push({ when: d.date, said: d.date, course: d.course, lines: [d.location], url: d.url });
    const print = JSON.stringify(rows);
    if (print === datesDrawn) return;
    datesDrawn = print;
    if (!rows.length) {
      if (noDates) dateBox.replaceChildren(noDates);
      dateSection.classList.remove('has-dates');
      return;
    }
    const list = make('ul', 'date-list');
    for (const r of rows) {
      const hasLink = /^https:\/\//.test(r.url || '');
      const row = make(hasLink ? 'a' : 'div', 'date-row');
      if (hasLink) {
        row.href = r.url;
        row.setAttribute('aria-label', [r.course].concat(r.lines.map((line) => line.replace(/ · /g, ', ')), r.said, SAY.details).join(', '));
      }
      const where = make('span', 'date-where');
      for (const line of r.lines) where.append(make('span', '', line));
      row.append(make('span', 'date-when', r.when), make('span', 'date-course', r.course), where);
      if (hasLink) row.append(arrow());
      const item = make('li');
      item.append(row);
      list.append(item);
    }
    dateBox.replaceChildren(list);
    dateSection.classList.add('has-dates');
  };

  /* message form: shown once the store has answered (now, or on an earlier visit of this browser).
     Nothing is sent anywhere before the visitor presses Send. */
  const form = $('#msg');
  const foot = form ? form.closest('.foot') : null;
  const showForm = (ready, hide) => {
    if (!form) return;
    const on = !!ready && storeOn;
    form.hidden = !on;
    if (foot) foot.classList.toggle('has-form', on && !(' ' + hide + ' ').includes(' message '));
  };
  if (form && storeOn) {
    const status = $('#msg-status');
    const sendBtn = form.querySelector('button[type="submit"]');
    const SAID = { email: SAY.email, message: SAY.message, busy: SAY.busy };
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sendBtn.disabled) return;
      const fields = new FormData(form);
      const letter = {
        p_email: String(fields.get('email') || '').trim(),
        p_message: String(fields.get('message') || '').trim(),
        p_news: fields.get('news') === 'yes',
        p_fax: String(fields.get('fax') || '')
      };
      sendBtn.disabled = true;
      status.textContent = SAY.sending;
      let answer = null;
      try {
        answer = await ask('site_message_send', letter);
      } catch (error) {
        answer = null;
      }
      sendBtn.disabled = false;
      if (answer && answer.ok === true) {
        form.reset();
        status.textContent = SAY.thanks;
      } else {
        status.textContent = (answer && SAID[answer.error]) || SAY.failed;
      }
    });
  }

  /* first what this browser remembers, then what the store says now */
  let state = { hide: '', trainings: null, form: false, texts: {} };
  const show = (next) => {
    render(next);
    tryHash();   /* an address that names a sheet of the research block opens it */
  };
  const render = (next) => steady(() => {
    const texts = next.texts === undefined ? state.texts : cleanTexts(next.texts);   /* a call that says nothing about texts leaves them */
    setCards(texts);
    setCourses(texts);
    setTexts(texts);
    setPictures(texts);
    setSound(texts);
    state = { hide: setHidden(next.hidden), trainings: Array.isArray(next.trainings) ? next.trainings : null, form: !!next.form, texts };
    setActs(state.hide);
    setSteps(state.hide);
    fitQuotes();
    drawDates(state.trainings);
    showForm(state.form, state.hide);
    retone();
  });
  const settled = () => root.classList.remove('fresh');   /* the menu links stop waiting (see the head of the page) */
  /* the cards get wider and narrower with the window, and the web fonts change how the words run: measure the quotes again */
  let fitQueued = false;
  const queueFit = () => {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => {
      fitQueued = false;
      steady(fitQuotes);
    });
  };
  window.addEventListener('resize', queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);
  if (!storeOn) {
    /* no store: every block shows, hand-written dates if any, no form */
    remember(null);
    show({ hidden: [], trainings: null, form: false, texts: null });
    setPhotos(null);
    settled();
    arrive();
    return;
  }
  const kept = recall();
  const week = 7 * 24 * 3600 * 1000;
  let photos = null;   /* which uploaded photos the store holds; null until this browser has heard from the store */
  if (kept && typeof kept.hide === 'string') {
    const recent = typeof kept.at === 'number' && Date.now() - kept.at < week;
    show({ hidden: kept.hide.split(' '), trainings: recent ? kept.trainings : null, form: recent && kept.form === true, texts: kept.texts || null });
    photos = cleanPhotos(kept.photos);
    setPhotos(photos);
  } else {
    show({ hidden: [], trainings: null, form: false, texts: null });   /* first visit: the photos wait for the store's answer */
  }
  arrive();   /* from the other language: back at the block the visitor was reading */
  const keep = () => remember({ hide: state.hide, trainings: state.trainings, form: state.form, photos: photos || {}, texts: state.texts, at: Date.now() });
  (async () => {
    let now;
    try {
      now = await ask('site_public');
    } catch (error) {
      now = null;   /* the store did not answer: the page stays as this browser last saw it */
    }
    if (!now || typeof now !== 'object' || !Array.isArray(now.hidden)) {
      if (!photos) setPhotos(null);   /* no answer and nothing remembered: the files named in content.js */
      return settled();
    }
    show({ hidden: now.hidden, trainings: Array.isArray(now.trainings) ? now.trainings : state.trainings, form: now.form === true, texts: now.texts || null });
    photos = cleanPhotos(now.photos);
    setPhotos(photos);
    settled();
    keep();
    if (now.stale !== true) return;
    /* the store's copy of the calendar is older than ten minutes: have it read again */
    try {
      const again = await ask('site_refresh');
      if (again && Array.isArray(again.trainings)) {
        show({ hidden: state.hide.split(' '), trainings: again.trainings, form: state.form });
        keep();
      }
    } catch (error) { /* the dates shown stay */ }
  })();
})();
