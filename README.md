# omeraydin.coffee

Static one-page site, version v2026-11-21b, with a small manager page at `/manage`. Cloudflare Pages publishes the `main` branch as it is: no build step, the repository root is the site.

## What changes without an upload

Four things are read from the CoffeeNutz Supabase project (the "store") each time the page opens:

- which blocks are switched off in the site manager, and which learner cards that start hidden are switched on,
- the training dates, taken from the CoffeeNutz training calendar,
- which photos were uploaded for the learner cards in the site manager,
- whether the message form can be shown. The form sends its messages to the same store.

The store's address and public key are in `content.js` (`storeUrl`, `storeKey`). The key is the public one that the other CoffeeNutz tools also carry in their pages. No secret belongs in this repository: everything in it is published as part of the site.

If the store does not answer, the page shows itself as the visitor's browser last saw it. On a first visit that means every block, no dates and no form.

The database part is one SQL file, `omeraydin-site.sql`. It is kept outside this repository and is run in the Supabase SQL editor. A newer version of the file is run the same way on top of the old one; settings, messages and photos stay.

## Site manager

`https://omeraydin.coffee/manage`, sign-in with the CoffeeNutz admin account.

- Visibility: one eye per block of the page, per course and level in "Explore the courses", and per learner card under "What learners say". Learner cards that are hidden and are not being changed are counted in one line there ("12 more cards are hidden"), which opens them under Learners. Changes reach the site when Publish is pressed. A course with no level left is dropped by the site, and so is the course list when no course is left; the same holds for "What learners say" when no card is left. Menu links and buttons that point at a hidden block disappear with it.
- Messages: what visitors wrote, newest first, with read and unread marks. A message can be deleted with a second press; a deleted message cannot be brought back. Nothing can be edited.
- Learners: the learner cards in their order on the page, with three filters: All, On the site, Hidden. Every public course review on coffeenutz.net has a card; the ones not chosen yet are hidden. The eye on a card shows or hides it; it is the same switch as in the Visibility list and goes live with Publish. A card whose eye was just pressed stays in the list until Publish or Undo. The photo of a card: choose a picture from the computer, drag it inside the frame to set the crop, save. The browser makes the picture smaller first (1600 px on its long side at most, as JPEG, without what a camera writes into a file) and puts it into the photo store of the Supabase project. "Remove uploaded photo" brings back the file named in `content.js`, or no picture. "Download" saves the picture a card shows to the computer: the uploaded one, else the file named in `content.js`.

The manager reads its list of blocks from the live page: every element in `index.html` with a `data-vis="key"` attribute is one row, named by `data-vis-name` or by its own text. To make a new block switchable, give it a `data-vis` key (lower-case letters and digits, optionally `group:name`). Nothing else has to change. The learner cards are added to that list from `content.js`: a card with an `id` has the key `learner:<id>`.

The store keeps one list of what differs from the page as written: the key of every block that is switched off, and `shown:<id>` for every learner card that starts hidden and was switched on. A new entry with `starts: "hidden"` therefore stays off the site without anything being pressed.

## Training dates

The block lists the classes on the CoffeeNutz calendar that are marked "Kayıt açık" or "Kesinleşti" and have not started yet (by the date in İzmir), the eight soonest at most. Each row shows the dates, the course, its level, the place from `datesPlace` in `content.js` and the class language, and links to the course page. Seats, prices and names are not in the calendar feed and never reach the page.

The calendar feed only answers browsers on guide.coffeenutz.net and coffeenutz.net, so the store fetches it and keeps a copy for ten minutes. A change in the calendar can take up to fifteen minutes to show. "Read it again" in the site manager fetches at once.

With no upcoming class the block shows the "will be announced" sentence. The `dates` list in `content.js` is only a fallback for a site without a store.

## Changing content

Edit `content.js`: the YouTube video ID, the portrait file path, the store, the place shown with the dates, and the learners (every entry is shown, in the order written, three to a row on a wide screen).

