import type { LocaleCode } from "./config";

export type ModeSlug = "unlimited" | "lyrics" | "drunk";

export interface ModePageCopy {
  title: string;
  description: string;
  badge: string;
  h1: string;
  seoHeading: string;
  seoParagraphs: string[];
  seoSubheadings: string[];
  /** Optional page-level keywords meta (falls back to site defaults). */
  keywords?: string;
  /** Optional FAQ block under the SEO section (Drunk / High). */
  faqHeading?: string;
  faqs?: { q: string; a: string }[];
}

const EN: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Unlimited — Songless Unlimited Style",
    description:
      "Play Songless unlimited on Cluetune — endless guess-the-song rounds with no daily cooldown. Filter by genre, decade and difficulty. No account.",
    badge: "Unlimited · no login, no limit",
    h1: "Unlimited — Songless unlimited mode",
    seoHeading: "Songless unlimited, without the wait",
    seoSubheadings: [
      "How to play Songless multiple times",
      "Filters for hip hop, decades and deep cuts",
      "Same clip ladder as the Daily",
    ],
    seoParagraphs: [
      "Unlimited is Cluetune's Songless unlimited mode: the same one-second-to-sixteen-second guess-the-song ladder as the Daily, but with no cooldown and no login. Finish a round and the next track queues immediately.",
      "People search for Songless unlimited, unlimited Songless, and Songless infinite when they want more than one puzzle per day. This mode is that — free in the browser, on any phone or desktop.",
      "Filters narrow the catalogue by genre (hip hop, K-pop, rock, and more), decade, and how well-known the track is. Share a filtered session via the URL so friends play the same constraints.",
      "Every round uses preview clips from rights holders' services. Spotify supplies metadata and artwork when available; the audio itself streams from Apple Music or Deezer previews.",
      "Streaks and accuracy update live in the session HUD. Stats stay on your device — no account required.",
    ],
  },
  lyrics: {
    title: "Lyrics Guess — Name the Song from the Words",
    description:
      "Read a few lyric lines and guess the song title. Skip to reveal more lines. A Cluetune mode for when you know the words better than the intro.",
    badge: "Lyrics guess · read it, name it",
    h1: "Lyrics Guess — guess the song from the words",
    seoHeading: "Guess the song from lyrics, not just the intro",
    seoSubheadings: [
      "How Lyrics Guess works",
      "Same six attempts as the Daily",
      "When words beat a one-second clip",
    ],
    seoParagraphs: [
      "Lyrics Guess shows a short run of lines from the song with the title redacted. Type the track name — artist alone won't win, but it counts as close. Skip or miss and the next pair of lines appears.",
      "It uses the same six-attempt structure as the Daily and Unlimited. After the round resolves you hear the clip, so the lyrics have to do the work first.",
      "Some songs are easier from the chorus than from a snare hit. Lyrics Guess is for players who know the words but not the intro — or who want a break from audio-only rounds.",
      "Title matching is forgiving: typos, remaster suffixes, and artist-title in either order all count. No account, no app — play in the browser.",
    ],
  },
  drunk: {
    title: "Drunk Mode & High Mode — Guess Drunk Songs Online",
    description:
      "Play drunk mode or high mode on Cluetune: guess drunk songs and guess high songs from pitch-warped, slowed, echoey clips. First listen is the hardest — skip to sober up. Free, no account.",
    badge: "Drunk mode · skip to sober up",
    h1: "Drunk mode / high mode — guess drunk songs from a wasted clip",
    seoHeading: "Drunk mode and high mode: guess the song when the audio is wasted",
    keywords:
      "drunk mode, high mode, guess drunk songs, guess high songs, drunk song guess, high song quiz, guess the song drunk, guess the song high, wasted song game, drunk music quiz, high music quiz, distorted song guess game, cluetune drunk, cluetune high mode",
    seoSubheadings: [
      "What is drunk mode (and high mode)?",
      "Guess drunk songs and high songs from a distorted clip",
      "Skip to sober up — same six-try ladder",
    ],
    seoParagraphs: [
      "Drunk mode (also searched as high mode) is Cluetune's distorted guess-the-song mode: every clip arrives pitch-warped, slowed, muffled, or swimming in echo and reverb so naming the track feels like guessing drunk songs or high songs from a messy party playlist.",
      "The first listen is the most wasted. Skip or miss and the mix sobers up while the clip ladder unlocks more audio — so you can try to crush a round while it's still messy, or burn attempts to hear a clearer version of the same track.",
      "People look for drunk mode, high mode, guess drunk songs, and guess high songs when they want a harder twist on Heardle / Songless-style play. Cluetune's version keeps the familiar six attempts, then queues the next round with no cooldown and no account.",
      "Each track picks a drunk character (slow slurry, chipmunk echo, bathroom reverb, underwater, tape wobble) that stays consistent as intensity drops. A session buzz meter can make the next round start rougher if you were struggling — or clearer if you were sharp.",
      "Play free in the browser on phone or desktop. Filters for genre, decade, and difficulty work the same as Unlimited. Part of Cluetune alongside the Daily, Unlimited, Lyrics Guess, and Genre Gauntlet.",
    ],
    faqHeading: "Drunk mode / high mode FAQ",
    faqs: [
      {
        q: "What is drunk mode / high mode on Cluetune?",
        a: "Drunk mode (also called high mode) is a free guess-the-song mode where clips are pitch-warped, slowed, echoed, or muffled. You guess drunk songs or high songs from that messy first listen; skip to sober up.",
      },
      {
        q: "How do I guess drunk songs or high songs?",
        a: "Open /drunk, press play, and type the song title. The first second is the most distorted. Each miss or skip clears the effects and unlocks more of the clip — six attempts, same as the Daily.",
      },
      {
        q: "Is high mode different from drunk mode?",
        a: "No. High mode and drunk mode are the same Cluetune mode. Search either phrase and play at cluetune.com/drunk — no account required.",
      },
    ],
  },
};

