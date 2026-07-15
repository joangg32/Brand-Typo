/* ============================================================
   styles.js — BASE DE DATOS DE ESTILOS DE LETRA
   ------------------------------------------------------------
   Cada "estilo" es un modelo de letra que aparecerá en la ruleta.
   Se generan como VECTORES REALES (paths SVG) a partir de fuentes
   libres (licencia OFL) elegidas porque EVOCAN logos famosos.

   Las fuentes se cargan desde el repo google/fonts vía jsDelivr
   (necesita conexión a internet la primera vez).

   ¿Quieres letras de logos REALES exactas? No toques esto:
   añádelas en js/custom-letters.js (ahí lo explico).
   ============================================================ */

const FONT_BASE = "https://cdn.jsdelivr.net/gh/google/fonts@main/";

/* fill puede ser:
   - un color:  "#E61A27"
   - un degradado: { stops: ["#a", "#b", ...], angle: 45 }   */
const STYLES = [
  {
    id: "coca",
    label: "Rojo Cursiva",
    vibe: "estilo Coca-Cola",
    url: FONT_BASE + "ofl/lobster/Lobster-Regular.ttf",
    fill: "#E61A27",
  },
  {
    id: "insta",
    label: "Script Degradado",
    vibe: "estilo Instagram",
    url: FONT_BASE + "ofl/pacifico/Pacifico-Regular.ttf",
    fill: { stops: ["#F58529", "#DD2A7B", "#8134AF"], angle: 45 },
  },
  {
    id: "netflix",
    label: "Rojo Condensado",
    vibe: "estilo Netflix",
    url: FONT_BASE + "ofl/anton/Anton-Regular.ttf",
    fill: "#E50914",
  },
  {
    id: "spotify",
    label: "Verde Geométrico",
    vibe: "estilo Spotify",
    url: FONT_BASE + "ofl/righteous/Righteous-Regular.ttf",
    fill: "#1DB954",
  },
  {
    id: "disney",
    label: "Azul Redondeado",
    vibe: "estilo Disney",
    url: FONT_BASE + "ofl/titanone/TitanOne-Regular.ttf",
    fill: "#2A6FD6",
  },
  {
    id: "comic",
    label: "Cómic Pop",
    vibe: "estilo cómic",
    url: FONT_BASE + "ofl/bangers/Bangers-Regular.ttf",
    fill: { stops: ["#FFD200", "#FF7A00"], angle: 90 },
  },
  {
    id: "urban",
    label: "Bloque Urbano",
    vibe: "estilo callejero",
    url: FONT_BASE + "ofl/bungee/Bungee-Regular.ttf",
    fill: "#00B4D8",
  },
  {
    id: "neon",
    label: "Neón Línea",
    vibe: "estilo neón",
    url: FONT_BASE + "ofl/monoton/Monoton-Regular.ttf",
    fill: { stops: ["#FF00CC", "#3333FF"], angle: 60 },
  },
  {
    id: "marker",
    label: "Rotulador",
    vibe: "manuscrito",
    url: FONT_BASE + "apache/permanentmarker/PermanentMarker-Regular.ttf",
    fill: "#111418",
  },
  {
    id: "retro8",
    label: "Pixel Retro",
    vibe: "estilo videojuego",
    url: FONT_BASE + "ofl/pressstart2p/PressStart2P-Regular.ttf",
    fill: "#39FF14",
  },
  {
    id: "slab",
    label: "Slab Macizo",
    vibe: "estilo robusto",
    url: FONT_BASE + "ofl/alfaslabone/AlfaSlabOne-Regular.ttf",
    fill: "#D62828",
  },
  {
    id: "tech",
    label: "Tecno Futurista",
    vibe: "estilo tech",
    url: FONT_BASE + "ofl/audiowide/Audiowide-Regular.ttf",
    fill: { stops: ["#00F5D4", "#0077B6"], angle: 45 },
  },
  {
    id: "army",
    label: "Estarcido Militar",
    vibe: "estilo militar",
    url: FONT_BASE + "ofl/blackopsone/BlackOpsOne-Regular.ttf",
    fill: "#5A6B2F",
  },
  {
    id: "horror",
    label: "Terror Goteo",
    vibe: "estilo terror",
    url: FONT_BASE + "ofl/creepster/Creepster-Regular.ttf",
    fill: "#7B2CBF",
  },
  {
    id: "bubble",
    label: "Burbuja",
    vibe: "estilo pop",
    url: FONT_BASE + "ofl/bowlbyonesc/BowlbyOneSC-Regular.ttf",
    fill: "#FF4D8D",
  },
  {
    id: "mono",
    label: "Mono Grueso",
    vibe: "estilo industrial",
    url: FONT_BASE + "ofl/rubikmonoone/RubikMonoOne-Regular.ttf",
    fill: "#222831",
  },
];
