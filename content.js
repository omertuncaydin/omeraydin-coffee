// Edit these values before publishing. Leave unknown content empty.
window.siteContent = {
  youtubeId: "eTAqLuLb1LA", // e.g. the ID after v= in your YouTube URL
  portrait: "assets/portrait.jpg", // e.g. assets/portrait.jpg

  // The store behind the site manager (omeraydin.coffee/manage): which blocks are shown, the training dates
  // read from the CoffeeNutz calendar, and the messages sent with the form. This key is the public one, the same
  // the other CoffeeNutz tools carry in their pages. Empty address: everything shows, no dates, no form.
  storeUrl: "https://efjvfggwnhqkunjvoyjb.supabase.co",
  storeKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanZmZ2d3bmhxa3VuanZveWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTA5MDEsImV4cCI6MjA5Nzg4NjkwMX0.A42X5lr8bYarJZVjPmfb45oyVnWYREODF4a6Y7i_tDA",

  // Shown with every class from the calendar. The calendar holds the classes taught at CoffeeNutz, İzmir.
  datesPlace: "İzmir",

  // Learners. Up to three are shown. Two voices, kept apart:
  //   headline, position, company   Ömer's own words about the learner, written as he gives them.
  //   quote                         the learner's own words from the public course reviews on coffeenutz.net, as an
  //                                 excerpt. "note" is for a translation remark.
  // id names the card for the site manager (omeraydin.coffee/manage, Learners): a photo uploaded there is shown on
  // the card with that id. Small letters, digits and hyphens. Do not change an id once a photo was uploaded for it.
  // photo is the picture used when none was uploaded: a file in assets/learners, shown 4:3. photoAt moves its crop:
  // "50% 16%" means centred, a little below the top edge. Full names, employers and photos only where the person
  // has agreed to it. "course" is kept for the record and is shown only for an entry without a headline.
  testimonials: [
    { id: "samuel-murgatroyd",
      headline: "Starbucks Reserve Roaster in Milan chose Ömer for SCA Roasting Professional.",
      photo: "assets/learners/samuel-murgatroyd.jpg", photoAt: "50% 50%",
      quote: "He is extremely knowledgeable, highly professional, and has a great teaching style that makes complex roasting concepts easy to understand.",
      name: "Samuel Murgatroyd", position: "roaster", company: "Starbucks Reserve, Milan", course: "Roasting · Professional" },
    { id: "kagan-giritli",
      headline: "Years of SCA training for Tchibo Türkiye’s head barista and dozens of his trainers.",
      photo: "assets/learners/kagan-giritli.jpg", photoAt: "50% 16%",
      quote: "…Ömer’s command of the subject and his systematic teaching method made even complex technical details easy to understand. Thanks to the patience, one-to-one guidance and professional approach he showed throughout the training, I was fully prepared for every learning outcome.",
      name: "Kağan Giritli", position: "head barista", company: "Tchibo Türkiye", course: "Barista Skills · Professional", note: "translated from Turkish" },
    { id: "doruk-osman",
      headline: "A historic boutique coffee shop in Greece chose Ömer for SCA Roasting.",
      photo: "assets/learners/doruk-osman.jpg", photoAt: "50% 66%",
      quote: "One of the best if not the best teacher in the industry",
      name: "Doruk Osman", course: "Roasting · Foundation + Intermediate" },
  ],

  // Only used when the store above is empty or cannot be reached and has never been read on this device.
  dates: [
    // { date: "Confirmed date", course: "Course name", location: "City, country", url: "https://..." },
  ]
};
