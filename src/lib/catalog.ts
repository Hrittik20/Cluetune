import type { Decade, Difficulty, Genre, ModeFilters, Track } from "./types";

/**
 * The seed pool. Every mode (Daily, Unlimited, Sped-Up, Lyrics Guess, Gauntlet)
 * draws from this single catalog so difficulty and coverage stay consistent
 * across the product.
 *
 * Unlimited, Sped-Up and Lyrics Guess also merge in Spotify editorial playlists
 * at request time when API credentials are present. Daily and Gauntlet stay on
 * this list so a rotating chart cannot change a shared puzzle.
 *
 * Entries carry metadata only — no audio. Playable clips are resolved at
 * request time through the provider chain in `src/lib/providers`, which is why
 * nothing here references a file path or a CDN.
 *
 * In production this is expected to be replaced by (or hydrated from) an
 * editorial database; the shape is intentionally the same so swapping the
 * source does not touch game code.
 */
export const CATALOG: Track[] = [
  // ── pop ──────────────────────────────────────────────────────────────────
  t("blinding-lights", "Blinding Lights", "The Weeknd", "After Hours", 2020, ["pop", "electronic"], 1, 908604612),
  t("levitating", "Levitating", "Dua Lipa", "Future Nostalgia", 2020, ["pop"], 1, 1124841682),
  t("as-it-was", "As It Was", "Harry Styles", "Harry's House", 2022, ["pop"], 1, 1703487577),
  t("espresso", "Espresso", "Sabrina Carpenter", "Short n' Sweet", 2024, ["pop"], 1, 2743578151),
  t("flowers", "Flowers", "Miley Cyrus", "Endless Summer Vacation", 2023, ["pop"], 1, 2105158337),
  t("bad-guy", "bad guy", "Billie Eilish", "When We All Fall Asleep, Where Do We Go?", 2019, ["pop"], 1, 655095912),
  t("rolling-in-the-deep", "Rolling in the Deep", "Adele", "21", 2010, ["pop", "rnb"], 1, 1174602992),
  t("toxic", "Toxic", "Britney Spears", "In the Zone", 2003, ["pop"], 1, 15391618),
  t("since-u-been-gone", "Since U Been Gone", "Kelly Clarkson", "Breakaway", 2004, ["pop", "rock"], 2, 15392707),
  t("dancing-queen", "Dancing Queen", "ABBA", "Arrival", 1976, ["pop"], 1, 884025),
  t("wannabe", "Wannabe", "Spice Girls", "Spice", 1996, ["pop"], 2, 45523681),
  t("torn", "Torn", "Natalie Imbruglia", "Left of the Middle", 1997, ["pop", "rock"], 3, 992131),
  t("murder-on-the-dancefloor", "Murder on the Dancefloor", "Sophie Ellis-Bextor", "Read My Lips", 2001, ["pop", "electronic"], 3, 4181750),
  t("padam-padam", "Padam Padam", "Kylie Minogue", "Tension", 2023, ["pop", "electronic"], 3, 3788156152),
  t("running-up-that-hill", "Running Up That Hill (A Deal with God)", "Kate Bush", "Hounds of Love", 1985, ["pop"], 2, 2173954687),
  t("take-on-me", "Take On Me", "a-ha", "Hunting High and Low", 1985, ["pop"], 1, 664107),
  t("billie-jean", "Billie Jean", "Michael Jackson", "Thriller", 1982, ["pop"], 1, 4603408),
  t("i-wanna-dance-with-somebody", "I Wanna Dance with Somebody (Who Loves Me)", "Whitney Houston", "Whitney", 1987, ["pop"], 1, 75981528),
  t("shake-it-off", "Shake It Off", "Taylor Swift", "1989", 2014, ["pop"], 1, 132744476),
  t("cruel-summer", "Cruel Summer", "Taylor Swift", "Lover", 2019, ["pop"], 1, 737967292),
  t("uptown-funk", "Uptown Funk", "Mark Ronson", "Uptown Special", 2014, ["pop"], 1, 92734438),
  t("dancing-on-my-own", "Dancing On My Own", "Robyn", "Body Talk Pt. 1", 2010, ["pop", "electronic"], 2, 1262005432),
  t("just-the-way-you-are", "Just the Way You Are", "Bruno Mars", "Doo-Wops & Hooligans", 2010, ["pop"], 1, 7216935),
  t("treasure", "Treasure", "Bruno Mars", "Unorthodox Jukebox", 2012, ["pop"], 1, 62724017),
  t("24k-magic", "24K Magic", "Bruno Mars", "24K Magic", 2016, ["pop"], 1, 136336110),
  t("thats-what-i-like", "That's What I Like", "Bruno Mars", "24K Magic", 2017, ["pop", "rnb"], 1, 136336116),
  t("grenade", "Grenade", "Bruno Mars", "Doo-Wops & Hooligans", 2010, ["pop"], 1, 14616013),
  t("leave-the-door-open", "Leave the Door Open", "Silk Sonic", "An Evening with Silk Sonic", 2021, ["pop", "rnb"], 1, 1666877272),
  t("firework", "Firework", "Katy Perry", "Teenage Dream", 2010, ["pop"], 1, 17135111),
  t("roar", "Roar", "Katy Perry", "Prism", 2013, ["pop"], 1, 71645431),
  t("teenage-dream", "Teenage Dream", "Katy Perry", "Teenage Dream", 2010, ["pop"], 1, 17135108),
  t("dark-horse", "Dark Horse", "Katy Perry", "Prism", 2013, ["pop"], 2, 71645436),
  t("thank-u-next", "thank u, next", "Ariana Grande", "thank u, next", 2019, ["pop"], 1, 629899852),
  t("7-rings", "7 rings", "Ariana Grande", "thank u, next", 2019, ["pop"], 1, 629899842),
  t("problem", "Problem", "Ariana Grande", "My Everything", 2014, ["pop"], 1, 83837258),
  t("positions", "positions", "Ariana Grande", "Positions", 2020, ["pop", "rnb"], 1, 1126047002),
  t("royals", "Royals", "Lorde", "Pure Heroine", 2013, ["pop", "indie"], 1, 70403437),
  t("green-light", "Green Light", "Lorde", "Melodrama", 2017, ["pop", "electronic"], 2, 371625771),
  t("we-found-love", "We Found Love", "Rihanna", "Talk That Talk", 2011, ["pop", "electronic"], 1, 14525574),
  t("diamonds", "Diamonds", "Rihanna", "Unapologetic", 2012, ["pop"], 1, 60978718),
  t("work", "Work", "Rihanna", "Anti", 2016, ["pop", "rnb"], 1, 118190298),
  t("halo", "Halo", "Beyoncé", "I Am... Sasha Fierce", 2008, ["pop", "rnb"], 1, 2485108),

  // ── hip-hop ──────────────────────────────────────────────────────────────
  t("sicko-mode", "SICKO MODE", "Travis Scott", "Astroworld", 2018, ["hip-hop"], 2, 536421002),
  t("humble", "HUMBLE.", "Kendrick Lamar", "DAMN.", 2017, ["hip-hop"], 1, 350171311),
  t("juicy", "Juicy", "The Notorious B.I.G.", "Ready to Die", 1994, ["hip-hop"], 2, 3616616),
  t("ny-state-of-mind", "N.Y. State of Mind", "Nas", "Illmatic", 1994, ["hip-hop"], 3, 77096688),
  t("ms-jackson", "Ms. Jackson", "OutKast", "Stankonia", 2000, ["hip-hop"], 2, 963042),
  t("alright", "Alright", "Kendrick Lamar", "To Pimp a Butterfly", 2015, ["hip-hop"], 2, 97206068),
  t("nonstop", "Nonstop", "Drake", "Scorpion", 2018, ["hip-hop"], 3, 533609202),
  t("nuthin-but-a-g-thang", "Nuthin' but a 'G' Thang", "Dr. Dre", "The Chronic", 1992, ["hip-hop"], 2, 2132919007),
  t("passionfruit", "Passionfruit", "Drake", "More Life", 2017, ["hip-hop", "rnb"], 2, 144572210),
  t("not-like-us", "Not Like Us", "Kendrick Lamar", "GNX", 2024, ["hip-hop"], 1, 2783963122),
  t("lose-yourself", "Lose Yourself", "Eminem", "8 Mile", 2002, ["hip-hop"], 1, 1109731),
  t("gold-digger", "Gold Digger", "Kanye West", "Late Registration", 2005, ["hip-hop"], 1, 1184309),
  t("shook-ones-pt-ii", "Shook Ones, Pt. II", "Mobb Deep", "The Infamous", 1995, ["hip-hop"], 3, 1044157),
  t("99-problems", "99 Problems", "Jay-Z", "The Black Album", 2003, ["hip-hop"], 2, 676960),
  t("empire-state-of-mind", "Empire State of Mind", "Jay-Z", "The Blueprint 3", 2009, ["hip-hop", "pop"], 1, 90533119),
  t("bodak-yellow", "Bodak Yellow", "Cardi B", "Invasion of Privacy", 2017, ["hip-hop"], 1, 373063001),
  t("this-is-america", "This Is America", "Childish Gambino", "This Is America", 2018, ["hip-hop"], 1, 496157642),
  t("earfquake", "EARFQUAKE", "Tyler, the Creator", "IGOR", 2019, ["hip-hop"], 2, 681009652),
  t("mask-off", "Mask Off", "Future", "Future", 2017, ["hip-hop"], 2, 142337683),
  t("sexyback", "SexyBack", "Justin Timberlake", "FutureSex/LoveSounds", 2006, ["pop", "rnb"], 1, 15489383),

  // ── r&b ──────────────────────────────────────────────────────────────────
  t("cranes-in-the-sky", "Cranes in the Sky", "Solange", "A Seat at the Table", 2016, ["rnb"], 3, 133103636),
  t("redbone", "Redbone", "Childish Gambino", "Awaken, My Love!", 2016, ["rnb"], 2, 3025966451),
  t("best-part", "Best Part", "Daniel Caesar", "Freudian", 2017, ["rnb"], 3, 417767192),
  t("no-scrubs", "No Scrubs", "TLC", "FanMail", 1999, ["rnb", "pop"], 2, 1075781),
  t("say-my-name", "Say My Name", "Destiny's Child", "The Writing's on the Wall", 1999, ["rnb", "pop"], 2, 580936),
  t("snooze", "Snooze", "SZA", "SOS", 2022, ["rnb"], 2, 2055292087),
  t("untitled-how-does-it-feel", "Untitled (How Does It Feel)", "D'Angelo", "Voodoo", 2000, ["rnb"], 3, 139102925),
  t("kill-bill", "Kill Bill", "SZA", "SOS", 2022, ["rnb"], 1, 2055292027),
  t("bad-habit", "Bad Habit", "Steve Lacy", "Gemini Rights", 2022, ["rnb"], 2, 1805106587),
  t("thinkin-bout-you", "Thinkin Bout You", "Frank Ocean", "Channel Orange", 2012, ["rnb"], 2, 17881414),
  t("adorn", "Adorn", "Miguel", "Kaleidoscope Dream", 2012, ["rnb"], 3, 60847141),
  t("lets-get-it-on", "Let's Get It On", "Marvin Gaye", "Let's Get It On", 1973, ["rnb"], 1, 2432823),
  t("sexual-healing", "Sexual Healing", "Marvin Gaye", "Midnight Love", 1982, ["rnb"], 1, 851867),
  t("superstition", "Superstition", "Stevie Wonder", "Talking Book", 1972, ["rnb"], 1, 596034702),
  t("isnt-she-lovely", "Isn't She Lovely", "Stevie Wonder", "Songs in the Key of Life", 1976, ["rnb"], 1, 538709352),
  t("respect", "Respect", "Aretha Franklin", "I Never Loved a Man the Way I Love You", 1967, ["rnb"], 1, 904732),
  t("i-will-always-love-you", "I Will Always Love You", "Whitney Houston", "The Bodyguard", 1992, ["pop", "rnb"], 1, 7675403),
  t("cant-stop-the-feeling", "Can't Stop the Feeling!", "Justin Timberlake", "Trolls", 2016, ["pop"], 1, 132635814),
  t("mirrors-timberlake", "Mirrors", "Justin Timberlake", "The 20/20 Experience", 2013, ["pop", "rnb"], 1, 65356224),
  t("cry-me-a-river", "Cry Me a River", "Justin Timberlake", "Justified", 2002, ["pop", "rnb"], 2, 969494),
  t("hold-up", "Hold Up", "Beyoncé", "Lemonade", 2016, ["pop", "rnb"], 2, 669486632),
  t("freedom", "Freedom", "Beyoncé", "Lemonade", 2016, ["hip-hop", "rnb"], 2, 669486712),

  // ── rock ─────────────────────────────────────────────────────────────────
  t("bohemian-rhapsody", "Bohemian Rhapsody", "Queen", "A Night at the Opera", 1975, ["rock"], 1, 4091937401),
  t("smells-like-teen-spirit", "Smells Like Teen Spirit", "Nirvana", "Nevermind", 1991, ["rock"], 1, 13693497),
  t("mr-brightside", "Mr. Brightside", "The Killers", "Hot Fuss", 2004, ["rock", "indie"], 1, 71955234),
  t("seven-nation-army", "Seven Nation Army", "The White Stripes", "Elephant", 2003, ["rock"], 1, 1153182282),
  t("everlong", "Everlong", "Foo Fighters", "The Colour and the Shape", 1997, ["rock"], 2, 4762041),
  t("paranoid-android", "Paranoid Android", "Radiohead", "OK Computer", 1997, ["rock", "indie"], 3, 138539973),
  t("wish-you-were-here", "Wish You Were Here", "Pink Floyd", "Wish You Were Here", 1975, ["rock"], 2, 116914042),
  t("take-me-out", "Take Me Out", "Franz Ferdinand", "Franz Ferdinand", 2004, ["rock", "indie"], 2, 4315684),
  t("dreams", "Dreams", "Fleetwood Mac", "Rumours", 1977, ["rock"], 1, 63480987),
  t("wonderwall", "Wonderwall", "Oasis", "(What's the Story) Morning Glory?", 1995, ["rock"], 1, 985745702),
  t("creep", "Creep", "Radiohead", "Pablo Honey", 1992, ["rock", "indie"], 1, 138547415),
  t("sweet-child-o-mine", "Sweet Child O' Mine", "Guns N' Roses", "Appetite for Destruction", 1987, ["rock"], 1, 518458172),
  t("under-the-bridge", "Under the Bridge", "Red Hot Chili Peppers", "Blood Sugar Sex Magik", 1991, ["rock"], 2, 785176),
  t("come-as-you-are", "Come as You Are", "Nirvana", "Nevermind", 1991, ["rock"], 2, 1543592132),
  t("stairway-to-heaven", "Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", 1971, ["rock"], 1, 88003859),
  t("whole-lotta-love", "Whole Lotta Love", "Led Zeppelin", "Led Zeppelin II", 1969, ["rock"], 2, 78671026),
  t("paint-it-black", "Paint It Black", "The Rolling Stones", "Aftermath", 1966, ["rock"], 1, 7818900),
  t("satisfaction", "(I Can't Get No) Satisfaction", "The Rolling Stones", "Out of Our Heads", 1965, ["rock"], 1, 7677778),
  t("sympathy-for-the-devil", "Sympathy for the Devil", "The Rolling Stones", "Beggars Banquet", 1968, ["rock"], 2, 9956063),
  t("with-or-without-you", "With or Without You", "U2", "The Joshua Tree", 1987, ["rock"], 1, 347363311),
  t("one-u2", "One", "U2", "Achtung Baby", 1991, ["rock"], 2, 14343282),
  t("heroes", "Heroes", "David Bowie", "\"Heroes\"", 1977, ["rock"], 1, 461043312),
  t("space-oddity", "Space Oddity", "David Bowie", "Space Oddity", 1969, ["rock"], 1, 107465566),
  t("lets-dance", "Let's Dance", "David Bowie", "Let's Dance", 1983, ["rock", "pop"], 2, 565656032),
  t("purple-rain", "Purple Rain", "Prince", "Purple Rain", 1984, ["pop", "rock"], 1, 374283061),
  t("kiss-prince", "Kiss", "Prince", "Parade", 1986, ["pop", "rock"], 2, 664178),
  t("born-to-run", "Born to Run", "Bruce Springsteen", "Born to Run", 1975, ["rock"], 2, 582022442),
  t("born-in-the-usa", "Born in the U.S.A.", "Bruce Springsteen", "Born in the U.S.A.", 1984, ["rock", "pop"], 2, 15586213),
  t("black-hole-sun", "Black Hole Sun", "Soundgarden", "Superunknown", 1994, ["rock"], 2, 78631539),
  t("alive-pearl-jam", "Alive", "Pearl Jam", "Ten", 1991, ["rock"], 2, 7675130),
  t("losing-my-religion", "Losing My Religion", "R.E.M.", "Out of Time", 1991, ["rock", "indie"], 2, 136334560),
  t("take-me-to-church", "Take Me to Church", "Hozier", "Hozier", 2013, ["rock", "indie"], 1, 72690686),
  t("killing-in-the-name", "Killing in the Name", "Rage Against the Machine", "Rage Against the Machine", 1992, ["metal", "rock"], 2, 62082829),

  // ── indie ────────────────────────────────────────────────────────────────
  t("two-weeks", "Two Weeks", "Grizzly Bear", "Veckatimest", 2009, ["indie"], 4, 5959430),
  t("midnight-city", "Midnight City", "M83", "Hurry Up, We're Dreaming", 2011, ["indie", "electronic"], 2, 75569764),
  t("fluorescent-adolescent", "Fluorescent Adolescent", "Arctic Monkeys", "Favourite Worst Nightmare", 2007, ["indie", "rock"], 3, 4637206),
  t("skinny-love", "Skinny Love", "Bon Iver", "For Emma, Forever Ago", 2007, ["indie"], 3, 73916142),
  t("the-less-i-know-the-better", "The Less I Know the Better", "Tame Impala", "Currents", 2015, ["indie"], 2, 103052662),
  t("pink-pony-club", "Pink Pony Club", "Chappell Roan", "The Rise and Fall of a Midwest Princess", 2020, ["pop", "indie"], 2, 2454854845),
  t("do-i-wanna-know", "Do I Wanna Know?", "Arctic Monkeys", "AM", 2013, ["indie", "rock"], 1, 70322130),
  t("electric-feel", "Electric Feel", "MGMT", "Oracular Spectacular", 2007, ["indie"], 2, 536484),
  t("kids", "Kids", "MGMT", "Oracular Spectacular", 2007, ["indie"], 2, 536485),
  t("float-on", "Float On", "Modest Mouse", "Good News for People Who Love Bad News", 2004, ["indie"], 3, 581923),
  t("young-folks", "Young Folks", "Peter Bjorn and John", "Writer's Block", 2006, ["indie"], 3, 4194903),
  t("last-nite", "Last Nite", "The Strokes", "Is This It", 2001, ["indie", "rock"], 2, 15615270),
  t("reptilia", "Reptilia", "The Strokes", "Room on Fire", 2003, ["indie", "rock"], 2, 14880812),
  t("a-punk", "A-Punk", "Vampire Weekend", "Vampire Weekend", 2008, ["indie"], 2, 66537484),
  t("harmony-hall", "Harmony Hall", "Vampire Weekend", "Father of the Bride", 2019, ["indie"], 2, 622127052),
  t("feel-good-inc", "Feel Good Inc.", "Gorillaz", "Demon Days", 2005, ["indie", "electronic"], 1, 3129407),
  t("clint-eastwood", "Clint Eastwood", "Gorillaz", "Gorillaz", 2001, ["indie", "hip-hop"], 2, 77528562),
  t("all-my-friends", "All My Friends", "LCD Soundsystem", "Sound of Silver", 2007, ["indie", "electronic"], 3, 3110852),
  t("wake-up-arcade-fire", "Wake Up", "Arcade Fire", "Funeral", 2004, ["indie", "rock"], 2, 374205501),
  t("rebellion-lies", "Rebellion (Lies)", "Arcade Fire", "Funeral", 2004, ["indie", "rock"], 3, 374205521),
  t("nobody-mitski", "Nobody", "Mitski", "Be the Cowboy", 2018, ["indie"], 3, 526540822),
  t("tennis-court", "Tennis Court", "Lorde", "Pure Heroine", 2013, ["pop", "indie"], 2, 70403435),

  // ── electronic ───────────────────────────────────────────────────────────
  t("one-more-time", "One More Time", "Daft Punk", "Discovery", 2000, ["electronic"], 1, 3135553),
  t("around-the-world", "Around the World", "Daft Punk", "Homework", 1997, ["electronic"], 2, 3129775),
  t("windowlicker", "Windowlicker", "Aphex Twin", "Windowlicker", 1999, ["electronic"], 4, 29392051),
  t("opus", "Opus", "Eric Prydz", "Opus", 2015, ["electronic"], 3, 118585342),
  t("sandstorm", "Sandstorm", "Darude", "Before the Storm", 1999, ["electronic"], 2, 11390027),
  t("music-sounds-better-with-you", "Music Sounds Better with You", "Stardust", "Music Sounds Better with You", 1998, ["electronic"], 3, 695110932),
  t("levels", "Levels", "Avicii", "Levels", 2011, ["electronic"], 1, 14383880),
  t("titanium", "Titanium", "David Guetta", "Nothing but the Beat", 2011, ["electronic", "pop"], 1, 62847142),
  t("scary-monsters-and-nice-sprites", "Scary Monsters and Nice Sprites", "Skrillex", "Scary Monsters and Nice Sprites", 2010, ["electronic"], 2, 7927244),
  t("praise-you", "Praise You", "Fatboy Slim", "You've Come a Long Way, Baby", 1998, ["electronic"], 2, 15686777),
  t("born-slippy", "Born Slippy .NUXX", "Underworld", "Trainspotting", 1995, ["electronic"], 3, 82265248),
  t("insomnia", "Insomnia", "Faithless", "Reverence", 1995, ["electronic"], 3, 15641322),
  t("blue-monday", "Blue Monday", "New Order", "Power, Corruption & Lies", 1983, ["electronic", "rock"], 2, 7337280),
  t("galvanize", "Galvanize", "The Chemical Brothers", "Push the Button", 2005, ["electronic"], 3, 3130293),
  t("strobe", "Strobe", "deadmau5", "For Lack of a Better Name", 2009, ["electronic"], 4, 3390634561),
  t("summer-calvin", "Summer", "Calvin Harris", "Motion", 2014, ["electronic", "pop"], 1, 88936747),
  t("this-is-what-you-came-for", "This Is What You Came For", "Calvin Harris", "This Is What You Came For", 2016, ["electronic", "pop"], 1, 123883254),
  t("feel-so-close", "Feel So Close", "Calvin Harris", "18 Months", 2011, ["electronic", "pop"], 2, 13040252),
  t("firestarter", "Firestarter", "The Prodigy", "The Fat of the Land", 1996, ["electronic"], 2, 62126191),
  t("breathe-prodigy", "Breathe", "The Prodigy", "The Fat of the Land", 1997, ["electronic"], 2, 62126185),
  t("lean-on", "Lean On", "Major Lazer", "Peace Is the Mission", 2015, ["electronic", "pop"], 1, 657813082),
  t("dont-you-worry-child", "Don't You Worry Child", "Swedish House Mafia", "Until Now", 2012, ["electronic", "pop"], 1, 60842360),
  t("clarity", "Clarity", "Zedd", "Clarity", 2012, ["electronic", "pop"], 1, 60904700),
  t("happier-marshmello", "Happier", "Marshmello", "Joytime III", 2018, ["electronic", "pop"], 1, 2441318935),

  // ── k-pop ────────────────────────────────────────────────────────────────
  t("dynamite", "Dynamite", "BTS", "BE", 2020, ["kpop", "pop"], 1, 1564465082),
  t("how-you-like-that", "How You Like That", "BLACKPINK", "The Album", 2020, ["kpop"], 2, 1097366392),
  t("super-shy", "Super Shy", "NewJeans", "Get Up", 2023, ["kpop"], 2, 2354707745),
  t("gods-menu", "God's Menu", "Stray Kids", "Go Live", 2020, ["kpop"], 3, 1642053412),
  t("next-level", "Next Level", "aespa", "Savage", 2021, ["kpop"], 3, 1371226732),
  t("gee", "Gee", "Girls' Generation", "Gee", 2009, ["kpop"], 3, 728406632),
  t("gangnam-style", "Gangnam Style", "PSY", "Psy 6 (Six Rules), Part 1", 2012, ["kpop"], 1, 60726278),
  t("butter", "Butter", "BTS", "Butter", 2021, ["kpop", "pop"], 1, 1576169062),
  t("boy-with-luv", "Boy With Luv", "BTS", "Map of the Soul: Persona", 2019, ["kpop", "pop"], 2, 1580983462),
  t("ddu-du-ddu-du", "DDU-DU DDU-DU", "BLACKPINK", "Square Up", 2018, ["kpop"], 2, 623470292),
  t("hype-boy", "Hype Boy", "NewJeans", "New Jeans", 2022, ["kpop"], 2, 1843514397),
  t("fancy", "FANCY", "TWICE", "Fancy You", 2019, ["kpop"], 3, 1255927852),
  t("psycho", "Psycho", "Red Velvet", "The ReVe Festival: Finale", 2019, ["kpop"], 3, 835295992),
  t("cupid", "Cupid", "FIFTY FIFTY", "The Beginning: Cupid", 2023, ["kpop", "pop"], 2, 2943563431),
  t("queencard", "Queencard", "(G)I-DLE", "I Feel", 2023, ["kpop"], 3, 3282147301),
  t("i-am-the-best", "I Am the Best", "2NE1", "2NE1", 2011, ["kpop"], 3, 92731220),
  t("fantastic-baby", "Fantastic Baby", "BIGBANG", "Alive", 2012, ["kpop"], 3, 45616751),
  t("love-scenario", "Love Scenario", "iKON", "Return", 2018, ["kpop"], 4, 1385129042),

  // ── afrobeats ────────────────────────────────────────────────────────────
  t("essence", "Essence", "Wizkid", "Made in Lagos", 2020, ["afrobeats", "rnb"], 2, 1463057142),
  t("last-last", "Last Last", "Burna Boy", "Love, Damini", 2022, ["afrobeats"], 2, 1748190317),
  t("ye", "Ye", "Burna Boy", "Outside", 2018, ["afrobeats"], 3, 452794492),
  t("calm-down", "Calm Down", "Rema", "Rave & Roses", 2022, ["afrobeats", "pop"], 1, 1873297197),
  t("ojuelegba", "Ojuelegba", "Wizkid", "Ayo", 2014, ["afrobeats"], 4, 1755868257),
  t("kwaku-the-traveller", "Kwaku the Traveller", "Black Sherif", "The Villain I Never Was", 2022, ["afrobeats", "drill"], 4, 1664803792),
  t("water", "Water", "Tyla", "Tyla", 2023, ["afrobeats", "pop"], 1, 2381294455),
  t("love-nwantiti", "Love Nwantiti (Ah Ah Ah)", "CKay", "CKay the First", 2019, ["afrobeats"], 2, 752155092),
  t("unavailable", "Unavailable", "Davido", "Timeless", 2023, ["afrobeats"], 3, 2182407327),
  t("fall", "Fall", "Davido", "Fall", 2017, ["afrobeats"], 3, 368671201),
  t("peru", "Peru", "Fireboy DML", "Peru", 2021, ["afrobeats"], 3, 1592733101),
  t("rush", "Rush", "Ayra Starr", "19 & Dangerous", 2022, ["afrobeats"], 3, 1881003417),
  t("terminator", "Terminator", "Asake", "Mr. Money With the Vibe", 2022, ["afrobeats"], 3, 1841734987),
  t("city-boys", "City Boys", "Burna Boy", "I Told Them...", 2023, ["afrobeats"], 3, 2424008615),
  t("soweto", "Soweto", "Victony", "Outlaw", 2022, ["afrobeats"], 4, 3279575181),
  t("ku-lo-sa", "Ku Lo Sa", "Oxlade", "Oxlade From Africa", 2022, ["afrobeats"], 4, 1963397827),

  // ── hyperpop ─────────────────────────────────────────────────────────────
  t("money-machine", "money machine", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 3, 864796942),
  t("hand-crushed-by-a-mallet", "hand crushed by a mallet", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 4, 864797012),
  t("stupid-horse", "stupid horse", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 5, 864796972),
  t("vroom-vroom", "Vroom Vroom", "Charli XCX", "Vroom Vroom", 2016, ["hyperpop", "pop"], 3, 119060180),
  t("360", "360", "Charli XCX", "Brat", 2024, ["hyperpop", "pop"], 2, 2833834772),
  t("von-dutch", "Von dutch", "Charli XCX", "Brat", 2024, ["hyperpop", "pop"], 3, 2833834822),
  t("nuclear-seasons", "Nuclear Seasons", "Charli XCX", "True Romance", 2012, ["hyperpop", "pop"], 4, 66175061),
  t("unlock-it", "Unlock It", "Charli XCX", "Pop 2", 2017, ["hyperpop", "pop"], 4, 437638462),
  t("second-hand-embarrassment", "Second Hand Embarrassment", "underscores", "fishmonger", 2021, ["hyperpop"], 5, 1247701112),
  t("immaterial", "Immaterial", "SOPHIE", "Oil of Every Pearl's Un-Insides", 2018, ["hyperpop"], 4, 2471885091),
  t("bipp", "BIPP", "SOPHIE", "Product", 2013, ["hyperpop"], 5, 1054951642),
  t("flamboyant", "Flamboyant", "Dorian Electra", "Flamboyant", 2019, ["hyperpop"], 4, 840490232),
  t("flamingo", "Flamingo", "Kero Kero Bonito", "Bonito Generation", 2016, ["hyperpop"], 4, 1858722027),
  t("hey-qt", "Hey QT", "QT", "Hey QT", 2014, ["hyperpop"], 5, 99613428),

  // ── drill ────────────────────────────────────────────────────────────────
  t("body", "Body", "Russ Millions", "Body", 2021, ["drill"], 3, 1285329872),
  t("location", "Location", "Dave", "Psychodrama", 2019, ["drill", "hip-hop"], 3, 3553155311),
  t("welcome-to-the-party", "Welcome to the Party", "Pop Smoke", "Meet the Woo", 2019, ["drill"], 3, 3529770671),
  t("dior", "Dior", "Pop Smoke", "Meet the Woo 2", 2020, ["drill"], 2, 3529770711),
  t("thiago-silva", "Thiago Silva", "Dave", "Thiago Silva", 2016, ["drill", "hip-hop"], 4, 124449412),
  t("doja", "Doja", "Central Cee", "23", 2022, ["drill"], 2, 1824910267),
  t("sprinter", "Sprinter", "Dave", "Split Decision", 2023, ["drill", "hip-hop"], 2, 3553677361),
  t("obsessed-with-you", "Obsessed With You", "Central Cee", "Wild West", 2021, ["drill"], 3, 1487902102),
  t("for-the-night", "For the Night", "Pop Smoke", "Shoot for the Stars, Aim for the Moon", 2020, ["drill"], 2, 3529770231),
  t("mood-swings", "Mood Swings", "Pop Smoke", "Shoot for the Stars, Aim for the Moon", 2020, ["drill"], 3, 3529770331),
  t("big-drip", "Big Drip", "Fivio Foreign", "800 BC", 2019, ["drill"], 3, 803129772),
  t("both", "Both", "Headie One", "Edna", 2020, ["drill"], 4, 728316192),
  t("homerton-b", "Homerton B", "Unknown T", "Homerton B", 2018, ["drill"], 4, 558529092),

  // ── latin ────────────────────────────────────────────────────────────────
  t("despacito", "Despacito", "Luis Fonsi", "Vida", 2017, ["latin", "pop"], 1, 623698142),
  t("titi-me-pregunto", "Tití Me Preguntó", "Bad Bunny", "Un Verano Sin Ti", 2022, ["latin"], 2, 1741494317),
  t("gasolina", "Gasolina", "Daddy Yankee", "Barrio Fino", 2004, ["latin"], 2, 3165861441),
  t("bailando", "Bailando", "Enrique Iglesias", "Sex and Love", 2014, ["latin", "pop"], 3, 765849012),
  t("hips-dont-lie", "Hips Don't Lie", "Shakira", "Oral Fixation, Vol. 2", 2006, ["latin", "pop"], 1, 3663852612),
  t("mi-gente", "Mi Gente", "J Balvin", "Vibras", 2017, ["latin"], 2, 376989861),
  t("provenza", "Provenza", "Karol G", "Mañana Será Bonito", 2022, ["latin"], 2, 1721634237),
  t("con-altura", "Con Altura", "ROSALÍA", "Con Altura", 2019, ["latin", "pop"], 3, 656027552),
  t("malamente", "Malamente", "ROSALÍA", "El Mal Querer", 2018, ["latin"], 4, 501851822),
  t("la-camisa-negra", "La Camisa Negra", "Juanes", "Mi Sangre", 2004, ["latin"], 3, 2445182),
  t("suavemente", "Suavemente", "Elvis Crespo", "Suavemente", 1998, ["latin"], 3, 13211608),
  t("oye-como-va", "Oye Como Va", "Santana", "Abraxas", 1970, ["latin", "rock"], 3, 15437788),

  // ── country ──────────────────────────────────────────────────────────────
  t("jolene", "Jolene", "Dolly Parton", "Jolene", 1973, ["country"], 1, 114422238),
  t("wagon-wheel", "Wagon Wheel", "Darius Rucker", "True Believers", 2013, ["country"], 3, 67351232),
  t("the-gambler", "The Gambler", "Kenny Rogers", "The Gambler", 1978, ["country"], 3, 3108438),
  t("ring-of-fire", "Ring of Fire", "Johnny Cash", "Ring of Fire: The Best of Johnny Cash", 1963, ["country"], 1, 856630),
  t("country-roads", "Take Me Home, Country Roads", "John Denver", "Poems, Prayers & Promises", 1971, ["country"], 1, 769749602),
  t("man-i-feel-like-a-woman", "Man! I Feel Like a Woman!", "Shania Twain", "Come On Over", 1997, ["country", "pop"], 2, 731732392),
  t("before-he-cheats", "Before He Cheats", "Carrie Underwood", "Some Hearts", 2005, ["country"], 2, 90944585),
  t("texas-hold-em", "TEXAS HOLD 'EM", "Beyoncé", "COWBOY CARTER", 2024, ["country", "pop"], 1, 2658723742),
  t("cruise", "Cruise", "Florida Georgia Line", "Here's to the Good Times", 2012, ["country"], 3, 62513271),
  t("friends-in-low-places", "Friends in Low Places", "Garth Brooks", "No Fences", 1990, ["country"], 1, 454775252),
  t("the-dance", "The Dance", "Garth Brooks", "Garth Brooks", 1990, ["country"], 2, 356070761),
  t("last-night-wallen", "Last Night", "Morgan Wallen", "One Thing at a Time", 2023, ["country"], 1, 3398329531),
  t("whiskey-glasses", "Whiskey Glasses", "Morgan Wallen", "If I Know Me", 2018, ["country"], 2, 2851520632),
  t("live-like-you-were-dying", "Live Like You Were Dying", "Tim McGraw", "Live Like You Were Dying", 2004, ["country"], 2, 75766544),
  t("amarillo-by-morning", "Amarillo by Morning", "George Strait", "Easy Come Easy Go", 1982, ["country"], 2, 7379463),
  t("country-girl-shake-it", "Country Girl (Shake It for Me)", "Luke Bryan", "Tailgates & Tanlines", 2011, ["country"], 2, 1614081222),
  t("god-s-country", "God's Country", "Blake Shelton", "God's Country", 2019, ["country"], 2, 654789872),

  // ── metal ────────────────────────────────────────────────────────────────
  t("enter-sandman", "Enter Sandman", "Metallica", "Metallica", 1991, ["metal", "rock"], 1, 136408134),
  t("chop-suey", "Chop Suey!", "System of a Down", "Toxicity", 2001, ["metal", "rock"], 1, 15523781),
  t("bleed", "Bleed", "Meshuggah", "obZen", 2008, ["metal"], 5, 3065403241),
  t("paranoid", "Paranoid", "Black Sabbath", "Paranoid", 1970, ["metal", "rock"], 1, 2332931615),
  t("in-the-end", "In the End", "Linkin Park", "Hybrid Theory", 2000, ["metal", "rock"], 1, 676183),
  t("master-of-puppets", "Master of Puppets", "Metallica", "Master of Puppets", 1986, ["metal"], 2, 1806332507),
  t("ace-of-spades", "Ace of Spades", "Motörhead", "Ace of Spades", 1980, ["metal", "rock"], 2, 3803071362),
  t("duality", "Duality", "Slipknot", "Vol. 3: The Subliminal Verses", 2004, ["metal"], 2, 3819908),
  t("raining-blood", "Raining Blood", "Slayer", "Reign in Blood", 1986, ["metal"], 3, 65690449),
  t("numb", "Numb", "Linkin Park", "Meteora", 2003, ["metal", "rock"], 1, 14629005),
  t("crawling", "Crawling", "Linkin Park", "Hybrid Theory", 2000, ["metal", "rock"], 2, 676171),
  t("walk-pantera", "Walk", "Pantera", "Vulgar Display of Power", 1992, ["metal"], 2, 662879),
  t("down-with-the-sickness", "Down with the Sickness", "Disturbed", "The Sickness", 2000, ["metal", "rock"], 2, 663984),
  t("schism", "Schism", "Tool", "Lateralus", 2001, ["metal"], 3, 722078532),
  t("run-to-the-hills", "Run to the Hills", "Iron Maiden", "The Number of the Beast", 1982, ["metal", "rock"], 2, 3801711952),
  t("war-pigs", "War Pigs", "Black Sabbath", "Paranoid", 1970, ["metal", "rock"], 2, 141425891),

  // ── jazz ─────────────────────────────────────────────────────────────────
  t("feeling-good", "Feeling Good", "Nina Simone", "I Put a Spell on You", 1965, ["jazz"], 2, 709830092),
  t("cantaloupe-island", "Cantaloupe Island", "Herbie Hancock", "Empyrean Isles", 1964, ["jazz"], 4, 2242622),
  t("the-sidewinder", "The Sidewinder", "Lee Morgan", "The Sidewinder", 1964, ["jazz"], 4, 3105342),
  t("take-five", "Take Five", "The Dave Brubeck Quartet", "Time Out", 1959, ["jazz"], 1, 3571289),
  t("so-what", "So What", "Miles Davis", "Kind of Blue", 1959, ["jazz"], 2, 2711778),
  t("fly-me-to-the-moon", "Fly Me to the Moon", "Frank Sinatra", "It Might as Well Be Swing", 1964, ["jazz"], 1, 97327628),
  t("my-favorite-things", "My Favorite Things", "John Coltrane", "My Favorite Things", 1961, ["jazz"], 3, 679548),
  t("chameleon", "Chameleon", "Herbie Hancock", "Head Hunters", 1973, ["jazz"], 3, 1015296),
  t("birdland", "Birdland", "Weather Report", "Heavy Weather", 1977, ["jazz"], 4, 30685421),
  t("what-a-wonderful-world", "What a Wonderful World", "Louis Armstrong", "What a Wonderful World", 1967, ["jazz"], 1, 62347641),
  t("summertime-fitzgerald", "Summertime", "Ella Fitzgerald", "Ella and Louis", 1957, ["jazz"], 2, 540203402),
  t("my-funny-valentine", "My Funny Valentine", "Chet Baker", "Chet Baker Sings", 1954, ["jazz"], 3, 3147914),
  t("round-midnight", "Round Midnight", "Thelonious Monk", "Genius of Modern Music Vol. 1", 1947, ["jazz"], 4, 1761361527),
  t("a-love-supreme", "A Love Supreme, Pt. I – Acknowledgement", "John Coltrane", "A Love Supreme", 1965, ["jazz"], 4, 2155111),

  // ── extra chart hits (kept guessable; daily draws from difficulty 1–3) ──
  t("shape-of-you", "Shape of You", "Ed Sheeran", "÷", 2017, ["pop"], 1, 139470659),
  t("perfect", "Perfect", "Ed Sheeran", "÷", 2017, ["pop"], 1, 142986206),
  t("thinking-out-loud", "Thinking Out Loud", "Ed Sheeran", "x", 2014, ["pop"], 1, 79875064),
  t("stay", "STAY", "The Kid LAROI", "F*CK LOVE 3: OVER YOU", 2021, ["pop"], 1, 1425844092),
  t("drivers-license", "drivers license", "Olivia Rodrigo", "SOUR", 2021, ["pop"], 1, 1378342592),
  t("good-4-u", "good 4 u", "Olivia Rodrigo", "SOUR", 2021, ["pop", "rock"], 1, 1378342622),
  t("vampire", "vampire", "Olivia Rodrigo", "GUTS", 2023, ["pop"], 1, 2440763155),
  t("anti-hero", "Anti-Hero", "Taylor Swift", "Midnights", 2022, ["pop"], 1, 1976903157),
  t("blank-space", "Blank Space", "Taylor Swift", "1989", 2014, ["pop"], 1, 132556984),
  t("love-story", "Love Story", "Taylor Swift", "Fearless", 2008, ["pop", "country"], 1, 1332676982),
  t("watermelon-sugar", "Watermelon Sugar", "Harry Styles", "Fine Line", 2019, ["pop"], 1, 830336922),
  t("dont-start-now", "Don't Start Now", "Dua Lipa", "Future Nostalgia", 2019, ["pop"], 1, 1124841652),
  t("heat-waves", "Heat Waves", "Glass Animals", "Dreamland", 2020, ["indie", "pop"], 1, 1040154662),
  t("stay-with-me", "Stay With Me", "Sam Smith", "In the Lonely Hour", 2014, ["pop", "rnb"], 1, 111780376),
  t("hello", "Hello", "Adele", "25", 2015, ["pop"], 1, 1174604652),
  t("someone-like-you", "Someone Like You", "Adele", "21", 2011, ["pop"], 1, 1174603092),
  t("poker-face", "Poker Face", "Lady Gaga", "The Fame", 2008, ["pop"], 1, 734508762),
  t("bad-romance", "Bad Romance", "Lady Gaga", "The Fame Monster", 2009, ["pop"], 1, 4601933),
  t("umbrella", "Umbrella", "Rihanna", "Good Girl Gone Bad", 2007, ["pop", "rnb"], 1, 925106),
  t("single-ladies", "Single Ladies (Put a Ring on It)", "Beyoncé", "I Am... Sasha Fierce", 2008, ["pop", "rnb"], 1, 2485118),
  t("crazy-in-love", "Crazy in Love", "Beyoncé", "Dangerously in Love", 2003, ["pop", "rnb"], 1, 609244),
  t("hey-ya", "Hey Ya!", "OutKast", "Speakerboxxx/The Love Below", 2003, ["hip-hop", "pop"], 1, 628266),
  t("yeah", "Yeah!", "Usher", "Confessions", 2004, ["rnb", "pop"], 1, 13783449),
  t("i-gotta-feeling", "I Gotta Feeling", "The Black Eyed Peas", "The E.N.D.", 2009, ["pop"], 1, 2531104231),
  t("party-in-the-usa", "Party in the U.S.A.", "Miley Cyrus", "The Time of Our Lives", 2009, ["pop"], 1, 24957851),
  t("call-me-maybe", "Call Me Maybe", "Carly Rae Jepsen", "Kiss", 2012, ["pop"], 1, 16670786),
  t("happy", "Happy", "Pharrell Williams", "GIRL", 2013, ["pop"], 1, 701326562),
  t("get-lucky", "Get Lucky", "Daft Punk", "Random Access Memories", 2013, ["electronic", "pop"], 1, 1819285597),
  t("senorita", "Señorita", "Shawn Mendes", "Shawn Mendes", 2019, ["pop"], 1, 698905582),
  t("old-town-road", "Old Town Road", "Lil Nas X", "7", 2019, ["hip-hop", "country"], 1, 699056262),
  t("peaches", "Peaches", "Justin Bieber", "Justice", 2021, ["pop", "rnb"], 1, 1280165222),
  t("sorry", "Sorry", "Justin Bieber", "Purpose", 2015, ["pop"], 1, 112662366),
  t("birds-of-a-feather", "BIRDS OF A FEATHER", "Billie Eilish", "HIT ME HARD AND SOFT", 2024, ["pop"], 1, 2801558052),
  t("beautiful-things", "Beautiful Things", "Benson Boone", "Fireworks & Rollerblades", 2024, ["pop"], 1, 2704682202),
  t("lose-control", "Lose Control", "Teddy Swims", "I've Tried Everything but Therapy (Part 1)", 2023, ["pop", "rnb"], 1, 2319265555),
  t("die-with-a-smile", "Die With A Smile", "Lady Gaga", "MAYHEM", 2024, ["pop"], 1, 2947516331),
  t("apt", "APT.", "ROSÉ", "rosie", 2024, ["pop", "kpop"], 1, 3050380851),
  t("starboy", "Starboy", "The Weeknd", "Starboy", 2016, ["pop", "rnb"], 1, 136889400),
  t("save-your-tears", "Save Your Tears", "The Weeknd", "After Hours", 2020, ["pop"], 1, 908604632),
  t("one-dance", "One Dance", "Drake", "Views", 2016, ["hip-hop", "afrobeats"], 1, 124603270),
  t("gods-plan", "God's Plan", "Drake", "Scorpion", 2018, ["hip-hop"], 1, 533609232),
  t("hotline-bling", "Hotline Bling", "Drake", "Hotline Bling", 2015, ["hip-hop"], 1, 124603286),
  t("in-da-club", "In Da Club", "50 Cent", "Get Rich or Die Tryin'", 2003, ["hip-hop"], 1, 145429536),
  t("sunflower", "Sunflower", "Post Malone", "Spider-Man: Into the Spider-Verse", 2018, ["hip-hop", "pop"], 1, 602456552),
  t("circles", "Circles", "Post Malone", "Hollywood's Bleeding", 2019, ["pop"], 1, 747399352),
  t("rockstar", "rockstar", "Post Malone", "Beerbongs & Bentleys", 2017, ["hip-hop"], 1, 491446942),
  t("closer", "Closer", "The Chainsmokers", "Collage", 2016, ["electronic", "pop"], 1, 129310248),
  t("something-just-like-this", "Something Just Like This", "The Chainsmokers", "Memories...Do Not Open", 2017, ["electronic", "pop"], 1, 142706538),
  t("wake-me-up", "Wake Me Up", "Avicii", "True", 2013, ["electronic", "pop"], 1, 70266756),
  t("rather-be", "Rather Be", "Clean Bandit", "New Eyes", 2014, ["electronic", "pop"], 2, 446937092),
  t("cheap-thrills", "Cheap Thrills", "Sia", "This Is Acting", 2016, ["pop"], 1, 115671688),
  t("havana", "Havana", "Camila Cabello", "Camila", 2017, ["pop", "latin"], 1, 447098092),
  t("dont-stop-believin", "Don't Stop Believin'", "Journey", "Escape", 1981, ["rock"], 1, 625643),
  t("hotel-california", "Hotel California", "Eagles", "Hotel California", 1977, ["rock"], 1, 426703682),
  t("livin-on-a-prayer", "Livin' on a Prayer", "Bon Jovi", "Slippery When Wet", 1986, ["rock"], 1, 538660022),
  t("eye-of-the-tiger", "Eye of the Tiger", "Survivor", "Eye of the Tiger", 1982, ["rock"], 1, 576431),
  t("imagine", "Imagine", "John Lennon", "Imagine", 1971, ["rock", "pop"], 1, 1056714232),
  t("hey-jude", "Hey Jude", "The Beatles", "Hey Jude", 1968, ["rock", "pop"], 1, 126848613),
  t("let-it-be", "Let It Be", "The Beatles", "Let It Be", 1970, ["rock", "pop"], 1, 116348656),
  t("come-together", "Come Together", "The Beatles", "Abbey Road", 1969, ["rock"], 1, 116348452),
  t("yellow", "Yellow", "Coldplay", "Parachutes", 2000, ["rock", "pop"], 1, 3128096),
  t("viva-la-vida", "Viva La Vida", "Coldplay", "Viva la Vida or Death and All His Friends", 2008, ["rock", "pop"], 1, 3157972),
  t("clocks", "Clocks", "Coldplay", "A Rush of Blood to the Head", 2002, ["rock"], 2, 3098841),
  t("somebody-that-i-used-to-know", "Somebody That I Used to Know", "Gotye", "Making Mirrors", 2011, ["pop", "indie"], 1, 119615552),
  t("radioactive", "Radioactive", "Imagine Dragons", "Night Visions", 2012, ["rock", "pop"], 1, 407110862),
  t("demons", "Demons", "Imagine Dragons", "Night Visions", 2012, ["rock", "pop"], 1, 58071451),
  t("believer", "Believer", "Imagine Dragons", "Evolve", 2017, ["rock", "pop"], 1, 528330441),
  t("counting-stars", "Counting Stars", "OneRepublic", "Native", 2013, ["pop", "rock"], 1, 65759979),
  t("shut-up-and-dance", "Shut Up and Dance", "WALK THE MOON", "TALKING IS HARD", 2014, ["pop", "rock"], 1, 90326361),
  t("all-of-me", "All of Me", "John Legend", "Love in the Future", 2013, ["rnb", "pop"], 1, 70079770),
  t("what-makes-you-beautiful", "What Makes You Beautiful", "One Direction", "Up All Night", 2011, ["pop"], 1, 16667911),
  t("night-changes", "Night Changes", "One Direction", "FOUR", 2014, ["pop"], 2, 90248141),
  t("stitches", "Stitches", "Shawn Mendes", "Handwritten", 2015, ["pop"], 2, 113418500),
  t("let-it-go", "Let It Go", "Idina Menzel", "Frozen", 2013, ["pop"], 1, 72371930),
  t("super-bass", "Super Bass", "Nicki Minaj", "Pink Friday", 2010, ["hip-hop", "pop"], 1, 412843352),
  t("industry-baby", "INDUSTRY BABY", "Lil Nas X", "MONTERO", 2021, ["hip-hop"], 1, 1439691952),
  t("about-damn-time", "About Damn Time", "Lizzo", "Special", 2022, ["pop"], 1, 1818665207),
  t("stayin-alive", "Stayin' Alive", "Bee Gees", "Saturday Night Fever", 1977, ["pop"], 1, 139138743),
];

