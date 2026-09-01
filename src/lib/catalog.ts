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
  t("blinding-lights", "Blinding Lights", "The Weeknd", "After Hours", 2020, ["pop", "electronic"], 1),
  t("levitating", "Levitating", "Dua Lipa", "Future Nostalgia", 2020, ["pop"], 1),
  t("as-it-was", "As It Was", "Harry Styles", "Harry's House", 2022, ["pop"], 1),
  t("espresso", "Espresso", "Sabrina Carpenter", "Short n' Sweet", 2024, ["pop"], 1),
  t("flowers", "Flowers", "Miley Cyrus", "Endless Summer Vacation", 2023, ["pop"], 1),
  t("bad-guy", "bad guy", "Billie Eilish", "When We All Fall Asleep, Where Do We Go?", 2019, ["pop"], 1),
  t("rolling-in-the-deep", "Rolling in the Deep", "Adele", "21", 2010, ["pop", "rnb"], 1),
  t("toxic", "Toxic", "Britney Spears", "In the Zone", 2003, ["pop"], 1),
  t("since-u-been-gone", "Since U Been Gone", "Kelly Clarkson", "Breakaway", 2004, ["pop", "rock"], 2),
  t("dancing-queen", "Dancing Queen", "ABBA", "Arrival", 1976, ["pop"], 1),
  t("wannabe", "Wannabe", "Spice Girls", "Spice", 1996, ["pop"], 2),
  t("torn", "Torn", "Natalie Imbruglia", "Left of the Middle", 1997, ["pop", "rock"], 3),
  t("murder-on-the-dancefloor", "Murder on the Dancefloor", "Sophie Ellis-Bextor", "Read My Lips", 2001, ["pop", "electronic"], 3),
  t("padam-padam", "Padam Padam", "Kylie Minogue", "Tension", 2023, ["pop", "electronic"], 3),
  t("running-up-that-hill", "Running Up That Hill (A Deal with God)", "Kate Bush", "Hounds of Love", 1985, ["pop"], 2),
  t("take-on-me", "Take On Me", "a-ha", "Hunting High and Low", 1985, ["pop"], 1),
  t("billie-jean", "Billie Jean", "Michael Jackson", "Thriller", 1982, ["pop"], 1),
  t("i-wanna-dance-with-somebody", "I Wanna Dance with Somebody (Who Loves Me)", "Whitney Houston", "Whitney", 1987, ["pop"], 1),
  t("shake-it-off", "Shake It Off", "Taylor Swift", "1989", 2014, ["pop"], 1),
  t("cruel-summer", "Cruel Summer", "Taylor Swift", "Lover", 2019, ["pop"], 1),
  t("uptown-funk", "Uptown Funk", "Mark Ronson", "Uptown Special", 2014, ["pop"], 1),
  t("dancing-on-my-own", "Dancing On My Own", "Robyn", "Body Talk Pt. 1", 2010, ["pop", "electronic"], 2),
  t("just-the-way-you-are", "Just the Way You Are", "Bruno Mars", "Doo-Wops & Hooligans", 2010, ["pop"], 1),
  t("treasure", "Treasure", "Bruno Mars", "Unorthodox Jukebox", 2012, ["pop"], 1),
  t("24k-magic", "24K Magic", "Bruno Mars", "24K Magic", 2016, ["pop"], 1),
  t("thats-what-i-like", "That's What I Like", "Bruno Mars", "24K Magic", 2017, ["pop", "rnb"], 1),
  t("grenade", "Grenade", "Bruno Mars", "Doo-Wops & Hooligans", 2010, ["pop"], 1),
  t("leave-the-door-open", "Leave the Door Open", "Silk Sonic", "An Evening with Silk Sonic", 2021, ["pop", "rnb"], 1),
  t("firework", "Firework", "Katy Perry", "Teenage Dream", 2010, ["pop"], 1),
  t("roar", "Roar", "Katy Perry", "Prism", 2013, ["pop"], 1),
  t("teenage-dream", "Teenage Dream", "Katy Perry", "Teenage Dream", 2010, ["pop"], 1),
  t("dark-horse", "Dark Horse", "Katy Perry", "Prism", 2013, ["pop"], 2),
  t("thank-u-next", "thank u, next", "Ariana Grande", "thank u, next", 2019, ["pop"], 1),
  t("7-rings", "7 rings", "Ariana Grande", "thank u, next", 2019, ["pop"], 1),
  t("problem", "Problem", "Ariana Grande", "My Everything", 2014, ["pop"], 1),
  t("positions", "positions", "Ariana Grande", "Positions", 2020, ["pop", "rnb"], 1),
  t("royals", "Royals", "Lorde", "Pure Heroine", 2013, ["pop", "indie"], 1),
  t("green-light", "Green Light", "Lorde", "Melodrama", 2017, ["pop", "electronic"], 2),
  t("we-found-love", "We Found Love", "Rihanna", "Talk That Talk", 2011, ["pop", "electronic"], 1),
  t("diamonds", "Diamonds", "Rihanna", "Unapologetic", 2012, ["pop"], 1),
  t("work", "Work", "Rihanna", "Anti", 2016, ["pop", "rnb"], 1),
  t("halo", "Halo", "Beyoncé", "I Am... Sasha Fierce", 2008, ["pop", "rnb"], 1),

  // ── hip-hop ──────────────────────────────────────────────────────────────
  t("sicko-mode", "SICKO MODE", "Travis Scott", "Astroworld", 2018, ["hip-hop"], 2),
  t("humble", "HUMBLE.", "Kendrick Lamar", "DAMN.", 2017, ["hip-hop"], 1),
  t("juicy", "Juicy", "The Notorious B.I.G.", "Ready to Die", 1994, ["hip-hop"], 2),
  t("ny-state-of-mind", "N.Y. State of Mind", "Nas", "Illmatic", 1994, ["hip-hop"], 3),
  t("ms-jackson", "Ms. Jackson", "OutKast", "Stankonia", 2000, ["hip-hop"], 2),
  t("alright", "Alright", "Kendrick Lamar", "To Pimp a Butterfly", 2015, ["hip-hop"], 2),
  t("nonstop", "Nonstop", "Drake", "Scorpion", 2018, ["hip-hop"], 3),
  t("nuthin-but-a-g-thang", "Nuthin' but a 'G' Thang", "Dr. Dre", "The Chronic", 1992, ["hip-hop"], 2),
  t("passionfruit", "Passionfruit", "Drake", "More Life", 2017, ["hip-hop", "rnb"], 2),
  t("not-like-us", "Not Like Us", "Kendrick Lamar", "GNX", 2024, ["hip-hop"], 1),
  t("lose-yourself", "Lose Yourself", "Eminem", "8 Mile", 2002, ["hip-hop"], 1),
  t("gold-digger", "Gold Digger", "Kanye West", "Late Registration", 2005, ["hip-hop"], 1),
  t("shook-ones-pt-ii", "Shook Ones, Pt. II", "Mobb Deep", "The Infamous", 1995, ["hip-hop"], 3),
  t("99-problems", "99 Problems", "Jay-Z", "The Black Album", 2003, ["hip-hop"], 2),
  t("empire-state-of-mind", "Empire State of Mind", "Jay-Z", "The Blueprint 3", 2009, ["hip-hop", "pop"], 1),
  t("bodak-yellow", "Bodak Yellow", "Cardi B", "Invasion of Privacy", 2017, ["hip-hop"], 1),
  t("this-is-america", "This Is America", "Childish Gambino", "This Is America", 2018, ["hip-hop"], 1),
  t("earfquake", "EARFQUAKE", "Tyler, the Creator", "IGOR", 2019, ["hip-hop"], 2),
  t("mask-off", "Mask Off", "Future", "Future", 2017, ["hip-hop"], 2),
  t("sexyback", "SexyBack", "Justin Timberlake", "FutureSex/LoveSounds", 2006, ["pop", "rnb"], 1),

  // ── r&b ──────────────────────────────────────────────────────────────────
  t("cranes-in-the-sky", "Cranes in the Sky", "Solange", "A Seat at the Table", 2016, ["rnb"], 3),
  t("redbone", "Redbone", "Childish Gambino", "Awaken, My Love!", 2016, ["rnb"], 2),
  t("best-part", "Best Part", "Daniel Caesar", "Freudian", 2017, ["rnb"], 3),
  t("no-scrubs", "No Scrubs", "TLC", "FanMail", 1999, ["rnb", "pop"], 2),
  t("say-my-name", "Say My Name", "Destiny's Child", "The Writing's on the Wall", 1999, ["rnb", "pop"], 2),
  t("snooze", "Snooze", "SZA", "SOS", 2022, ["rnb"], 2),
  t("untitled-how-does-it-feel", "Untitled (How Does It Feel)", "D'Angelo", "Voodoo", 2000, ["rnb"], 3),
  t("kill-bill", "Kill Bill", "SZA", "SOS", 2022, ["rnb"], 1),
  t("bad-habit", "Bad Habit", "Steve Lacy", "Gemini Rights", 2022, ["rnb"], 2),
  t("thinkin-bout-you", "Thinkin Bout You", "Frank Ocean", "Channel Orange", 2012, ["rnb"], 2),
  t("adorn", "Adorn", "Miguel", "Kaleidoscope Dream", 2012, ["rnb"], 3),
  t("lets-get-it-on", "Let's Get It On", "Marvin Gaye", "Let's Get It On", 1973, ["rnb"], 1),
  t("sexual-healing", "Sexual Healing", "Marvin Gaye", "Midnight Love", 1982, ["rnb"], 1),
  t("superstition", "Superstition", "Stevie Wonder", "Talking Book", 1972, ["rnb"], 1),
  t("isnt-she-lovely", "Isn't She Lovely", "Stevie Wonder", "Songs in the Key of Life", 1976, ["rnb"], 1),
  t("respect", "Respect", "Aretha Franklin", "I Never Loved a Man the Way I Love You", 1967, ["rnb"], 1),
  t("i-will-always-love-you", "I Will Always Love You", "Whitney Houston", "The Bodyguard", 1992, ["pop", "rnb"], 1),
  t("cant-stop-the-feeling", "Can't Stop the Feeling!", "Justin Timberlake", "Trolls", 2016, ["pop"], 1),
  t("mirrors-timberlake", "Mirrors", "Justin Timberlake", "The 20/20 Experience", 2013, ["pop", "rnb"], 1),
  t("cry-me-a-river", "Cry Me a River", "Justin Timberlake", "Justified", 2002, ["pop", "rnb"], 2),
  t("hold-up", "Hold Up", "Beyoncé", "Lemonade", 2016, ["pop", "rnb"], 2),
  t("freedom", "Freedom", "Beyoncé", "Lemonade", 2016, ["hip-hop", "rnb"], 2),

  // ── rock ─────────────────────────────────────────────────────────────────
  t("bohemian-rhapsody", "Bohemian Rhapsody", "Queen", "A Night at the Opera", 1975, ["rock"], 1),
  t("smells-like-teen-spirit", "Smells Like Teen Spirit", "Nirvana", "Nevermind", 1991, ["rock"], 1),
  t("mr-brightside", "Mr. Brightside", "The Killers", "Hot Fuss", 2004, ["rock", "indie"], 1),
  t("seven-nation-army", "Seven Nation Army", "The White Stripes", "Elephant", 2003, ["rock"], 1),
  t("everlong", "Everlong", "Foo Fighters", "The Colour and the Shape", 1997, ["rock"], 2),
  t("paranoid-android", "Paranoid Android", "Radiohead", "OK Computer", 1997, ["rock", "indie"], 3),
  t("wish-you-were-here", "Wish You Were Here", "Pink Floyd", "Wish You Were Here", 1975, ["rock"], 2),
  t("take-me-out", "Take Me Out", "Franz Ferdinand", "Franz Ferdinand", 2004, ["rock", "indie"], 2),
  t("dreams", "Dreams", "Fleetwood Mac", "Rumours", 1977, ["rock"], 1),
  t("wonderwall", "Wonderwall", "Oasis", "(What's the Story) Morning Glory?", 1995, ["rock"], 1),
  t("creep", "Creep", "Radiohead", "Pablo Honey", 1992, ["rock", "indie"], 1),
  t("sweet-child-o-mine", "Sweet Child O' Mine", "Guns N' Roses", "Appetite for Destruction", 1987, ["rock"], 1),
  t("under-the-bridge", "Under the Bridge", "Red Hot Chili Peppers", "Blood Sugar Sex Magik", 1991, ["rock"], 2),
  t("come-as-you-are", "Come as You Are", "Nirvana", "Nevermind", 1991, ["rock"], 2),
  t("stairway-to-heaven", "Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", 1971, ["rock"], 1),
  t("whole-lotta-love", "Whole Lotta Love", "Led Zeppelin", "Led Zeppelin II", 1969, ["rock"], 2),
  t("paint-it-black", "Paint It Black", "The Rolling Stones", "Aftermath", 1966, ["rock"], 1),
  t("satisfaction", "(I Can't Get No) Satisfaction", "The Rolling Stones", "Out of Our Heads", 1965, ["rock"], 1),
  t("sympathy-for-the-devil", "Sympathy for the Devil", "The Rolling Stones", "Beggars Banquet", 1968, ["rock"], 2),
  t("with-or-without-you", "With or Without You", "U2", "The Joshua Tree", 1987, ["rock"], 1),
  t("one-u2", "One", "U2", "Achtung Baby", 1991, ["rock"], 2),
  t("heroes", "Heroes", "David Bowie", "\"Heroes\"", 1977, ["rock"], 1),
  t("space-oddity", "Space Oddity", "David Bowie", "Space Oddity", 1969, ["rock"], 1),
  t("lets-dance", "Let's Dance", "David Bowie", "Let's Dance", 1983, ["rock", "pop"], 2),
  t("purple-rain", "Purple Rain", "Prince", "Purple Rain", 1984, ["pop", "rock"], 1),
  t("kiss-prince", "Kiss", "Prince", "Parade", 1986, ["pop", "rock"], 2),
  t("born-to-run", "Born to Run", "Bruce Springsteen", "Born to Run", 1975, ["rock"], 2),
  t("born-in-the-usa", "Born in the U.S.A.", "Bruce Springsteen", "Born in the U.S.A.", 1984, ["rock", "pop"], 2),
  t("black-hole-sun", "Black Hole Sun", "Soundgarden", "Superunknown", 1994, ["rock"], 2),
  t("alive-pearl-jam", "Alive", "Pearl Jam", "Ten", 1991, ["rock"], 2),
  t("losing-my-religion", "Losing My Religion", "R.E.M.", "Out of Time", 1991, ["rock", "indie"], 2),
  t("take-me-to-church", "Take Me to Church", "Hozier", "Hozier", 2013, ["rock", "indie"], 1),
  t("killing-in-the-name", "Killing in the Name", "Rage Against the Machine", "Rage Against the Machine", 1992, ["metal", "rock"], 2),

  // ── indie ────────────────────────────────────────────────────────────────
  t("two-weeks", "Two Weeks", "Grizzly Bear", "Veckatimest", 2009, ["indie"], 4),
  t("midnight-city", "Midnight City", "M83", "Hurry Up, We're Dreaming", 2011, ["indie", "electronic"], 2),
  t("fluorescent-adolescent", "Fluorescent Adolescent", "Arctic Monkeys", "Favourite Worst Nightmare", 2007, ["indie", "rock"], 3),
  t("skinny-love", "Skinny Love", "Bon Iver", "For Emma, Forever Ago", 2007, ["indie"], 3),
  t("the-less-i-know-the-better", "The Less I Know the Better", "Tame Impala", "Currents", 2015, ["indie"], 2),
  t("pink-pony-club", "Pink Pony Club", "Chappell Roan", "The Rise and Fall of a Midwest Princess", 2020, ["pop", "indie"], 2),
  t("do-i-wanna-know", "Do I Wanna Know?", "Arctic Monkeys", "AM", 2013, ["indie", "rock"], 1),
  t("electric-feel", "Electric Feel", "MGMT", "Oracular Spectacular", 2007, ["indie"], 2),
  t("kids", "Kids", "MGMT", "Oracular Spectacular", 2007, ["indie"], 2),
  t("float-on", "Float On", "Modest Mouse", "Good News for People Who Love Bad News", 2004, ["indie"], 3),
  t("young-folks", "Young Folks", "Peter Bjorn and John", "Writer's Block", 2006, ["indie"], 3),
  t("last-nite", "Last Nite", "The Strokes", "Is This It", 2001, ["indie", "rock"], 2),
  t("reptilia", "Reptilia", "The Strokes", "Room on Fire", 2003, ["indie", "rock"], 2),
  t("a-punk", "A-Punk", "Vampire Weekend", "Vampire Weekend", 2008, ["indie"], 2),
  t("harmony-hall", "Harmony Hall", "Vampire Weekend", "Father of the Bride", 2019, ["indie"], 2),
  t("feel-good-inc", "Feel Good Inc.", "Gorillaz", "Demon Days", 2005, ["indie", "electronic"], 1),
  t("clint-eastwood", "Clint Eastwood", "Gorillaz", "Gorillaz", 2001, ["indie", "hip-hop"], 2),
  t("all-my-friends", "All My Friends", "LCD Soundsystem", "Sound of Silver", 2007, ["indie", "electronic"], 3),
  t("wake-up-arcade-fire", "Wake Up", "Arcade Fire", "Funeral", 2004, ["indie", "rock"], 2),
  t("rebellion-lies", "Rebellion (Lies)", "Arcade Fire", "Funeral", 2004, ["indie", "rock"], 3),
  t("nobody-mitski", "Nobody", "Mitski", "Be the Cowboy", 2018, ["indie"], 3),
  t("tennis-court", "Tennis Court", "Lorde", "Pure Heroine", 2013, ["pop", "indie"], 2),

  // ── electronic ───────────────────────────────────────────────────────────
  t("one-more-time", "One More Time", "Daft Punk", "Discovery", 2000, ["electronic"], 1),
  t("around-the-world", "Around the World", "Daft Punk", "Homework", 1997, ["electronic"], 2),
  t("windowlicker", "Windowlicker", "Aphex Twin", "Windowlicker", 1999, ["electronic"], 4),
  t("opus", "Opus", "Eric Prydz", "Opus", 2015, ["electronic"], 3),
  t("sandstorm", "Sandstorm", "Darude", "Before the Storm", 1999, ["electronic"], 2),
  t("music-sounds-better-with-you", "Music Sounds Better with You", "Stardust", "Music Sounds Better with You", 1998, ["electronic"], 3),
  t("levels", "Levels", "Avicii", "Levels", 2011, ["electronic"], 1),
  t("titanium", "Titanium", "David Guetta", "Nothing but the Beat", 2011, ["electronic", "pop"], 1),
  t("scary-monsters-and-nice-sprites", "Scary Monsters and Nice Sprites", "Skrillex", "Scary Monsters and Nice Sprites", 2010, ["electronic"], 2),
  t("praise-you", "Praise You", "Fatboy Slim", "You've Come a Long Way, Baby", 1998, ["electronic"], 2),
  t("born-slippy", "Born Slippy .NUXX", "Underworld", "Trainspotting", 1995, ["electronic"], 3),
  t("insomnia", "Insomnia", "Faithless", "Reverence", 1995, ["electronic"], 3),
  t("blue-monday", "Blue Monday", "New Order", "Power, Corruption & Lies", 1983, ["electronic", "rock"], 2),
  t("galvanize", "Galvanize", "The Chemical Brothers", "Push the Button", 2005, ["electronic"], 3),
  t("strobe", "Strobe", "deadmau5", "For Lack of a Better Name", 2009, ["electronic"], 4),
  t("summer-calvin", "Summer", "Calvin Harris", "Motion", 2014, ["electronic", "pop"], 1),
  t("this-is-what-you-came-for", "This Is What You Came For", "Calvin Harris", "This Is What You Came For", 2016, ["electronic", "pop"], 1),
  t("feel-so-close", "Feel So Close", "Calvin Harris", "18 Months", 2011, ["electronic", "pop"], 2),
  t("firestarter", "Firestarter", "The Prodigy", "The Fat of the Land", 1996, ["electronic"], 2),
  t("breathe-prodigy", "Breathe", "The Prodigy", "The Fat of the Land", 1997, ["electronic"], 2),
  t("lean-on", "Lean On", "Major Lazer", "Peace Is the Mission", 2015, ["electronic", "pop"], 1),
  t("dont-you-worry-child", "Don't You Worry Child", "Swedish House Mafia", "Until Now", 2012, ["electronic", "pop"], 1),
  t("clarity", "Clarity", "Zedd", "Clarity", 2012, ["electronic", "pop"], 1),
  t("happier-marshmello", "Happier", "Marshmello", "Joytime III", 2018, ["electronic", "pop"], 1),

  // ── k-pop ────────────────────────────────────────────────────────────────
  t("dynamite", "Dynamite", "BTS", "BE", 2020, ["kpop", "pop"], 1),
  t("how-you-like-that", "How You Like That", "BLACKPINK", "The Album", 2020, ["kpop"], 2),
  t("super-shy", "Super Shy", "NewJeans", "Get Up", 2023, ["kpop"], 2),
  t("gods-menu", "God's Menu", "Stray Kids", "Go Live", 2020, ["kpop"], 3),
  t("next-level", "Next Level", "aespa", "Savage", 2021, ["kpop"], 3),
  t("gee", "Gee", "Girls' Generation", "Gee", 2009, ["kpop"], 3),
  t("gangnam-style", "Gangnam Style", "PSY", "Psy 6 (Six Rules), Part 1", 2012, ["kpop"], 1),
  t("butter", "Butter", "BTS", "Butter", 2021, ["kpop", "pop"], 1),
  t("boy-with-luv", "Boy With Luv", "BTS", "Map of the Soul: Persona", 2019, ["kpop", "pop"], 2),
  t("ddu-du-ddu-du", "DDU-DU DDU-DU", "BLACKPINK", "Square Up", 2018, ["kpop"], 2),
  t("hype-boy", "Hype Boy", "NewJeans", "New Jeans", 2022, ["kpop"], 2),
  t("fancy", "FANCY", "TWICE", "Fancy You", 2019, ["kpop"], 3),
  t("psycho", "Psycho", "Red Velvet", "The ReVe Festival: Finale", 2019, ["kpop"], 3),
  t("cupid", "Cupid", "FIFTY FIFTY", "The Beginning: Cupid", 2023, ["kpop", "pop"], 2),
  t("queencard", "Queencard", "(G)I-DLE", "I Feel", 2023, ["kpop"], 3),
  t("i-am-the-best", "I Am the Best", "2NE1", "2NE1", 2011, ["kpop"], 3),
  t("fantastic-baby", "Fantastic Baby", "BIGBANG", "Alive", 2012, ["kpop"], 3),
  t("love-scenario", "Love Scenario", "iKON", "Return", 2018, ["kpop"], 4),

  // ── afrobeats ────────────────────────────────────────────────────────────
  t("essence", "Essence", "Wizkid", "Made in Lagos", 2020, ["afrobeats", "rnb"], 2),
  t("last-last", "Last Last", "Burna Boy", "Love, Damini", 2022, ["afrobeats"], 2),
  t("ye", "Ye", "Burna Boy", "Outside", 2018, ["afrobeats"], 3),
  t("calm-down", "Calm Down", "Rema", "Rave & Roses", 2022, ["afrobeats", "pop"], 1),
  t("ojuelegba", "Ojuelegba", "Wizkid", "Ayo", 2014, ["afrobeats"], 4),
  t("kwaku-the-traveller", "Kwaku the Traveller", "Black Sherif", "The Villain I Never Was", 2022, ["afrobeats", "drill"], 4),
  t("water", "Water", "Tyla", "Tyla", 2023, ["afrobeats", "pop"], 1),
  t("love-nwantiti", "Love Nwantiti (Ah Ah Ah)", "CKay", "CKay the First", 2019, ["afrobeats"], 2),
  t("unavailable", "Unavailable", "Davido", "Timeless", 2023, ["afrobeats"], 3),
  t("fall", "Fall", "Davido", "Fall", 2017, ["afrobeats"], 3),
  t("peru", "Peru", "Fireboy DML", "Peru", 2021, ["afrobeats"], 3),
  t("rush", "Rush", "Ayra Starr", "19 & Dangerous", 2022, ["afrobeats"], 3),
  t("terminator", "Terminator", "Asake", "Mr. Money With the Vibe", 2022, ["afrobeats"], 3),
  t("city-boys", "City Boys", "Burna Boy", "I Told Them...", 2023, ["afrobeats"], 3),
  t("soweto", "Soweto", "Victony", "Outlaw", 2022, ["afrobeats"], 4),
  t("ku-lo-sa", "Ku Lo Sa", "Oxlade", "Oxlade From Africa", 2022, ["afrobeats"], 4),

  // ── hyperpop ─────────────────────────────────────────────────────────────
  t("money-machine", "money machine", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 3),
  t("hand-crushed-by-a-mallet", "hand crushed by a mallet", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 4),
  t("stupid-horse", "stupid horse", "100 gecs", "1000 gecs", 2019, ["hyperpop"], 5),
  t("vroom-vroom", "Vroom Vroom", "Charli XCX", "Vroom Vroom", 2016, ["hyperpop", "pop"], 3),
  t("360", "360", "Charli XCX", "Brat", 2024, ["hyperpop", "pop"], 2),
  t("von-dutch", "Von dutch", "Charli XCX", "Brat", 2024, ["hyperpop", "pop"], 3),
  t("nuclear-seasons", "Nuclear Seasons", "Charli XCX", "True Romance", 2012, ["hyperpop", "pop"], 4),
  t("unlock-it", "Unlock It", "Charli XCX", "Pop 2", 2017, ["hyperpop", "pop"], 4),
  t("second-hand-embarrassment", "Second Hand Embarrassment", "underscores", "fishmonger", 2021, ["hyperpop"], 5),
  t("immaterial", "Immaterial", "SOPHIE", "Oil of Every Pearl's Un-Insides", 2018, ["hyperpop"], 4),
  t("bipp", "BIPP", "SOPHIE", "Product", 2013, ["hyperpop"], 5),
  t("flamboyant", "Flamboyant", "Dorian Electra", "Flamboyant", 2019, ["hyperpop"], 4),
  t("flamingo", "Flamingo", "Kero Kero Bonito", "Bonito Generation", 2016, ["hyperpop"], 4),
  t("hey-qt", "Hey QT", "QT", "Hey QT", 2014, ["hyperpop"], 5),

  // ── drill ────────────────────────────────────────────────────────────────
  t("body", "Body", "Russ Millions", "Body", 2021, ["drill"], 3),
  t("location", "Location", "Dave", "Psychodrama", 2019, ["drill", "hip-hop"], 3),
  t("welcome-to-the-party", "Welcome to the Party", "Pop Smoke", "Meet the Woo", 2019, ["drill"], 3),
  t("dior", "Dior", "Pop Smoke", "Meet the Woo 2", 2020, ["drill"], 2),
  t("thiago-silva", "Thiago Silva", "Dave", "Thiago Silva", 2016, ["drill", "hip-hop"], 4),
  t("doja", "Doja", "Central Cee", "23", 2022, ["drill"], 2),
  t("sprinter", "Sprinter", "Dave", "Split Decision", 2023, ["drill", "hip-hop"], 2),
  t("obsessed-with-you", "Obsessed With You", "Central Cee", "Wild West", 2021, ["drill"], 3),
  t("for-the-night", "For the Night", "Pop Smoke", "Shoot for the Stars, Aim for the Moon", 2020, ["drill"], 2),
  t("mood-swings", "Mood Swings", "Pop Smoke", "Shoot for the Stars, Aim for the Moon", 2020, ["drill"], 3),
  t("big-drip", "Big Drip", "Fivio Foreign", "800 BC", 2019, ["drill"], 3),
  t("both", "Both", "Headie One", "Edna", 2020, ["drill"], 4),
  t("homerton-b", "Homerton B", "Unknown T", "Homerton B", 2018, ["drill"], 4),

  // ── latin ────────────────────────────────────────────────────────────────
  t("despacito", "Despacito", "Luis Fonsi", "Vida", 2017, ["latin", "pop"], 1),
  t("titi-me-pregunto", "Tití Me Preguntó", "Bad Bunny", "Un Verano Sin Ti", 2022, ["latin"], 2),
  t("gasolina", "Gasolina", "Daddy Yankee", "Barrio Fino", 2004, ["latin"], 2),
  t("bailando", "Bailando", "Enrique Iglesias", "Sex and Love", 2014, ["latin", "pop"], 3),
  t("hips-dont-lie", "Hips Don't Lie", "Shakira", "Oral Fixation, Vol. 2", 2006, ["latin", "pop"], 1),
  t("mi-gente", "Mi Gente", "J Balvin", "Vibras", 2017, ["latin"], 2),
  t("provenza", "Provenza", "Karol G", "Mañana Será Bonito", 2022, ["latin"], 2),
  t("con-altura", "Con Altura", "ROSALÍA", "Con Altura", 2019, ["latin", "pop"], 3),
  t("malamente", "Malamente", "ROSALÍA", "El Mal Querer", 2018, ["latin"], 4),
  t("la-camisa-negra", "La Camisa Negra", "Juanes", "Mi Sangre", 2004, ["latin"], 3),
  t("suavemente", "Suavemente", "Elvis Crespo", "Suavemente", 1998, ["latin"], 3),
  t("oye-como-va", "Oye Como Va", "Santana", "Abraxas", 1970, ["latin", "rock"], 3),

  // ── country ──────────────────────────────────────────────────────────────
  t("jolene", "Jolene", "Dolly Parton", "Jolene", 1973, ["country"], 1),
  t("wagon-wheel", "Wagon Wheel", "Darius Rucker", "True Believers", 2013, ["country"], 3),
  t("the-gambler", "The Gambler", "Kenny Rogers", "The Gambler", 1978, ["country"], 3),
  t("ring-of-fire", "Ring of Fire", "Johnny Cash", "Ring of Fire: The Best of Johnny Cash", 1963, ["country"], 1),
  t("country-roads", "Take Me Home, Country Roads", "John Denver", "Poems, Prayers & Promises", 1971, ["country"], 1),
  t("man-i-feel-like-a-woman", "Man! I Feel Like a Woman!", "Shania Twain", "Come On Over", 1997, ["country", "pop"], 2),
  t("before-he-cheats", "Before He Cheats", "Carrie Underwood", "Some Hearts", 2005, ["country"], 2),
  t("texas-hold-em", "TEXAS HOLD 'EM", "Beyoncé", "COWBOY CARTER", 2024, ["country", "pop"], 1),
  t("cruise", "Cruise", "Florida Georgia Line", "Here's to the Good Times", 2012, ["country"], 3),
  t("friends-in-low-places", "Friends in Low Places", "Garth Brooks", "No Fences", 1990, ["country"], 1),
  t("the-dance", "The Dance", "Garth Brooks", "Garth Brooks", 1990, ["country"], 2),
  t("last-night-wallen", "Last Night", "Morgan Wallen", "One Thing at a Time", 2023, ["country"], 1),
  t("whiskey-glasses", "Whiskey Glasses", "Morgan Wallen", "If I Know Me", 2018, ["country"], 2),
  t("live-like-you-were-dying", "Live Like You Were Dying", "Tim McGraw", "Live Like You Were Dying", 2004, ["country"], 2),
  t("amarillo-by-morning", "Amarillo by Morning", "George Strait", "Easy Come Easy Go", 1982, ["country"], 2),
  t("country-girl-shake-it", "Country Girl (Shake It for Me)", "Luke Bryan", "Tailgates & Tanlines", 2011, ["country"], 2),
  t("god-s-country", "God's Country", "Blake Shelton", "God's Country", 2019, ["country"], 2),

  // ── metal ────────────────────────────────────────────────────────────────
  t("enter-sandman", "Enter Sandman", "Metallica", "Metallica", 1991, ["metal", "rock"], 1),
  t("chop-suey", "Chop Suey!", "System of a Down", "Toxicity", 2001, ["metal", "rock"], 1),
  t("bleed", "Bleed", "Meshuggah", "obZen", 2008, ["metal"], 5),
  t("paranoid", "Paranoid", "Black Sabbath", "Paranoid", 1970, ["metal", "rock"], 1),
  t("in-the-end", "In the End", "Linkin Park", "Hybrid Theory", 2000, ["metal", "rock"], 1),
  t("master-of-puppets", "Master of Puppets", "Metallica", "Master of Puppets", 1986, ["metal"], 2),
  t("ace-of-spades", "Ace of Spades", "Motörhead", "Ace of Spades", 1980, ["metal", "rock"], 2),
  t("duality", "Duality", "Slipknot", "Vol. 3: The Subliminal Verses", 2004, ["metal"], 2),
  t("raining-blood", "Raining Blood", "Slayer", "Reign in Blood", 1986, ["metal"], 3),
  t("numb", "Numb", "Linkin Park", "Meteora", 2003, ["metal", "rock"], 1),
  t("crawling", "Crawling", "Linkin Park", "Hybrid Theory", 2000, ["metal", "rock"], 2),
  t("walk-pantera", "Walk", "Pantera", "Vulgar Display of Power", 1992, ["metal"], 2),
  t("down-with-the-sickness", "Down with the Sickness", "Disturbed", "The Sickness", 2000, ["metal", "rock"], 2),
  t("schism", "Schism", "Tool", "Lateralus", 2001, ["metal"], 3),
  t("run-to-the-hills", "Run to the Hills", "Iron Maiden", "The Number of the Beast", 1982, ["metal", "rock"], 2),
  t("war-pigs", "War Pigs", "Black Sabbath", "Paranoid", 1970, ["metal", "rock"], 2),

  // ── jazz ─────────────────────────────────────────────────────────────────
  t("feeling-good", "Feeling Good", "Nina Simone", "I Put a Spell on You", 1965, ["jazz"], 2),
  t("cantaloupe-island", "Cantaloupe Island", "Herbie Hancock", "Empyrean Isles", 1964, ["jazz"], 4),
  t("the-sidewinder", "The Sidewinder", "Lee Morgan", "The Sidewinder", 1964, ["jazz"], 4),
  t("take-five", "Take Five", "The Dave Brubeck Quartet", "Time Out", 1959, ["jazz"], 1),
  t("so-what", "So What", "Miles Davis", "Kind of Blue", 1959, ["jazz"], 2),
  t("fly-me-to-the-moon", "Fly Me to the Moon", "Frank Sinatra", "It Might as Well Be Swing", 1964, ["jazz"], 1),
  t("my-favorite-things", "My Favorite Things", "John Coltrane", "My Favorite Things", 1961, ["jazz"], 3),
  t("chameleon", "Chameleon", "Herbie Hancock", "Head Hunters", 1973, ["jazz"], 3),
  t("birdland", "Birdland", "Weather Report", "Heavy Weather", 1977, ["jazz"], 4),
  t("what-a-wonderful-world", "What a Wonderful World", "Louis Armstrong", "What a Wonderful World", 1967, ["jazz"], 1),
  t("summertime-fitzgerald", "Summertime", "Ella Fitzgerald", "Ella and Louis", 1957, ["jazz"], 2),
  t("my-funny-valentine", "My Funny Valentine", "Chet Baker", "Chet Baker Sings", 1954, ["jazz"], 3),
  t("round-midnight", "Round Midnight", "Thelonious Monk", "Genius of Modern Music Vol. 1", 1947, ["jazz"], 4),
  t("a-love-supreme", "A Love Supreme, Pt. I – Acknowledgement", "John Coltrane", "A Love Supreme", 1965, ["jazz"], 4),

  // ── extra chart hits (kept guessable; daily draws from difficulty 1–3) ──
  t("shape-of-you", "Shape of You", "Ed Sheeran", "÷", 2017, ["pop"], 1),
  t("perfect", "Perfect", "Ed Sheeran", "÷", 2017, ["pop"], 1),
  t("thinking-out-loud", "Thinking Out Loud", "Ed Sheeran", "x", 2014, ["pop"], 1),
  t("stay", "STAY", "The Kid LAROI", "F*CK LOVE 3: OVER YOU", 2021, ["pop"], 1),
  t("drivers-license", "drivers license", "Olivia Rodrigo", "SOUR", 2021, ["pop"], 1),
  t("good-4-u", "good 4 u", "Olivia Rodrigo", "SOUR", 2021, ["pop", "rock"], 1),
  t("vampire", "vampire", "Olivia Rodrigo", "GUTS", 2023, ["pop"], 1),
  t("anti-hero", "Anti-Hero", "Taylor Swift", "Midnights", 2022, ["pop"], 1),
  t("blank-space", "Blank Space", "Taylor Swift", "1989", 2014, ["pop"], 1),
  t("love-story", "Love Story", "Taylor Swift", "Fearless", 2008, ["pop", "country"], 1),
  t("watermelon-sugar", "Watermelon Sugar", "Harry Styles", "Fine Line", 2019, ["pop"], 1),
  t("dont-start-now", "Don't Start Now", "Dua Lipa", "Future Nostalgia", 2019, ["pop"], 1),
  t("heat-waves", "Heat Waves", "Glass Animals", "Dreamland", 2020, ["indie", "pop"], 1),
  t("stay-with-me", "Stay With Me", "Sam Smith", "In the Lonely Hour", 2014, ["pop", "rnb"], 1),
  t("hello", "Hello", "Adele", "25", 2015, ["pop"], 1),
  t("someone-like-you", "Someone Like You", "Adele", "21", 2011, ["pop"], 1),
  t("poker-face", "Poker Face", "Lady Gaga", "The Fame", 2008, ["pop"], 1),
  t("bad-romance", "Bad Romance", "Lady Gaga", "The Fame Monster", 2009, ["pop"], 1),
  t("umbrella", "Umbrella", "Rihanna", "Good Girl Gone Bad", 2007, ["pop", "rnb"], 1),
  t("single-ladies", "Single Ladies (Put a Ring on It)", "Beyoncé", "I Am... Sasha Fierce", 2008, ["pop", "rnb"], 1),
  t("crazy-in-love", "Crazy in Love", "Beyoncé", "Dangerously in Love", 2003, ["pop", "rnb"], 1),
  t("hey-ya", "Hey Ya!", "OutKast", "Speakerboxxx/The Love Below", 2003, ["hip-hop", "pop"], 1),
  t("yeah", "Yeah!", "Usher", "Confessions", 2004, ["rnb", "pop"], 1),
  t("i-gotta-feeling", "I Gotta Feeling", "The Black Eyed Peas", "The E.N.D.", 2009, ["pop"], 1),
  t("party-in-the-usa", "Party in the U.S.A.", "Miley Cyrus", "The Time of Our Lives", 2009, ["pop"], 1),
  t("call-me-maybe", "Call Me Maybe", "Carly Rae Jepsen", "Kiss", 2012, ["pop"], 1),
  t("happy", "Happy", "Pharrell Williams", "GIRL", 2013, ["pop"], 1),
  t("get-lucky", "Get Lucky", "Daft Punk", "Random Access Memories", 2013, ["electronic", "pop"], 1),
  t("senorita", "Señorita", "Shawn Mendes", "Shawn Mendes", 2019, ["pop"], 1),
  t("old-town-road", "Old Town Road", "Lil Nas X", "7", 2019, ["hip-hop", "country"], 1),
  t("peaches", "Peaches", "Justin Bieber", "Justice", 2021, ["pop", "rnb"], 1),
  t("sorry", "Sorry", "Justin Bieber", "Purpose", 2015, ["pop"], 1),
  t("birds-of-a-feather", "BIRDS OF A FEATHER", "Billie Eilish", "HIT ME HARD AND SOFT", 2024, ["pop"], 1),
  t("beautiful-things", "Beautiful Things", "Benson Boone", "Fireworks & Rollerblades", 2024, ["pop"], 1),
  t("lose-control", "Lose Control", "Teddy Swims", "I've Tried Everything but Therapy (Part 1)", 2023, ["pop", "rnb"], 1),
  t("die-with-a-smile", "Die With A Smile", "Lady Gaga", "MAYHEM", 2024, ["pop"], 1),
  t("apt", "APT.", "ROSÉ", "rosie", 2024, ["pop", "kpop"], 1),
  t("starboy", "Starboy", "The Weeknd", "Starboy", 2016, ["pop", "rnb"], 1),
  t("save-your-tears", "Save Your Tears", "The Weeknd", "After Hours", 2020, ["pop"], 1),
  t("one-dance", "One Dance", "Drake", "Views", 2016, ["hip-hop", "afrobeats"], 1),
  t("gods-plan", "God's Plan", "Drake", "Scorpion", 2018, ["hip-hop"], 1),
  t("hotline-bling", "Hotline Bling", "Drake", "Hotline Bling", 2015, ["hip-hop"], 1),
  t("in-da-club", "In Da Club", "50 Cent", "Get Rich or Die Tryin'", 2003, ["hip-hop"], 1),
  t("sunflower", "Sunflower", "Post Malone", "Spider-Man: Into the Spider-Verse", 2018, ["hip-hop", "pop"], 1),
  t("circles", "Circles", "Post Malone", "Hollywood's Bleeding", 2019, ["pop"], 1),
  t("rockstar", "rockstar", "Post Malone", "Beerbongs & Bentleys", 2017, ["hip-hop"], 1),
  t("closer", "Closer", "The Chainsmokers", "Collage", 2016, ["electronic", "pop"], 1),
  t("something-just-like-this", "Something Just Like This", "The Chainsmokers", "Memories...Do Not Open", 2017, ["electronic", "pop"], 1),
  t("wake-me-up", "Wake Me Up", "Avicii", "True", 2013, ["electronic", "pop"], 1),
  t("rather-be", "Rather Be", "Clean Bandit", "New Eyes", 2014, ["electronic", "pop"], 2),
  t("cheap-thrills", "Cheap Thrills", "Sia", "This Is Acting", 2016, ["pop"], 1),
  t("havana", "Havana", "Camila Cabello", "Camila", 2017, ["pop", "latin"], 1),
  t("dont-stop-believin", "Don't Stop Believin'", "Journey", "Escape", 1981, ["rock"], 1),
  t("hotel-california", "Hotel California", "Eagles", "Hotel California", 1977, ["rock"], 1),
  t("livin-on-a-prayer", "Livin' on a Prayer", "Bon Jovi", "Slippery When Wet", 1986, ["rock"], 1),
  t("eye-of-the-tiger", "Eye of the Tiger", "Survivor", "Eye of the Tiger", 1982, ["rock"], 1),
  t("imagine", "Imagine", "John Lennon", "Imagine", 1971, ["rock", "pop"], 1),
  t("hey-jude", "Hey Jude", "The Beatles", "Hey Jude", 1968, ["rock", "pop"], 1),
  t("let-it-be", "Let It Be", "The Beatles", "Let It Be", 1970, ["rock", "pop"], 1),
  t("come-together", "Come Together", "The Beatles", "Abbey Road", 1969, ["rock"], 1),
  t("yellow", "Yellow", "Coldplay", "Parachutes", 2000, ["rock", "pop"], 1),
  t("viva-la-vida", "Viva La Vida", "Coldplay", "Viva la Vida or Death and All His Friends", 2008, ["rock", "pop"], 1),
  t("clocks", "Clocks", "Coldplay", "A Rush of Blood to the Head", 2002, ["rock"], 2),
  t("somebody-that-i-used-to-know", "Somebody That I Used to Know", "Gotye", "Making Mirrors", 2011, ["pop", "indie"], 1),
  t("radioactive", "Radioactive", "Imagine Dragons", "Night Visions", 2012, ["rock", "pop"], 1),
  t("demons", "Demons", "Imagine Dragons", "Night Visions", 2012, ["rock", "pop"], 1),
  t("believer", "Believer", "Imagine Dragons", "Evolve", 2017, ["rock", "pop"], 1),
  t("counting-stars", "Counting Stars", "OneRepublic", "Native", 2013, ["pop", "rock"], 1),
  t("shut-up-and-dance", "Shut Up and Dance", "WALK THE MOON", "TALKING IS HARD", 2014, ["pop", "rock"], 1),
  t("all-of-me", "All of Me", "John Legend", "Love in the Future", 2013, ["rnb", "pop"], 1),
  t("what-makes-you-beautiful", "What Makes You Beautiful", "One Direction", "Up All Night", 2011, ["pop"], 1),
  t("night-changes", "Night Changes", "One Direction", "FOUR", 2014, ["pop"], 2),
  t("stitches", "Stitches", "Shawn Mendes", "Handwritten", 2015, ["pop"], 2),
  t("let-it-go", "Let It Go", "Idina Menzel", "Frozen", 2013, ["pop"], 1),
  t("super-bass", "Super Bass", "Nicki Minaj", "Pink Friday", 2010, ["hip-hop", "pop"], 1),
  t("industry-baby", "INDUSTRY BABY", "Lil Nas X", "MONTERO", 2021, ["hip-hop"], 1),
  t("about-damn-time", "About Damn Time", "Lizzo", "Special", 2022, ["pop"], 1),
  t("stayin-alive", "Stayin' Alive", "Bee Gees", "Saturday Night Fever", 1977, ["pop"], 1),
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
if (import.meta.env.DEV && CATALOG_BY_ID.size !== CATALOG.length) {
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