const ES: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Ilimitado — Estilo Songless Unlimited",
    description:
      "Juega Songless unlimited en Cluetune: rondas infinitas para adivinar canciones sin esperar al diario. Filtra por género, década y dificultad. Sin cuenta.",
    badge: "Ilimitado · sin cuenta, sin límite",
    h1: "Modo ilimitado — Songless unlimited",
    seoHeading: "Songless unlimited, sin esperas",
    seoSubheadings: [
      "Cómo jugar Songless varias veces",
      "Filtros por género, década y rareza",
      "La misma escalera de clip que el diario",
    ],
    seoParagraphs: [
      "Ilimitado es el modo Songless unlimited de Cluetune: la misma escalera de un segundo a dieciséis, pero sin cooldown ni registro. Terminas una ronda y la siguiente se encola al instante.",
      "Mucha gente busca songless unlimited o songless infinito cuando quiere más de un puzzle al día. Este modo es exactamente eso — gratis en el navegador.",
      "Los filtros acotan el catálogo por género, década y popularidad. Comparte la URL filtrada para que tus amigos jueguen las mismas reglas.",
      "Cada ronda usa previews de los titulares de derechos. Spotify aporta metadatos cuando está disponible.",
      "Rachas y precisión se actualizan en vivo. Las estadísticas quedan en tu dispositivo.",
    ],
  },
  lyrics: {
    title: "Adivina por letra — Nombre la canción",
    description:
      "Lee unas líneas y adivina el título. Salta para ver más letra. Un modo de Cluetune para cuando conoces la letra mejor que el intro.",
    badge: "Letra · léela y adivínala",
    h1: "Adivina por letra — adivina la canción por las palabras",
    seoHeading: "Adivina la canción por la letra",
    seoSubheadings: ["Cómo funciona", "Seis intentos como el diario", "Cuando las palabras ganan al intro"],
    seoParagraphs: [
      "Muestra unas líneas con el título censurado. Escribe el nombre de la pista; solo el artista cuenta como cercano. Salta o falla y aparecen más líneas.",
      "Usa la misma estructura de seis intentos que el diario. Al terminar escuchas el clip.",
      "Algunas canciones son más fáciles por el estribillo que por un segundo de audio.",
      "Coincidencia flexible de títulos. Sin cuenta — juega en el navegador.",
    ],
  },
  drunk: {
    title: "Modo Drunk y High — Adivina canciones borrachas online",
    description:
      "Juega al modo drunk o high en Cluetune: adivina canciones borrachas o high con clips distorsionados (pitch, ralentizado, eco). La primera escucha es la más dura; salta para aclarar. Gratis, sin cuenta.",
    badge: "Modo Drunk · salta para aclarar",
    h1: "Modo drunk / high — adivina canciones con un clip borracho",
    seoHeading: "Modo drunk y high: adivina la canción cuando el audio está borracho",
    keywords:
      "drunk mode, high mode, modo borracho, modo high, adivinar canciones borrachas, guess drunk songs, guess high songs, canción distorsionada, quiz musical borracho, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Qué es el modo drunk (y high)",
      "Adivina canciones borrachas o high con un clip distorsionado",
      "Salta para aclarar — misma escalera de seis intentos",
    ],
    seoParagraphs: [
      "El modo drunk (también buscado como high mode) es el modo distorsionado de Cluetune: cada clip llega con pitch alterado, ralentizado, ahogado o nadando en eco y reverb, como adivinar canciones borrachas o high en una playlist de fiesta.",
      "La primera escucha es la más borracha. Si saltas o fallas, la mezcla se aclara mientras la escalera desbloquea más audio: puedes acertar en el caos o gastar intentos para oír una versión más clara.",
      "Quien busca drunk mode, high mode o adivinar canciones borrachas quiere un giro más difícil al estilo Heardle / Songless. Cluetune mantiene seis intentos y encadena la siguiente ronda sin espera ni cuenta.",
      "Cada pista elige un carácter borracho (arrastre lento, eco chipmunk, reverb de baño, underwater, cinta temblorosa) que se mantiene mientras baja la intensidad. El medidor de buzz de la sesión puede hacer que la siguiente ronda empiece más dura o más clara.",
      "Juega gratis en el navegador, en móvil o escritorio. Los filtros de género, década y dificultad son los mismos que en Ilimitado. Forma parte de Cluetune junto al Diario, Ilimitado, Letra y Desafío de género.",
    ],
    faqHeading: "FAQ del modo Drunk / High",
    faqs: [
      {
        q: "¿Qué es el modo drunk / high en Cluetune?",
        a: "El modo drunk (también llamado high) es un modo gratis de adivinar la canción con clips distorsionados: pitch, ralentizado, eco o ahogado. Adivinas canciones borrachas o high en esa primera escucha caótica; salta para aclarar.",
      },
      {
        q: "¿Cómo adivino canciones borrachas o high?",
        a: "Abre /drunk, pulsa play y escribe el título. El primer segundo es el más distorsionado. Cada fallo o salto aclara los efectos y desbloquea más clip — seis intentos, igual que el Diario.",
      },
      {
        q: "¿El high mode es distinto del drunk mode?",
        a: "No. High mode y drunk mode son el mismo modo de Cluetune. Busca cualquiera de las dos frases y juega en cluetune.com/drunk — sin cuenta.",
      },
    ],
  },
};

