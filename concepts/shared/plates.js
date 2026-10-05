/*
 * Engineering plates: one line drawing per tool, drawn from what the tool does.
 * Colors come from CSS custom properties (see base.css: --pl-ink, --pl-acc, ...),
 * so each concept tints the same drawings in its own palette.
 * Unknown tool ids fall back to a category drawing, so new tools still get a plate.
 */
(function () {
  'use strict';

  function grid(x0, y0, x1, y1, step) {
    let d = '';
    for (let x = x0; x <= x1; x += step) d += `M${x} ${y0}V${y1}`;
    for (let y = y0; y <= y1; y += step) d += `M${x0} ${y}H${x1}`;
    return `<path class="pl-grid" d="${d}"/>`;
  }

  function arrowHead(x, y, dir) {
    // small open arrowhead pointing in dir: 'r' | 'u' | 'd' | 'l'
    const m = { r: `M${x - 6} ${y - 3.5}L${x} ${y}L${x - 6} ${y + 3.5}`, l: `M${x + 6} ${y - 3.5}L${x} ${y}L${x + 6} ${y + 3.5}`,
      u: `M${x - 3.5} ${y + 6}L${x} ${y}L${x + 3.5} ${y + 6}`, d: `M${x - 3.5} ${y - 6}L${x} ${y}L${x + 3.5} ${y - 6}` };
    return m[dir];
  }

  function axes(ox, oy, x1, y1) {
    return `<path class="pl-ink" d="M${ox} ${oy}H${x1}${arrowHead(x1, oy, 'r')}M${ox} ${oy}V${y1}${arrowHead(ox, y1, 'u')}"/>`;
  }

  const DRAW = {
    'knowledge-base'() {
      let load = 'M176 62H260';
      for (let x = 180; x <= 256; x += 12.6) load += `M${x.toFixed(1)} 62V79${arrowHead(+x.toFixed(1), 80, 'd')}`;
      return grid(0, 0, 320, 200, 20)
        + '<rect class="pl-page" x="44" y="32" width="116" height="138" rx="2"/><rect class="pl-page" x="160" y="32" width="116" height="138" rx="2"/>'
        + '<path class="pl-ink pl-bold" d="M58 52H116"/>'
        + '<path class="pl-thin" d="M58 68H144M58 78H138M58 88H146M58 98H120M58 114H142M58 124H134M58 134H144M58 144H108M58 154H130"/>'
        + `<path class="pl-ink" d="${load}"/>`
        + '<path class="pl-ink pl-bold" d="M176 86H260"/>'
        + '<path class="pl-ink" d="M176 86L169 98H183ZM166 102H186M260 86m-5 6a5 5 0 1 0 10 0a5 5 0 1 0-10 0M250 102H270"/>'
        + '<path class="pl-soft" d="M176 122Q218 166 260 122Z"/>'
        + '<path class="pl-thin" d="M176 122H260"/><path class="pl-acc" d="M176 122Q218 166 260 122"/>'
        + '<text class="pl-txt" x="212" y="56">q</text><text class="pl-txt" x="208" y="160">M(x)</text>';
    },

    'material-library'() {
      return grid(0, 0, 320, 200, 20) + axes(52, 168, 292, 26)
        + '<path class="pl-thin pl-dash" d="M92 62V168M52 62H92"/>'
        + '<path class="pl-ink pl-dash" d="M52 168C92 140 142 126 286 118"/>'
        + '<path class="pl-ink" d="M52 168L104 96C140 80 200 72 252 74"/><path class="pl-ink" d="M249 71l6 6M255 71l-6 6"/>'
        + '<path class="pl-acc" d="M52 168L92 62L100 66L108 63C150 40 210 34 236 40C248 44 256 52 262 62"/><path class="pl-acc" d="M259 59l6 6M265 59l-6 6"/>'
        + '<circle class="pl-accfill" cx="92" cy="62" r="3.5"/>'
        + '<text class="pl-txt" x="34" y="36">σ</text><text class="pl-txt" x="284" y="188">ε</text>'
        + '<text class="pl-mono" x="98" y="56">yield</text>';
    },

    'shock-pulse'() {
      const x0 = 76, x1 = 236, base = 160, peak = 52;
      let pts = [];
      for (let i = 0; i <= 40; i++) {
        const x = x0 + (x1 - x0) * i / 40;
        pts.push(`${x.toFixed(1)} ${(base - (base - peak) * Math.sin(Math.PI * i / 40)).toFixed(1)}`);
      }
      const curve = 'M' + pts.join('L');
      return grid(0, 0, 320, 200, 20) + axes(52, base, 292, 28)
        + `<path class="pl-soft" d="${curve}Z"/>`
        + `<path class="pl-thin pl-dash" d="M52 ${peak}H156"/>`
        + `<path class="pl-acc" d="${curve}"/>`
        + `<path class="pl-thin" d="M${x0} 170V184M${x1} 170V184M${x0} 178H${x1}${arrowHead(x0, 178, 'l')}${arrowHead(x1, 178, 'r')}"/>`
        + '<text class="pl-txt" x="58" y="30">a(t)</text><text class="pl-txt" x="288" y="176">t</text>'
        + `<text class="pl-txt" x="36" y="${peak + 4}">A</text><text class="pl-txt" x="150" y="196">τ</text>`
        + '<text class="pl-txt pl-big" x="134" y="130">Δv</text>';
    },

    'center-of-gravity'() {
      const cx = 153, cy = 122;
      return grid(0, 0, 320, 200, 20)
        + '<rect class="pl-page" x="72" y="128" width="176" height="22"/><rect class="pl-page" x="72" y="58" width="24" height="70"/>'
        + '<rect class="pl-soft-ink" x="176" y="98" width="56" height="30"/>'
        + '<path class="pl-thin" d="M84 58V128M72 139H248M204 98V128"/>'
        + axes(48, 166, 124, 96)
        + `<path class="pl-thin pl-dash" d="M${cx} ${cy + 9}V188M${cx - 9} ${cy}H26"/>`
        + `<path class="pl-thin" d="M48 184H${cx}${arrowHead(48, 184, 'l')}${arrowHead(cx, 184, 'r')}M30 166V${cy}${arrowHead(30, 166, 'd')}${arrowHead(30, cy, 'u')}"/>`
        + `<circle class="pl-acc pl-cg" cx="${cx}" cy="${cy}" r="9"/>`
        + `<path class="pl-accfill" d="M${cx} ${cy}V${cy - 9}A9 9 0 0 1 ${cx + 9} ${cy}ZM${cx} ${cy}V${cy + 9}A9 9 0 0 1 ${cx - 9} ${cy}Z"/>`
        + '<text class="pl-txt" x="128" y="170">x</text><text class="pl-txt" x="42" y="90">y</text>'
        + '<text class="pl-txt" x="96" y="198">x̄</text><text class="pl-txt" x="14" y="150">ȳ</text>';
    },

    'pre-run-checklist'() {
      let mesh = '';
      for (let x = 82; x < 208; x += 18) mesh += `M${x} 46V154`;
      for (let y = 64; y < 154; y += 18) mesh += `M64 ${y}H208`;
      let radial = '';
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
        radial += `M${(136 + 22 * c).toFixed(1)} ${(100 + 22 * s).toFixed(1)}L${(136 + 34 * c).toFixed(1)} ${(100 + 34 * s).toFixed(1)}`;
      }
      let hatch = '';
      for (let y = 46; y <= 154; y += 10) hatch += `M58 ${y}l-8 8`;
      let loads = '';
      [64, 100, 136].forEach(y => { loads += `M212 ${y}H242${arrowHead(242, y, 'r')}`; });
      let checks = '';
      [['62', 'MESH'], ['100', 'BC'], ['138', 'LOAD']].forEach(([y, label]) => {
        y = +y;
        checks += `<rect class="pl-ink" x="256" y="${y - 8}" width="16" height="16" rx="2"/>`
          + `<path class="pl-acc" d="M259.5 ${y}l3.5 4 6.5-8.5"/><text class="pl-mono" x="278" y="${y + 3.5}">${label}</text>`;
      });
      return '<rect class="pl-page" x="64" y="46" width="144" height="108"/>'
        + `<path class="pl-thin" d="${mesh}"/>`
        + '<circle class="pl-page-fill" cx="136" cy="100" r="34"/>'
        + `<path class="pl-thin" d="${radial}"/><circle class="pl-thin" cx="136" cy="100" r="34"/>`
        + '<circle class="pl-page" cx="136" cy="100" r="22"/>'
        + '<rect class="pl-ink pl-bold" x="64" y="46" width="144" height="108"/>'
        + `<path class="pl-ink pl-bold" d="M58 40V160"/><path class="pl-thin" d="${hatch}"/>`
        + `<path class="pl-acc" d="${loads}"/>` + checks;
    },

    'standard-finder'() {
      let g = '';
      for (let dec = 0; dec < 3; dec++) {
        for (let n = 1; n < 10; n++) {
          const x = 52 + 80 * dec + 80 * Math.log10(n);
          g += `M${x.toFixed(1)} 30V168`;
        }
      }
      for (let y = 40; y < 168; y += 32) g += `M52 ${y}H292`;
      return `<path class="pl-grid" d="${g}M292 30V168"/>` + axes(52, 168, 296, 26)
        + '<path class="pl-thin pl-dash" d="M68 140L120 78H224L280 128M68 160L120 98H224L280 148"/>'
        + '<path class="pl-acc" d="M68 150L120 88H224L280 138"/>'
        + '<circle class="pl-accfill" cx="120" cy="88" r="3"/><circle class="pl-accfill" cx="224" cy="88" r="3"/>'
        + '<text class="pl-mono" x="60" y="24">g²/Hz</text><text class="pl-mono" x="272" y="186">Hz</text>'
        + '<text class="pl-mono" x="150" y="72">±3 dB</text>';
    },

    'weight-manager'() {
      const rows = [[72, 120, 104], [104, 76, 88], [136, 140, 128], [164, 52, 50]];
      let tree = '<rect class="pl-ink" x="36" y="28" width="40" height="16" rx="3"/><path class="pl-ink" d="M48 44V164"/>';
      let bars = '<path class="pl-ink" d="M140 54V178"/>';
      rows.forEach(([y, a, b]) => {
        tree += `<path class="pl-ink" d="M48 ${y}H66"/><rect class="pl-ink" x="66" y="${y - 6}" width="12" height="12" rx="2"/><path class="pl-thin" d="M86 ${y}H${y === 136 ? 118 : 128}"/>`;
        bars += `<rect class="pl-soft-ink" x="140" y="${y - 10}" width="${a}" height="8"/><rect class="pl-accfill" x="140" y="${y + 1}" width="${b}" height="8"/>`;
      });
      return grid(0, 0, 320, 200, 20) + tree + bars
        + '<rect class="pl-soft-ink" x="214" y="22" width="9" height="9"/><text class="pl-mono" x="227" y="30">CFG A</text>'
        + '<rect class="pl-accfill" x="262" y="22" width="9" height="9"/><text class="pl-mono" x="275" y="30">CFG B</text>';
    }
  };

  // Category drawings for tools without a bespoke plate.
  function fallback(tool) {
    const meta = window.Hub.categoryMeta(tool.category);
    return grid(0, 0, 320, 200, 20)
      + `<g transform="translate(124 64) scale(3)" class="pl-icon">${window.Hub.icon(meta.icon).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`;
  }

  function plate(tool, cls) {
    const body = DRAW[tool.id] ? DRAW[tool.id]() : fallback(tool);
    return `<svg class="plate${cls ? ' ' + cls : ''}" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  window.Hub.plate = plate;
  window.Hub.hasPlate = id => Boolean(DRAW[id]);
})();
