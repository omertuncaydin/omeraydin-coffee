# omeraydin.coffee

Static one-page site, version v2026-11-22c, with a small manager page at `/manage`. Cloudflare Pages publishes the `main` branch as it is: no build step, the repository root is the site.

## What changes without an upload

Five things are read from the CoffeeNutz Supabase project (the "store") each time the page opens:

- which blocks are switched off in the site manager, and which learner cards that start hidden are switched on,
- the training dates, taken from the CoffeeNutz training calendar,
- which photos were uploaded for the learner cards in the site manager,
- which texts were written in the site manager: the words and the order of the learner cards, the logo of a card and whether it is switched on, the texts of the pop-up behind "More about Ömer Aydın", and the texts of the block "Original Research & Methodology" with a recording for its button "Hear a roast", when one was chosen there,
- whether the message form can be shown. The form sends its messages to the same store.

The store's address and public key are in `content.js` (`storeUrl`, `storeKey`). The key is the public one that the other CoffeeNutz tools also carry in their pages. No secret belongs in this repository: everything in it is published as part of the site.

If the store does not answer, the page shows itself as the visitor's browser last saw it. On a first visit that means every block, the texts and the order of the site files, no dates and no form.

The database part is one SQL file, `omeraydin-site.sql`. It is kept outside this repository and is run in the Supabase SQL editor. A newer version of the file is run the same way on top of the old one; settings, messages, photos and texts stay. Texts need the version of 21 November 2026 or later (table `site_texts`); until it has been run, the site manager says so and the site shows the texts of the site files. A recording needs v2026-11-21f or later, which lets the photo store take sound files (MP3, M4A, WAV, 6 MB at most); until it has been run, the Research tab says so and everything else works.

## Site manager

`https://omeraydin.coffee/manage`, sign-in with the CoffeeNutz admin account.

- Visibility: one eye per block of the page, per course and level in "Explore the courses", and per learner card under "What learners say". Learner cards that are hidden and are not being changed are counted in one line there ("12 more cards are hidden"), which opens them under Learners. Changes reach the site when Publish is pressed. A course with no level left is dropped by the site, and so is the course list when no course is left; the same holds for "What learners say" when no card is left. Menu links and buttons that point at a hidden block disappear with it.
- Messages: what visitors wrote, newest first, with read and unread marks. A message can be deleted with a second press; a deleted message cannot be brought back. Nothing can be edited.
- Learners: the learner cards in their order on the page, with three filters: All, On the site, Hidden. "Edit text" opens the headline, name, title, company and quote of a card; what is saved there is shown in place of the text in `content.js`, and "Back to the text of the site files" takes it away again. The two arrows move a card up or down among the cards the filter lists. "Choose logo" takes a logo file from the computer for the card (PNG, SVG, WebP or JPEG); it is shown before the name, and "Logo on" / "Logo off" shows or hides it without taking the file away. "Remove logo" takes the file away after a second press. The browser cuts the empty edge off the logo, makes it 480 × 240 px at most and saves it as PNG in the photo store. A dark logo on a see-through or white ground works; a logo that is white all over is refused, because it would not show on the light page. Text, order and logo are saved at once, without Publish. Every public course review on coffeenutz.net has a card; the ones not chosen yet are hidden. The eye on a card shows or hides it; it is the same switch as in the Visibility list and goes live with Publish. A card whose eye was just pressed stays in the list until Publish or Undo. The photo of a card: choose a picture from the computer, drag it inside the frame to set the crop, save. The browser makes the picture smaller first (1600 px on its long side at most, as JPEG, without what a camera writes into a file) and puts it into the photo store of the Supabase project. "Remove uploaded photo" brings back the file named in `content.js`, or no picture. "Download" saves the picture a card shows to the computer: the uploaded one, else the file named in `content.js`.