const JA: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "アンリミテッド — イントロドン風 無制限",
    description: "Cluetuneで無制限モード。1秒曲当てをクールダウンなしで何度でも。ジャンル・年代・難易度で絞り込み。アカウント不要。",
    badge: "無制限 · ログイン不要",
    h1: "アンリミテッド — 無制限曲当て",
    seoHeading: "イントロドン風を何度でも",
    seoSubheadings: ["何度もプレイする方法", "ジャンル・年代フィルター", "デイリーと同じラダー"],
    seoParagraphs: [
      "デイリーと同じ1秒から16秒のラダーを、クールダウンなしでプレイ。ラウンド終了後すぐ次の曲へ。",
      "Songless unlimitedを探している人向け。ブラウザで無料。",
      "フィルターでジャンル・年代・知名度を指定。URLを共有して同じ条件で友達と対戦。",
      "プレビューは権利者のサービスから配信。",
      "スタッツは端末に保存。アカウント不要。",
    ],
  },
  lyrics: {
    title: "歌詞当て — 歌詞から曲名を当てる",
    description: "数行の歌詞を読んで曲名を当てる。スキップで次の行を表示。イントロより歌詞が得意な人向け。",
    badge: "歌詞当て · 読んで当てる",
    h1: "歌詞当てクイズ",
    seoHeading: "歌詞から曲を当てる",
    seoSubheadings: ["遊び方", "6回のチャンス", "イントロより歌詞が手がかりのとき"],
    seoParagraphs: [
      "タイトル部分を隠した歌詞を表示。曲名を入力。スキップで次の行へ。",
      "デイリーと同じ6試行。終了後にクリップを再生。",
      "サビの方が分かりやすい曲もある。",
      "表記ゆれは許容。ブラウザで無料プレイ。",
    ],
  },
  drunk: {
    title: "Drunk / Highモード — 酔った音源で曲当て",
    description:
      "Cluetuneのdrunk mode / high mode。ピッチずれ・スロー・エコーのかかったクリップから曲名を当てる。最初がいちばん歪み、スキップでクリアに。無料・アカウント不要。",
    badge: "Drunkモード · スキップでクリアに",
    h1: "Drunk / Highモード — 酔ったクリップで曲当て",
    seoHeading: "Drunk modeとhigh mode：歪んだ音源で曲を当てる",
    keywords:
      "drunk mode, high mode, 曲当て 歪み, イントロドン 難しい, guess drunk songs, guess high songs, 酔い 音楽クイズ, cluetune drunk",
    seoSubheadings: [
      "Drunk mode（High mode）とは",
      "歪んだクリップから曲を当てる",
      "スキップで酔いが覚める — 6回のラダー",
    ],
    seoParagraphs: [
      "Drunk mode（検索では high mode とも呼ばれる）は、Cluetuneの歪み曲当てモード。クリップはピッチずれ・スロー・こもった音・エコーやリバーブ付きで、酔ったプレイリストから曲を当てる感覚です。",
      "最初の再生がいちばん「酔い」ます。スキップやミスでミックスがクリアになり、同時にクリップの長さも伸びます。ぐちゃぐちゃなまま当てるか、試行を使ってクリアな音を聞くかを選べます。",
      "Heardle / Songless系をもっと難しくしたい人が drunk mode や high mode を探します。Cluetuneはおなじみの6回挑戦のまま、クールダウンなし・アカウント不要で次のラウンドへ。",
      "曲ごとに酔いのキャラクター（ゆっくりスラー、チップマンクエコー、バスルームリバーブ、水中、テープの揺れ）が決まり、強度が下がっても維持されます。セッションのbuzzメーターで次ラウンドの開始難易度が変わります。",
      "スマホでもPCでもブラウザで無料。ジャンル・年代・難易度フィルターはアンリミテッドと同じ。デイリー、アンリミテッド、歌詞当て、ジャンルガントレットと並ぶCluetuneのモードです。",
    ],
    faqHeading: "Drunk / Highモード FAQ",
    faqs: [
      {
        q: "Cluetuneのdrunk mode / high modeとは？",
        a: "Drunk mode（high modeとも）は、ピッチずれ・スロー・エコー・こもった音のクリップから曲名を当てる無料モードです。最初がいちばん歪み、スキップでクリアになります。",
      },
      {
        q: "どうやって酔った曲を当てる？",
        a: "/drunk を開き、再生して曲名を入力。最初の1秒がいちばん歪んでいます。ミスやスキップで効果が薄れ、クリップも長くなります — デイリーと同じ6回。",
      },
      {
        q: "High modeとDrunk modeは別？",
        a: "いいえ。同じモードです。どちらの言葉で検索しても cluetune.com/drunk でプレイできます。アカウント不要。",
      },
    ],
  },
};

