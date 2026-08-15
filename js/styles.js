/* ============================================================
   styles.js — LETTER STYLE DATABASE
   ------------------------------------------------------------
   Each "style" is a letter model that will appear in the reel.
   They are generated as REAL VECTORS (SVG paths) from free
   fonts (OFL license) chosen because they EVOKE famous logos.

   Fonts are loaded from the google/fonts repo via jsDelivr
   (needs an internet connection the first time).

   Want EXACT real logo letters? Don't touch this:
   add them in js/custom-letters.js (explained there).
   ============================================================ */

const FONT_BASE = "https://cdn.jsdelivr.net/gh/google/fonts@main/";

/* fill can be:
   - a color: "#E61A27"
   - a gradient: { stops: ["#a", "#b", ...], angle: 45 }   */
const STYLES = [
  {
    id: "coca",
    label: "Red Cursive",
    vibe: "Coca-Cola style",
    url: FONT_BASE + "ofl/lobster/Lobster-Regular.ttf",
    fill: "#E61A27",
  },
  {
    id: "insta",
    label: "Gradient Script",
    vibe: "Instagram style",
    url: FONT_BASE + "ofl/pacifico/Pacifico-Regular.ttf",
    fill: { stops: ["#F58529", "#DD2A7B", "#8134AF"], angle: 45 },
  },
  {
    id: "netflix",
    label: "Red Condensed",
    vibe: "Netflix style",
    url: FONT_BASE + "ofl/anton/Anton-Regular.ttf",
    fill: "#E50914",
  },
  {
    id: "spotify",
    label: "Geometric Green",
    vibe: "Spotify style",
    url: FONT_BASE + "ofl/righteous/Righteous-Regular.ttf",
    fill: "#1DB954",
  },
  {
    id: "disney",
    label: "Rounded Blue",
    vibe: "Disney style",
    url: FONT_BASE + "ofl/titanone/TitanOne-Regular.ttf",
    fill: "#2A6FD6",
  },
  {
    id: "comic",
    label: "Pop Comic",
    vibe: "comic style",
    url: FONT_BASE + "ofl/bangers/Bangers-Regular.ttf",
    fill: { stops: ["#FFD200", "#FF7A00"], angle: 90 },
  },
  {
    id: "urban",
    label: "Urban Block",
    vibe: "street style",
    url: FONT_BASE + "ofl/bungee/Bungee-Regular.ttf",
    fill: "#00B4D8",
  },
  {
    id: "neon",
    label: "Neon Line",
    vibe: "neon style",
    url: FONT_BASE + "ofl/monoton/Monoton-Regular.ttf",
    fill: { stops: ["#FF00CC", "#3333FF"], angle: 60 },
  },
  {
    id: "marker",
    label: "Marker",
    vibe: "handwritten",
    url: FONT_BASE + "apache/permanentmarker/PermanentMarker-Regular.ttf",
    fill: "#111418",
  },
  {
    id: "retro8",
    label: "Retro Pixel",
    vibe: "video game style",
    url: FONT_BASE + "ofl/pressstart2p/PressStart2P-Regular.ttf",
    fill: "#39FF14",
  },
  {
    id: "slab",
    label: "Solid Slab",
    vibe: "bold style",
    url: FONT_BASE + "ofl/alfaslabone/AlfaSlabOne-Regular.ttf",
    fill: "#D62828",
  },
  {
    id: "tech",
    label: "Futuristic Tech",
    vibe: "tech style",
    url: FONT_BASE + "ofl/audiowide/Audiowide-Regular.ttf",
    fill: { stops: ["#00F5D4", "#0077B6"], angle: 45 },
  },
  {
    id: "army",
    label: "Military Stencil",
    vibe: "military style",
    url: FONT_BASE + "ofl/blackopsone/BlackOpsOne-Regular.ttf",
    fill: "#5A6B2F",
  },
  {
    id: "horror",
    label: "Horror Drip",
    vibe: "horror style",
    url: FONT_BASE + "ofl/creepster/Creepster-Regular.ttf",
    fill: "#7B2CBF",
  },
  {
    id: "bubble",
    label: "Bubble",
    vibe: "pop style",
    url: FONT_BASE + "ofl/bowlbyonesc/BowlbyOneSC-Regular.ttf",
    fill: "#FF4D8D",
  },
  {
    id: "mono",
    label: "Thick Mono",
    vibe: "industrial style",
    url: FONT_BASE + "ofl/rubikmonoone/RubikMonoOne-Regular.ttf",
    fill: "#222831",
  },
];
