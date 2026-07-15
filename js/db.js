/* ============================================================
   db.js — MOTOR DE GLIFOS
   ------------------------------------------------------------
   - Carga las fuentes de STYLES con opentype.js.
   - Convierte cada letra en un path SVG vectorial (sirve tanto
     para la ruleta como para el editor y la exportación).
   - Unifica estilos de fuente, letras reales y logos PNG bajo el
     concepto de "modelo".
   ============================================================ */

const LOGO_IMAGES = [
  "a's.png",
  "angles.png",
  "atlanta.png",
  "avengers.png",
  "barbie.png",
  "beats.png",
  "bic.png",
  "bitcoin.png",
  "bluethooth.png",
  "bridgeston.png",
  "c equipo.png",
  "c ns.png",
  "canon.png",
  "Capa 7.png",
  "carrefour.png",
  "cavaliers.png",
  "coke.png",
  "diesel.png",
  "disney.png",
  "duke.png",
  "elcorteingles.png",
  "espn.png",
  "everyone.png",
  "explorer_.png",
  "f de nfl.png",
  "facebook.png",
  "fila.png",
  "ford.png",
  "fortnite.png",
  "g dodgers.png",
  "g sega.png",
  "gamecube.png",
  "gaotrade.png",
  "google.png",
  "h underarmour.png",
  "harry potter.png",
  "hawaii.png",
  "history channel.png",
  "hyundai.png",
  "i pixar.png",
  "ibm.png",
  "increibles.png",
  "j utah.png",
  "jazz.png",
  "juventus.png",
  "k de calving klein.png",
  "kellogs.png",
  "kfc.png",
  "lafayette.png",
  "lakers.png",
  "lego.png",
  "lexus.png",
  "m walls.png",
  "mcdonalds.png",
  "michigan.png",
  "monster.png",
  "monstruos sa.png",
  "moviestar.png",
  "mtv.png",
  "nasa.png",
  "nespresso.png",
  "netflix.png",
  "new era.png",
  "nintendo.png",
  "ny.png",
  "o fiat.png",
  "o pepsi.png",
  "o vodafone.png",
  "oakley.png",
  "oreo.png",
  "pacers.png",
  "paypal.png",
  "pinterest.png",
  "pittsburg pirates.png",
  "plñaystation.png",
  "queens basketball.png",
  "quicktime.png",
  "r toys.png",
  "reeses.png",
  "rockets.png",
  "rockstrar.png",
  "rolls royce.png",
  "seattle.png",
  "shreck.png",
  "sony.png",
  "sox.png",
  "starter.png",
  "supersonics.png",
  "supperman.png",
  "suzuki.png",
  "t tortugas ninja.png",
  "takis.png",
  "tesla.png",
  "thrasher.png",
  "toyota.png",
  "u miami.png",
  "u spurs.png",
  "u torrent.png",
  "ucf.png",
  "unilever.png",
  "v louis vuitton.png",
  "vendeta.png",
  "vikings.png",
  "visa.png",
  "vlone.png",
  "w kappa.png",
  "warner.png",
  "wilson.png",
  "wordpress.png",
  "wwe.png",
  "x games.png",
  "x jetix.png",
  "x off white.png",
  "xbox.png",
  "xd.png",
  "y subway.png",
  "yahoo.png",
  "yankees.png",
  "zara.png",
  "zazzle.png"
];

