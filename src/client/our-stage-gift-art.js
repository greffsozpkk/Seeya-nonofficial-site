'use strict';
// Small code-native pixel props; no new character artwork or stored gift counters.
const paths={
 box:'<path fill="#bd6b8a" d="M4 13h24v16H4z"/><path fill="#e9abc2" d="M2 10h28v6H2z"/><path fill="#f7de9e" d="M14 10h5v19h-5zM7 4h7v3h4V4h7v6H7z"/>',
 bouquet:'<path fill="#739375" d="M9 13h5v10H9zM18 12h5v11h-5z"/><path fill="#e28bab" d="M5 4h8v8H5zM18 6h9v8h-9z"/><path fill="#f0bf70" d="M12 2h8v9h-8z"/><path fill="#f3dfb3" d="M4 15h25v5h-5v5h-4v5h-8v-5H8v-5H4z"/><path fill="#b86d86" d="M11 24h11v4H11z"/>',
 bear:'<path fill="#ba8b64" d="M5 2h7v7H5zM21 2h7v7h-7zM7 7h19v14H7zM8 20h17v10H8zM3 21h5v7H3zM25 21h5v7h-5z"/><path fill="#f6dfb8" d="M12 12h9v7h-9zM12 23h9v6h-9z"/><path fill="#503c40" d="M10 10h3v3h-3zM21 10h3v3h-3zM15 14h3v3h-3z"/><path fill="#cb7f9b" d="M10 20h13v3H10z"/>',
 towel:'<path fill="#6b638f" d="M2 10h28v14H2z"/><path fill="#e0a8cb" d="M4 12h24v10H4z"/><path fill="#fff1cc" d="M6 15h4v4H6zM14 15h4v4h-4zM22 15h4v4h-4z"/><path fill="#6b638f" d="M2 24h3v4H2zM7 24h3v4H7zM22 24h3v4h-3zM27 24h3v4h-3z"/>',
 letters:'<path fill="#d5b79c" d="M5 6h23v22H5z"/><path fill="#fff1d5" d="M2 10h25v17H2z"/><path fill="#d7a48a" d="M2 10h4v4h5v4h7v-4h5v-4h4v5h-5v5H7v-5H2z"/><path fill="#b96e8b" d="M11 17h8v6h-8z"/>'
};
module.exports=kind=>`<svg viewBox="0 0 32 32" class="gift-pixel" aria-hidden="true" shape-rendering="crispEdges">${paths[kind]||paths.box}</svg>`;
