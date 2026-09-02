import type { LocaleCode } from "./config";

export type ModeSlug = "unlimited" | "lyrics" | "sped-up";

export interface ModePageCopy {
  title: string;
  description: string;
  badge: string;
  h1: string;
  seoHeading: string;
  seoParagraphs: string[];
  seoSubheadings: string[];
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
  "sped-up": {
    title: "Sped-Up Round — 1.35× Guess the Song",
    description:
      "Every clip pitched and tempo-shifted up 1.35×, the way it sounds on your For You page. A harder twist on the guess-the-song ladder.",
    badge: "Sped-up · 1.35× pitch and tempo",
    h1: "Sped-Up round — guess the song at 1.35×",
    seoHeading: "Guess the song when it's sped up",
    seoSubheadings: [
      "Why 1.35× is harder than it sounds",
      "Shorter clip ladder, same six tries",
      "TikTok-speed audio, classic format",
    ],
    seoParagraphs: [
      "Sped-Up plays every preview at 1.35× pitch and tempo — the way tracks sound when they blow up on short-form video. Same guess-the-song goal, harder execution.",
      "The clip ladder is compressed in time because the audio is faster. You still get six attempts; each miss unlocks more of the sped-up fragment.",
      "Use filters to stick to a genre or decade if you want a themed session. Unlimited-style continuous play with no daily limit.",
      "Free, no account, runs entirely in your browser. Part of Cluetune alongside the Daily, Unlimited, Lyrics Guess, and Genre Gauntlet.",
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
  "sped-up": {
    title: "Acelerado — Adivina a 1.35×",
    description:
      "Cada clip subido a 1.35× en tono y tempo, como en tu feed. Un giro más difícil del quiz musical.",
    badge: "Acelerado · 1.35× tono y tempo",
    h1: "Modo acelerado — adivina la canción a 1.35×",
    seoHeading: "Adivina la canción acelerada",
    seoSubheadings: ["Por qué 1.35× es más difícil", "Escalera más corta", "Audio estilo TikTok"],
    seoParagraphs: [
      "Reproduce cada preview a 1.35× — como cuando una canción se viraliza en vídeo corto.",
      "La escalera de clip se comprime en el tiempo. Sigues teniendo seis intentos.",
      "Usa filtros para temáticas por género o década.",
      "Gratis, sin cuenta, en el navegador.",
    ],
  },
};

// For brevity in other locales, provide full SEO content - I'll write reasonable translations for JA, FR, DE, PT, KO, IT, RU

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
  "sped-up": {
    title: "スピードアップ — 1.35倍で曲当て",
    description: "全クリップを1.35倍のピッチとテンポで再生。ショート動画風の難しいモード。",
    badge: "スピードアップ · 1.35×",
    h1: "スピードアップラウンド",
    seoHeading: "早送り音声で曲当て",
    seoSubheadings: ["1.35倍の難しさ", "短いラダー", "TikTok速度の音源"],
    seoParagraphs: [
      "プレビューを1.35倍で再生。ショート動画で流行る速さ。",
      "時間圧縮されたラダー。6回の試行は同じ。",
      "ジャンル・年代でフィルター可能。",
      "無料・アカウント不要。",
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
  "sped-up": {
    title: "Accéléré — Devine à 1,35×",
    description: "Chaque extrait accéléré à 1,35× en hauteur et tempo. Un blind test plus difficile.",
    badge: "Accéléré · 1,35×",
    h1: "Manche accélérée",
    seoHeading: "Deviner une chanson accélérée",
    seoSubheadings: ["Pourquoi 1,35× est dur", "Échelle raccourcie", "Son style TikTok"],
    seoParagraphs: [
      "Extraits à 1,35× comme sur les réseaux courts.",
      "Échelle compressée, six essais.",
      "Filtres par genre ou décennie.",
      "Gratuit, sans compte.",
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
  "sped-up": {
    title: "Beschleunigt — 1,35× Raten",
    description: "Jeder Clip mit 1,35× Tonhöhe und Tempo — schwerer als es klingt.",
    badge: "Beschleunigt · 1,35×",
    h1: "Beschleunigte Runde",
    seoHeading: "Song im Fast-Forward erraten",
    seoSubheadings: ["Warum 1,35× schwer ist", "Kürzere Leiter", "TikTok-Tempo"],
    seoParagraphs: [
      "Previews mit 1,35× Geschwindigkeit.",
      "Komprimierte Leiter, sechs Versuche.",
      "Filter nach Genre oder Jahrzehnt.",
      "Kostenlos, ohne Konto.",
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
  "sped-up": {
    title: "Acelerado — 1,35×",
    description: "Cada clipe em 1,35× de tom e tempo. Modo mais difícil.",
    badge: "Acelerado · 1,35×",
    h1: "Rodada acelerada",
    seoHeading: "Adivinhe acelerado",
    seoSubheadings: ["Por que 1,35× é difícil", "Escada curta", "Som estilo TikTok"],
    seoParagraphs: [
      "Previews em 1,35×.",
      "Escada comprimida, seis tentativas.",
      "Filtros por gênero.",
      "Grátis, sem conta.",
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
  "sped-up": {
    title: "스피드업 — 1.35배",
    description: "모든 클립을 1.35배 피치·템포로 재생. 더 어려운 모드.",
    badge: "스피드업 · 1.35×",
    h1: "스피드업 라운드",
    seoHeading: "빨라진 곡 맞히기",
    seoSubheadings: ["1.35배의 난이도", "짧은 래더", "숏폼 속도"],
    seoParagraphs: [
      "1.35배 속도로 프리뷰 재생.",
      "압축된 래더, 6시도.",
      "장르 필터.",
      "무료, 계정 불필요.",
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
  "sped-up": {
    title: "Accelerato — 1,35×",
    description: "Ogni clip a 1,35× di pitch e tempo. Modalità più difficile.",
    badge: "Accelerato · 1,35×",
    h1: "Round accelerato",
    seoHeading: "Indovina accelerato",
    seoSubheadings: ["Perché 1,35× è difficile", "Scala corta", "Suono stile TikTok"],
    seoParagraphs: [
      "Anteprime a 1,35×.",
      "Scala compressa, sei tentativi.",
      "Filtri per genere.",
      "Gratis, senza account.",
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
  "sped-up": {
    title: "Ускоренный — 1,35×",
    description: "Каждый клип с ускорением 1,35× по тону и темпу. Сложнее, чем кажется.",
    badge: "Ускоренный · 1,35×",
    h1: "Ускоренный раунд",
    seoHeading: "Угадать ускоренную песню",
    seoSubheadings: ["Почему 1,35× сложно", "Короткая лестница", "Звук как в TikTok"],
    seoParagraphs: [
      "Превью с ускорением 1,35×.",
      "Сжатая лестница, шесть попыток.",
      "Фильтры по жанру.",
      "Бесплатно, без аккаунта.",
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

export const MODE_SLUGS: ModeSlug[] = ["unlimited", "lyrics", "sped-up"];

export function modePath(slug: ModeSlug): string {
  return `/${slug}`;
}