const FR: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Illimité — Style Songless Unlimited",
    description:
      "Jouez à Songless unlimited sur Cluetune : devine la chanson en boucle sans attendre le quotidien. Filtres par genre, décennie et difficulté.",
    badge: "Illimité · sans compte",
    h1: "Mode illimité — Songless unlimited",
    seoHeading: "Songless unlimited, sans attente",
    seoSubheadings: ["Jouer plusieurs fois", "Filtres genre et décennie", "Même échelle que le quotidien"],
    seoParagraphs: [
      "Même échelle d'un à seize secondes, sans cooldown. La piste suivante se charge aussitôt.",
      "Pour ceux qui cherchent songless unlimited ou songless infini — gratuit dans le navigateur.",
      "Filtrez par genre, décennie et popularité. Partagez l'URL filtrée.",
      "Extraits des services des ayants droit.",
      "Stats sur votre appareil, sans compte.",
    ],
  },
  lyrics: {
    title: "Paroles — Devine la chanson",
    description: "Lisez quelques lignes et devinez le titre. Passez pour voir la suite. Pour ceux qui connaissent les mots mieux que l'intro.",
    badge: "Paroles · lisez et devinez",
    h1: "Devine par les paroles",
    seoHeading: "Deviner la chanson par les paroles",
    seoSubheadings: ["Comment ça marche", "Six essais", "Quand les mots suffisent"],
    seoParagraphs: [
      "Quelques lignes avec le titre masqué. Saisissez le titre. Passez pour plus de lignes.",
      "Six tentatives comme le quotidien. Le clip joue à la fin.",
      "Parfois le refrain est plus facile qu'une seconde d'audio.",
      "Titres tolérants aux fautes. Sans compte.",
    ],
  },
  drunk: {
    title: "Mode Drunk et High — Devine des chansons saoules",
    description:
      "Jouez au mode drunk ou high sur Cluetune : devinez des chansons saoules ou high avec des extraits pitchés, ralentis et écho. La première écoute est la plus dure ; passez pour dégriser. Gratuit, sans compte.",
    badge: "Mode Drunk · passez pour dégriser",
    h1: "Mode drunk / high — devinez la chanson sur un extrait saoul",
    seoHeading: "Mode drunk et high : devinez quand l'audio est saoul",
    keywords:
      "drunk mode, high mode, mode bourré, deviner chanson distordue, guess drunk songs, guess high songs, quiz musical saoul, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Qu'est-ce que le mode drunk (et high) ?",
      "Devinez des chansons saoules ou high sur un extrait distordu",
      "Passez pour dégriser — même échelle à six essais",
    ],
    seoParagraphs: [
      "Le mode drunk (aussi cherché comme high mode) est le mode distordu de Cluetune : chaque extrait arrive pitché, ralenti, étouffé ou noyé dans l'écho et la réverb — comme deviner des chansons saoules ou high sur une playlist de soirée.",
      "La première écoute est la plus saoule. Passez ou ratez et le mix se clarifie pendant que l'échelle débloque plus d'audio : tentez le chaos ou brûlez des essais pour une version plus nette.",
      "Ceux qui cherchent drunk mode, high mode ou guess drunk songs veulent un twist plus dur du style Heardle / Songless. Cluetune garde six essais, puis enchaîne la manche suivante sans cooldown ni compte.",
      "Chaque piste choisit un caractère saoul (trainant lent, écho chipmunk, réverb de salle de bain, underwater, wobble de bande) qui reste stable pendant que l'intensité baisse. Le compteur de buzz de session peut rendre la manche suivante plus rude ou plus claire.",
      "Gratuit dans le navigateur, téléphone ou desktop. Les filtres genre, décennie et difficulté sont les mêmes qu'Illimité. Aux côtés du Quotidien, Illimité, Paroles et Genre Gauntlet.",
    ],
    faqHeading: "FAQ mode Drunk / High",
    faqs: [
      {
        q: "Qu'est-ce que le mode drunk / high sur Cluetune ?",
        a: "Le mode drunk (aussi appelé high) est un mode gratuit où les extraits sont pitchés, ralentis, avec écho ou étouffés. Vous devinez des chansons saoules ou high dès la première écoute chaotique ; passez pour dégriser.",
      },
      {
        q: "Comment deviner des chansons saoules ou high ?",
        a: "Ouvrez /drunk, appuyez sur lecture et tapez le titre. La première seconde est la plus distordue. Chaque échec ou skip clarifie les effets et débloque plus d'extrait — six essais, comme le Quotidien.",
      },
      {
        q: "High mode est-il différent de drunk mode ?",
        a: "Non. High mode et drunk mode sont le même mode Cluetune. Cherchez l'une ou l'autre expression et jouez sur cluetune.com/drunk — sans compte.",
      },
    ],
  },
};