- Pop-up: the texts of the pop-up that "More about Ömer Aydın" opens, one field each. A link is written as `[words](https://address)`, bold as `**words**`, a new line is a line break, and in the list every line is one entry. An emptied text is left out of the pop-up; the title cannot be emptied. A field that holds the text of the site files again is no longer kept in the store.
- Research: the texts of the block "Original Research & Methodology", one field each, written the same way as in the Pop-up tab; in the steps every line is one step. The line under the title, the paragraph and the steps can be emptied and are then left out; the label, the title and the texts of the two buttons cannot. Under them, one group per pop-up behind a step (a press on its line opens it): headline, text and the line under its figure, and for the second and third pop-up the data of the figure. A group says in its line whether its pop-up opens on the site, has no headline or text, or is switched off. Under the fields: the recording that the play button plays. The site comes with one (see `roastSound` below); "Choose recording" takes an MP3, M4A or WAV file of 6 MB at most from the computer, saves it at once, as it is, and the site plays it in place of its own. It can be listened to there, replaced, or removed after a second press; removing it brings back the recording of the site files. The eye of the whole block is in the Visibility list, and under it one eye for each pop-up.

The manager reads its list of blocks from the live page: every element in `index.html` with a `data-vis="key"` attribute is one row, named by `data-vis-name` or by its own text. To make a new block switchable, give it a `data-vis` key (lower-case letters and digits, optionally `group:name`). Nothing else has to change. The learner cards are added to that list from `content.js`: a card with an `id` has the key `learner:<id>`.

The texts that can be changed are read from the live page in the same way: an element with `data-edit="group:name"` is one field, named by `data-edit-name`. `data-edit-need` marks a text that cannot be emptied, and `data-edit-box` marks a box that disappears when every text inside it was emptied. A list (`ul` or `ol`) takes one line per entry. To make another text of the page editable, give its element a `data-edit` key; the Pop-up tab lists the keys that start with `bg:`, the Research tab those that start with `rm:`. Texts inside an element with `data-edit-group="name"` are shown together as one group under that name, and `data-edit-hint` puts a line of explanation under a field.

The store keeps one list of what differs from the page as written: the key of every block that is switched off, and `shown:<id>` for every learner card that starts hidden and was switched on. A new entry with `starts: "hidden"` therefore stays off the site without anything being pressed.

A logo needs no line in the database script: it is kept with the texts. `learner:<id>:logo` names the file in the photo store (`logos/<id>-<stamp>-<width>x<height>.png`), and `learner:<id>:logo-off` holds `1` while the logo is switched off. The site shows a logo no taller than 48 px and no wider than 96 px, a wide one a little lower, so that logos of different shapes weigh about the same.

A recording chosen in the site manager is kept the same way: the text `rm:sound` names its file in the photo store (`sounds/roast-<stamp>.mp3`, `.m4a` or `.wav`). Removing it in the site manager takes the text and the file away.

## Original Research & Methodology

The black panel after "Your instructor" (`<section id="research">` in `index.html`, so `omeraydin.coffee/#research` opens the page there). On the left: the label, the title, a line under it, a paragraph and two buttons. On the right: a numbered list of steps. The words written in `index.html` show while nothing was saved in the site manager (Research).

