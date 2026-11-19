# omeraydin.coffee

Static one-page site, version v2026-11-19c. Cloudflare Pages publishes the `main` branch as it is: no build step, the repository root is the site.

## Changing content

Edit `content.js`. It holds the YouTube video ID, the portrait file path, the address the message form is sent to, approved learner testimonials (up to three) and confirmed training dates. Leave unknown content empty.

- Testimonials stay hidden until an entry has both a quote and a name. No endorsements are fabricated.
- Training dates show the "will be announced" line until an entry has a date, a course and a location. A `url` starting with `https://` turns the row into a link.
- The portrait is shown uncropped. Put a new picture in `assets/` and point `portrait` at it.
- Without a valid video ID the film sticker and the film link are removed and the classroom photo stays as a picture.

Course names, levels and their coffeenutz.net sales links are written in `index.html`, in the section with `id="courses"`.

## Message form

The form in the closing panel ("Write to me") stays hidden while `messageUrl` in `content.js` is empty. To switch it on, paste the address of the `site-message` function between the quotes. The address looks like `https://<project>.supabase.co/functions/v1/site-message`. It is not a secret.

A message goes from the visitor's browser to that function in Supabase, and the function emails it through Resend. Replying to the email answers the visitor. The email also says whether the visitor ticked "Send me news and updates". Nothing is sent anywhere before a visitor presses Send.

The function's code is kept in the Supabase project, not in this repository, because everything in this repository is published as part of the site. The Resend key and the receiving address are Supabase secrets (`RESEND_API_KEY`, `MESSAGE_TO`) and must never be written into these files. Opening the function address in a browser shows `"ready": true` once both secrets are in place.

## Menu

The menu is a glass capsule that stays in view while the page scrolls. Its labels change colour with what passes under them: red at the top of the page, ink over light surfaces, white over photos, the film and dark panels. `site.js` decides this from the `data-surface` attribute in `index.html`: a block marked `data-surface="media"` (a photo or the film) or `data-surface="dark"` (a dark panel) switches the capsule to its dark glass. Give a new dark block or a new photo that attribute, otherwise the labels over it stay ink.

## Files

- `index.html`: the page.
- `style.css`: layout and colours. Desktop first, the menu button appears at 760 px and below, the phone layout at 520 px and below. The glass of the menu is in the header section.
- `site.js`: menu button, menu label colours, film player, message form, and the parts filled from `content.js`.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`: the ÖA mark for browser tabs and phone home screens.
- `assets/`: photos and the two typefaces in `assets/fonts/` (Averia Serif Libre and Schibsted Grotesk, SIL Open Font License 1.1, see `assets/fonts/fonts-license.txt`).

Nothing is requested from another host when the page loads. The film loads from YouTube's privacy-enhanced player only after a visitor presses play, and the message function is contacted only when a visitor presses Send.

## After changing style.css or site.js

Raise the version in `index.html`: the `version` meta tag and the `?v=` values (stylesheet, script, and the three icon links when an icon changes).