const DE: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Unbegrenzt — Songless Unlimited Stil",
    description:
      "Songless unlimited auf Cluetune: endlos Songs erraten ohne Tageslimit. Filter nach Genre, Jahrzehnt und Schwierigkeit.",
    badge: "Unbegrenzt · ohne Konto",
    h1: "Unbegrenzt — Songless unlimited",
    seoHeading: "Songless unlimited ohne Wartezeit",
    seoSubheadings: ["Mehrfach spielen", "Genre- und Jahrzehntfilter", "Gleiche Leiter wie Daily"],
    seoParagraphs: [
      "Gleiche 1–16-Sekunden-Leiter, kein Cooldown. Nächster Track sofort.",
      "Für alle, die unlimited Songless suchen — kostenlos im Browser.",
      "Filter nach Genre, Jahrzehnt und Bekanntheit. URL teilen.",
      "Previews von Rechteinhabern.",
      "Stats bleiben auf dem Gerät.",
    ],
  },
  lyrics: {
    title: "Songtext-Raten — Titel erraten",
    description: "Lies ein paar Zeilen und rate den Titel. Überspringen zeigt mehr Text.",
    badge: "Songtext · lesen und raten",
    h1: "Songtext-Modus",
    seoHeading: "Song per Textzeilen erraten",
    seoSubheadings: ["So funktioniert's", "Sechs Versuche", "Wenn Worte helfen"],
    seoParagraphs: [
      "Zeilen mit zensiertem Titel. Titel eingeben. Skip für mehr Zeilen.",
      "Sechs Versuche wie beim Daily. Clip danach.",
      "Manchmal ist der Refrain leichter als eine Sekunde Audio.",
      "Tippfehler tolerant. Ohne Konto.",
    ],
  },
  drunk: {
    title: "Drunk- & High-Modus — Betrunkene Songs erraten",
    description:
      "Spiele Drunk Mode oder High Mode auf Cluetune: errate betrunkene oder high Songs aus pitch-verschobenen, verlangsamten Echo-Clips. Der erste Hörversuch ist am härtesten — skippen zum Nüchternwerden. Kostenlos, ohne Konto.",
    badge: "Drunk-Modus · skippen zum Nüchternwerden",
    h1: "Drunk- / High-Modus — Song aus einem betrunkenen Clip erraten",
    seoHeading: "Drunk- und High-Modus: Song erraten, wenn das Audio betrunken klingt",
    keywords:
      "drunk mode, high mode, betrunkener Song raten, verzerrter Song Quiz, guess drunk songs, guess high songs, Musikquiz betrunken, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Was ist Drunk Mode (und High Mode)?",
      "Betrunkene oder high Songs aus einem verzerrten Clip erraten",
      "Skippen zum Nüchternwerden — gleiche Sechs-Versuch-Leiter",
    ],
    seoParagraphs: [
      "Drunk Mode (auch als High Mode gesucht) ist Cluetunes verzerrter Guess-the-Song-Modus: Clips kommen pitch-verschoben, verlangsamt, gedämpft oder in Echo und Hall — wie betrunkene oder high Songs von einer Party-Playlist zu erraten.",
      "Der erste Hörversuch ist am betrunkensten. Skippen oder danebenliegen lässt den Mix nüchterner werden, während die Leiter mehr Audio freigibt — du kannst im Chaos treffen oder Versuche opfern für eine klarere Version.",
      "Wer Drunk Mode, High Mode oder guess drunk songs sucht, will einen härteren Twist à la Heardle / Songless. Cluetune behält sechs Versuche und startet die nächste Runde ohne Cooldown und ohne Konto.",
      "Jeder Track wählt einen betrunkenen Charakter (langsames Slur, Chipmunk-Echo, Badezimmer-Hall, underwater, Tape-Wobble), der bleibt, während die Intensität sinkt. Der Session-Buzz-Meter kann die nächste Runde härter oder klarer starten lassen.",
      "Kostenlos im Browser auf Handy oder Desktop. Genre-, Jahrzehnt- und Schwierigkeitsfilter wie bei Unbegrenzt. Neben Daily, Unbegrenzt, Songtext und Genre Gauntlet.",
    ],
    faqHeading: "FAQ Drunk- / High-Modus",
    faqs: [
      {
        q: "Was ist Drunk Mode / High Mode auf Cluetune?",
        a: "Drunk Mode (auch High Mode) ist ein kostenloser Modus mit pitch-verschobenen, verlangsamten, echoigen oder gedämpften Clips. Du errätst betrunkene oder high Songs beim chaotischen ersten Hören; skippen nüchtert den Mix.",
      },
      {
        q: "Wie errate ich betrunkene oder high Songs?",
        a: "Öffne /drunk, drücke Play und tippe den Titel. Die erste Sekunde ist am stärksten verzerrt. Jeder Fehlversuch oder Skip mildert die Effekte und schaltet mehr Clip frei — sechs Versuche wie beim Daily.",
      },
      {
        q: "Ist High Mode anders als Drunk Mode?",
        a: "Nein. High Mode und Drunk Mode sind derselbe Cluetune-Modus. Suche entweder Phrase und spiele auf cluetune.com/drunk — ohne Konto.",
      },
    ],
  },
};