- "Hear a roast" plays a recording and pauses it when pressed again: the one chosen in the site manager, else the file named by `roastSound` in `content.js` (36 seconds of first crack from one of the roastery's own roasts, in `assets/sounds/`). If the chosen one cannot be fetched, the file of the site is played. With neither, the button is not shown. Nothing is fetched before a visitor presses it; pressing play on the film pauses it.
- "Host a workshop" jumps to "Host a course" in the closing panel and disappears with that block when it is switched off.
- The steps are numbered by the style sheet: one line in the site manager is one step, however many there are.

### The pop-ups behind the steps

Each of the first four steps can open a sheet (the four `<dialog class="bg step" id="sheet-1">` to `sheet-4` inside the section). A step opens while its sheet has a headline or a text; one emptied of both is a plain name, as all steps were before v2026-11-22c. A step that opens gets a round button at its right; a press anywhere on its row opens the sheet. The sheet shows the number and name of its step, a headline, a text, a figure with a line under it, "Next: <the following step>" and "Close", and dots for its place in the line. The last one links to the courses and to "Host a course" under the names those two carry on the page.

- The words stand in `index.html` as first drafts and are changed in the site manager (Research): `rm:s1-head`, `rm:s1-text`, `rm:s1-note` and the same for `s2`, `s3`, `s4`. An emptied one takes no room. The line under the picture of the fourth sheet is empty in the site files.
- A sheet with words can be switched off again: the eyes are `sheet:1` to `sheet:4` in the Visibility list, under the block.
- An open sheet has an address: the name of its step in plain lower-case letters (`omeraydin.coffee/#acoustic-stages`), and `#sheet-2` whatever the step is called. A link to that address opens the page with the sheet open.
- Sheet 1 shows the recording of the site files as a picture (its outline and a mark for each pop, computed once and written into `index.html`) with a play button for the same player as "Hear a roast". A line runs along the picture while it plays, and a press on the picture plays from that place. While a recording chosen in the site manager is the one that plays, a plain bar stands in for the outline. If `assets/sounds/first-crack.mp3` is ever replaced, the outline in `index.html` (`.wave`, with `data-for` and `data-seconds`) has to be made again from the new file.
- Sheet 2 draws a bell with named points from the lines of `rm:s2-points`: one line per point, `name` or `name: what it stands for`; what stands after the colon is listed under the bell. Two to twelve points; with fewer the figure is left out. `rm:s2-axes` holds the words on its two axes: the one that points up, then the one along the bottom.
- Sheet 3 draws measured roasts on one scale from the lines of `rm:s3-roasts`: `value | label` is a roast, `value - value | label` a band behind the dots (its label is shown above the figure). The scale sets itself; `rm:s3-axis` is the unit under it.
- Sheet 4 shows `assets/classroom.jpg`.
- Without scripts, or in a browser without `<dialog>`, the steps are plain names.

## Training dates

The block lists the classes on the CoffeeNutz calendar that are marked "Kayıt açık" or "Kesinleşti" and have not started yet (by the date in İzmir), the eight soonest at most. Each row shows the dates, the course, its level, the place from `datesPlace` in `content.js` and the class language, and links to the course page. Seats, prices and names are not in the calendar feed and never reach the page.

The calendar feed only answers browsers on guide.coffeenutz.net and coffeenutz.net, so the store fetches it and keeps a copy for ten minutes. A change in the calendar can take up to fifteen minutes to show. "Read it again" in the site manager fetches at once.

With no upcoming class the block shows the "will be announced" sentence. The `dates` list in `content.js` is only a fallback for a site without a store.

## Changing content

Edit `content.js`: the YouTube video ID, the portrait file path, the recording for "Hear a roast" (`roastSound`: a file in `assets/sounds/`, MP3, M4A or WAV, small letters, digits and hyphens in its name; leave it empty for a site without one), the store, the place shown with the dates, and the learners (every entry is shown, in the order written, three to a row on a wide screen).

What the site manager holds comes on top of `content.js`: a headline, name, title, company or quote written there replaces the one written here for that card, and an order set there replaces the order of the entries. Logos exist only in the site manager; `content.js` has no line for them. A card the saved order does not name (a new entry, for example) follows after the named ones. So when a change in `content.js` does not show on the site, look at the card in the site manager first.

- Each learner entry has two voices. `headline`, `position` and `company` are Ömer's own words about the learner, written as he gives them. `quote` is the learner's own words from a public review, in English. No remark about the source or the language is written on the card.
- `starts: "hidden"` keeps a card off the site until its eye is opened in the site manager and Publish is pressed. Every public course review on coffeenutz.net has an entry; the ones not chosen yet carry this line. Taking the line out makes the card show by default. Such an entry needs an `id`.
- `original` (the review as it was written) and `reviewed` (its date) are kept for the record and are never shown.
- `id` names the card for the site manager: a photo uploaded there under Learners is shown on the card with that id, and the eye there shows or hides it. Small letters, digits and hyphens; do not change an id once a photo was uploaded for it. To add a learner, add an entry with a new id; its photo can then be uploaded in the site manager, no file in the repository is needed.
- `photo` is the picture used when none was uploaded: a file in `assets/learners/`, shown in a 4:3 box above the headline. `photoAt` moves the crop inside that box (`"50% 16%"` is centred, a little below the top edge). A photo wider than 800 px stays sharp on every screen. Save the photos into that folder yourself, straight from your own files, under the names written in `content.js`. A missing or empty file is simply left out: the card then shows without a picture. Names, employers and photos only with the learner's agreement.
- On a card the quote shows three lines; a longer one gets "Read more", which opens it, and "Show less". The whole quote is in the page either way. Under the quote stands the name in bold, and below it the title and the company (`position` · `company`). A line that opens with the title starts with a capital on the page, whatever is written here.
- A card without a `headline` shows its photo (if one was uploaded), the quote, and the name with `course` under it; its quote starts where the headlines of its row start. To finish such a card, write its `headline`, and `position` and `company` if wanted. An entry with neither `headline` nor `id` is shown the earlier way: the quote in large type with the name and `course` under it.
- The portrait is shown uncropped. Put a new picture in `assets/` and point `portrait` at it.
- Without a valid video ID the film sticker and the film link are removed and the classroom photo stays as a picture.

Written in `index.html`: course names, levels and their coffeenutz.net sales links (section `id="courses"`), and the background pop-up that the "More about Ömer Aydın" button under "Your instructor" opens (`<dialog id="bg">` near the end; the button is the link with `id="bg-open"`). Its texts can be replaced in the site manager (Pop-up); what is written in `index.html` is what shows while nothing was saved there. Without scripts that button is a plain link to coffeenutz.net.

## Message form

The form in the closing panel ("Write to me") appears once the store has answered. A message goes from the visitor's browser straight into the store and shows up in the site manager under Messages. It also records whether the visitor ticked "Send me news and updates". Nothing is sent anywhere before a visitor presses Send.

The store accepts the form only from omeraydin.coffee, drops what a script writes into the hidden trap field, and takes at most 5 messages per sender and 40 in total in ten minutes.

## Menu

The menu is a glass capsule that stays in view while the page scrolls. Its labels change colour with what passes under them: red at the top of the page, ink over light surfaces, white over photos, the film and dark panels. `site.js` decides this from the `data-surface` attribute in `index.html`: a block marked `data-surface="media"` (a photo or the film) or `data-surface="dark"` (a dark panel) switches the capsule to its dark glass. Give a new dark block or a new photo that attribute, otherwise the labels over it stay ink.

## Files

- `index.html`: the page.
- `style.css`: layout and colours. Desktop first. Date rows stack at 1000 px and below, the menu button appears at 760 px and below, the phone layout at 520 px and below. The glass of the menu is in the header section.
- `site.js`: menu button, menu label colours, film player, background pop-up, the learner cards, the button that plays the recording, and everything that comes from the store (hidden blocks, dates, photos, texts and card order, message form). A text from the store is put into the page as text, never as HTML.
- `content.js`: the values described above.
- `manage.html`: the site manager, served at `/manage`. It loads the Supabase sign-in library from cdn.jsdelivr.net, as the other CoffeeNutz tools do.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`: the ÖA mark for browser tabs and phone home screens.
- `assets/learners/`: the photos of the learner cards.
- `assets/sounds/`: the recording that "Hear a roast" plays while none was chosen in the site manager.
- `assets/`: photos and the two typefaces in `assets/fonts/` (Averia Serif Libre and Schibsted Grotesk, SIL Open Font License 1.1, see `assets/fonts/fonts-license.txt`).

When the page loads it asks the store one question (two when the stored calendar copy is older than ten minutes). A learner photo or a logo uploaded in the site manager is fetched from the store when the visitor comes near that block, and the recording only after "Hear a roast" was pressed (from the site itself, or from the store when one was chosen in the site manager). Nothing else is requested from another host. The film loads from YouTube's privacy-enhanced player only after a visitor presses play.

## After changing style.css, site.js or content.js

Raise the version in `index.html`: the `version` meta tag and the `?v=` value of each file that changed (stylesheet, the two scripts, and the three icon links when an icon changes). A file that did not change keeps its value. `manage.html` carries its own version in its `version` meta tag, in its footer line and in its `?v=` for `content.js`.
