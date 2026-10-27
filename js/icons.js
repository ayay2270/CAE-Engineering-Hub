const paths = {
  external:'<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>',
  shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-5 10 3 3 6-6"/>',
  chart:'<path d="M3 3v18h18M7 16v-5m5 5V6m5 10v-8"/>',
  pulse:'<path d="M2 18h4c2 0 2-12 6-12s4 12 6 12h4M12 2v2M3 22h18"/>',
  gravity:'<path d="M6 3h12v18H6ZM2 21h20M12 3v18M8 12h8"/><circle cx="12" cy="12" r="2"/>',
  link:'<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(2 0)"/>',
  home:'<path d="m3 10 9-7 9 7v10H15v-7H9v7H3Z"/>',
  grid:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  book:'<path d="M12 5v16M12 5C9 2 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-2-10 1Z"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h1m6 0h1M8 15h1m6 0h1M8 19h1m6 0h1"/>',
  checklist:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
  document:'<path d="M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8M8 16h8"/>',
  weight:'<path d="M5 8h14l3 13H2Zm4 0V5a3 3 0 0 1 6 0v3"/>',
  star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10v10M3 7l9 5 9-5"/>'
};
export function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.cube}</svg>`;}
