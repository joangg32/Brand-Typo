/* ============================================================
   custom-letters.js — TUS LETRAS REALES DE LOGOS FAMOSOS
   ------------------------------------------------------------
   Aquí es donde construyes tu base de datos de letras REALES.

   Cómo añadir una letra real de un logo:
   1. Consigue el SVG de la letra (p.ej. recorta una letra de un
      logo en worldvectorlogo.com / brandsoftheworld.com, o
      dibújala en Figma/Illustrator y exporta a SVG).
   2. Abre ese .svg con un editor de texto y copia SOLO el
      contenido interior (las etiquetas <path>, <polygon>, <g>…),
      NO la etiqueta <svg> exterior.
   3. Mira el atributo viewBox del <svg> (ej. "0 0 120 140").
   4. Añade una entrada con CUSTOM_LETTERS.push({...}) abajo.

   Cada entrada representa UNA letra en UN estilo. Aparecerá
   automáticamente en la ruleta para esa letra, junto a los
   estilos de fuente, y se podrá editar y exportar igual.

   La comparación de "char" ignora mayúsculas/minúsculas.
   ============================================================ */

const CUSTOM_LETTERS = [
  /* ---------- EJEMPLO (descoméntalo y edítalo) ----------
  {
    styleId: "cocacola-real",     // id único de tu estilo/marca
    styleLabel: "Coca-Cola (real)",
    char: "C",                     // la letra que representa
    viewBox: "0 0 120 140",        // el viewBox del SVG original
    // 'inner' = contenido interior del SVG (paths, etc.):
    inner: '<path d="M10 70 ..." fill="#E61A27"/>'
  },
  ------------------------------------------------------- */
];
