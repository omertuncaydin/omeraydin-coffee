// Edit these values before publishing. Leave unknown content empty.
window.siteContent = {
  youtubeId: "eTAqLuLb1LA", // e.g. the ID after v= in your YouTube URL
  portrait: "assets/portrait.jpg", // e.g. assets/portrait.jpg

  // The recording that "Hear a roast" plays in the block "Original Research & Methodology": a file in assets/sounds
  // (mp3, m4a or wav; small letters, digits and hyphens in its name). A recording chosen in the site manager
  // (Research) is played in its place. Empty: the button shows only while the site manager holds a recording.
  roastSound: "assets/sounds/first-crack.mp3",

  // The store behind the site manager (omeraydin.coffee/manage): which blocks are shown, the training dates
  // read from the CoffeeNutz calendar, and the messages sent with the form. This key is the public one, the same
  // the other CoffeeNutz tools carry in their pages. Empty address: everything shows, no dates, no form.
  storeUrl: "https://efjvfggwnhqkunjvoyjb.supabase.co",
  storeKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanZmZ2d3bmhxa3VuanZveWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTA5MDEsImV4cCI6MjA5Nzg4NjkwMX0.A42X5lr8bYarJZVjPmfb45oyVnWYREODF4a6Y7i_tDA",

  // Shown with every class from the calendar. The calendar holds the classes taught at CoffeeNutz, İzmir.
  datesPlace: "İzmir",

  // Learners. The entries are shown in this order, three to a row. Two voices, kept apart:
  //   headline, position, company   Ömer's own words about the learner, written as he gives them.
  //   quote                         the learner's own words from a public review, in English.
  // id names the card for the site manager (omeraydin.coffee/manage, Learners): a photo uploaded there is shown on
  // the card with that id, and the eye there shows or hides the card. Small letters, digits and hyphens. Do not
  // change an id once a photo was uploaded for it.
  // starts: "hidden" keeps a card off the site until its eye is opened in the site manager and Publish is pressed.
  // Every public course review on coffeenutz.net has an entry here; the ones not chosen yet start hidden.
  // "original" (the review as it was written) and "reviewed" (its date) are kept for the record. The English page
  // never shows them.
  // The Turkish page (omeraydin.coffee/tr) shows the same cards with: tr: { headline, position, company, quote },
  // first drafts that the site manager can replace (tab "Türkçe"). Where tr has no quote, the Turkish page shows
  // "original", the learner's own Turkish words; where it has neither, the English quote. A value left out of tr
  // is taken from the English card. The name is the same on both pages.
  // photo is the picture used when none was uploaded: a file in assets/learners, shown 4:3. photoAt moves its crop:
  // "50% 16%" means centred, a little below the top edge. Full names, employers and photos only where the person
  // has agreed to it. "course" is kept for the record and is shown only for an entry without a headline.
  testimonials: [
    { id: "samuel-murgatroyd",
      headline: "Starbucks Reserve Roaster in Milan chose Ömer for SCA Roasting Professional.",
      photo: "assets/learners/samuel-murgatroyd.jpg", photoAt: "50% 50%",
      quote: "He is extremely knowledgeable, highly professional, and has a great teaching style that makes complex roasting concepts easy to understand.",
      name: "Samuel Murgatroyd", position: "roaster", company: "Starbucks Reserve, Milan", course: "Roasting · Professional",
      tr: { headline: "Starbucks Reserve Milano’nun kavurucusu, SCA Roasting Professional için Ömer’i seçti.",
            position: "kavurucu", company: "Starbucks Reserve, Milano",
            quote: "SCA Roasting Professional sertifikamı Ömer ile tamamlamak inanılmaz bir deneyimdi. Son derece bilgili, çok profesyonel ve karmaşık kavurma kavramlarını kolay anlaşılır kılan harika bir öğretme tarzı var. Sabrı, yol göstericiliği ve derin uzmanlığı sayesinde kendimi tamamen hazır hissettim ve sınavı rahatlıkla geçtim. Kavurma becerilerinizi en üst seviyeye taşımak istiyorsanız, eğitimini ne kadar tavsiye etsem az!" } },
    { id: "kagan-giritli",
      headline: "Years of SCA training for Tchibo Türkiye’s head barista and dozens of his trainers.",
      photo: "assets/learners/kagan-giritli.jpg", photoAt: "50% 16%",
      quote: "…Ömer’s command of the subject and his systematic teaching method made even complex technical details easy to understand. Thanks to the patience, one-to-one guidance and professional approach he showed throughout the training, I was fully prepared for every learning outcome.",
      name: "Kağan Giritli", position: "head barista", company: "Tchibo Türkiye", course: "Barista Skills · Professional",
      tr: { headline: "Tchibo Türkiye’nin baş baristası ve onlarca eğitmeni Ömer’den eğitim aldı.",
            position: "baş barista", company: "Tchibo Türkiye",
            quote: "Ekibim ile CoffeeNutz’da gerçekleştirdiğimiz uzun SCA Barista eğitimleri ve Profesyonel için de birebir Tchibo merkezde geçen 3 günlük eğitimimizde Ömer Hoca’nın; konuya hakimiyeti ve sistematik öğretim metodu, karmaşık teknik detayları dahi anlaşılır kıldı." } },
    { id: "doruk-osman",
      headline: "A historic boutique coffee shop in Greece chose Ömer for SCA Roasting.",
      photo: "assets/learners/doruk-osman.jpg", photoAt: "50% 66%",
      quote: "One of the best if not the best teacher in the industry",
      name: "Doruk Osman", course: "Roasting · Foundation + Intermediate",
      tr: { headline: "Yunanistan’dan bir nitelikli kahve dükkânı sahibi, SCA Roasting için Ömer’i seçti.",
            position: "işletme sahibi", company: "Nitelikli Kahve Dükkânı, Yunanistan",
            quote: "Sektördeki en iyi eğitmenlerden biri, belki de en iyisi" } },
    { id: "yakup-cankir",
      headline: "Head roaster of Türkiye’s most popular coffee roasting company kahve.com chose Ömer for roasting training.",
      quote: "I took roasting training from Ömer and left 100% satisfied. His knowledge and the way he conveys it were truly incredible. A professional extremely well versed in his field, who blends his passion for coffee with science and combines a scientist’s rigour with a coffee lover’s excitement…",
      name: "Yakup Çankır", position: "head roaster", company: "kahve.com", course: "Roasting",
      tr: { headline: "kahve.com’un baş kavurucusu, ileri seviye kavurma eğitimi için Ömer’i seçti.",
            position: "baş kavurucu", company: "kahve.com",
            quote: "Ömer Hoca’dan kavurma eğitimi aldım ve %100 memnuniyetle ayrıldım. Bilgi birikimi ve bu bilgiyi aktarma şekli gerçekten inanılmazdı. Kahveye olan tutkusunu bilimle harmanlayan, bilim insanı titizliğini bir kahve severin heyecanıyla birleştiren, alanında son derece donanımlı bir profesyonel." } },
    // The other public course reviews on coffeenutz.net, newest first. Hidden until switched on in the site manager.
    // Names are as the review shows them, until Ömer gives the full name, the position and the company of a learner;
    // the card then gets its headline as well (kemal-a, ferhat-m). A card without a headline shows its photo (if one
    // was uploaded), the quote and "name · course".
    { id: "kemal-a", starts: "hidden",
      headline: "Owner and roaster of Shady Coffee Works chose Ömer for SCA Roasting Professional.",
      quote: "The trainings were packed with both knowledge and practice, and a thoroughly enjoyable time as well. Thanks to Ömer’s kind and generous approach, it was a training in which we felt at ease, found answers to our questions and got something out of every moment. I thank him for sharing his knowledge and experience so sincerely and for making learning this enjoyable.",
      name: "Kemal Akdaş", position: "owner and roaster", company: "Shady Coffee Works", course: "Roasting · Professional", reviewed: "2026-11-06",
      tr: { headline: "Shady Coffee Roastery’nin kurucusu, SCA Roasting Professional için Ömer’i seçti.", position: "kurucu ve kavurucu", company: "Shady Coffee Roastery" },
      original: "Eğitimler hem bilgi ve uygulama açısından dolu dolu hem de oldukça keyifli bir süreçti. Ömer Hoca’nın nazik, ve paylaşımcı yaklaşımı sayesinde kendimizi rahat hissettiğimiz, sorularımıza karşılık bulabildiğimiz ve her anından verim aldığımız bir eğitim oldu. Bilgi ve deneyimlerini içtenlikle paylaştığı, öğrenmeyi bu kadar keyifli hâle getirdiği için kendisine teşekkür ederim." },
    { id: "emin-g", starts: "hidden",
      quote: "I was truly very pleased with the Roasting training I took from Ömer Aydın. Besides his depth of knowledge, he is an extremely kind, patient and sincere instructor. Above all, his ability to look at topics from different perspectives and explain them again with different teaching methods makes learning far more productive. This training did not just improve my roasting knowledge, it also changed the way I look at coffee. The experience and valuable advice he shared with my goal of becoming a Q Grader in mind were especially precious to me. Thank you very much for everything.",
      name: "Emin G.", course: "Roasting · Foundation + Intermediate", reviewed: "2026-10-22",
      original: "Ömer Aydın hocamdan aldığım Roasting eğitiminden gerçekten çok memnun kaldım. Bilgi birikiminin yanı sıra son derece kibar, sabırlı ve samimi bir eğitmen. Özellikle konuları farklı perspektiflerden ele alıp farklı öğretim yöntemleriyle yeniden aktarabilmesi, öğrenme sürecini çok daha verimli kılıyor. Bu eğitim yalnızca kavurma bilgimi geliştirmekle kalmadı, kahveye bakış açımı da değiştirdi. Q Grader olma hedefim doğrultusunda paylaştığı tecrübeler ve değerli tavsiyeler benim için ayrıca çok kıymetliydi. Her şey için çok teşekkür ederim hocam." },
    { id: "tugba-s", starts: "hidden",
      quote: "It was a full, intense training in which a great deal was learned. I thank Ömer for everything.",
      name: "Tuğba S.", course: "Roasting · Foundation + Intermediate", reviewed: "2026-07-17",
      original: "Dolu dolu geçen ve çok fazla şey öğrenilen bir eğitimdi her şey için Ömer hocaya teşekkür ederim." },
    { id: "ferhat-m", starts: "hidden",
      headline: "Head roaster of Can Kardeşler chose Ömer for SCA Roasting.",
      quote: "Taking part in this training was a very valuable experience for me. I gained technical knowledge about coffee roasting and also had the chance to benefit from years of experience. Most importantly, it made my passion for coffee grow even further. It was a sincere, professional and instructive training. I thank Ömer for his work and recommend it to everyone who wants to lay a solid foundation for their coffee journey.",
      name: "Ferhat Mete", position: "head roaster", company: "Can Kardeşler", course: "Roasting · Foundation + Intermediate", reviewed: "2026-06-14",
      tr: { headline: "Can Kardeşler’in baş kavurucusu, SCA Roasting Professional için Ömer’i seçti.", position: "baş kavurucu", company: "Can Kardeşler" },
      original: "Bu eğitime katılmak benim için çok değerli bir deneyimdi. Kahve kavurma konusunda hem teknik bilgiler edindim hem de yılların deneyiminden faydalanma fırsatı buldum. En önemlisi, kahveye olan tutkumun daha da artmasını sağladı. Samimi, profesyonel ve öğretici bir eğitim süreciydi. Emeği geçen Ömer hocama teşekkür ediyor, kahve yolculuğuna sağlam bir temel atmak isteyen herkese tavsiye ediyorum." },
    { id: "saggezza", starts: "hidden",
      quote: "During the Q Grader training, the way CoffeeNutz, that is Ömer, passed on knowledge was truly very valuable. Running a training this technical and this demanding in a way that is both disciplined and clear takes serious competence. Ömer’s command of the subject, the calm confidence in his approach and the importance he gives to detail made the process far more productive. I thank CoffeeNutz, that is Ömer, for this strong training experience.",
      name: "Saggezza A.ş S.", course: "Q Grader", reviewed: "2026-04-23",
      original: "Q Grader eğitimi sürecinde Coffee Nutz’un yani Ömer hocanın bilgi aktarımı gerçekten çok kıymetliydi. Bu kadar teknik ve dikkat isteyen bir eğitimi, hem disiplinli hem de anlaşılır şekilde yürütmek ciddi bir yetkinlik gerektiriyor. Ömer hocanın konuya hakimiyeti, yaklaşımındaki sakin güven ve detaylara verdiği önem, süreci çok daha verimli hale getirdi. Coffee Nutz’a yani Ömer hocaya bu güçlü eğitim deneyimi için teşekkür ederim." },
    { id: "mehmet-d", starts: "hidden",
      quote: "Many thanks to Ömer. A wonderful instructor. A wonderful person.",
      name: "Mehmet D.", course: "Roasting · Foundation + Intermediate", reviewed: "2025-12-02",
      original: "ömer bey'e çok teşekkür ederim. harika bir eğitmen. harika bir insan." },
    { id: "huseyin-u", starts: "hidden",
      quote: "It was a very useful and wonderful training. Ömer is a true doyen and a perfect gentleman. Once again, thank you very, very much. Taking this training from Ömer is great luck.",
      name: "Hüseyin U.", course: "Roasting · Foundation + Intermediate", reviewed: "2025-12-01",
      original: "Çok faydalı ve harika bir eğitimdi Ömer hocam gerçek bir duayen tam bir beyefendi. Tekrar çok çok teşekkür ederim. Bu eğitimi Ömer hocadan almak büyük şans." },
    { id: "tarik-s", starts: "hidden",
      quote: "In one word, excellent. First of all, Ömer is a professional with a scientific approach. Naturally, the quality of the training you get from such an instructor is highly satisfying. In essence, besides the technical knowledge we gain in SCA courses, the way the instructor makes his point of view and his experience tangible as he teaches is also a criterion for a student when choosing. You will feel the experience throughout your training :) The Modbar and the other fancy equipment are the icing on the cake...",
      name: "Tarık S.", course: "Barista Skills · Professional", reviewed: "2025-09-29",
      original: "Tek kelime ile mükemmel. Her şeyden önce, Ömer Hoca bilimsel yaklaşıma sahip bir profesyonel. Tabi ki böyle bir eğitmenden aldığınız eğitimin kalitesi oldukça tatmin edici oluyor. İşin özünde, SCA eğitimlerinde edindiğimiz teknik bilginin yanı sıra eğitmenin bakış açısı ve tecrübelerini somutlaştırarak anlatması da öğrenci için bir seçim kriteri. Eğitiminiz süresince tecrübeyi hissedeceksiniz :) Modbar ve diğer fancy ekipmanlar da işin cabası..." },
    { id: "taylan-k", starts: "hidden",
      quote: "In the four-day programme I took, with Ömer’s support and teaching, I believe I went through a very useful certification process. I would like to thank him.",
      name: "Taylan K.", course: "Roasting · Foundation + Intermediate", reviewed: "2025-05-05",
      original: "4 gün bpyunca aldığım programda Sayın Ömer Hocamın desteği ve anlatımı ile çok faydalı bir sertifika süreci geçirdiğimi düşünüyorum. Kendisine teşekkür etmek isterim." },
    { id: "cagri-o-retake", starts: "hidden",
      quote: "Like a coach, Ömer is always at our side. So glad we got to know him. :)",
      name: "Çağrı Ö.", course: "Consultancy & Retakes", reviewed: "2025-04-20",
      original: "Bir Koç gibi her zaman yanımızda Ömer hocamız. İyi ki tanımışız. :)" },
    { id: "cagri-o", starts: "hidden",
      quote: "Learning roasting from a master of the craft, from tremendous experience, was priceless. Thank you, Ömer.",
      name: "Çağrı Ö.", course: "Roasting · Foundation + Intermediate", reviewed: "2025-03-24",
      original: "İşin ehlinden, müthiş deneyimden kavurma öğrenmek paha biçilemezdi. Teşekkürler Ömer hocam." },
    { id: "hamza-h", starts: "hidden",
      quote: "Everything was magnificent. I can say that training with Ömer was the most valuable investment I have made in coffee. With his knowledge and experience he showed the way on everything to do with coffee. CoffeeNutz has a special place in our hearts. So glad you are there.",
      name: "Hamza H.", course: "Roasting · Foundation + Intermediate", reviewed: "2023-12-28",
      original: "Her şey şahaneydi. Ömer hocadan eğitim almış olmak kahve üzerine yaptığım en kıymetli yatırımdı diyebilirim. Bilgisi ve deneyimiyle kahveyle ilgili her konuda yol gösterdi. Coffenutz, gönlümüzde özel bir yere sahip. İyi ki varsınız." },
  ],

  // Only used when the store above is empty or cannot be reached and has never been read on this device.
  dates: [
    // { date: "Confirmed date", course: "Course name", location: "City, country", url: "https://..." },
  ]
};
