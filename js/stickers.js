/* ============================================================
   stickers.js — PEGATINAS QUE SE GENERAN CON EL RATÓN
   ------------------------------------------------------------
   Al mover el ratón (o el dedo) van cayendo pegatinas con los
   PNG de los logos. Aparecen, se asientan y se desvanecen.
   Puramente decorativo: viven detrás de la interfaz y no
   interceptan clics (pointer-events: none en la capa).
   ============================================================ */
(() => {
  "use strict";

  const layer = document.getElementById("sticker-layer");
  if (!layer) return;

  // Solo en la pantalla de inicio (paso 1).
  const home = document.getElementById("screen-1");
  const onHome = () => home && home.classList.contains("is-active");

  // Respeta a quien prefiera menos movimiento.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Lista de logos disponibles en /letters (los mismos PNG del proyecto). */
  const LOGOS = [
    "a's.png", "angles.png", "atlanta.png", "avengers.png", "barbie.png",
    "beats.png", "bic.png", "bitcoin.png", "bluethooth.png", "bridgeston.png",
    "canon.png", "carrefour.png", "cavaliers.png", "coke.png", "diesel.png",
    "disney.png", "duke.png", "elcorteingles.png", "espn.png", "facebook.png",
    "fila.png", "ford.png", "fortnite.png", "google.png", "gamecube.png",
    "harry potter.png", "hawaii.png", "hyundai.png", "ibm.png", "juventus.png",
    "kellogs.png", "kfc.png", "lakers.png", "lego.png", "lexus.png",
    "mcdonalds.png", "michigan.png", "monster.png", "mtv.png", "nasa.png",
    "nespresso.png", "netflix.png", "nintendo.png", "ny.png", "oakley.png",
    "oreo.png", "paypal.png", "pinterest.png", "quicktime.png", "reeses.png",
    "rockets.png", "rolls royce.png", "sony.png", "starter.png", "suzuki.png",
    "takis.png", "tesla.png", "thrasher.png", "toyota.png", "unilever.png",
    "visa.png", "vlone.png", "warner.png", "wilson.png", "wordpress.png",
    "wwe.png", "xbox.png", "yahoo.png", "yankees.png", "zara.png", "zazzle.png",
  ];

  // Precarga ligera para que la primera pegatina no parpadee.
  LOGOS.forEach((f) => { const im = new Image(); im.src = src(f); });

  function src(file) {
    return "letters/" + encodeURIComponent(file);
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  /* Control de ritmo: solo soltamos una pegatina cada cierta
     distancia recorrida por el puntero, y con un límite de vida. */
  let last = null;              // última posición donde soltamos
  const MIN_DIST = 90;          // px entre pegatinas
  const MAX_LIVE = 26;          // tope de pegatinas simultáneas
  let live = 0;
  let cooling = false;

  function drop(x, y) {
    if (live >= MAX_LIVE) return;

    const el = document.createElement("img");
    el.className = "sticker";
    el.src = src(pick(LOGOS));
    el.alt = "";
    el.decoding = "async";

    const size = rnd(56, 130) / 3;
    const rot = rnd(-22, 22);
    const life = rnd(1100, 1900);

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.setProperty("--s", size.toFixed(0) + "px");
    el.style.setProperty("--r", rot.toFixed(1) + "deg");
    el.style.setProperty("--life", life.toFixed(0) + "ms");

    live++;
    layer.appendChild(el);
    el.addEventListener("animationend", () => {
      el.remove();
      live--;
    }, { once: true });
  }

  function onMove(x, y) {
    if (reduce || !onHome()) return;
    if (!last) { last = { x, y }; drop(x, y); return; }
    const dx = x - last.x, dy = y - last.y;
    if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
    last = { x, y };
    // pequeña histéresis para no saturar en movimientos rápidos
    if (cooling) return;
    cooling = true;
    requestAnimationFrame(() => (cooling = false));
    drop(x, y);
  }

  window.addEventListener("pointermove", (e) => {
    // el ratón y el lápiz dejan rastro; el dedo también al arrastrar
    onMove(e.clientX, e.clientY);
  }, { passive: true });

  // Un toque suelto también planta una pegatina.
  window.addEventListener("pointerdown", (e) => {
    if (!reduce && onHome()) drop(e.clientX, e.clientY);
  }, { passive: true });
})();