function t(
  id: string,
  title: string,
  artist: string,
  album: string,
  year: number,
  genres: Genre[],
  difficulty: Difficulty,
  deezerId?: number,
): Track {
  return { id, title, artist, album, year, genres, difficulty, ...(deezerId ? { deezerId } : {}) };
}

export const CATALOG_BY_ID = new Map(CATALOG.map((track) => [track.id, track]));

// A duplicate id silently shadows a track and skews every deterministic draw
// (the daily seed indexes into CATALOG, but lookups go through the map). Cheap
// to catch here; near-impossible to spot later.
if (import.meta.env?.DEV && CATALOG_BY_ID.size !== CATALOG.length) {
  const seen = new Set<string>();
  const duplicates = CATALOG.map((track) => track.id).filter((id) => !seen.add(id));
  throw new Error(`Duplicate track ids in catalog: ${[...new Set(duplicates)].join(", ")}`);
}

export function getTrack(id: string): Track | undefined {
  return CATALOG_BY_ID.get(id);
}

export function decadeOf(year: number): Decade {
  const start = Math.floor(year / 10) * 10;
  return `${start < 1960 ? 1960 : start}s` as Decade;
}

export const ALL_GENRES: Genre[] = [
  "pop",
  "hip-hop",
  "rnb",
  "rock",
  "indie",
  "electronic",
  "kpop",
  "afrobeats",
  "hyperpop",
  "drill",
  "latin",
  "country",
  "metal",
  "jazz",
];