const PT: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Ilimitado — Estilo Songless Unlimited",
    description:
      "Jogue Songless unlimited no Cluetune: adivinhe músicas sem limite diário. Filtros por gênero, década e dificuldade.",
    badge: "Ilimitado · sem conta",
    h1: "Modo ilimitado",
    seoHeading: "Songless unlimited sem espera",
    seoSubheadings: ["Jogar várias vezes", "Filtros", "Mesma escada do diário"],
    seoParagraphs: [
      "Mesma escada de 1 a 16 segundos, sem cooldown.",
      "Para quem busca songless unlimited — grátis no navegador.",
      "Filtre por gênero, década e popularidade.",
      "Previews dos detentores de direitos.",
      "Stats no dispositivo.",
    ],
  },
  lyrics: {
    title: "Letra — Adivinhe a música",
    description: "Leia algumas linhas e adivinhe o título. Pule para ver mais letra.",
    badge: "Letra · leia e adivinhe",
    h1: "Adivinhe pela letra",
    seoHeading: "Adivinhar pela letra",
    seoSubheadings: ["Como funciona", "Seis tentativas", "Quando a letra ajuda"],
    seoParagraphs: [
      "Linhas com título oculto. Digite o nome. Pule para mais linhas.",
      "Seis tentativas como o diário.",
      "Às vezes o refrão é mais fácil que um segundo de áudio.",
      "Sem conta.",
    ],
  },
  drunk: {
    title: "Modo Drunk e High — Adivinha músicas bêbadas",
    description:
      "Joga o modo drunk ou high no Cluetune: adivinha músicas bêbadas ou high com clipes distorcidos (pitch, lentidão, eco). A primeira escuta é a mais dura; salta para ficar sóbrio. Grátis, sem conta.",
    badge: "Modo Drunk · salta para ficar sóbrio",
    h1: "Modo drunk / high — adivinha a música num clipe bêbado",
    seoHeading: "Modo drunk e high: adivinha quando o áudio está bêbado",
    keywords:
      "drunk mode, high mode, modo bêbado, adivinhar músicas distorcidas, guess drunk songs, guess high songs, quiz musical bêbado, cluetune drunk, cluetune high",
    seoSubheadings: [
      "O que é o modo drunk (e high)?",
      "Adivinha músicas bêbadas ou high com um clipe distorcido",
      "Salta para ficar sóbrio — mesma escada de seis tentativas",
    ],
    seoParagraphs: [
      "O modo drunk (também procurado como high mode) é o modo distorcido do Cluetune: cada clipe chega com pitch alterado, mais lento, abafado ou a nadar em eco e reverb — como adivinhar músicas bêbadas ou high numa playlist de festa.",
      "A primeira escuta é a mais bêbada. Se saltas ou falhas, a mistura fica sóbria enquanto a escada desbloqueia mais áudio: podes acertar no caos ou gastar tentativas para ouvir uma versão mais clara.",
      "Quem procura drunk mode, high mode ou guess drunk songs quer um twist mais difícil ao estilo Heardle / Songless. O Cluetune mantém seis tentativas e encadeia a ronda seguinte sem espera nem conta.",
      "Cada faixa escolhe um carácter bêbado (arrasto lento, eco chipmunk, reverb de casa de banho, underwater, wobble de fita) que se mantém enquanto a intensidade baixa. O medidor de buzz da sessão pode tornar a ronda seguinte mais dura ou mais clara.",
      "Grátis no browser, telemóvel ou desktop. Filtros de género, década e dificuldade iguais ao Ilimitado. Junto ao Diário, Ilimitado, Letra e Desafio de género.",
    ],
    faqHeading: "FAQ do modo Drunk / High",
    faqs: [
      {
        q: "O que é o modo drunk / high no Cluetune?",
        a: "O modo drunk (também chamado high) é um modo grátis em que os clipes têm pitch alterado, lentidão, eco ou abafamento. Adivinhas músicas bêbadas ou high na primeira escuta caótica; salta para ficar sóbrio.",
      },
      {
        q: "Como adivinhar músicas bêbadas ou high?",
        a: "Abre /drunk, carrega play e escreve o título. O primeiro segundo é o mais distorcido. Cada falha ou salto clarifica os efeitos e desbloqueia mais clipe — seis tentativas, como o Diário.",
      },
      {
        q: "High mode é diferente de drunk mode?",
        a: "Não. High mode e drunk mode são o mesmo modo do Cluetune. Procura qualquer uma das frases e joga em cluetune.com/drunk — sem conta.",
      },
    ],
  },
};

const KO: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "무제한 — 송리스 무제한 스타일",
    description: "클루튠 무제한 모드. 1초 음악 퀴즈를 쿨다운 없이. 장르·연대·난이도 필터. 계정 불필요.",
    badge: "무제한 · 로그인 없음",
    h1: "무제한 모드",
    seoHeading: "송리스 무제한, 대기 없이",
    seoSubheadings: ["여러 번 플레이", "필터", "데일리와 같은 래더"],
    seoParagraphs: [
      "1초에서 16초까지 같은 래더, 쿨다운 없음.",
      "songless unlimited를 찾는 분들을 위해 — 브라우저에서 무료.",
      "장르·연대·인기도 필터. URL 공유 가능.",
      "권리자 프리뷰 사용.",
      "기록은 기기에 저장.",
    ],
  },
  lyrics: {
    title: "가사 맞히기",
    description: "몇 줄의 가사를 읽고 곡명을 맞히세요. 스킵으로 다음 줄 공개.",
    badge: "가사 · 읽고 맞히기",
    h1: "가사 퀴즈",
    seoHeading: "가사로 곡 맞히기",
    seoSubheadings: ["방법", "6번의 기회", "인트로보다 가사가 나을 때"],
    seoParagraphs: [
      "제목이 가려진 가사 표시. 곡명 입력. 스킵으로 더 많은 줄.",
      "데일리와 같은 6시도.",
      "후렴이 더 쉬운 곡도 있음.",
      "계정 불필요.",
    ],
  },
  drunk: {
    title: "Drunk / High 모드 — 취한 음원으로 곡 맞히기",
    description:
      "클루튠 drunk mode / high mode. 피치·슬로우·에코가 걸린 클립으로 곡명을 맞히세요. 첫 재생이 가장 심하고, 스킵하면 맑아집니다. 무료, 계정 불필요.",
    badge: "Drunk 모드 · 스킵하면 맑아짐",
    h1: "Drunk / High 모드 — 취한 클립으로 곡 맞히기",
    seoHeading: "Drunk mode와 high mode: 왜곡된 소리로 곡 맞히기",
    keywords:
      "drunk mode, high mode, 왜곡 곡맞히기, guess drunk songs, guess high songs, 취한 음악 퀴즈, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Drunk mode(High mode)란?",
      "왜곡된 클립으로 취한/하이 곡 맞히기",
      "스킵으로 술이 깸 — 6번의 래더",
    ],
    seoParagraphs: [
      "Drunk mode(검색어로는 high mode)는 클루튠의 왜곡 곡맞히기 모드입니다. 클립은 피치 변형·슬로우·먹먹함·에코·리버브로 들어와, 파티 플레이리스트에서 취한 곡을 맞히는 느낌입니다.",
      "첫 재생이 가장 '취합니다'. 스킵하거나 틀리면 믹스가 맑아지면서 클립도 길어집니다. 엉망인 채로 맞히거나, 시도를 써서 더 맑은 버전을 들을 수 있습니다.",
      "Heardle / Songless 스타일을 더 어렵게 하고 싶은 사람이 drunk mode, high mode를 찾습니다. 클루튠은 익숙한 6시도를 유지하고, 쿨다운·계정 없이 다음 라운드로 이어집니다.",
      "곡마다 취기 캐릭터(느린 슬러리, chipmunk 에코, 욕실 리버브, underwater, 테이프 흔들림)가 정해지고 강도가 내려가도 유지됩니다. 세션 buzz 미터로 다음 라운드 시작 난이도가 달라질 수 있습니다.",
      "휴대폰·PC 브라우저에서 무료. 장르·연대·난이도 필터는 무제한과 같습니다. 데일리, 무제한, 가사 맞히기, 장르 건틀릿과 함께하는 클루튠 모드입니다.",
    ],
    faqHeading: "Drunk / High 모드 FAQ",
    faqs: [
      {
        q: "클루튠의 drunk mode / high mode란?",
        a: "Drunk mode(high mode라고도 함)는 피치·슬로우·에코·먹먹한 클립으로 곡명을 맞히는 무료 모드입니다. 첫 재생이 가장 왜곡되고, 스킵하면 맑아집니다.",
      },
      {
        q: "취한 곡은 어떻게 맞히나요?",
        a: "/drunk를 열고 재생한 뒤 곡명을 입력하세요. 첫 1초가 가장 왜곡됩니다. 틀리거나 스킵하면 효과가 줄고 클립이 길어집니다 — 데일리와 같은 6번.",
      },
      {
        q: "High mode와 Drunk mode는 다른가요?",
        a: "아니요. 같은 클루튠 모드입니다. 어느 쪽 검색어든 cluetune.com/drunk에서 플레이하면 됩니다. 계정 불필요.",
      },
    ],
  },
};

