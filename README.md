# omeraydin.coffee

Static one-page site, version v2026-11-19b. Cloudflare Pages publishes the `main` branch as it is: no build step, the repository root is the site.

## Changing content

Edit `content.js`. It holds the YouTube video ID, the portrait file path, the key for the message form, approved learner testimonials (up to three) and confirmed training dates. Leave unknown content empty.

- Testimonials stay hidden until an entry has both a quote and a name. No endorsements are fabricated.
- Training dates show the "will be announced" line until an entry has a date, a course and a location. A `url` starting with `https://` turns the row into a link.
- The portrait is shown uncropped. Put a new picture in `assets/` and point `portrait` at it.
- Without a valid video ID the film sticker and the film link are removed and the classroom photo stays as a picture.

Course names, levels and their coffeenutz.net sales links are written in `index.html`, in the section with `id="courses"`.

## Message form

The form in the closing panel ("Write to me") stays hidden while `messageKey` in `content.js` is empty. To switch it on, create a free access key at web3forms.com with the address that should receive the messages, then paste the key between the quotes. The key is a public identifier, it is meant to be visible in the page source, and it is not a password.

Messages go from the visitor's browser to Web3Forms, which forwards them by email. Replying to that email answers the visitor. The email also says whether the visitor ticked "Send me news and updates". Nothing is sent to Web3Forms before a visitor presses Send.

## Files

- `index.html`: the page.
- `style.css`: layout and colours. Desktop first, the menu button appears at 760 px and below, the phone layout at 520 px and below.
- `site.js`: menu button, film player, message form, and the parts filled from `content.js`.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`: the ÖA mark for browser tabs and phone home screens.
- `assets/`: photos and the two typefaces in `assets/fonts/` (Averia Serif Libre and Schibsted Grotesk, SIL Open Font License 1.1, see `assets/fonts/fonts-license.txt`).

Nothing is requested from another host when the page loads. The film loads from YouTube's privacy-enhanced player only after a visitor presses play.

## After changing style.css or site.js

Raise the version in three places in `index.html`: the `version` meta tag and the two `?v=` values.
