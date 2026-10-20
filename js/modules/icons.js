/* ============================================================================
 * icons.js — one icon for every technology, certificate and award.
 * ----------------------------------------------------------------------------
 * Two sources, merged by App.iconSvg():
 *   App.BRAND_ICONS   generated file, real product marks
 *                     (js/modules/icons.brand.js, from tools/fetch-tech-icons.js)
 *   the G table below hand-drawn line marks for the things that are not a
 *     product (CNN, RBAC, UAT, REST APIs…) and for the brands whose artwork is
 *     no longer licensed for reuse (Microsoft, Adobe, AWS, Tableau, SAS, Canva).
 * A glyph is an array of shapes: a string is a 24x24 path drawn as a stroke,
 * { d, fill } is a path filled instead. Nothing here invents a logo — if a
 * technology has no honest mark it gets a plain, descriptive glyph.
 * ==========================================================================*/
(function (global) {
  'use strict';
  var App = global.App || (global.App = {});

  var G = {
    /* -------------------------------------------------------- languages / web */
    'rest-api': ['M9 7.5 5 12l4 4.5', 'M15 7.5 19 12l-4 4.5', 'M13.2 5.5l-2.4 13'],
    'responsive-ui': ['M3.5 6.5h11v8h-11z', 'M6.5 17.5h5', 'M16.5 9h4v11h-4z', 'M18 18.5h1'],
    html5: null, /* brand */
    'local-server': ['M4 5.5h16v5h-16z', 'M4 13.5h16v5h-16z', 'M7 8h3', 'M7 16h3', 'M15 8h2', 'M15 16h2'],

    /* ---------------------------------------------------------------- mobile */
    'camera-capture': ['M3.5 8.5h3l1.5-2h6l1.5 2h3v10h-15z',
      'M11 10.7a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z'],
    'tts': ['M4 10h3l4-3.5v11l-4-3.5h-3z', 'M14.5 9.5a4 4 0 0 1 0 5', 'M17 7.5a7.5 7.5 0 0 1 0 9'],
    'mobile-ux': ['M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-8a1.5 1.5 0 0 1-1.5-1.5v-14a1.5 1.5 0 0 1 1.5-1.5z',
      'M12 9.6c.9-1.5 3.2-1 3.2.8 0 1.4-1.8 2.7-3.2 3.7-1.4-1-3.2-2.3-3.2-3.7 0-1.8 2.3-2.3 3.2-.8z'],

    /* -------------------------------------------------------------------- ai */
    'cnn': ['M4 4h16v16h-16z', 'M9.3 4v16', 'M14.7 4v16', 'M4 9.3h16', 'M4 14.7h16'],
    'lstm': ['M3.5 11h4v5h-4z', 'M10 11h4v5h-4z', 'M16.5 11h4v5h-4z',
      'M7.5 13.5h2.5', 'M14 13.5h2.5', 'M5.5 11c0-3.6 13-3.6 13 0'],
    'yolo': ['M4 8v-4h4', 'M16 4h4v4', 'M20 16v4h-4', 'M8 20h-4v-4', { d: 'M10 10h4v4h-4z', fill: true }],
    'model-eval': ['M4.5 17a7.5 7.5 0 1 1 15 0', 'M12 17l3.6-5.2', { d: 'M10.8 15.8a1.7 1.7 0 1 0 2.4 2.4 1.7 1.7 0 0 0-2.4-2.4z', fill: true }],
    'teachable-machine': ['M12 5l9 4-9 4-9-4z', 'M7 12v4.2c0 1.5 10 1.5 10 0v-4.2', 'M20.6 9.4v4.6'],
    'ai-tools': ['M11 4.5l1.5 4.2 4.2 1.5-4.2 1.5-1.5 4.3-1.5-4.3-4.2-1.5 4.2-1.5z',
      'M17.8 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z'],

    /* ------------------------------------------------------------------ data */
    'powerbi': ['M4 19.5h16', 'M7 19.5v-6', 'M12 19.5v-11', 'M17 19.5v-4'],
    'tableau': ['M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z', 'M12 4.5v7.5l5.3 5.3'],
    'sas': ['M4.5 5.5h15l-5.8 6.8v6l-3.6 1.8v-7.8z'],
    'spss': ['M4.5 4.5v15h15',
      { d: 'M8 14a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 1 0-2.6 0z', fill: true },
      { d: 'M12.4 9.6a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 1 0-2.6 0z', fill: true },
      { d: 'M16 13a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 1 0-2.6 0z', fill: true }],
    'excel': ['M4 5h16v14h-16z', 'M4 9h16', 'M9.5 9v10', 'M14.5 9v10'],
    'dataset-pipeline': ['M3.5 6h8', 'M3.5 11h8', 'M3.5 16h8', 'M13.5 11.5h6', 'M17 8.5l3 3-3 3'],
    'analytics-dashboards': ['M4 5.5h16v13h-16z', 'M4 9.5h16', 'M12 9.5v9', 'M6.5 15.5l2-2 1.6 1.6'],

    /* ----------------------------------------------------------------- tools */
    'hardware-integration': ['M8.5 8.5h7v7h-7z', 'M10.5 8.5v-3', 'M13.5 8.5v-3',
      'M10.5 18.5v-3', 'M13.5 18.5v-3', 'M8.5 10.5h-3', 'M8.5 13.5h-3', 'M18.5 10.5h-3', 'M18.5 13.5h-3'],
    'rbac': ['M6.5 11h11v9h-11z', 'M8.5 11v-3a3.5 3.5 0 0 1 7 0v3', 'M12 14.5v2.5'],
    'uat': ['M4.5 12.5l2.6 2.6 5.2-6', 'M14 7.5h6', 'M14 12h6', 'M14 16.5h4.5'],

    /* ---------------------------------------------------------------- design */
    'illustrator': ['M12 3.5 6 9.5 12 20.5 18 9.5z', 'M9.4 9.5h5.2', 'M12 9.5v4.2'],
    'photoshop': ['M12 3.5l8 4.5-8 4.5-8-4.5z', 'M4 12.5l8 4.5 8-4.5', 'M4 16.6l8 4.4 8-4.4'],
    'canva': ['M12 3.5c4 5 6.4 7.6 6.4 10.4a6.4 6.4 0 0 1-12.8 0c0-2.8 2.4-5.4 6.4-10.4z',
      'M9.6 14.4a2.4 2.4 0 0 0 2.4 2.4'],
    'capcut': ['M3.5 6.5h17v11h-17z', 'M6.6 6.5v11', 'M17.4 6.5v11',
      { d: 'M10.6 10.6l3.8 1.4-3.8 1.4z', fill: true }],

    /* ------------------------------------------- certificates, awards, misc */
    'certificate': ['M5.5 3.5h9l4 4v13h-13z', 'M14.5 3.5v4h4', 'M8 11h6.5', 'M8 14.5h6.5',
      'M15.6 18.6a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z'],
    'medal': ['M12 9.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z', 'M9.2 5.2 7 10', 'M14.8 5.2 17 10', 'M12 3.5l-2.8 1.7', 'M12 3.5l2.8 1.7'],
    'trophy': ['M8 4.5h8v3.2a4 4 0 0 1-8 0z', 'M8 5.6h-2.6a3.4 3.4 0 0 0 3.4 3.4', 'M16 5.6h2.6a3.4 3.4 0 0 1-3.4 3.4',
      'M12 11.8v3.4', 'M9.6 19.5h4.8l-.7-4.3h-3.4z']
  };

  /* brand entries that have no glyph, so the lookup can fall through cleanly */
  Object.keys(G).forEach(function (k) { if (G[k] === null) delete G[k]; });
  App.GLYPH_ICONS = G;

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function shape(node, s) {
    var p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', typeof s === 'string' ? s : s.d);
    if (typeof s !== 'string' && s.fill) p.setAttribute('fill', 'currentColor');
    node.appendChild(p);
  }

  /* Returns an <svg> tinted by CSS (currentColor), or null when the id has no
     mark — callers then fall back to the initials tile. */
  App.iconSvg = function (id, extraClass) {
    if (!id) return null;
    var brand = App.BRAND_ICONS && App.BRAND_ICONS[id];
    var glyph = G[id];
    if (!brand && !glyph) return null;
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'ico' + (extraClass ? ' ' + extraClass : ''));
    if (brand) {
      svg.setAttribute('fill', 'currentColor');
      brand.forEach(function (d) { shape(svg, d); });
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.7');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      glyph.forEach(function (s) { shape(svg, s); });
    }
    return svg;
  };

  App.hasIcon = function (id) {
    return !!(App.BRAND_ICONS && App.BRAND_ICONS[id]) || !!G[id];
  };
})(typeof window !== 'undefined' ? window : globalThis);
