import type { Decade, Difficulty, Genre, ModeFilters, Track } from "./types";

/**
 * The seed pool. Every mode (Daily, Unlimited, Sped-Up, Lyric-Flip, Gauntlet)
 * draws from this single catalog so difficulty and coverage stay consistent
 * across the product.
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
];

function t(
  id: string,
  title: string,
  artist: string,
  album: string,
  year: number,
  genres: Genre[],
  difficulty: Difficulty,
): Track {
  return { id, title, artist, album, year, genres, difficulty };
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
  difficulty: [1, 5],
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
