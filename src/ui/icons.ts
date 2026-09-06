export const AQUILA_SVG = `
<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <g id="kt-wing">
      <path d="M58,38 L85,20 L82,32 L95,28 L90,40 L98,42 L88,50 L92,58 L78,52 L75,60 L65,48 Z" />
    </g>
    <g id="kt-head">
      <circle cx="60" cy="26" r="6" />
      <path d="M66,24 L74,22 L66,29 Z" />
    </g>
  </defs>
  <path d="M50,30 L58,40 L58,66 L50,78 L42,66 L42,40 Z" />
  <use href="#kt-wing" />
  <use href="#kt-head" />
  <g transform="scale(-1,1) translate(-100,0)">
    <use href="#kt-wing" />
    <use href="#kt-head" />
  </g>
</svg>
`.trim();
