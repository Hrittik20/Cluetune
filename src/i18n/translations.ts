import type { LocaleCode } from "./config";
import { HOME_FAQS } from "../lib/faqs";

export interface FaqTranslation {
  q: string;
  a: string;
}

export interface LocaleTranslation {
  meta: {
    title: string;
    description: string;
    keywords: string;
    h1: string;
  };
  hero: {
    badge: string;
    donePrompt: string;
    unlimitedLink: string;
    doneSuffix: string;
  };
  modes: {
    eyebrow: string;
    heading: string;
    items: { href: string; name: string; meta: string; blurb: string; accent: string; featured?: boolean }[];
  };
  why: {
    eyebrow: string;
    heading: string;
    items: { title: string; body: string }[];
  };
  how: {
    eyebrow: string;
    heading: string;
    body: string;
    rulesLink: string;
    playLink: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    subheadings: string[];
    questionsHeading: string;
    siteNavLabel: string;
    sitePages: { href: string; label: string }[];
  };
  faqs: FaqTranslation[];
}

const EN: LocaleTranslation = {
  meta: {
    title: "Song Guess Game — Guess the Song from 1 Second",
    description:
      "Cluetune is a free song guessing game online. Name the track from 1 second — a Songless-style daily puzzle, then unlimited rounds with no account.",
    keywords:
      "song guess game, song guessing game online, songless, songless unlimited, guess the song game, music guessing game, heardle, guessable, drunk mode, high mode, guess drunk songs, guess high songs",
    h1: "Cluetune — guess the song from 1 second",
  },
  hero: {
    badge: "Daily · same clip for everyone",
    donePrompt: "Done for the day?",
    unlimitedLink: "Unlimited",
    doneSuffix: "has no cooldown.",
  },
  modes: {
    eyebrow: "Other ways to play",
    heading: "Four more modes, all drawing from the same catalogue.",
    items: [
      {
        href: "/unlimited",
        name: "Unlimited",
        meta: "No cooldown",
        blurb: "Keep going. Same catalogue, live streak and accuracy, filters for genre, decade and obscurity.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Guess drunk songs or high songs from a wasted first listen. Skip and the mix sobers up.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Lyrics Guess",
        meta: "Read it",
        blurb: "A few lines of the song. Guess the title. Skip to reveal the next lines if you are stuck.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Genre Gauntlet",
        meta: "5 rounds",
        blurb: "Pick a pack — hyperpop, K-pop, Afrobeats, drill — and run five back to back.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Why this one",
    heading: "Built for the part everyone else treats as an afterthought.",
    items: [
      {
        title: "A result card, not a screenshot.",
        body: "Finish a round and you get a rendered 9:16 image with your clip's waveform, guess pattern and time-to-guess. It drops straight into a Story or a TikTok upload.",
      },
      {
        title: "Challenge links that need no account.",
        body: "Send a friend the exact clip you just played. They open the link, play it in the browser, and get scored against you. Nobody signs up.",
      },
      {
        title: "The record is the interface.",
        body: "No progress bar. A vinyl that spins with the clip, grooves that move with the spectrum, and a needle-skip glitch every time you miss.",
      },
      {
        title: "No cooldown after you're done.",
        body: "The daily is one clip. Unlimited is right underneath it — keep playing, with filters, for as long as you like.",
      },
    ],
  },
  how: {
    eyebrow: "How a round works",
    heading: "Six rungs, and the clip grows on every miss.",
    body: "The ladder is deliberately steep at the start. One second is barely a snare hit — that is the whole point. Guess wrong and the next rung hands you enough to hear the hook.",
    rulesLink: "Read the Rules",
    playLink: "Play Unlimited",
  },
  about: {
    eyebrow: "About the game",
    heading: "What is Cluetune?",
    subheadings: [
      "Cluetune vs Songless, Guessable and other song guess games",
      "How to guess a song from 1 second",
      "Unlimited, Songless unlimited hip hop, and the other modes",
    ],
    paragraphs: [
      "Cluetune is a free song guess game you play in the browser. Each round starts with one second of a track and six attempts to name it. Guess wrong, or skip, and the clip grows from one second up to sixteen. No account, no app, no cooldown once the daily is done.",
      "That loop is what people want from a song guessing game online — the same format as Songless, Songless Unlimited, and Guessable.gg. One shared daily so friends can compare scores, then unlimited rounds when you are not finished.",
      "Songless and unlimited Songless sessions popularised the heard-it, name-it format after Heardle closed. Cluetune sits in that family with a vinyl interface, shareable result cards, and challenge links that need no account.",
      "Titles in the real world are messy — remasters, featured artists, punctuation. Cluetune treats the title alone, artist and title in either order, and reasonable typos as the same answer.",
      "The daily puzzle is the same clip for every player and resets at midnight in your timezone. A skip buys the next rung of audio. Miss all six and the track is revealed with links to Spotify, Apple Music and YouTube.",
      "Clips stream from rights holders' preview services. Unlimited also draws current hits from iTunes and Deezer charts. None of that requires a streaming login.",
      "Done with the daily? Unlimited is Cluetune's Songless unlimited mode: no cooldown, live streak, and filters for genre, decade and obscurity. Drunk mode (also called high mode — guess drunk songs or high songs from warped clips), Lyrics Guess and Genre Gauntlet add more ways to play.",
      "Land on Cluetune, press play, type a title. Challenge a friend with a link that pins the exact clip you just heard. Cluetune is a song guess game first and a daily ritual second.",
    ],
    questionsHeading: "Questions",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
    ],
  },
  faqs: HOME_FAQS,
};

const ES: LocaleTranslation = {
  meta: {
    title: "Adivina la canción — Juego de adivinar canciones",
    description:
      "Cluetune es un juego gratuito para adivinar canciones online. ¿Qué canción es? Escucha 1 segundo y adivínala — quiz de música diario y modo ilimitado sin cuenta.",
    keywords:
      "adivina la canción, juego de adivinar canciones, quiz de música, trivial de música, qué canción es, adivinar canciones online, juego musical, heardle español, songless, drunk mode, high mode, modo borracho, adivinar canciones borrachas",
    h1: "Cluetune — adivina la canción en 1 segundo",
  },
  hero: {
    badge: "Diario · la misma canción para todos",
    donePrompt: "¿Terminaste por hoy?",
    unlimitedLink: "Ilimitado",
    doneSuffix: "no tiene límite de tiempo.",
  },
  modes: {
    eyebrow: "Otras formas de jugar",
    heading: "Cuatro modos más, todos con el mismo catálogo.",
    items: [
      {
        href: "/unlimited",
        name: "Ilimitado",
        meta: "Sin límite",
        blurb: "Sigue jugando. Mismo catálogo, racha en vivo y filtros por género, década y dificultad.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Adivina canciones borrachas o high con la primera escucha destrozada. Salta y la mezcla se aclara.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Letra",
        meta: "Léela",
        blurb: "Unas líneas de la canción. Adivina el título. Salta para ver más letra si te atascas.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Desafío de género",
        meta: "5 rondas",
        blurb: "Elige un pack — K-pop, Afrobeats, drill — y juega cinco rondas seguidas.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Por qué este",
    heading: "Hecho para lo que otros tratan como un detalle menor.",
    items: [
      {
        title: "Una tarjeta de resultado, no una captura.",
        body: "Al terminar una ronda obtienes una imagen 9:16 con la forma de onda, el patrón de intentos y el tiempo. Lista para Stories o TikTok.",
      },
      {
        title: "Enlaces de reto sin cuenta.",
        body: "Envía a un amigo el clip exacto que acabas de escuchar. Abre el enlace, juega y compara puntuaciones. Nadie se registra.",
      },
      {
        title: "El disco es la interfaz.",
        body: "Sin barra de progreso. Un vinilo que gira con el clip y un salto de aguja cada vez que fallas.",
      },
      {
        title: "Sin espera después del diario.",
        body: "El reto diario es un clip. Ilimitado está justo debajo — sigue jugando con filtros todo lo que quieras.",
      },
    ],
  },
  how: {
    eyebrow: "Cómo funciona una ronda",
    heading: "Seis escalones, y el clip crece con cada fallo.",
    body: "La escalera es empinada al principio a propósito. Un segundo es apenas un golpe de caja — ese es el punto. Falla y el siguiente escalón te da suficiente audio para oír el estribillo.",
    rulesLink: "Leer las reglas",
    playLink: "Jugar ilimitado",
  },
  about: {
    eyebrow: "Sobre el juego",
    heading: "¿Qué es Cluetune?",
    subheadings: [
      "Cluetune frente a otros juegos de adivinar canciones",
      "Cómo adivinar una canción con 1 segundo",
      "Modo ilimitado y otros modos de juego",
    ],
    paragraphs: [
      "Cluetune es un juego gratuito de adivinar canciones que juegas en el navegador. Cada ronda empieza con un segundo de una pista y tienes seis intentos para nombrarla. Si fallas o saltas, el clip crece de uno a dieciséis segundos. Sin cuenta, sin app, sin espera tras el diario.",
      "Ese bucle es lo que buscan quienes buscan un juego de adivinar canciones online o un quiz de música al estilo Heardle y Songless. Un reto diario compartido para comparar con amigos, y rondas ilimitadas cuando quieras seguir.",
      "Los juegos de adivinar canciones popularizaron el formato escúchalo y nómbralo. Cluetune está en esa familia con interfaz de vinilo, tarjetas para compartir y enlaces de reto sin registro.",
      "Los títulos reales son caóticos — remasterizaciones, artistas invitados, puntuación. Cluetune acepta solo el título, artista y título en cualquier orden, y errores razonables de escritura.",
      "El puzzle diario es el mismo clip para todos y se reinicia a medianoche en tu zona horaria. Saltar compra el siguiente escalón de audio. Si fallas las seis, se revela la canción con enlaces a Spotify, Apple Music y YouTube.",
      "Los clips se transmiten desde los servicios de vista previa de los titulares de derechos. Ilimitado también incluye éxitos actuales de iTunes y Deezer.",
      "¿Terminaste el diario? Ilimitado es el modo sin límite: sin espera, racha en vivo y filtros por género, década y dificultad. Modo Drunk (también high — adivina canciones borrachas o high con clips distorsionados), Letra y Desafío de género añaden más formas de jugar.",
      "Entra en Cluetune, pulsa play, escribe un título. Reta a un amigo con un enlace al clip exacto. Cluetune es un juego para adivinar la canción primero y un ritual diario después.",
    ],
    questionsHeading: "Preguntas",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "Sobre nosotros" },
      { href: "/contact", label: "Contacto" },
      { href: "/privacy", label: "Política de privacidad" },
      { href: "/terms", label: "Términos y condiciones" },
    ],
  },
  faqs: [
    {
      q: "¿Qué canción es?",
      a: "En Cluetune escuchas un clip corto y debes adivinar la canción. Empiezas con un segundo y tienes seis intentos. Cada fallo revela más audio — un quiz de música al estilo Heardle.",
    },
    {
      q: "¿Cómo jugar al juego de adivinar canciones?",
      a: "Pulsa Play, escucha el clip y escribe el título. Sin cuenta. El reto diario es uno al día; el modo Ilimitado te deja jugar todas las rondas que quieras.",
    },
    {
      q: "¿Es un quiz de música gratuito?",
      a: "Sí. Cluetune es un trivial de música gratuito en el navegador. Diario, ilimitado, modo drunk / high, letra y desafío de género — todo sin registro.",
    },
    {
      q: "¿Puedo jugar varias veces?",
      a: "Sí. Tras el diario, abre Ilimitado para rondas sin fin. Filtra por género, década o dificultad.",
    },
    {
      q: "¿Qué es el modo drunk / high?",
      a: "El modo drunk (también high) distorsiona los clips con pitch, ralentizado, eco o ahogado. Adivinas canciones borrachas o high en la primera escucha; salta y la mezcla se aclara. Gratis en /drunk.",
    },
    {
      q: "¿Cómo adivinar canciones borrachas o high?",
      a: "Abre el modo Drunk en Cluetune. El primer segundo es el más duro; cada salto aclara los efectos. Seis intentos como el Diario, luego la siguiente pista.",
    },
    {
      q: "¿Necesito una cuenta?",
      a: "No. Cada modo funciona al cargar la página. Las rachas se guardan en este navegador.",
    },
  ],
};

const JA: LocaleTranslation = {
  meta: {
    title: "曲当てクイズ — イントロドン風 音楽クイズ",
    description:
      "Cluetuneは無料の歌当てゲーム。1秒のイントロから曲名を当てる音楽クイズ。毎日のパズルと無制限モード、アカウント不要。",
    keywords:
      "イントロドン, 曲当てクイズ, 音楽クイズ, 歌当てゲーム, 曲当てゲーム, 音楽当てゲーム, イントロ当て, heardle 日本語, songless, drunk mode, high mode",
    h1: "Cluetune — 1秒で曲当てクイズ",
  },
  hero: {
    badge: "デイリー · みんな同じ曲",
    donePrompt: "今日は終わり？",
    unlimitedLink: "無制限",
    doneSuffix: "はいつでもプレイできます。",
  },
  modes: {
    eyebrow: "他のプレイ方法",
    heading: "同じカタログから遊べる4つのモード。",
    items: [
      {
        href: "/unlimited",
        name: "無制限",
        meta: "制限なし",
        blurb: "続けてプレイ。連勝記録とジャンル・年代・難易度フィルター付き。",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "酔った最初の再生から曲を当てる。スキップするとミックスがクリアに。",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "歌詞当て",
        meta: "読む",
        blurb: "数行の歌詞から曲名を当てる。困ったらスキップで次の歌詞を表示。",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "ジャンルチャレンジ",
        meta: "5ラウンド",
        blurb: "K-pop、Afrobeats、ドリルなどのパックで5曲連続チャレンジ。",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "選ばれる理由",
    heading: "他のゲームが後回しにする部分にこだわった。",
    items: [
      {
        title: "スクリーンショットではなく結果カード。",
        body: "ラウンド終了後、波形・回答パターン・所要時間入りの9:16画像を生成。ストーリーやTikTokにそのまま投稿。",
      },
      {
        title: "アカウント不要のチャレンジリンク。",
        body: "聞いたクリップのリンクを友達に送るだけ。相手はブラウザで開いてスコアを競える。登録不要。",
      },
      {
        title: "レコードがUI。",
        body: "プログレスバーなし。クリップに合わせて回るレコードと、ミス時のニードルスキップ演出。",
      },
      {
        title: "デイリー後もすぐプレイ。",
        body: "デイリーは1曲。すぐ下の無制限モードでフィルター付きで好きなだけ続けられる。",
      },
    ],
  },
  how: {
    eyebrow: "ラウンドの流れ",
    heading: "6段階。ミスするたびにクリップが伸びる。",
    body: "最初は意図的に短い。1秒はスネアの一撃程度——それがこのゲームの醍醐味。外すと次の段階でサビが聞こえる長さになる。",
    rulesLink: "ルールを読む",
    playLink: "無制限でプレイ",
  },
  about: {
    eyebrow: "ゲームについて",
    heading: "Cluetuneとは？",
    subheadings: [
      "他の曲当てゲームとの違い",
      "1秒から曲を当てる方法",
      "無制限モードとその他のモード",
    ],
    paragraphs: [
      "Cluetuneはブラウザで遊べる無料の歌当てゲームです。各ラウンドは1秒のクリップから始まり、6回まで曲名を入力できます。外すかスキップすると、1秒から16秒までクリップが伸びます。アカウント不要、待ち時間なし。",
      "イントロドンやHeardle、Songlessのような音楽クイズを探している人向けのゲームです。毎日同じ曲で友達と比較し、終わったら無制限モードで続けられます。",
      "曲当てクイズの「聞いて当てる」形式を継承。レコードUI、シェア用カード、アカウント不要のチャレンジリンクが特徴です。",
      "曲名は現実世界では複雑——リマスター、フィーチャリング、記号の違い。Cluetuneは曲名のみ、順不同の「アーティスト＋曲名」、軽いタイプミスを正解として扱います。",
      "デイリーパズルは全員同じクリップで、現地時間の深夜にリセット。スキップは次の段階の音声を得る手段。6回外すと曲が表示され、Spotify・Apple Music・YouTubeへのリンクが出ます。",
      "クリップは権利者のプレビューサービスから配信。無制限モードはiTunesとDeezerのチャートからも曲を取得します。",
      "デイリーが終わったら無制限モードへ。待ち時間なし、連勝記録、ジャンル・年代・難易度フィルター付き。Drunkモード（high mode — 歪んだクリップから曲当て）、歌詞当て、ジャンルチャレンジも用意。",
      "Cluetuneを開いて再生、曲名を入力するだけ。聞いたクリップのリンクで友達に挑戦。曲当てゲームとして、そして毎日の習慣として楽しめます。",
    ],
    questionsHeading: "よくある質問",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "概要" },
      { href: "/contact", label: "お問い合わせ" },
      { href: "/privacy", label: "プライバシーポリシー" },
      { href: "/terms", label: "利用規約" },
    ],
  },
  faqs: [
    {
      q: "イントロドンとは？",
      a: "短いイントロから曲名を当てる音楽クイズの形式です。Cluetuneも1秒から始まり、6回のチャンスで曲当てクイズを楽しめます。",
    },
    {
      q: "曲当てクイズは無料ですか？",
      a: "はい。Cluetuneはブラウザで無料プレイできる音楽クイズです。アカウント登録は不要です。",
    },
    {
      q: "何度でもプレイできますか？",
      a: "はい。デイリー終了後、無制限モードで好きなだけ続けられます。ジャンル・年代・難易度でフィルター可能。",
    },
    {
      q: "Songlessのようなゲームですか？",
      a: "はい。CluetuneはSonglessやHeardleと同じ形式の歌当てゲームで、デイリーと無制限モードに加え、Drunk / Highモードや歌詞当てもあります。",
    },
    {
      q: "Drunk mode / High modeとは？",
      a: "クリップがピッチずれ・スロー・エコーなどで歪む曲当てモードです。最初がいちばん歪み、スキップでクリアに。/drunk で無料・アカウント不要。",
    },
    {
      q: "アカウントは必要ですか？",
      a: "不要です。ページを開けばすぐプレイできます。連勝記録はこのブラウザに保存されます。",
    },
  ],
};

const FR: LocaleTranslation = {
  meta: {
    title: "Devine la chanson — Quiz musical en ligne",
    description:
      "Cluetune est un jeu gratuit pour deviner la chanson en ligne. Écoutez 1 seconde et trouvez le titre — quiz musical quotidien et mode illimité sans compte.",
    keywords:
      "devine la chanson, jeu deviner chanson, quiz musical, quiz musique, blind test musique, jeu musical en ligne, heardle français, songless, drunk mode, high mode, mode bourré",
    h1: "Cluetune — devine la chanson en 1 seconde",
  },
  hero: {
    badge: "Quotidien · même extrait pour tous",
    donePrompt: "Terminé pour aujourd'hui ?",
    unlimitedLink: "Illimité",
    doneSuffix: "n'a pas de limite de temps.",
  },
  modes: {
    eyebrow: "Autres modes",
    heading: "Quatre modes de plus, le même catalogue.",
    items: [
      {
        href: "/unlimited",
        name: "Illimité",
        meta: "Sans limite",
        blurb: "Continuez à jouer. Série en direct, filtres par genre, décennie et difficulté.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Devinez des chansons saoules ou high dès la première écoute gâchée. Passez et le mix se clarifie.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Paroles",
        meta: "Lisez",
        blurb: "Quelques lignes de la chanson. Devinez le titre. Passez pour voir la suite.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Défi genre",
        meta: "5 manches",
        blurb: "Choisissez un pack — K-pop, Afrobeats, drill — et enchaînez cinq manches.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Pourquoi celui-ci",
    heading: "Conçu pour ce que les autres négligent.",
    items: [
      {
        title: "Une carte de résultat, pas une capture.",
        body: "À la fin d'une manche, une image 9:16 avec la forme d'onde, le schéma de tentatives et le temps. Prête pour Stories ou TikTok.",
      },
      {
        title: "Liens défi sans compte.",
        body: "Envoyez à un ami l'extrait exact que vous venez d'entendre. Il ouvre le lien, joue et compare son score. Aucune inscription.",
      },
      {
        title: "Le disque est l'interface.",
        body: "Pas de barre de progression. Un vinyle qui tourne avec l'extrait et un saut d'aiguille à chaque erreur.",
      },
      {
        title: "Pas d'attente après le quotidien.",
        body: "Le défi quotidien est un extrait. Illimité est juste en dessous — jouez avec des filtres aussi longtemps que vous voulez.",
      },
    ],
  },
  how: {
    eyebrow: "Comment fonctionne une manche",
    heading: "Six paliers, l'extrait grandit à chaque erreur.",
    body: "L'échelle est volontairement raide au début. Une seconde, c'est à peine une caisse claire — c'est tout l'intérêt. Ratez et le palier suivant révèle assez pour entendre le refrain.",
    rulesLink: "Lire les règles",
    playLink: "Jouer en illimité",
  },
  about: {
    eyebrow: "À propos",
    heading: "Qu'est-ce que Cluetune ?",
    subheadings: [
      "Cluetune face aux autres jeux de deviner la chanson",
      "Comment deviner une chanson en 1 seconde",
      "Mode illimité et autres modes",
    ],
    paragraphs: [
      "Cluetune est un jeu gratuit pour deviner la chanson dans le navigateur. Chaque manche commence par une seconde d'extrait et six tentatives pour le nommer. Erreur ou passage : l'extrait passe de une à seize secondes. Sans compte, sans application.",
      "C'est le format recherché par ceux qui veulent un quiz musical en ligne façon Heardle ou Songless. Un défi quotidien partagé, puis des manches illimitées.",
      "Les jeux de deviner la chanson ont popularisé le format entendre et nommer. Cluetune en hérite avec une interface vinyle et des liens défi sans inscription.",
      "Les titres réels sont chaotiques — remasters, featurings, ponctuation. Cluetune accepte le titre seul, artiste et titre dans n'importe quel ordre, et des fautes raisonnables.",
      "Le puzzle quotidien est le même extrait pour tous, réinitialisé à minuit dans votre fuseau horaire. Passer achète le palier suivant. Six erreurs et la piste est révélée avec des liens Spotify, Apple Music et YouTube.",
      "Les extraits proviennent des services de prévisualisation des détenteurs de droits. Illimité inclut aussi les hits actuels d'iTunes et Deezer.",
      "Terminé le quotidien ? Illimité est le mode sans limite : pas d'attente, série en direct, filtres par genre, décennie et difficulté. Mode Drunk (aussi high — chansons saoules ou high sur clips distordus), Paroles et Genre Gauntlet ajoutent d'autres façons de jouer.",
      "Ouvrez Cluetune, appuyez sur lecture, tapez un titre. Défiez un ami avec un lien vers l'extrait exact. Cluetune est un quiz musical d'abord, un rituel quotidien ensuite.",
    ],
    questionsHeading: "Questions",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Politique de confidentialité" },
      { href: "/terms", label: "Conditions d'utilisation" },
    ],
  },
  faqs: [
    {
      q: "Qu'est-ce qu'un quiz musical ?",
      a: "Un quiz musical joue un court extrait et vous demande de deviner la chanson. Cluetune commence à une seconde avec six tentatives — le même format que Heardle.",
    },
    {
      q: "Est-ce un jeu pour deviner la chanson en ligne ?",
      a: "Oui. Cluetune fonctionne entièrement dans le navigateur, sans téléchargement ni compte. Défi quotidien ou manches illimitées sur tout appareil.",
    },
    {
      q: "Puis-je jouer plusieurs fois ?",
      a: "Oui. Après le quotidien, ouvrez Illimité pour des manches sans fin avec filtres par genre, décennie et difficulté.",
    },
    {
      q: "Qu'est-ce que le mode drunk / high ?",
      a: "Le mode drunk (aussi high) distord les extraits : pitch, ralentissement, écho ou étouffement. Vous devinez des chansons saoules ou high dès la première écoute ; passez pour dégriser. Gratuit sur /drunk.",
    },
    {
      q: "Faut-il un compte ?",
      a: "Non. Chaque mode fonctionne dès le chargement de la page. Les séries restent dans ce navigateur.",
    },
    {
      q: "Est-ce comme Songless ?",
      a: "Oui. Même format de blind test musique avec défi quotidien partagé, mode illimité et échelle d'extrait de 1 à 16 secondes.",
    },
  ],
};

const DE: LocaleTranslation = {
  meta: {
    title: "Musikquiz — Lieder erraten in 1 Sekunde",
    description:
      "Cluetune ist ein kostenloses Musikquiz online. Song erraten ab 1 Sekunde — tägliches Rätsel und unbegrenzter Modus ohne Konto. Musik Intro Quiz für alle.",
    keywords:
      "musik quiz, musikquiz, lieder erraten, song erraten, musik intro quiz, musik erraten spiel, heardle deutsch, songless, musik raten online, drunk mode, high mode",
    h1: "Cluetune — Song erraten ab 1 Sekunde",
  },
  hero: {
    badge: "Täglich · gleicher Clip für alle",
    donePrompt: "Fertig für heute?",
    unlimitedLink: "Unbegrenzt",
    doneSuffix: "hat kein Zeitlimit.",
  },
  modes: {
    eyebrow: "Weitere Spielmodi",
    heading: "Vier weitere Modi, ein Katalog.",
    items: [
      {
        href: "/unlimited",
        name: "Unbegrenzt",
        meta: "Kein Limit",
        blurb: "Weiterspielen. Serie, Genauigkeit und Filter nach Genre, Jahrzehnt und Schwierigkeit.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Errate betrunkene oder high Songs beim chaotischen ersten Hören. Skippen und der Mix nüchtert sich.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Songtext",
        meta: "Lesen",
        blurb: "Ein paar Zeilen des Songs. Errate den Titel. Überspringen für mehr Text.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Genre-Challenge",
        meta: "5 Runden",
        blurb: "Wähle ein Paket — K-Pop, Afrobeats, Drill — und spiele fünf Runden hintereinander.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Warum dieses",
    heading: "Für den Teil, den andere vernachlässigen.",
    items: [
      {
        title: "Eine Ergebniskarte, kein Screenshot.",
        body: "Nach einer Runde ein 9:16-Bild mit Wellenform, Ratemuster und Zeit. Direkt für Story oder TikTok.",
      },
      {
        title: "Challenge-Links ohne Konto.",
        body: "Schick einem Freund den exakten Clip. Er öffnet den Link, spielt und vergleicht die Punktzahl. Keine Anmeldung.",
      },
      {
        title: "Die Schallplatte ist die Oberfläche.",
        body: "Kein Fortschrittsbalken. Eine Vinylscheibe, die mit dem Clip dreht, und ein Nadel-Sprung bei jedem Fehler.",
      },
      {
        title: "Keine Wartezeit nach dem Täglichen.",
        body: "Das Tagesrätsel ist ein Clip. Unbegrenzt ist direkt darunter — spiele mit Filtern so lange du willst.",
      },
    ],
  },
  how: {
    eyebrow: "So funktioniert eine Runde",
    heading: "Sechs Stufen, der Clip wächst bei jedem Fehler.",
    body: "Die Leiter ist am Anfang absichtlich steil. Eine Sekunde ist kaum ein Snare-Hit — genau darum geht es. Verfehle und die nächste Stufe gibt genug Audio für den Refrain.",
    rulesLink: "Regeln lesen",
    playLink: "Unbegrenzt spielen",
  },
  about: {
    eyebrow: "Über das Spiel",
    heading: "Was ist Cluetune?",
    subheadings: [
      "Cluetune vs. andere Musikquiz-Spiele",
      "So errätst du einen Song in 1 Sekunde",
      "Unbegrenzter Modus und weitere Modi",
    ],
    paragraphs: [
      "Cluetune ist ein kostenloses Spiel zum Lieder erraten im Browser. Jede Runde startet mit einer Sekunde eines Tracks und sechs Versuchen. Bei Fehler oder Überspringen wächst der Clip von einer auf sechzehn Sekunden. Kein Konto, keine App.",
      "Genau das suchen Fans von Musikquiz, Musik Intro Quiz und Songless — ein tägliches Rätsel für alle, dann unbegrenzte Runden.",
      "Das Format Song erraten nach einem kurzen Intro wurde durch Heardle und Songless bekannt. Cluetune setzt darauf mit Vinyl-Oberfläche und teilbaren Ergebniskarten auf.",
      "Echte Titel sind chaotisch — Remaster, Features, Interpunktion. Cluetune akzeptiert nur den Titel, Künstler und Titel in beliebiger Reihenfolge und vertretbare Tippfehler.",
      "Das Tagesrätsel ist für alle gleich und setzt sich um Mitternacht in deiner Zeitzone zurück. Überspringen kauft die nächste Stufe. Nach sechs Fehlern wird der Track mit Links zu Spotify, Apple Music und YouTube enthüllt.",
      "Clips streamen von den Vorschaudiensten der Rechteinhaber. Unbegrenzt zieht auch aktuelle Hits von iTunes und Deezer.",
      "Tägliches fertig? Unbegrenzt ist der Songless-unlimited-Modus: keine Wartezeit, Live-Serie, Filter nach Genre, Jahrzehnt und Schwierigkeit. Drunk-Modus (auch High — betrunkene oder high Songs aus verzerrten Clips), Songtext und Genre Gauntlet bieten mehr Spielarten.",
      "Öffne Cluetune, drücke Play, tippe einen Titel. Fordere einen Freund mit dem exakten Clip heraus. Cluetune ist ein Musikquiz zum Song erraten — zuerst Spiel, dann Ritual.",
    ],
    questionsHeading: "Fragen",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "Über uns" },
      { href: "/contact", label: "Kontakt" },
      { href: "/privacy", label: "Datenschutz" },
      { href: "/terms", label: "AGB" },
    ],
  },
  faqs: [
    {
      q: "Was ist ein Musikquiz?",
      a: "Ein Musikquiz spielt einen kurzen Clip und du musst den Song erraten. Cluetune startet bei einer Sekunde mit sechs Versuchen — wie Heardle und Songless.",
    },
    {
      q: "Kann ich Lieder erraten ohne Konto?",
      a: "Ja. Cluetune läuft komplett im Browser. Tägliches Rätsel oder unbegrenzte Runden auf Handy, Tablet und Desktop.",
    },
    {
      q: "Ist das ein Musik Intro Quiz?",
      a: "Ja. Du hörst zuerst nur die Intro-Sekunde und der Clip wird länger, bis du den Song erraten hast.",
    },
    {
      q: "Kann ich unbegrenzt spielen?",
      a: "Ja. Nach dem Täglichen öffne Unbegrenzt für endlose Runden mit Genre-, Jahrzehnt- und Schwierigkeitsfiltern.",
    },
    {
      q: "Was ist Drunk Mode / High Mode?",
      a: "Drunk Mode (auch High Mode) verzerrt Clips mit Pitch, Slowdown, Echo oder Dämpfung. Du errätst betrunkene oder high Songs beim ersten Hören; Skippen nüchtert den Mix. Kostenlos unter /drunk.",
    },
    {
      q: "Brauche ich ein Konto?",
      a: "Nein. Jeder Modus funktioniert sofort. Serien werden in diesem Browser gespeichert.",
    },
  ],
};

const PT: LocaleTranslation = {
  meta: {
    title: "Adivinhe a música — Jogo de adivinhar música",
    description:
      "Cluetune é um quiz de música gratuito online. Qual é a música? Ouça 1 segundo e adivinhe — desafio diário e modo ilimitado sem conta.",
    keywords:
      "qual é a música, adivinhe a música, adivinhar a música, quiz de música, jogo de adivinhar música, jogo musical online, heardle português, songless, drunk mode, high mode, modo bêbado",
    h1: "Cluetune — adivinhe a música em 1 segundo",
  },
  hero: {
    badge: "Diário · mesma música para todos",
    donePrompt: "Terminou por hoje?",
    unlimitedLink: "Ilimitado",
    doneSuffix: "não tem limite de tempo.",
  },
  modes: {
    eyebrow: "Outras formas de jogar",
    heading: "Mais quatro modos, o mesmo catálogo.",
    items: [
      {
        href: "/unlimited",
        name: "Ilimitado",
        meta: "Sem limite",
        blurb: "Continue jogando. Sequência ao vivo e filtros por género, década e dificuldade.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Adivinha músicas bêbadas ou high na primeira escuta destruída. Salta e a mistura fica sóbria.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Letra",
        meta: "Leia",
        blurb: "Algumas linhas da música. Adivinhe o título. Pule para ver mais letra.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Desafio de género",
        meta: "5 rodadas",
        blurb: "Escolha um pack — K-pop, Afrobeats, drill — e jogue cinco rodadas seguidas.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Por que este",
    heading: "Feito para o que outros tratam como detalhe.",
    items: [
      {
        title: "Um cartão de resultado, não uma captura.",
        body: "Ao terminar uma rodada, uma imagem 9:16 com forma de onda, padrão de tentativas e tempo. Pronta para Stories ou TikTok.",
      },
      {
        title: "Links de desafio sem conta.",
        body: "Envie a um amigo o clip exato que acabou de ouvir. Ele abre o link, joga e compara a pontuação. Sem cadastro.",
      },
      {
        title: "O disco é a interface.",
        body: "Sem barra de progresso. Um vinil que gira com o clip e um salto de agulha a cada erro.",
      },
      {
        title: "Sem espera após o diário.",
        body: "O desafio diário é um clip. Ilimitado está logo abaixo — jogue com filtros o quanto quiser.",
      },
    ],
  },
  how: {
    eyebrow: "Como funciona uma rodada",
    heading: "Seis degraus, o clip cresce a cada erro.",
    body: "A escada é íngreme no início de propósito. Um segundo é quase um bumbo — esse é o ponto. Erre e o próximo degrau revela áudio suficiente para ouvir o refrão.",
    rulesLink: "Ler as regras",
    playLink: "Jogar ilimitado",
  },
  about: {
    eyebrow: "Sobre o jogo",
    heading: "O que é o Cluetune?",
    subheadings: [
      "Cluetune vs. outros jogos de adivinhar música",
      "Como adivinhar uma música em 1 segundo",
      "Modo ilimitado e outros modos",
    ],
    paragraphs: [
      "Cluetune é um jogo gratuito de adivinhar a música no navegador. Cada rodada começa com um segundo de uma faixa e seis tentativas para nomeá-la. Erre ou pule e o clip cresce de um a dezesseis segundos. Sem conta, sem app.",
      "É o que quem procura um quiz de música online ou jogo de adivinhar música estilo Heardle e Songless quer — um desafio diário partilhado e rodadas ilimitadas.",
      "Jogos de adivinhar música popularizaram o formato ouça e nomeie. Cluetune está nessa família com interface de vinil e links de desafio sem registo.",
      "Títulos reais são caóticos — remasters, participações, pontuação. Cluetune aceita só o título, artista e título em qualquer ordem e erros razoáveis.",
      "O puzzle diário é o mesmo clip para todos e reinicia à meia-noite no seu fuso horário. Pular compra o próximo degrau. Seis erros e a faixa é revelada com links para Spotify, Apple Music e YouTube.",
      "Os clips vêm dos serviços de pré-visualização dos detentores de direitos. Ilimitado também inclui hits atuais do iTunes e Deezer.",
      "Terminou o diário? Ilimitado é o modo sem limite: sem espera, sequência ao vivo, filtros por género, década e dificuldade. Modo Drunk (também high — músicas bêbadas ou high com clipes distorcidos), Letra e Desafio de género acrescentam mais formas de jogar.",
      "Abra o Cluetune, pressione play, digite um título. Desafie um amigo com o link do clip exato. Cluetune é um jogo de adivinhar música primeiro, ritual diário depois.",
    ],
    questionsHeading: "Perguntas",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "Sobre nós" },
      { href: "/contact", label: "Contacto" },
      { href: "/privacy", label: "Política de privacidade" },
      { href: "/terms", label: "Termos e condições" },
    ],
  },
  faqs: [
    {
      q: "Qual é a música?",
      a: "No Cluetune você ouve um clip curto e deve adivinhar a música. Começa com um segundo e você tem seis tentativas — um quiz de música estilo Heardle.",
    },
    {
      q: "Como jogar o jogo de adivinhar música?",
      a: "Pressione Play, ouça o clip e digite o título. Sem conta. O desafio diário é um por dia; o modo Ilimitado permite jogar quantas rodadas quiser.",
    },
    {
      q: "É um quiz de música gratuito?",
      a: "Sim. Cluetune é um quiz de música gratuito no navegador. Diário, ilimitado, modo drunk / high, letra e desafio de género — tudo sem cadastro.",
    },
    {
      q: "Posso jogar várias vezes?",
      a: "Sim. Após o diário, abra Ilimitado para rodadas sem fim com filtros por género, década e dificuldade.",
    },
    {
      q: "O que é o modo drunk / high?",
      a: "O modo drunk (também high) distorce os clipes com pitch, lentidão, eco ou abafamento. Adivinhas músicas bêbadas ou high na primeira escuta; salta para ficar sóbrio. Grátis em /drunk.",
    },
    {
      q: "Preciso de uma conta?",
      a: "Não. Cada modo funciona ao carregar a página. As sequências ficam neste navegador.",
    },
  ],
};

const KO: LocaleTranslation = {
  meta: {
    title: "노래 맞히기 게임 — 1초 음악 퀴즈",
    description:
      "Cluetune은 무료 온라인 노래 맞히기 게임입니다. 1초 인트로로 곡을 맞혀 보세요. 매일 퍼즐과 무제한 모드, 계정 불필요.",
    keywords:
      "노래 맞히기, 음악 퀴즈, 곡 맞히기 게임, 인트로 퀴즈, 음악 맞히기, 노래 퀴즈 게임, heardle 한국어, songless, drunk mode, high mode",
    h1: "Cluetune — 1초 노래 맞히기",
  },
  hero: {
    badge: "데일리 · 모두 같은 곡",
    donePrompt: "오늘은 끝?",
    unlimitedLink: "무제한",
    doneSuffix: "은 언제든 플레이할 수 있습니다.",
  },
  modes: {
    eyebrow: "다른 플레이 방법",
    heading: "같은 카탈로그의 네 가지 모드.",
    items: [
      {
        href: "/unlimited",
        name: "무제한",
        meta: "제한 없음",
        blurb: "계속 플레이. 연승 기록과 장르·연대·난이도 필터.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "망가진 첫 재생으로 취한/하이 곡을 맞히세요. 스킵하면 믹스가 맑아집니다.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "가사 맞히기",
        meta: "읽기",
        blurb: "몇 줄의 가사로 곡명을 맞힙니다. 스킵으로 다음 가사를 볼 수 있습니다.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "장르 챌린지",
        meta: "5라운드",
        blurb: "K-pop, Afrobeats, 드릴 등 팩을 골라 5곡 연속 도전.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "이 게임을 선택하는 이유",
    heading: "다른 게임이 소홀히 하는 부분에 집중했습니다.",
    items: [
      {
        title: "스크린샷이 아닌 결과 카드.",
        body: "라운드 종료 후 파형, 시도 패턴, 소요 시간이 담긴 9:16 이미지. 스토리나 TikTok에 바로 공유.",
      },
      {
        title: "계정 없는 챌린지 링크.",
        body: "방금 들은 클립 링크를 친구에게 보내세요. 브라우저에서 열어 점수를 겨룹니다. 가입 불필요.",
      },
      {
        title: "레코드가 UI.",
        body: "진행 바 없음. 클립에 맞춰 도는 레코드와 실수할 때마다 바늘 스킵 효과.",
      },
      {
        title: "데일리 후에도 바로 플레이.",
        body: "데일리는 한 곡. 바로 아래 무제한 모드로 필터와 함께 원하는 만큼 계속.",
      },
    ],
  },
  how: {
    eyebrow: "라운드 진행 방식",
    heading: "6단계. 틀릴 때마다 클립이 길어집니다.",
    body: "처음은 의도적으로 짧습니다. 1초는 스네어 한 방 정도 — 그게 이 게임의 핵심입니다. 틀리면 다음 단계에서 후렴을 들을 수 있는 길이가 됩니다.",
    rulesLink: "규칙 읽기",
    playLink: "무제한 플레이",
  },
  about: {
    eyebrow: "게임 소개",
    heading: "Cluetune이란?",
    subheadings: [
      "다른 노래 맞히기 게임과의 차이",
      "1초로 곡 맞히는 방법",
      "무제한 모드와 기타 모드",
    ],
    paragraphs: [
      "Cluetune은 브라우저에서 즐기는 무료 노래 맞히기 게임입니다. 각 라운드는 1초 클립으로 시작하고 6번까지 곡명을 입력할 수 있습니다. 틀리거나 스킵하면 1초에서 16초까지 클립이 늘어납니다. 계정·앱·대기 시간 없음.",
      "Heardle나 Songless 스타일의 음악 퀴즈를 찾는 분들을 위한 게임입니다. 매일 같은 곡으로 친구와 비교하고, 끝나면 무제한 모드로 계속할 수 있습니다.",
      "짧은 인트로로 곡을 맞히는 형식을 이어갑니다. 레코드 UI, 공유 카드, 계정 없는 챌린지 링크가 특징입니다.",
      "실제 곡 제목은 복잡합니다 — 리마스터, 피처링, 기호 차이. Cluetune은 제목만, 순서 무관한 아티스트+제목, 가벼운 오타를 정답으로 처리합니다.",
      "데일리 퍼즐은 모두 같은 클립이며 현지 시간 자정에 리셋됩니다. 스킵은 다음 단계 오디오를 얻는 방법. 6번 틀리면 Spotify, Apple Music, YouTube 링크와 함께 공개됩니다.",
      "클립은 권리자의 미리듣기 서비스에서 스트리밍됩니다. 무제한 모드는 iTunes와 Deezer 차트의 최신 히트도 포함합니다.",
      "데일리가 끝났나요? 무제한 모드는 대기 없이 연승 기록과 장르·연대·난이도 필터를 제공합니다. Drunk 모드(high — 왜곡된 클립으로 취한/하이 곡 맞히기), 가사 맞히기, 장르 건틀릿도 있습니다.",
      "Cluetune을 열고 재생, 곡명 입력. 들은 클립 링크로 친구에게 도전하세요. 노래 맞히기 게임이자 일상의 음악 퀴즈입니다.",
    ],
    questionsHeading: "자주 묻는 질문",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "소개" },
      { href: "/contact", label: "문의" },
      { href: "/privacy", label: "개인정보 처리방침" },
      { href: "/terms", label: "이용약관" },
    ],
  },
  faqs: [
    {
      q: "노래 맞히기 게임이란?",
      a: "짧은 클립을 듣고 곡명을 맞히는 음악 퀴즈입니다. Cluetune은 1초에서 시작해 6번의 기회가 있으며, Heardle과 같은 형식입니다.",
    },
    {
      q: "무료 음악 퀴즈인가요?",
      a: "네. Cluetune은 브라우저에서 무료로 즐기는 노래 맞히기 게임이며 계정이 필요 없습니다.",
    },
    {
      q: "여러 번 플레이할 수 있나요?",
      a: "네. 데일리 후 무제한 모드에서 끝없이 플레이할 수 있습니다. 장르·연대·난이도 필터 지원.",
    },
    {
      q: "Songless와 비슷한가요?",
      a: "네. 공유 데일리 퍼즐, 무제한 모드, 1~16초 클립 사다리가 있는 같은 형식의 곡 맞히기 게임입니다.",
    },
    {
      q: "Drunk mode / High mode란?",
      a: "클립이 피치·슬로우·에코 등으로 왜곡되는 곡 맞히기 모드입니다. 첫 재생이 가장 심하고, 스킵하면 맑아집니다. /drunk에서 무료, 계정 불필요.",
    },
    {
      q: "계정이 필요한가요?",
      a: "아니요. 페이지를 열면 바로 플레이할 수 있습니다. 연승 기록은 이 브라우저에 저장됩니다.",
    },
  ],
};

const IT: LocaleTranslation = {
  meta: {
    title: "Indovina la canzone — Quiz musicale online",
    description:
      "Cluetune è un gioco gratuito per indovinare la canzone online. Ascolta 1 secondo e indovina il titolo — quiz musicale giornaliero e modalità illimitata senza account.",
    keywords:
      "indovina la canzone, gioco indovina canzone, quiz musicale, quiz canzoni, gioco musicale online, heardle italiano, songless, blind test musica, drunk mode, high mode",
    h1: "Cluetune — indovina la canzone in 1 secondo",
  },
  hero: {
    badge: "Giornaliero · stesso brano per tutti",
    donePrompt: "Finito per oggi?",
    unlimitedLink: "Illimitato",
    doneSuffix: "non ha limiti di tempo.",
  },
  modes: {
    eyebrow: "Altri modi di giocare",
    heading: "Altri quattro modi, lo stesso catalogo.",
    items: [
      {
        href: "/unlimited",
        name: "Illimitato",
        meta: "Senza limiti",
        blurb: "Continua a giocare. Serie live e filtri per genere, decennio e difficoltà.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Indovina canzoni ubriache o high al primo ascolto rovinato. Salta e il mix si schiarisce.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "Testo",
        meta: "Leggi",
        blurb: "Qualche riga della canzone. Indovina il titolo. Salta per vedere altro testo.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Sfida genere",
        meta: "5 round",
        blurb: "Scegli un pack — K-pop, Afrobeats, drill — e gioca cinque round di fila.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Perché questo",
    heading: "Fatto per ciò che gli altri trascurano.",
    items: [
      {
        title: "Una scheda risultato, non uno screenshot.",
        body: "A fine round, un'immagine 9:16 con forma d'onda, schema tentativi e tempo. Pronta per Stories o TikTok.",
      },
      {
        title: "Link sfida senza account.",
        body: "Invia a un amico il clip esatto che hai appena sentito. Apre il link, gioca e confronta il punteggio. Nessuna registrazione.",
      },
      {
        title: "Il disco è l'interfaccia.",
        body: "Nessuna barra di avanzamento. Un vinile che gira con il clip e un salto dell'ago a ogni errore.",
      },
      {
        title: "Nessuna attesa dopo il giornaliero.",
        body: "La sfida giornaliera è un clip. Illimitato è subito sotto — gioca con filtri quanto vuoi.",
      },
    ],
  },
  how: {
    eyebrow: "Come funziona un round",
    heading: "Sei gradini, il clip cresce a ogni errore.",
    body: "La scala è ripida all'inizio di proposito. Un secondo è appena un colpo di rullante — è tutto il punto. Sbaglia e il gradino successivo rivela abbastanza audio per il ritornello.",
    rulesLink: "Leggi le regole",
    playLink: "Gioca illimitato",
  },
  about: {
    eyebrow: "Informazioni sul gioco",
    heading: "Cos'è Cluetune?",
    subheadings: [
      "Cluetune vs. altri giochi per indovinare la canzone",
      "Come indovinare una canzone in 1 secondo",
      "Modalità illimitata e altri modi",
    ],
    paragraphs: [
      "Cluetune è un gioco gratuito per indovinare la canzone nel browser. Ogni round inizia con un secondo di un brano e sei tentativi per nominarlo. Errore o salto: il clip passa da uno a sedici secondi. Senza account, senza app.",
      "È ciò che cercano chi vuole un quiz musicale online stile Heardle o Songless — una sfida giornaliera condivisa e round illimitati.",
      "I giochi per indovinare la canzone hanno reso popolare il formato ascolta e nomina. Cluetune ne fa parte con interfaccia vinile e link sfida senza registrazione.",
      "I titoli reali sono caotici — remaster, featuring, punteggiatura. Cluetune accetta solo il titolo, artista e titolo in qualsiasi ordine e errori ragionevoli.",
      "Il puzzle giornaliero è lo stesso clip per tutti e si resetta a mezzanotte nel tuo fuso orario. Saltare compra il gradino successivo. Sei errori e il brano è rivelato con link a Spotify, Apple Music e YouTube.",
      "I clip provengono dai servizi di anteprima dei titolari dei diritti. Illimitato include anche hit attuali da iTunes e Deezer.",
      "Finito il giornaliero? Illimitato è la modalità senza limiti: nessuna attesa, serie live, filtri per genere, decennio e difficoltà. Modalità Drunk (anche high — canzoni ubriache o high da clip distorti), Testo e Genre Gauntlet aggiungono altri modi di giocare.",
      "Apri Cluetune, premi play, digita un titolo. Sfida un amico con il link del clip esatto. Cluetune è un quiz musicale prima, un rituale quotidiano dopo.",
    ],
    questionsHeading: "Domande",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "Chi siamo" },
      { href: "/contact", label: "Contatti" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Termini e condizioni" },
    ],
  },
  faqs: [
    {
      q: "Cos'è un quiz musicale?",
      a: "Un quiz musicale riproduce un breve clip e devi indovinare la canzone. Cluetune parte da un secondo con sei tentativi — come Heardle.",
    },
    {
      q: "È un gioco per indovinare la canzone online?",
      a: "Sì. Cluetune funziona interamente nel browser, senza download né account. Sfida giornaliera o round illimitati su qualsiasi dispositivo.",
    },
    {
      q: "Posso giocare più volte?",
      a: "Sì. Dopo il giornaliero, apri Illimitato per round senza fine con filtri per genere, decennio e difficoltà.",
    },
    {
      q: "Cos'è la modalità drunk / high?",
      a: "La modalità drunk (anche high) distorce i clip con pitch, rallentamento, eco o ovattamento. Indovini canzoni ubriache o high al primo ascolto; salta per smaltire. Gratis su /drunk.",
    },
    {
      q: "Serve un account?",
      a: "No. Ogni modalità funziona al caricamento della pagina. Le serie restano in questo browser.",
    },
    {
      q: "È come Songless?",
      a: "Sì. Stesso formato di blind test musica con sfida giornaliera condivisa, modalità illimitata e scala da 1 a 16 secondi.",
    },
  ],
};

const RU: LocaleTranslation = {
  meta: {
    title: "Угадай мелодию — Музыкальный квиз онлайн",
    description:
      "Cluetune — бесплатная музыкальная викторина. Угадай песню по 1 секунде — ежедневная головоломка и безлимитный режим без аккаунта.",
    keywords:
      "угадай мелодию, угадай песню, музыкальный квиз, музыкальная викторина, угадай песню по интро, игра угадай песню, heardle русский, songless, drunk mode, high mode",
    h1: "Cluetune — угадай песню за 1 секунду",
  },
  hero: {
    badge: "Ежедневно · одна песня для всех",
    donePrompt: "На сегодня всё?",
    unlimitedLink: "Безлимит",
    doneSuffix: "— без ограничений по времени.",
  },
  modes: {
    eyebrow: "Другие режимы",
    heading: "Ещё четыре режима, один каталог.",
    items: [
      {
        href: "/unlimited",
        name: "Безлимит",
        meta: "Без лимита",
        blurb: "Играйте дальше. Серия, точность и фильтры по жанру, десятилетию и сложности.",
        accent: "var(--cluetune-cyan)",
        featured: true,
      },
      {
        href: "/drunk",
        name: "Drunk",
        meta: "Drunk / high",
        blurb: "Угадай пьяные или high песни с хаотичного первого прослушивания. Пропуск проясняет микс.",
        accent: "var(--cluetune-pink)",
      },
      {
        href: "/lyrics",
        name: "По тексту",
        meta: "Читай",
        blurb: "Несколько строк песни. Угадайте название. Пропуск покажет следующие строки.",
        accent: "var(--cluetune-violet)",
      },
      {
        href: "/gauntlet",
        name: "Жанровый вызов",
        meta: "5 раундов",
        blurb: "Выберите пак — K-pop, Afrobeats, drill — и сыграйте пять раундов подряд.",
        accent: "var(--cluetune-amber)",
      },
    ],
  },
  why: {
    eyebrow: "Почему этот",
    heading: "Сделано для того, что другие упускают.",
    items: [
      {
        title: "Карточка результата, не скриншот.",
        body: "После раунда — изображение 9:16 с волной, схемой попыток и временем. Готово для Stories или TikTok.",
      },
      {
        title: "Ссылки-вызовы без аккаунта.",
        body: "Отправьте другу точный клип, который только что слышали. Он откроет ссылку, сыграет и сравнит счёт. Регистрация не нужна.",
      },
      {
        title: "Пластинка — это интерфейс.",
        body: "Без полосы прогресса. Винил крутится вместе с клипом, и скачок иглы при каждой ошибке.",
      },
      {
        title: "Без ожидания после ежедневного.",
        body: "Ежедневный вызов — один клип. Безлимит прямо под ним — играйте с фильтрами сколько угодно.",
      },
    ],
  },
  how: {
    eyebrow: "Как проходит раунд",
    heading: "Шесть ступеней, клип растёт с каждой ошибкой.",
    body: "Лестница намеренно крутая в начале. Одна секунда — едва удар малого барабана, в этом и суть. Ошибитесь — следующая ступень даст достаточно, чтобы услышать припев.",
    rulesLink: "Правила",
    playLink: "Играть безлимит",
  },
  about: {
    eyebrow: "Об игре",
    heading: "Что такое Cluetune?",
    subheadings: [
      "Cluetune и другие игры «угадай песню»",
      "Как угадать песню за 1 секунду",
      "Безлимитный режим и другие режимы",
    ],
    paragraphs: [
      "Cluetune — бесплатная игра «угадай песню» в браузере. Каждый раунд начинается с одной секунды трека и шести попыток назвать его. Ошибка или пропуск — клип растёт от одной до шестнадцати секунд. Без аккаунта и приложения.",
      "Именно это ищут любители музыкального квиза в духе Heardle и Songless — общая ежедневная головоломка и безлимитные раунды.",
      "Игры «угадай мелодию» популяризировали формат «услышал — назови». Cluetune в этой семье с интерфейсом виниловой пластинки и ссылками-вызовами без регистрации.",
      "Реальные названия хаотичны — ремастеры, фиты, пунктуация. Cluetune принимает только название, артиста и название в любом порядке и разумные опечатки.",
      "Ежедневная головоломка — один клип для всех, сброс в полночь по вашему часовому поясу. Пропуск покупает следующую ступень. Шесть ошибок — трек раскрывается со ссылками на Spotify, Apple Music и YouTube.",
      "Клипы стримятся с превью-сервисов правообладателей. Безлимит также включает актуальные хиты из чартов iTunes и Deezer.",
      "Ежедневное пройдено? Безлимит — режим без ожидания, живая серия, фильтры по жанру, десятилетию и сложности. Режим Drunk (также high — пьяные или high песни по искажённым клипам), Текст и Genre Gauntlet добавляют другие способы игры.",
      "Откройте Cluetune, нажмите play, введите название. Бросьте вызов другу ссылкой на точный клип. Cluetune — музыкальная викторина в первую очередь, ежедневный ритуал — во вторую.",
    ],
    questionsHeading: "Вопросы",
    siteNavLabel: "Cluetune",
    sitePages: [
      { href: "/about", label: "О нас" },
      { href: "/contact", label: "Контакты" },
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Условия использования" },
    ],
  },
  faqs: [
    {
      q: "Что такое музыкальный квиз?",
      a: "Музыкальный квиз воспроизводит короткий клип, и вы должны угадать песню. Cluetune начинается с одной секунды и даёт шесть попыток — как Heardle.",
    },
    {
      q: "Это игра «угадай песню» онлайн?",
      a: "Да. Cluetune работает полностью в браузере, без скачивания и аккаунта. Ежедневный вызов или безлимитные раунды на любом устройстве.",
    },
    {
      q: "Можно играть много раз?",
      a: "Да. После ежедневного откройте Безлимит для бесконечных раундов с фильтрами по жанру, десятилетию и сложности.",
    },
    {
      q: "Что такое drunk mode / high mode?",
      a: "Drunk mode (также high) искажает клипы: сдвиг тона, замедление, эхо или глушение. Угадываешь пьяные или high песни с первого прослушивания; пропуск отрезвляет. Бесплатно на /drunk.",
    },
    {
      q: "Нужен ли аккаунт?",
      a: "Нет. Каждый режим работает сразу при загрузке страницы. Серии сохраняются в этом браузере.",
    },
    {
      q: "Это как Songless?",
      a: "Да. Тот же формат музыкальной викторины с общим ежедневным вызовом, безлимитным режимом и лестницей клипа от 1 до 16 секунд.",
    },
  ],
};

const TRANSLATIONS: Record<LocaleCode, LocaleTranslation> = {
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

export function getTranslation(locale: LocaleCode): LocaleTranslation {
  return TRANSLATIONS[locale];
}

export function faqJsonLdForLocale(locale: LocaleCode) {
  const faqs = getTranslation(locale).faqs.slice(0, 8);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: `<p>${faq.a.length > 160 ? `${faq.a.slice(0, 157)}…` : faq.a}</p>`,
      },
    })),
  };
}
