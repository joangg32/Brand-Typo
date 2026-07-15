/* ============================================================
   app.js — LÓGICA PRINCIPAL (máquina de pasos 1→5)
   ============================================================ */
(() => {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Estado global ---------- */
  const state = {
    name: "",
    fontsLoaded: false,
    /* una entrada por carácter del nombre:
       { char, isSpace, models[], modelId, scale, rot, offX, offY, mirror, z, spacing, color } */
    letters: [],
    bgColor: "#ffffff",
    showBg: false,
    selected: -1, // índice de letra seleccionada en el editor
  };

  /* ============================================================
     NAVEGACIÓN ENTRE PASOS
     ============================================================ */
  function goto(step) {
    $$(".screen").forEach((s) => s.classList.remove("is-active"));
    $("#screen-" + step).classList.add("is-active");
    $$("#steps .step").forEach((el) =>
      el.classList.toggle("is-active", Number(el.dataset.step) === step)
    );
    if (step === 2) buildReels();
    if (step === 3) {
      // al entrar al editor, seleccionar la primera letra por defecto
      state.selected = state.letters.findIndex((l) => !l.isSpace);
      renderEditor();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-goto]");
    if (t) goto(Number(t.dataset.goto));
  });

  /* ============================================================
     OVERLAY DE CARGA
     ============================================================ */
  function showLoader(text) {
    $("#loader-text").textContent = text || "Cargando…";
    $("#loader").hidden = false;
  }
  function hideLoader() {
    $("#loader").hidden = true;
  }

  /* ============================================================
     PASO 1 — NOMBRE
     ============================================================ */
  const ALLOWED = /[A-Za-zÀ-ÿ0-9 ]/;

  $("#name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = $("#name-input").value;
    const clean = Array.from(raw).filter((c) => ALLOWED.test(c)).join("").replace(/\s+/g, " ").trim();
    if (!clean) {
      flashHint("Escribe al menos una letra.");
      return;
    }
    state.name = clean.slice(0, 14);

    if (!state.fontsLoaded) {
      state.fontsLoaded = true;
    }

    buildLetters();
    if (!state.letters.some((l) => !l.isSpace && l.models.length)) {
      flashHint("No se encontraron logos para esas letras. Prueba con letras A–Z.");
      return;
    }
    goto(2);
  });

  function flashHint(msg) {
    const h = $("#name-hint");
    h.textContent = msg;
    h.classList.add("flash");
    setTimeout(() => h.classList.remove("flash"), 1200);
  }

  function buildLetters() {
    state.letters = Array.from(state.name).map((ch) => {
      const isSpace = ch === " ";
      const models = isSpace ? [] : DB.modelsForChar(ch);
      return {
        char: ch,
        isSpace,
        models,
        modelId: models.length ? models[0].id : null,
        scale: 1,
        rot: 0,
        offX: 0,
        offY: 0,
        mirror: false,
        mirrorV: false,
        z: 0,
        spacing: 0,
        color: null,
      };
    });
  }

  /* ============================================================
     PASO 2 — RULETAS (carruseles verticales tipo casino)
     ============================================================ */
  const ITEM_H = 130; // alto de cada celda de la ruleta (px)

  function buildReels() {
    const wrap = $("#reels");
    wrap.innerHTML = "";

    state.letters.forEach((letter, i) => {
      if (letter.isSpace) {
        const gap = document.createElement("div");
        gap.className = "reel-gap";
        gap.innerHTML = '<span>espacio</span>';
        wrap.appendChild(gap);
        return;
      }

      const col = document.createElement("div");
      col.className = "reel-col";

      const head = document.createElement("div");
      head.className = "reel-label";
      head.textContent = letter.char;
      col.appendChild(head);

      const machine = document.createElement("div");
      machine.className = "reel-machine";

      const scroll = document.createElement("div"); // contenedor que hace scroll
      scroll.className = "reel-scroll";

      const win = document.createElement("div"); // marco de selección central (fijo)
      win.className = "reel-window";

      const track = document.createElement("div");
      track.className = "reel-track";
      track.dataset.index = i;

      letter.models.forEach((model, mi) => {
        const cell = document.createElement("div");
        cell.className = "reel-item";
        cell.dataset.mi = mi;
        cell.innerHTML = DB.letterSVG(model, letter.char, null);
        cell.title = (model.type === "custom" ? "Real — " : "") + (modelLabel(model, letter.char));
        cell.addEventListener("click", () => spinTo(track, mi));
        track.appendChild(cell);
      });

      scroll.appendChild(track);
      machine.appendChild(win);
      machine.appendChild(scroll);

      // pie de foto editorial con el nombre del estilo elegido
      const caption = document.createElement("div");
      caption.className = "reel-caption";

      // controles apilados: ▲ / imagen / ▼ / SPIN
      const up = document.createElement("button");
      up.type = "button";
      up.className = "reel-btn up";
      up.textContent = "▲";
      up.setAttribute("aria-label", "Letra anterior");
      up.addEventListener("click", () => step(track, -1));

      const down = document.createElement("button");
      down.type = "button";
      down.className = "reel-btn down";
      down.textContent = "▼";
      down.setAttribute("aria-label", "Letra siguiente");
      down.addEventListener("click", () => step(track, 1));

      const spin = document.createElement("button");
      spin.type = "button";
      spin.className = "reel-btn spin";
      spin.textContent = "SPIN";
      spin.addEventListener("click", () => spinRandom(track));

      col.appendChild(up);       // flecha para subir
      col.appendChild(machine);  // imagen actual de la letra
      col.appendChild(down);     // flecha para bajar
      col.appendChild(spin);     // opción SPIN
      col.appendChild(caption);  // nombre del estilo
      wrap.appendChild(col);

      // selección inicial = modelo guardado
      const startMi = Math.max(0, letter.models.findIndex((m) => m.id === letter.modelId));
      scroll.addEventListener("scroll", () => onReelScroll(track));
      // colocar sin animación
      requestAnimationFrame(() => setReel(scroll, track, startMi, false));
    });
  }

  function modelLabel(model, char) {
    const g = DB.glyphData(model, char);
    return g.label || (model.type === "custom" ? "Real" : model.style.label);
  }

  function scrollerOf(track) {
    return track.parentElement; // .reel-scroll
  }

  function currentIndex(scroll) {
    return Math.round(scroll.scrollTop / ITEM_H);
  }

  function setReel(scroll, track, mi, smooth) {
    const max = track.children.length - 1;
    mi = Math.max(0, Math.min(max, mi));
    scroll.scrollTo({ top: mi * ITEM_H, behavior: smooth ? "smooth" : "auto" });
    markSelected(track, mi);
  }

  function step(track, dir) {
    const scroll = scrollerOf(track);
    setReel(scroll, track, currentIndex(scroll) + dir, true);
  }

  function spinTo(track, mi) {
    setReel(scrollerOf(track), track, mi, true);
  }

  function spinRandom(track) {
    const n = track.children.length;
    const target = Math.floor(Math.random() * n);
    animateSpin(scrollerOf(track), track, target);
  }

  // Giro con sensación de ruleta: acelera y frena hasta el destino
  function animateSpin(scroll, track, target) {
    const n = track.children.length;
    if (n <= 1) return setReel(scroll, track, 0, false);
    const extraLoops = 1 + Math.floor(Math.random() * 2);
    const startTop = scroll.scrollTop;
    const endTop = target * ITEM_H + extraLoops * n * ITEM_H;
    const dur = 750 + Math.random() * 450;
    const t0 = performance.now();
    scroll.classList.add("spinning");

    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      let top = startTop + (endTop - startTop) * eased;
      top = ((top % (n * ITEM_H)) + n * ITEM_H) % (n * ITEM_H); // envolver
      scroll.scrollTop = top;
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        scroll.classList.remove("spinning");
        setReel(scroll, track, target, false);
      }
    }
    requestAnimationFrame(frame);
  }

  let scrollTimers = new WeakMap();
  function onReelScroll(track) {
    const scroll = scrollerOf(track);
    clearTimeout(scrollTimers.get(track));
    scrollTimers.set(
      track,
      setTimeout(() => {
        markSelected(track, currentIndex(scroll));
      }, 90)
    );
    // resaltado en vivo
    markSelected(track, currentIndex(scroll));
  }

  function markSelected(track, mi) {
    const i = Number(track.dataset.index);
    const max = track.children.length - 1;
    mi = Math.max(0, Math.min(max, mi));
    Array.from(track.children).forEach((c, idx) =>
      c.classList.toggle("is-selected", idx === mi)
    );
    const model = state.letters[i].models[mi];
    if (model) {
      state.letters[i].modelId = model.id;
      const col = track.closest(".reel-col");
      const cap = col && col.querySelector(".reel-caption");
      if (cap) cap.textContent = modelLabel(model, state.letters[i].char);
    }
  }

  $("#spin-all").addEventListener("click", () => {
    $$(".reel-track").forEach((track, k) => {
      setTimeout(() => spinRandom(track), k * 120);
    });
  });

  /* ============================================================
     LAYOUT — coloca las letras en un sistema de coordenadas común
     ============================================================ */
  function buildLayout() {
    const items = [];
    let penX = 0;
    const baseY = 0;

    state.letters.forEach((letter, i) => {
      if (letter.isSpace) {
        penX += 90; // ancho de espacio
        return;
      }
      const model = DB.getModel(letter.modelId, letter.char) || letter.models[0];
      if (!model) return;
      const g = DB.glyphData(model, letter.char);
      const S = (g.norm || 1) * letter.scale;
      const cx = (g.x1 + g.x2) / 2;
      const cy = (g.y1 + g.y2) / 2;
      const px = penX + letter.offX;
      const py = baseY + letter.offY;

      const corners = transformedCorners(g, cx, cy, letter.rot, S, px, py);
      const bb = cornersBBox(corners);

      items.push({ i, letter, model, g, S, cx, cy, px, py, rot: letter.rot, bb });

      penX += g.advance * S + letter.spacing;
    });

    const bbox = unionBBox(items.map((it) => it.bb));
    return { items, bbox };
  }

  function transformedCorners(g, cx, cy, rotDeg, S, px, py) {
    const r = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(r), sin = Math.sin(r);
    const pts = [
      [g.x1, g.y1], [g.x2, g.y1], [g.x2, g.y2], [g.x1, g.y2],
    ];
    return pts.map(([x, y]) => {
      const dx = x - cx, dy = y - cy;
      const rx = cx + dx * cos - dy * sin;
      const ry = cy + dx * sin + dy * cos;
      return [px + rx * S, py + ry * S];
    });
  }

  function cornersBBox(c) {
    const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
  }

  function unionBBox(list) {
    if (!list.length) return { x1: 0, y1: 0, x2: 100, y2: 100 };
    return list.reduce((a, b) => ({
      x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1),
      x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2),
    }));
  }

  /* ---- Genera el string SVG completo del nombre ---- */
  function buildNameSVG({ withBg, selectedIndex = -1, padRatio = 0.08 } = {}) {
    const { items, bbox } = buildLayout();
    const w = bbox.x2 - bbox.x1 || 100;
    const h = bbox.y2 - bbox.y1 || 100;
    const pad = Math.max(w, h) * padRatio + 20;
    const vbX = bbox.x1 - pad, vbY = bbox.y1 - pad;
    const vbW = w + pad * 2, vbH = h + pad * 2;

    let defs = "";
    let body = "";

    if (withBg) {
      body += `<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${state.bgColor}"/>`;
    }

    // dibujar de atrás hacia delante según el orden z de cada letra
    const ordered = items.slice().sort((a, b) => (a.letter.z || 0) - (b.letter.z || 0));
    ordered.forEach((it) => {
      const transform = letterTransform(it);
      let glyph;
      if (it.g.kind === "markup") {
        glyph = it.g.inner;
      } else if (it.g.kind === "image") {
        glyph = `<image href="${it.g.src}" x="${it.g.x1}" y="${it.g.y1}" width="${it.g.x2 - it.g.x1}" height="${it.g.y2 - it.g.y1}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        const f = DB.resolveFill(it.g.defaultFill, it.letter.color);
        defs += f.defs;
        glyph = `<path d="${it.g.d}" fill="${f.paint}"/>`;
      }
      const sel = it.i === selectedIndex ? ' class="sel"' : "";
      body += `<g data-i="${it.i}"${sel} transform="${transform}">${glyph}</g>`;
    });

    // marco de selección (solo en editor)
    let overlay = "";
    if (selectedIndex >= 0) {
      const it = items.find((x) => x.i === selectedIndex);
      if (it) {
        const m = 6;
        overlay = `<rect class="selbox" x="${fmt(it.bb.x1 - m)}" y="${fmt(it.bb.y1 - m)}" width="${fmt(it.bb.x2 - it.bb.x1 + m * 2)}" height="${fmt(it.bb.y2 - it.bb.y1 + m * 2)}" fill="none" stroke="#050505" stroke-width="${fmt(Math.max(w, h) * 0.006 + 1)}" stroke-dasharray="${fmt(Math.max(w, h) * 0.02)}"/>`;
      }
    }

    const svg =
      `<svg xmlns="${SVGNS}" viewBox="${fmt(vbX)} ${fmt(vbY)} ${fmt(vbW)} ${fmt(vbH)}" preserveAspectRatio="xMidYMid meet">` +
      `<defs>${defs}</defs>${body}${overlay}</svg>`;
    return { svg, vbX, vbY, vbW, vbH, items };
  }

  function fmt(n) {
    return Math.round(n * 100) / 100;
  }

  /* transform SVG de una letra (posición, escala, rotación y espejo).
     El espejo voltea en horizontal respecto al centro cx, así la letra
     no se desplaza y la caja delimitadora no cambia. */
  function letterTransform(it) {
    let t = `translate(${fmt(it.px)},${fmt(it.py)}) scale(${fmt(it.S)}) rotate(${fmt(it.rot)} ${fmt(it.cx)} ${fmt(it.cy)})`;
    if (it.letter.mirror) t += ` translate(${fmt(2 * it.cx)},0) scale(-1,1)`;
    if (it.letter.mirrorV) t += ` translate(0,${fmt(2 * it.cy)}) scale(1,-1)`;
    return t;
  }

  /* ============================================================
     PASO 3 — EDITOR
     ============================================================ */
  function renderEditor() {
    const canvas = $("#editor-canvas");
    const { svg } = buildNameSVG({ withBg: state.showBg, selectedIndex: state.selected });
    canvas.style.background = state.showBg ? "transparent" : "";
    canvas.innerHTML = svg;
    bindEditorSVG(canvas);
    syncPanel();
    renderGallery();
  }

  /* mini galería bajo el canvas: los modelos disponibles para la letra
     seleccionada; al pulsar uno se cambia el modelo de esa letra. */
  function renderGallery() {
    const gal = $("#letter-gallery");
    const L = selLetter();
    if (!L || L.isSpace || !L.models.length) {
      gal.innerHTML = "";
      gal.hidden = true;
      return;
    }
    gal.hidden = false;
    gal.innerHTML = "";
    L.models.forEach((model) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gal-item" + (model.id === L.modelId ? " is-active" : "");
      b.innerHTML = DB.letterSVG(model, L.char, null);
      b.title = modelLabel(model, L.char);
      b.addEventListener("click", () => {
        L.modelId = model.id;
        renderEditor();
      });
      gal.appendChild(b);
    });
  }

  function bindEditorSVG(canvas) {
    const svgEl = canvas.querySelector("svg");
    if (!svgEl) return;

    // seleccionar letra al hacer clic
    svgEl.querySelectorAll("g[data-i]").forEach((g) => {
      g.style.cursor = "grab";
      g.addEventListener("pointerdown", (e) => startDrag(e, svgEl, Number(g.dataset.i)));
    });

    // clic en zona vacía deselecciona
    svgEl.addEventListener("pointerdown", (e) => {
      if (e.target === svgEl) {
        state.selected = -1;
        renderEditor();
      }
    });
  }

  let drag = null;
  function startDrag(e, svgEl, i) {
    e.preventDefault();
    e.stopPropagation();
    if (state.letters[i].isSpace) return;
    state.selected = i;
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.viewBox.baseVal;
    const scaleX = vb.width / rect.width;
    const scaleY = vb.height / rect.height;
    drag = {
      i, scaleX, scaleY,
      startX: e.clientX, startY: e.clientY,
      origX: state.letters[i].offX, origY: state.letters[i].offY,
      moved: false,
    };
    svgEl.setPointerCapture(e.pointerId);
    svgEl.addEventListener("pointermove", onDrag);
    svgEl.addEventListener("pointerup", endDrag);
    syncPanel();
    highlightOnly(svgEl, i);
  }

  function onDrag(e) {
    if (!drag) return;
    const L = state.letters[drag.i];
    L.offX = drag.origX + (e.clientX - drag.startX) * drag.scaleX;
    L.offY = drag.origY + (e.clientY - drag.startY) * drag.scaleY;
    drag.moved = true;
    // actualización en vivo (ligera): regenerar transform del grupo
    const g = e.currentTarget.querySelector(`g[data-i="${drag.i}"]`);
    if (g) {
      const it = currentItem(drag.i);
      if (it) g.setAttribute("transform", letterTransform(it));
    }
  }

  function endDrag(e) {
    if (!drag) return;
    const svgEl = e.currentTarget;
    svgEl.removeEventListener("pointermove", onDrag);
    svgEl.removeEventListener("pointerup", endDrag);
    try { svgEl.releasePointerCapture(e.pointerId); } catch (x) {}
    drag = null;
    renderEditor(); // re-render completo para recalcular bbox/selección
  }

  // penX (posición acumulada sin offX) de una letra, para arrastre en vivo
  function currentItem(i) {
    const { items } = buildLayout();
    const it = items.find((x) => x.i === i);
    if (!it) return null;
    return { ...it, penX: it.px - state.letters[i].offX };
  }

  function highlightOnly(svgEl, i) {
    svgEl.querySelectorAll("g[data-i]").forEach((g) =>
      g.classList.toggle("sel", Number(g.dataset.i) === i)
    );
  }

  /* ---- Panel de controles ---- */
  function selLetter() {
    return state.selected >= 0 ? state.letters[state.selected] : null;
  }

  function syncPanel() {
    const L = selLetter();
    const empty = $("#panel-empty");
    const ctrls = $("#panel-controls");
    if (!L || L.isSpace) {
      empty.hidden = false;
      ctrls.hidden = true;
      return;
    }
    empty.hidden = true;
    ctrls.hidden = false;

    $("#c-scale").value = Math.round(L.scale * 100);
    $("#v-scale").textContent = Math.round(L.scale * 100) + "%";
    $("#c-offx").value = Math.round(L.offX);
    $("#v-offx").textContent = Math.round(L.offX);
    $("#c-offy").value = Math.round(L.offY);
    $("#v-offy").textContent = Math.round(L.offY);
    $("#c-rot").value = Math.round(L.rot);
    $("#v-rot").textContent = Math.round(L.rot) + "°";
    $("#c-mirror").checked = !!L.mirror;
    $("#c-mirror-v").checked = !!L.mirrorV;
  }

  // listeners del panel
  function onCtrl(id, fn) {
    const el = $(id);
    el.addEventListener("input", () => {
      const L = selLetter();
      if (!L) return;
      fn(L, el.value);
      renderEditor();
    });
  }
  onCtrl("#c-scale", (L, v) => (L.scale = Number(v) / 100));
  onCtrl("#c-offx", (L, v) => (L.offX = Number(v)));
  onCtrl("#c-offy", (L, v) => (L.offY = Number(v)));
  onCtrl("#c-rot", (L, v) => (L.rot = Number(v)));

  $("#c-mirror").addEventListener("change", (e) => {
    const L = selLetter();
    if (!L) return;
    L.mirror = e.target.checked;
    renderEditor();
  });
  $("#c-mirror-v").addEventListener("change", (e) => {
    const L = selLetter();
    if (!L) return;
    L.mirrorV = e.target.checked;
    renderEditor();
  });

  // orden de apilado: adelante = por encima de todas; atrás = por debajo
  $("#z-front").addEventListener("click", () => setZ(1));
  $("#z-back").addEventListener("click", () => setZ(-1));
  function setZ(dir) {
    const L = selLetter();
    if (!L) return;
    const zs = state.letters.filter((x) => !x.isSpace).map((x) => x.z || 0);
    L.z = dir > 0 ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
    renderEditor();
  }

  $("#reset-letter").addEventListener("click", () => {
    const L = selLetter();
    if (!L) return;
    Object.assign(L, { scale: 1, rot: 0, offX: 0, offY: 0, mirror: false, mirrorV: false, z: 0, spacing: 0, color: null });
    renderEditor();
  });

  $("#bg-color").addEventListener("input", (e) => {
    state.bgColor = e.target.value;
    if (state.showBg) renderEditor();
  });
  $("#show-bg").addEventListener("change", (e) => {
    state.showBg = e.target.checked;
    renderEditor();
  });

  /* ============================================================
     EXPORTAR — menú desplegable de formato
     ============================================================ */
  const dlToggle = $("#dl-toggle");
  const dlList = $("#dl-list");

  function closeDlMenu() {
    dlList.hidden = true;
    dlToggle.setAttribute("aria-expanded", "false");
  }
  dlToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dlList.hidden;
    dlList.hidden = !open;
    dlToggle.setAttribute("aria-expanded", String(open));
  });
  // cerrar al pulsar fuera o con Escape
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#dl-menu")) closeDlMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDlMenu();
  });

  document.querySelectorAll("[data-dl]").forEach((b) => {
    b.addEventListener("click", () => {
      download(b.dataset.dl);
      closeDlMenu();
    });
  });

  function download(fmtType) {
    const fileBase = (state.name || "nombre").replace(/\s+/g, "_").toLowerCase();
    const withBg = fmtType === "jpg";
    const { svg, vbW, vbH } = buildNameSVG({ withBg });

    if (fmtType === "svg") {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      triggerDownload(URL.createObjectURL(blob), fileBase + ".svg", true);
      return;
    }

    // PNG / JPG: rasterizar el SVG
    const outH = 900;
    const scale = outH / vbH;
    const W = Math.round(vbW * scale);
    const H = Math.round(vbH * scale);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (fmtType === "jpg") {
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.drawImage(img, 0, 0, W, H);
      const mime = fmtType === "jpg" ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => triggerDownload(URL.createObjectURL(blob), fileBase + "." + fmtType, true),
        mime,
        0.95
      );
    };
    img.onerror = () => alert("No se pudo generar la imagen. Prueba a descargar el SVG.");
    img.src = "data:image/svg+xml;base64," + b64(svg);
  }

  function b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function triggerDownload(href, filename, revoke) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (revoke) setTimeout(() => URL.revokeObjectURL(href), 4000);
  }

  /* ---------- Reiniciar ---------- */
  $("#restart").addEventListener("click", () => {
    state.name = "";
    state.letters = [];
    state.selected = -1;
    $("#name-input").value = "";
    goto(1);
  });
})();