export const GENRE_LABELS: Record<Genre, string> = {
  pop: "Pop",
  "hip-hop": "Hip-Hop",
  rnb: "R&B",
  rock: "Rock",
  indie: "Indie",
  electronic: "Electronic",
  kpop: "K-Pop",
  afrobeats: "Afrobeats",
  hyperpop: "Hyperpop",
  drill: "Drill",
  latin: "Latin",
  country: "Country",
  metal: "Metal",
  jazz: "Jazz",
};

export const ALL_DECADES: Decade[] = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Inescapable",
  2: "Well known",
  3: "Solid deep cut",
  4: "Obscure",
  5: "Crate digger",
};

export const DEFAULT_FILTERS: ModeFilters = {
  genres: [],
  decades: [],
  difficulty: [1, 3],
};

/**
 * How often a track is drawn, by obscurity. Level 1 songs show up an order of
 * magnitude more than crate-digger cuts, so a random session still feels
 * guessable without making deep cuts impossible to ever see.
 */
const POPULARITY_WEIGHT: Record<Difficulty, number> = {
  1: 12,
  2: 7,
  3: 2,
  4: 0.35,
  5: 0.1,
};

/** Empty genre/decade arrays mean "no constraint" rather than "match nothing". */
export function filterCatalog(filters: ModeFilters, pool: Track[] = CATALOG): Track[] {
  const [minDifficulty, maxDifficulty] = filters.difficulty;

  return pool.filter((track) => {
    if (track.difficulty < minDifficulty || track.difficulty > maxDifficulty) return false;
    if (filters.genres.length && !track.genres.some((g) => filters.genres.includes(g))) return false;
    if (filters.decades.length && !filters.decades.includes(decadeOf(track.year))) return false;
    return true;
  });
}

