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

  // Learner quotes: the reviewers' own words from the public course reviews on coffeenutz.net, as excerpts.
  // Full names only where the person has agreed to it. "note" is for a translation remark. Up to three are shown.
  testimonials: [
    { quote: "He is extremely knowledgeable, highly professional, and has a great teaching style that makes complex roasting concepts easy to understand.", name: "Samuel Murgatroyd", role: "Roasting · Professional" },
    { quote: "In a word, excellent. Above all, Ömer is a professional with a scientific approach.", name: "Tarık S.", role: "Barista Skills · Professional", note: "translated from Turkish" },
    { quote: "One of the best if not the best teacher in the industry", name: "Doruk O.", role: "Roasting · Foundation + Intermediate" },
  ],

  // Only used when the store above is empty or cannot be reached and has never been read on this device.
  dates: [
    // { date: "Confirmed date", course: "Course name", location: "City, country", url: "https://..." },
  ]
};
