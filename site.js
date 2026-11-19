/* omeraydin.coffee v2026-11-19c
   Reads window.siteContent (content.js) and fills the film, portrait, learner quotes, training dates and the message form.
   Keeps the glass menu readable: sets data-tone on the header from what is under its labels. */
(() => {
  'use strict';
  const content = window.siteContent || {};
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
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
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

  /* learner quotes: up to three, only entries with a quote and a name */
  const quotes = (content.testimonials || []).filter((q) => q && q.quote && q.name).slice(0, 3);
  const quoteSection = $('#quotes');
  const quoteGrid = $('#quote-grid');
  if (quotes.length && quoteSection && quoteGrid) {
    for (const q of quotes) {
      const figure = make('figure', 'quote');
      figure.append(
        make('blockquote', '', '“' + q.quote + '”'),
        make('figcaption', '', [q.name, q.role].filter(Boolean).join(' · '))
      );
      quoteGrid.append(figure);
    }
    quoteSection.hidden = false;
  }

  /* training dates: only entries with a date, a course and a location */
  const dates = (content.dates || []).filter((d) => d && d.date && d.course && d.location);
  const dateSection = $('#dates');
  const dateBox = $('#dates-list');
  if (dates.length && dateSection && dateBox) {
    const list = make('ul', 'date-list');
    for (const d of dates) {
      const hasLink = /^https:\/\//.test(d.url || '');
      const row = make(hasLink ? 'a' : 'div', 'date-row');
      if (hasLink) {
        row.href = d.url;
        row.setAttribute('aria-label', d.course + ', ' + d.date + ', ' + d.location + ', course details');
      }
      row.append(make('span', 'date-when', d.date), make('span', 'date-course', d.course), make('span', 'date-where', d.location));
      if (hasLink) row.append(arrow());
      const item = make('li');
      item.append(row);
      list.append(item);
    }
    dateBox.replaceChildren(list);
    dateSection.classList.add('has-dates');
  }

  /* message form: stays hidden until content.js has the address of the function that emails it.
     Nothing is sent anywhere before the visitor presses Send. */
  const form = $('#msg');
  const messageUrl = typeof content.messageUrl === 'string' ? content.messageUrl.trim() : '';
  if (form && /^https:\/\/[a-z0-9.-]+\/[\w./-]+$/i.test(messageUrl)) {
    const status = $('#msg-status');
    const sendBtn = form.querySelector('button[type="submit"]');
    form.hidden = false;
    const foot = form.closest('.foot');
    if (foot) foot.classList.add('has-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sendBtn.disabled) return;
      const fields = new FormData(form);
      const payload = {
        email: String(fields.get('email') || '').trim(),
        message: String(fields.get('message') || '').trim(),
        news: fields.get('news') === 'yes',
        fax: String(fields.get('fax') || '')
      };
      sendBtn.disabled = true;
      status.textContent = 'Sending…';
      let sent = false;
      try {
        const response = await fetch(messageUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => null);
        sent = response.status === 200 && !!result && result.ok === true;
      } catch (error) {
        sent = false;
      }
      sendBtn.disabled = false;
      if (sent) {
        form.reset();
        status.textContent = 'Thank you. Your message is on its way.';
      } else {
        status.textContent = 'That did not go through. Please try again in a moment, or write on Instagram.';
      }
    });
  }
})();