const DB = (() => {
  const FS = 200;           // tamaño base de generación de glifos
  const TARGET_CAP = 150;   // altura de mayúscula objetivo (normaliza tamaños entre fuentes)

  const fonts = {};         // styleId -> opentype.Font | null (null = falló)
  const glyphCache = {};    // "styleId|char" -> datos de glifo
  let gradCounter = 0;

  /* ---- Carga de fuentes (con timeout para no colgarse nunca) ---- */
  const LOAD_TIMEOUT = 12000;

  function loadOne(style) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (font) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (font) {
          fonts[style.id] = font;
          const cap = capHeightPx(font);
          style._norm = cap ? TARGET_CAP / cap : 1;
        } else {
          fonts[style.id] = null;
        }
        resolve();
      };
      const timer = setTimeout(() => {
        console.warn("Timeout cargando fuente:", style.id);
        finish(null);
      }, LOAD_TIMEOUT);

      if (typeof opentype === "undefined") {
        console.error("opentype.js no está disponible (¿sin conexión?).");
        return finish(null);
      }
      try {
        opentype.load(style.url, (err, font) => {
          if (err || !font) {
            console.warn("No se pudo cargar la fuente:", style.id, err && err.message);
            finish(null);
          } else {
            finish(font);
          }
        });
      } catch (e) {
        console.warn("Error cargando fuente:", style.id, e && e.message);
        finish(null);
      }
    });
  }

  function capHeightPx(font) {
    try {
      const upm = font.unitsPerEm || 1000;
      const os2 = font.tables && font.tables.os2;
      let cap = os2 && os2.sCapHeight ? os2.sCapHeight : 0;
      if (!cap) cap = font.tables && font.tables.os2 ? font.tables.os2.sxHeight : 0;
      if (!cap) cap = (font.ascender || upm * 0.7);
      return (cap / upm) * FS;
    } catch (e) {
      return FS * 0.7;
    }
  }

  async function loadAll(onProgress) {
    const total = STYLES.length;
    let done = 0;
    await Promise.all(
      STYLES.map((s) =>
        loadOne(s).then(() => {
          done++;
          if (onProgress) onProgress(done, total);
        })
      )
    );
  }

  function fontHasChar(style, char) {
    const f = fonts[style.id];
    if (!f) return false;
    try {
      return f.charToGlyph(char).index > 0;
    } catch (e) {
      return false;
    }
  }

  /* ---- Modelos disponibles para una letra ---- */
  function imageModelsForChar(char) {
    const normalized = String(char).toLowerCase();
    return LOGO_IMAGES.filter((file) => {
      const match = file.match(/[A-Za-z]/);
      return match && match[0].toLowerCase() === normalized;
    }).map((file) => ({
      id: "image:" + file,
      type: "image",
      src: "letters/" + file,
      label: file.replace(/\.png$/i, "").replace(/[_]/g, " "),
    }));
  }

  function modelsForChar(char) {
    return imageModelsForChar(char);
  }

  function getModel(modelId, char) {
    const [type, key] = modelId.split(":");
    if (type === "font") {
      const s = STYLES.find((x) => x.id === key);
      return s ? { id: modelId, type: "font", style: s } : null;
    }
    if (type === "image") {
      const file = LOGO_IMAGES.find((f) => f === key);
      return file
        ? { id: modelId, type: "image", src: "letters/" + file, label: file.replace(/\.png$/i, "").replace(/[_]/g, " ") }
        : null;
    }
    const list = (typeof CUSTOM_LETTERS !== "undefined" ? CUSTOM_LETTERS : []).filter(
      (c) => String(c.char).toLowerCase() === String(char).toLowerCase()
    );
    const c = list.find((x, i) => (x.styleId || i) == key);
    return c ? { id: modelId, type: "custom", custom: c } : null;
  }

  /* ---- Datos de glifo unificados ----
     Devuelve: { kind, d|inner, x1,y1,x2,y2, advance, norm, defaultFill, label } */
  function glyphData(model, char) {
    if (model.type === "custom") {
      const c = model.custom;
      const vb = (c.viewBox || "0 0 100 100").trim().split(/\s+/).map(Number);
      const [x, y, w, h] = vb.length === 4 ? vb : [0, 0, 100, 100];
      return {
        kind: "markup",
        inner: c.inner || "",
        x1: x, y1: y, x2: x + w, y2: y + h,
        advance: w,
        norm: TARGET_CAP / h, // normaliza por su propia altura
        defaultFill: null,
        label: c.styleLabel || c.styleId || "Real",
      };
    }
    if (model.type === "image") {
      const size = 180;
      return {
        kind: "image",
        src: model.src,
        x1: 0, y1: 0, x2: size, y2: size,
        advance: size,
        norm: 1,
        defaultFill: null,
        label: model.label || "Logo",
      };
    }
    // fuente
    const s = model.style;
    const cacheKey = s.id + "|" + char;
    if (glyphCache[cacheKey]) return glyphCache[cacheKey];
    const font = fonts[s.id];
    const path = font.getPath(char, 0, 0, FS); // baseline en y=0
    const bb = path.getBoundingBox();
    const data = {
      kind: "path",
      d: path.toPathData(2),
      x1: bb.x1, y1: bb.y1, x2: bb.x2, y2: bb.y2,
      advance: font.getAdvanceWidth(char, FS),
      norm: s._norm || 1,
      defaultFill: s.fill,
      label: s.label,
      vibe: s.vibe,
    };
    glyphCache[cacheKey] = data;
    return data;
  }

  /* ---- Resolución de relleno (color o degradado) ---- */
  function resolveFill(fill, overrideColor) {
    if (overrideColor) return { paint: overrideColor, defs: "" };
    if (!fill) return { paint: "#ffffff", defs: "" };
    if (typeof fill === "string") return { paint: fill, defs: "" };
    // degradado
    const id = "grad-" + (gradCounter++);
    const angle = (fill.angle || 0) * (Math.PI / 180);
    const x2 = Math.round(Math.cos(angle) * 100);
    const y2 = Math.round(Math.sin(angle) * 100);
    const stops = fill.stops
      .map((c, i) => {
        const off = (i / (fill.stops.length - 1)) * 100;
        return `<stop offset="${off}%" stop-color="${c}"/>`;
      })
      .join("");
    const defs = `<linearGradient id="${id}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
    return { paint: `url(#${id})`, defs };
  }

  /* ---- SVG de una sola letra (para la ruleta / previsualización) ---- */
  function letterSVG(model, char, overrideColor) {
    const g = glyphData(model, char);
    const pad = (g.x2 - g.x1 || 100) * 0.12 + 12;
    const vbX = g.x1 - pad, vbY = g.y1 - pad;
    const vbW = (g.x2 - g.x1) + pad * 2, vbH = (g.y2 - g.y1) + pad * 2;
    const inner =
      g.kind === "markup"
        ? g.inner
        : g.kind === "image"
        ? `<image href="${g.src}" x="${g.x1}" y="${g.y1}" width="${g.x2 - g.x1}" height="${g.y2 - g.y1}" preserveAspectRatio="xMidYMid meet"/>`
        : (() => {
            const f = resolveFill(g.defaultFill, overrideColor);
            return `<defs>${f.defs}</defs><path d="${g.d}" fill="${f.paint}"/>`;
          })();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  }

  function loadedCount() {
    return STYLES.filter((s) => fonts[s.id]).length;
  }

  return {
    loadAll,
    loadedCount,
    modelsForChar,
    getModel,
    glyphData,
    resolveFill,
    letterSVG,
    fontHasChar,
  };
})();