- Each learner entry has two voices. `headline`, `position` and `company` are Ömer's own words about the learner, written as he gives them. `quote` is the learner's own words from a public review, in English. No remark about the source or the language is written on the card.
- `starts: "hidden"` keeps a card off the site until its eye is opened in the site manager and Publish is pressed. Every public course review on coffeenutz.net has an entry; the ones not chosen yet carry this line. Taking the line out makes the card show by default. Such an entry needs an `id`.
- `original` (the review as it was written) and `reviewed` (its date) are kept for the record and are never shown.
- `id` names the card for the site manager: a photo uploaded there under Learners is shown on the card with that id, and the eye there shows or hides it. Small letters, digits and hyphens; do not change an id once a photo was uploaded for it. To add a learner, add an entry with a new id; its photo can then be uploaded in the site manager, no file in the repository is needed.
- `photo` is the picture used when none was uploaded: a file in `assets/learners/`, shown in a 4:3 box above the headline. `photoAt` moves the crop inside that box (`"50% 16%"` is centred, a little below the top edge). A photo wider than 800 px stays sharp on every screen. Save the photos into that folder yourself, straight from your own files, under the names written in `content.js`. A missing or empty file is simply left out: the card then shows without a picture. Names, employers and photos only with the learner's agreement.
- A card without a `headline` shows its photo (if one was uploaded), the quote, and the name with `course` under it; its quote starts where the headlines of its row start. To finish such a card, write its `headline`, and `position` and `company` if wanted. An entry with neither `headline` nor `id` is shown the earlier way: the quote in large type with the name and `course` under it.
- The portrait is shown uncropped. Put a new picture in `assets/` and point `portrait` at it.
- Without a valid video ID the film sticker and the film link are removed and the classroom photo stays as a picture.

Written in `index.html`: course names, levels and their coffeenutz.net sales links (section `id="courses"`), and the background pop-up that the "More about Ömer Aydın" button under "Your instructor" opens (`<dialog id="bg">` near the end; the button is the link with `id="bg-open"`). Without scripts that button is a plain link to coffeenutz.net.

## Message form

The form in the closing panel ("Write to me") appears once the store has answered. A message goes from the visitor's browser straight into the store and shows up in the site manager under Messages. It also records whether the visitor ticked "Send me news and updates". Nothing is sent anywhere before a visitor presses Send.

The store accepts the form only from omeraydin.coffee, drops what a script writes into the hidden trap field, and takes at most 5 messages per sender and 40 in total in ten minutes.

## Menu

The menu is a glass capsule that stays in view while the page scrolls. Its labels change colour with what passes under them: red at the top of the page, ink over light surfaces, white over photos, the film and dark panels. `site.js` decides this from the `data-surface` attribute in `index.html`: a block marked `data-surface="media"` (a photo or the film) or `data-surface="dark"` (a dark panel) switches the capsule to its dark glass. Give a new dark block or a new photo that attribute, otherwise the labels over it stay ink.

## Files

- `index.html`: the page.
- `style.css`: layout and colours. Desktop first. Date rows stack at 1000 px and below, the menu button appears at 760 px and below, the phone layout at 520 px and below. The glass of the menu is in the header section.
- `site.js`: menu button, menu label colours, film player, background pop-up, the learner cards, and everything that comes from the store (hidden blocks, dates, message form).
- `content.js`: the values described above.
- `manage.html`: the site manager, served at `/manage`. It loads the Supabase sign-in library from cdn.jsdelivr.net, as the other CoffeeNutz tools do.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`: the ÖA mark for browser tabs and phone home screens.
- `assets/learners/`: the photos of the learner cards.
- `assets/`: photos and the two typefaces in `assets/fonts/` (Averia Serif Libre and Schibsted Grotesk, SIL Open Font License 1.1, see `assets/fonts/fonts-license.txt`).

When the page loads it asks the store one question (two when the stored calendar copy is older than ten minutes). A learner photo uploaded in the site manager is fetched from the store when the visitor comes near that block. Nothing else is requested from another host. The film loads from YouTube's privacy-enhanced player only after a visitor presses play.

## After changing style.css, site.js or content.js

Raise the version in `index.html`: the `version` meta tag and the `?v=` value of each file that changed (stylesheet, the two scripts, and the three icon links when an icon changes). A file that did not change keeps its value. `manage.html` carries its own version in its `version` meta tag, in its footer line and in its `?v=` for `content.js`.