/**
 * Shuffle that still prefers well-known tracks. Without replacement, so a
 * session does not immediately re-deal the same hit.
 */
export function shuffleByPopularity(items: Track[]): Track[] {
  const remaining = items.map((item) => ({ item, weight: POPULARITY_WEIGHT[item.difficulty] }));
  const out: Track[] = [];

  while (remaining.length) {
    const total = remaining.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    let index = remaining.length - 1;

    for (let i = 0; i < remaining.length; i++) {
      roll -= remaining[i]!.weight;
      if (roll <= 0) {
        index = i;
        break;
      }
    }

    out.push(remaining[index]!.item);
    remaining.splice(index, 1);
  }

  return out;
}

/** Daily only: skip crate-digger cuts so the shared puzzle stays guessable. */
export function dailyGuessablePool(pool: Track[] = CATALOG): Track[] {
  const guessable = pool.filter((track) => track.difficulty <= 3);
  return guessable.length ? guessable : pool;
}

/**
 * Repeats better-known tracks in the daily cycle so a random date is more
 * likely to land on something people actually know, while still walking the
 * whole guessable pool over time.
 */
export function expandByPopularity(pool: Track[]): Track[] {
  const copies: Record<Difficulty, number> = { 1: 4, 2: 2, 3: 1, 4: 0, 5: 0 };
  const out: Track[] = [];

  for (const track of pool) {
    const n = copies[track.difficulty] ?? 0;
    for (let i = 0; i < n; i++) out.push(track);
  }

  return out.length ? out : pool;
}