const IT: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Illimitato — Stile Songless Unlimited",
    description:
      "Gioca Songless unlimited su Cluetune: indovina canzoni senza limite giornaliero. Filtri per genere, decennio e difficoltà.",
    badge: "Illimitato · senza account",
    h1: "Modalità illimitata",
    seoHeading: "Songless unlimited senza attesa",
    seoSubheadings: ["Giocare più volte", "Filtri", "Stessa scala del giornaliero"],
    seoParagraphs: [
      "Stessa scala da 1 a 16 secondi, senza cooldown.",
      "Per chi cerca songless unlimited — gratis nel browser.",
      "Filtra per genere, decennio e popolarità.",
      "Anteprime dai titolari dei diritti.",
      "Statistiche sul dispositivo.",
    ],
  },
  lyrics: {
    title: "Testo — Indovina la canzone",
    description: "Leggi alcune righe e indovina il titolo. Salta per vedere altro testo.",
    badge: "Testo · leggi e indovina",
    h1: "Indovina dal testo",
    seoHeading: "Indovinare dalla lyrics",
    seoSubheadings: ["Come funziona", "Sei tentativi", "Quando le parole bastano"],
    seoParagraphs: [
      "Righe con titolo oscurato. Inserisci il titolo. Salta per altre righe.",
      "Sei tentativi come il giornaliero.",
      "A volte il ritornello è più facile di un secondo di audio.",
      "Senza account.",
    ],
  },
  drunk: {
    title: "Modalità Drunk e High — Indovina canzoni ubriache",
    description:
      "Gioca alla modalità drunk o high su Cluetune: indovina canzoni ubriache o high da clip distorti (pitch, rallentati, eco). Il primo ascolto è il più duro; salta per smaltire. Gratis, senza account.",
    badge: "Modalità Drunk · salta per smaltire",
    h1: "Modalità drunk / high — indovina la canzone da un clip ubriaco",
    seoHeading: "Modalità drunk e high: indovina quando l'audio è ubriaco",
    keywords:
      "drunk mode, high mode, modalità ubriaca, indovina canzone distorta, guess drunk songs, guess high songs, quiz musicale ubriaco, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Cos'è la modalità drunk (e high)?",
      "Indovina canzoni ubriache o high da un clip distorto",
      "Salta per smaltire — stessa scala a sei tentativi",
    ],
    seoParagraphs: [
      "La modalità drunk (cercata anche come high mode) è la modalità distorta di Cluetune: ogni clip arriva pitchato, rallentato, ovattato o immerso in eco e reverb — come indovinare canzoni ubriache o high da una playlist di festa.",
      "Il primo ascolto è il più ubriaco. Se salti o sbagli, il mix si schiarisce mentre la scala sblocca più audio: puoi indovinare nel caos o bruciare tentativi per una versione più chiara.",
      "Chi cerca drunk mode, high mode o guess drunk songs vuole un twist più duro in stile Heardle / Songless. Cluetune mantiene sei tentativi e avvia subito il round successivo senza cooldown né account.",
      "Ogni traccia sceglie un carattere ubriaco (slur lento, eco chipmunk, reverb da bagno, underwater, wobble da nastro) che resta stabile mentre l'intensità scende. Il misuratore di buzz della sessione può rendere il round successivo più duro o più chiaro.",
      "Gratis nel browser su telefono o desktop. Filtri per genere, decennio e difficoltà come in Illimitato. Accanto a Giornaliero, Illimitato, Testo e Genre Gauntlet.",
    ],
    faqHeading: "FAQ modalità Drunk / High",
    faqs: [
      {
        q: "Cos'è la modalità drunk / high su Cluetune?",
        a: "La modalità drunk (detta anche high) è una modalità gratuita con clip pitchati, rallentati, con eco o ovattati. Indovini canzoni ubriache o high al primo ascolto caotico; salta per smaltire.",
      },
      {
        q: "Come indovino canzoni ubriache o high?",
        a: "Apri /drunk, premi play e digita il titolo. Il primo secondo è il più distorto. Ogni errore o skip schiarisce gli effetti e sblocca più clip — sei tentativi, come il Giornaliero.",
      },
      {
        q: "High mode è diverso da drunk mode?",
        a: "No. High mode e drunk mode sono la stessa modalità Cluetune. Cerca entrambe le frasi e gioca su cluetune.com/drunk — senza account.",
      },
    ],
  },
};

