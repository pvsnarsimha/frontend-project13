# Vendored third-party files

Shipped in the repository so the app works fully offline (no CDN requests).

| File | Package | Version | License |
|---|---|---|---|
| `chart.umd.js` | [chart.js](https://www.npmjs.com/package/chart.js) (`dist/chart.umd.js`) | 4.4.0 | MIT (`licenses/chart.js-MIT.md`) |
| `fonts/inter-latin-*.woff2` | [@fontsource/inter](https://www.npmjs.com/package/@fontsource/inter) | 5.3.0 | SIL OFL 1.1 (`licenses/inter-OFL.txt`) |
| `fonts/jetbrains-mono-latin-*.woff2` | [@fontsource/jetbrains-mono](https://www.npmjs.com/package/@fontsource/jetbrains-mono) | 5.3.0 | SIL OFL 1.1 (`licenses/jetbrains-mono-OFL.txt`) |

Only the Latin subset of the fonts is included; other scripts fall back to the system font.

The vendored Chart.js is 4.4.0; newer 4.x releases exist. Nothing in the app depends on a feature of a later version, so updating is optional
(the tests only check that this table matches the banner of `chart.umd.js`).

To update a file: `npm pack <package>@<version>`, extract it, copy the file over, and update the table above.
