/* omeraydin.coffee v2026-11-21f
   Reads window.siteContent (content.js) and fills the film, portrait and learner cards.
   Asks the store behind the site manager which blocks are switched off, which classes are on the calendar,
   which photos were uploaded for the learner cards and which texts were written there, and sends the message form there.
   Plays the recording of the research block when its button is pressed.
   Keeps the glass menu readable: sets data-tone on the header from what is under its labels. */
(() => {
  'use strict';
  const content = window.siteContent || {};
  const root = document.documentElement;
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
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  let hush = () => {};   /* stops the recording of "Hear the roast" (set further down) */

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
      player.title = 'Film: coffee education with Ömer Aydın';
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
    const said = (field) => {
      const over = person.id && texts ? texts['learner:' + person.id + ':' + field] : null;
      if (typeof over !== 'string' || over.length > CARD_TEXT[field]) return text(q[field]);
      const clean = over.replace(/\s+/g, ' ').trim();
      return clean || (field === 'name' || field === 'quote' ? text(q[field]) : '');   /* a card always has a name and a quote */
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
      const more = make('button', 'quote-more', 'Read more');
      more.type = 'button';
      more.setAttribute('aria-expanded', 'false');
      more.addEventListener('click', () => {
        const open = !figure.classList.contains('is-open');
        figure.classList.toggle('is-open', open);
        more.setAttribute('aria-expanded', open ? 'true' : 'false');
        more.textContent = open ? 'Show less' : 'Read more';
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
        mark.alt = company ? 'Logo of ' + company : '';
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
      person.card.alt = text(q.photoAlt) || 'Photo of ' + name;
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
      more.textContent = 'Read more';
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
  /* "Hear the roast" in the research block: the recording uploaded in the site manager (the text "rm:sound" names
     its file in the store). The button shows only while there is one, and nothing is fetched before it is pressed. */
  const SOUND_PATH = /^sounds\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:mp3|m4a|wav)$/;
  const hear = $('#hear');
  const acts = hear ? hear.parentElement : null;
  let sound = null;
  let soundPath = '';
  let hostOff = false;
  /* the row of the two buttons leaves no gap when neither shows: no recording, and "Host a course" switched off */
  const setActs = (hide) => {
    if (typeof hide === 'string') hostOff = (' ' + hide + ' ').includes(' host ');
    if (acts) acts.hidden = hear.hidden && hostOff;
  };
  const quiet = () => {
    if (!hear) return;
    hear.classList.remove('is-playing');
    hear.setAttribute('aria-pressed', 'false');
  };
  hush = () => { if (sound && !sound.paused) sound.pause(); };
  const setSound = (texts) => {
    if (!hear) return;
    const named = texts && typeof texts['rm:sound'] === 'string' ? texts['rm:sound'] : '';
    const path = named.length <= 120 && SOUND_PATH.test(named) ? named : '';
    if (path === soundPath) return;
    soundPath = path;
    if (sound) {
      sound.pause();
      sound = null;
    }
    quiet();
    hear.hidden = !path;
  };
  if (hear) {
    hear.addEventListener('click', () => {
      if (!soundPath) return;
      if (!sound) {
        const player = new Audio();
        player.preload = 'auto';
        player.addEventListener('playing', () => {
          if (sound !== player) return;
          hear.classList.add('is-playing');
          hear.setAttribute('aria-pressed', 'true');
        });
        player.addEventListener('pause', () => { if (sound === player) quiet(); });
        player.addEventListener('ended', () => {
          if (sound !== player) return;
          player.currentTime = 0;
          quiet();
        });
        player.addEventListener('error', () => {   /* the file is gone: the button goes with it */
          if (sound !== player) return;
          sound = null;
          quiet();
          hear.hidden = true;
          setActs();
        });
        player.src = storeFile(soundPath);
        sound = player;
      }
      if (sound.paused) {
        const started = sound.play();
        if (started && started.catch) started.catch(() => {});
      } else sound.pause();
    });
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
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
  /* "SCA Barista F+I" on the calendar is "Barista Skills" + "Foundation + Intermediate" here */
  const courseOf = (name) => {
    const plain = String(name).replace(/^SCA\s+/i, '').trim();
    if (/^q[\s-]*grader/i.test(plain)) return { field: 'Q Grader', level: 'Certification programme' };
    const parts = plain.match(/^(.+?)\s+(F\+I|Pro|Professional|Foundation|Intermediate)$/i);
    if (parts && FIELDS[parts[1].toLowerCase()]) return { field: FIELDS[parts[1].toLowerCase()], level: LEVELS[parts[2].toLowerCase()] };
    return { field: plain, level: '' };
  };
  const period = (from, to, spoken) => {
    const a = { y: +from.slice(0, 4), m: +from.slice(5, 7), d: +from.slice(8, 10) };
    const b = { y: +to.slice(0, 4), m: +to.slice(5, 7), d: +to.slice(8, 10) };
    const month = (m) => (spoken ? MONTHS[m - 1] : MONTHS[m - 1].slice(0, 3));
    if (from === to) return a.d + ' ' + month(a.m) + ' ' + a.y;
    if (a.y === b.y && a.m === b.m) return a.d + (spoken ? ' to ' : '–') + b.d + ' ' + month(a.m) + ' ' + a.y;
    const join = spoken ? ' to ' : ' – ';
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
        lines: [course.level, [place, lang ? 'in ' + lang : ''].filter(Boolean).join(' · ')].filter(Boolean),
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
        row.setAttribute('aria-label', [r.course].concat(r.lines.map((line) => line.replace(/ · /g, ', ')), r.said, 'course details').join(', '));
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
    const SAID = {
      email: 'Please check the email address and try again.',
      message: 'Please write a few words (up to 4,000 characters).',
      busy: 'Too many messages just now. Please try again in a few minutes.'
    };
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
      status.textContent = 'Sending…';
      let answer = null;
      try {
        answer = await ask('site_message_send', letter);
      } catch (error) {
        answer = null;
      }
      sendBtn.disabled = false;
      if (answer && answer.ok === true) {
        form.reset();
        status.textContent = 'Thank you. Your message has reached Ömer.';
      } else {
        status.textContent = (answer && SAID[answer.error]) || 'That did not go through. Please try again in a moment, or write on Instagram.';
      }
    });
  }

  /* first what this browser remembers, then what the store says now */
  let state = { hide: '', trainings: null, form: false, texts: {} };
  const show = (next) => steady(() => {
    const texts = next.texts === undefined ? state.texts : cleanTexts(next.texts);   /* a call that says nothing about texts leaves them */
    setCards(texts);
    setTexts(texts);
    setSound(texts);
    state = { hide: setHidden(next.hidden), trainings: Array.isArray(next.trainings) ? next.trainings : null, form: !!next.form, texts };
    setActs(state.hide);
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