const RU: Record<ModeSlug, ModePageCopy> = {
  unlimited: {
    title: "Безлимит — в стиле Songless Unlimited",
    description:
      "Songless unlimited в Cluetune: угадывай песни без дневного лимита. Фильтры по жанру, десятилетию и сложности.",
    badge: "Безлимит · без аккаунта",
    h1: "Безлимитный режим",
    seoHeading: "Songless unlimited без ожидания",
    seoSubheadings: ["Играть много раз", "Фильтры", "Та же лестница, что в ежедневном"],
    seoParagraphs: [
      "Та же лестница от 1 до 16 секунд, без кулдауна.",
      "Для тех, кто ищет songless unlimited — бесплатно в браузере.",
      "Фильтры по жанру, десятилетию и известности.",
      "Превью от правообладателей.",
      "Статистика на устройстве.",
    ],
  },
  lyrics: {
    title: "Угадай по тексту",
    description: "Прочитай строки и угадай название. Пропуск открывает следующие строки.",
    badge: "Текст · читай и угадывай",
    h1: "Режим по тексту песни",
    seoHeading: "Угадать песню по словам",
    seoSubheadings: ["Как играть", "Шесть попыток", "Когда слова важнее интро"],
    seoParagraphs: [
      "Строки с скрытым названием. Введи название. Пропуск — больше строк.",
      "Шесть попыток как в ежедневном.",
      "Иногда припев проще, чем секунда аудио.",
      "Без аккаунта.",
    ],
  },
  drunk: {
    title: "Режим Drunk и High — Угадай пьяные песни",
    description:
      "Играй в drunk mode или high mode на Cluetune: угадывай пьяные или high песни по искажённым клипам (pitch, замедление, эхо). Первое прослушивание самое тяжёлое — пропуск отрезвляет. Бесплатно, без аккаунта.",
    badge: "Режим Drunk · пропуск отрезвляет",
    h1: "Режим drunk / high — угадай песню по пьяному клипу",
    seoHeading: "Режим drunk и high: угадай песню, когда аудио пьяное",
    keywords:
      "drunk mode, high mode, пьяный режим, угадать песню искажение, guess drunk songs, guess high songs, музыкальный квиз пьяный, cluetune drunk, cluetune high",
    seoSubheadings: [
      "Что такое drunk mode (и high mode)?",
      "Угадывай пьяные или high песни по искажённому клипу",
      "Пропуск отрезвляет — та же лестница из шести попыток",
    ],
    seoParagraphs: [
      "Drunk mode (также ищут как high mode) — искажённый режим угадай-песню на Cluetune: клипы приходят со сдвигом тона, замедлением, глушением или в эхе и ревербе — как угадывать пьяные или high песни с вечериночной плейлиста.",
      "Первое прослушивание самое пьяное. Пропуск или промах проясняет микс, пока лестница открывает больше аудио: можно угадать в хаосе или потратить попытки на более чистую версию.",
      "Те, кто ищет drunk mode, high mode или guess drunk songs, хотят более жёсткий твист в духе Heardle / Songless. Cluetune сохраняет шесть попыток и сразу запускает следующий раунд без кулдауна и без аккаунта.",
      "У каждого трека свой пьяный характер (медленный slur, chipmunk-эхо, ванная реверберация, underwater, wobble ленты), который держится, пока интенсивность падает. Счётчик buzz сессии может сделать следующий раунд жёстче или чище.",
      "Бесплатно в браузере на телефоне или компьютере. Фильтры жанра, десятилетия и сложности как в Безлимите. Рядом с Ежедневным, Безлимитом, Текстом и Genre Gauntlet.",
    ],
    faqHeading: "FAQ режима Drunk / High",
    faqs: [
      {
        q: "Что такое drunk mode / high mode на Cluetune?",
        a: "Drunk mode (также high mode) — бесплатный режим с клипами со сдвигом тона, замедлением, эхом или глушением. Угадываешь пьяные или high песни с хаотичного первого прослушивания; пропуск отрезвляет.",
      },
      {
        q: "Как угадывать пьяные или high песни?",
        a: "Открой /drunk, нажми play и введи название. Первая секунда — самая искажённая. Каждый промах или пропуск ослабляет эффекты и открывает больше клипа — шесть попыток, как в Ежедневном.",
      },
      {
        q: "High mode отличается от drunk mode?",
        a: "Нет. High mode и drunk mode — один и тот же режим Cluetune. Ищи любую фразу и играй на cluetune.com/drunk — без аккаунта.",
      },
    ],
  },
};

export const MODE_PAGES: Record<LocaleCode, Record<ModeSlug, ModePageCopy>> = {
  en: EN,
  es: ES,
  ja: JA,
  fr: FR,
  de: DE,
  pt: PT,
  ko: KO,
  it: IT,
  ru: RU,
};

export function getModePageCopy(locale: LocaleCode, slug: ModeSlug): ModePageCopy {
  return MODE_PAGES[locale][slug];
}

export const MODE_SLUGS: ModeSlug[] = ["unlimited", "lyrics", "drunk"];

export function modePath(slug: ModeSlug): string {
  return `/${slug}`;
}
