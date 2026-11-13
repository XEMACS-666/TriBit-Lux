# TriBit Lux website integration

Implemented locally on 13 November 2026. No commit, push, deployment or GitHub Pages setting change was made.

## Files

- `index.html`: standalone portfolio with home, ADC lab, evolution, PCB showcase, technical documentation and resources.
- `website/styles.css`: original dark green electronics palette, responsive layouts, light theme and reduced-motion support.
- `website/data.js`: documented histories and curated original media for all eight versions.
- `website/adc.js`: ideal 2.5 V quantizer and digit patterns.
- `website/app.js`: galleries, native dialog lightbox, simulation controls, navigation and resource filters.
- `website/inventory.json` / `inventory.csv`: 123 inventoried originals and previews; 106 tracked files offered in the resource browser.
- `website/tools/build_inventory.py`: regenerates the inventory without modifying originals.
- `website/tools/check.mjs`: repeatable ADC, file, case-sensitive path and optional HTTP checks.
- `_includes/head-custom.html`: reduced to a valid head fragment. The complete Canva HTML had been stored here; no root index existed in this checkout. Its palette and display interaction informed the new standalone page. The Canva bootstrap, SDKs, CDN scripts, inline editor styles and runtime GitHub media discovery are removed from the active site.

## Preview and checks

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. Serve over HTTP; browser module loading is not intended for `file://`.

In another terminal:

```sh
node website/tools/check.mjs http://127.0.0.1:8765/
```

Use `node website/tools/check.mjs` for filesystem and simulation checks without a server. The site has no build step or runtime third-party dependency. Future deployment must include the root index, website directory and original tracked assets.

## Verification completed

- 115 site, media and document URLs returned successful HTTP responses both at the server root and under `/TriBit-Lux/` using a local Pages-style mount.
- Exact filename case checked against directory entries and tracked paths, including spaces, parentheses and uppercase extensions.
- All 25,001 slider values from 0 to 2.5 V checked for level, bits, LED count and digit segments. Separate tests cover below, at and above all seven thresholds, plus saturation.
- Browser: eight preset states, slider endpoint and reset, eight version selectors, gallery next/thumbnail controls, lightbox navigation, Escape and restored focus, V2.0 PCB layout selection, resource filtering, mobile navigation and both themes verified.
- Original H.264 video decoded and played in the browser; duration 23.985 seconds. It is silent.
- Viewports checked at 320, 375, 390, 768 and 1440 pixels: no document horizontal overflow. Thumbnail and version navigation strips intentionally scroll horizontally on small screens.
- No browser console errors or warnings observed on the main site or Pages-style mount.
- SHA-256 comparison of 210 existing README, version-directory and preview-media files found no modifications. Existing firmware, CAD and manufacturing files remain untouched.

## Source qualifications

- The V2.1 local README and review files are ignored by Git. They are inventoried as local-only references and not linked from the deployable website. Documentation links use the tracked root README.
- Current V2.1 BOM totals are 56 electrical parts / 39 SMT / 17 THT. Older local review text gives different totals; the site uses the current CSV values.
- V2.0 and V2.1 are unfabricated designs. Renders are labeled CAD, and V2.1 exports predate final label alignment. The existing V2.1 Gerber archive is explicitly marked historical, requiring regeneration and supplier review before ordering.
- HEIC originals are download links; their existing JPEG previews appear in galleries. Existing redactions and XEMACS attribution are preserved.
- Historical 5 V and 3.3 V demonstrations remain unchanged and clearly separate from the current 2.5 V lab. Their internal dependencies/legacy documentation links were not rewritten.
- The new website adds no electrical validation claims. Recorded DRC/ERC results are attributed to the project documentation; fabrication, supplier approval and physical tests remain pending.
- Inventory excludes Git internals, OS files, CAD caches/locks, temporary outputs and development backup snapshots. Re-run its builder when adding project assets, after those originals are tracked for deployment.
