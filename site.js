/* omeraydin.coffee v2026-11-20a
   Reads window.siteContent (content.js) and fills the film, portrait and learner quotes.
   Asks the store behind the site manager which blocks are switched off and which classes are on the calendar,
   and sends the message form there.
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

  /* learners: up to three, only entries with a quote and a name.
     With a headline: photo (if any), headline, the quote in small type, then "name, position · company".
     Without one: the quote in large type and "name · course", as before v2026-11-20d. */
  const text = (v) => (typeof v === 'string' ? v.trim() : '');
  const quotes = (content.testimonials || []).filter((q) => q && text(q.quote) && text(q.name)).slice(0, 3);
  const quoteSection = $('#quotes');
  const quoteGrid = $('#quote-grid');
  if (quotes.length && quoteSection && quoteGrid) {
    for (const q of quotes) {
      const headline = text(q.headline);
      const figure = make('figure', headline ? 'quote has-hl' : 'quote');
      if (headline) {
        if (/^assets\/[\w./-]+\.(?:jpe?g|png|webp|avif)$/i.test(text(q.photo))) {
          /* The picture is fetched right away and joins its card only once it has arrived: a missing or empty
             file leaves no hole and no jump. Arriving above the reader, it does not move what is being read. */
          const photo = make('img', 'quote-ph');
          photo.alt = text(q.photoAlt) || 'Photo posted with the review by ' + text(q.name);
          photo.width = 800; photo.height = 600; photo.decoding = 'async';
          if (/^\d{1,3}% \d{1,3}%$/.test(text(q.photoAt))) photo.style.objectPosition = text(q.photoAt);
          photo.addEventListener('load', () => { if (photo.naturalWidth) steady(() => figure.prepend(photo)); }, { once: true });
          photo.src = text(q.photo);
        }
        figure.append(make('h3', 'quote-hl', headline));
      }
      const who = text(q.name) + (headline && text(q.position) ? ', ' + text(q.position) : '');
      const by = make('figcaption', '', [who, headline ? text(q.company) : text(q.course) || text(q.role)].filter(Boolean).join(' · '));
      if (text(q.note)) by.append(make('span', 'quote-note', text(q.note)));
      figure.append(make('blockquote', '', '“' + text(q.quote) + '”'), by);
      quoteGrid.append(figure);
    }
    quoteGrid.classList.toggle('has-hl', quotes.some((q) => text(q.headline)));
    quoteSection.hidden = false;
  }

  /* ---------- what the site manager controls: hidden blocks, training dates, the message form ---------- */

  const store = {
    url: typeof content.storeUrl === 'string' && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(content.storeUrl.trim()) ? content.storeUrl.trim() : '',
    key: typeof content.storeKey === 'string' ? content.storeKey.trim() : ''
  };
  const storeOn = !!(store.url && store.key);
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

  /* hidden blocks. Every switchable block carries data-vis="key" in index.html; the keys that are switched off
     become one style rule (the line in the head of the page writes the same rule from the last visit).
     Links that point at a hidden block go with it. */
  const KEY = /^[a-z0-9]+(?::[a-z0-9-]+)?$/;
  const setHidden = (list) => {
    const off = new Set((Array.isArray(list) ? list : []).filter((key) => typeof key === 'string' && KEY.test(key)));
    const courses = [...document.querySelectorAll('.course[data-vis]')];
    for (const course of courses) {
      /* a course with no level left to show goes too, and so does the whole block when no course is left */
      const levels = [...course.querySelectorAll('.lvl[data-vis]')];
      if (levels.length && levels.every((level) => off.has(level.dataset.vis))) off.add(course.dataset.vis);
    }
    if (courses.length && courses.every((course) => off.has(course.dataset.vis))) off.add('courses');
    const keys = [...off].sort();
    let rule = document.getElementById('vis');
    if (!keys.length) {
      if (rule) rule.remove();
      return '';
    }
    if (!rule) {
      rule = document.createElement('style');
      rule.id = 'vis';
      document.head.append(rule);
    }
    const text = keys.map((key) => '[data-vis="' + key + '"],a[href="#' + key + '"]').join(',') + '{display:none!important}';
    if (rule.textContent !== text) rule.textContent = text;
    return keys.join(' ');
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
  let state = { hide: '', trainings: null, form: false };
  const show = (next) => steady(() => {
    state = { hide: setHidden(next.hidden), trainings: Array.isArray(next.trainings) ? next.trainings : null, form: !!next.form };
    drawDates(state.trainings);
    showForm(state.form, state.hide);
    retone();
  });
  const settled = () => root.classList.remove('fresh');   /* the menu links stop waiting (see the head of the page) */
  if (!storeOn) {
    /* no store: every block shows, hand-written dates if any, no form */
    remember(null);
    show({ hidden: [], trainings: null, form: false });
    settled();
    return;
  }
  const kept = recall();
  const week = 7 * 24 * 3600 * 1000;
  if (kept && typeof kept.hide === 'string') {
    const recent = typeof kept.at === 'number' && Date.now() - kept.at < week;
    show({ hidden: kept.hide.split(' '), trainings: recent ? kept.trainings : null, form: recent && kept.form === true });
  } else {
    show({ hidden: [], trainings: null, form: false });
  }
  const keep = () => remember({ hide: state.hide, trainings: state.trainings, form: state.form, at: Date.now() });
  (async () => {
    let now;
    try {
      now = await ask('site_public');
    } catch (error) {
      now = null;   /* the store did not answer: the page stays as this browser last saw it */
    }
    if (!now || typeof now !== 'object' || !Array.isArray(now.hidden)) return settled();
    show({ hidden: now.hidden, trainings: Array.isArray(now.trainings) ? now.trainings : state.trainings, form: now.form === true });
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