/** Curated Gauntlet packs. Each resolves to a filter over the same catalog. */
export interface GenrePack {
  slug: string;
  name: string;
  blurb: string;
  genres: Genre[];
  accent: string;
}

export const GENRE_PACKS: GenrePack[] = [
  {
    slug: "hyperpop",
    name: "Hyperpop",
    blurb: "Blown-out, pitch-shifted and proudly unlistenable to your parents.",
    genres: ["hyperpop"],
    accent: "var(--cluetune-pink)",
  },
  {
    slug: "kpop",
    name: "K-Pop",
    blurb: "Four generations of the most engineered pop on earth.",
    genres: ["kpop"],
    accent: "var(--cluetune-violet)",
  },
  {
    slug: "afrobeats",
    name: "Afrobeats",
    blurb: "Lagos to London, log drums and all.",
    genres: ["afrobeats"],
    accent: "var(--cluetune-amber)",
  },
  {
    slug: "drill",
    name: "Drill",
    blurb: "Sliding 808s from Brooklyn to Brixton.",
    genres: ["drill"],
    accent: "var(--cluetune-coral)",
  },
  {
    slug: "throwback",
    name: "Throwback",
    blurb: "Everything your algorithm forgot, 1965 to 1999.",
    genres: ["pop", "rock", "rnb", "jazz", "country"],
    accent: "var(--cluetune-cyan)",
  },
  {
    slug: "club",
    name: "Club",
    blurb: "Four to the floor, filter house and festival drops.",
    genres: ["electronic"],
    accent: "var(--cluetune-develop-end)",
  },
];

export function getPack(slug: string): GenrePack | undefined {
  return GENRE_PACKS.find((pack) => pack.slug === slug);
}
