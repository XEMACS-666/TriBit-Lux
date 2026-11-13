"""Inventory originals without changing them. Run from any directory."""
from pathlib import Path
import csv, json, subprocess, mimetypes
ROOT = Path(__file__).resolve().parents[2]
tracked = set(subprocess.check_output(['git', 'ls-files'], cwd=ROOT, text=True).splitlines())
rows = []
for folder in sorted(ROOT.glob('Version_*')) + [ROOT / 'docs/media']:
    for p in sorted(folder.rglob('*')):
        if not p.is_file(): continue
        rel = p.relative_to(ROOT).as_posix()
        if any(x.startswith('.') or x.endswith('-backups') for x in p.relative_to(ROOT).parts): continue
        if p.name in ('fp-info-cache', 'Icon\r') or p.suffix in ('.kicad_prl', '.lck') or p.name.endswith('-bak'): continue
        if '/review/' in rel and p.suffix in ('.zip', '.kicad_pcb'): continue
        version = folder.name.removeprefix('Version_') if folder.name.startswith('Version_') else ('1.0' if 'v1-0' in p.name else '1.1' if 'v1-1' in p.name else '1.2')
        ext = p.suffix.lower().lstrip('.') or 'library-table'
        category = ('Photographs and diagrams' if ext in ('png','jpg','jpeg','svg','heic') else
                    'Animation' if ext == 'gif' else 'Video' if ext in ('mp4','webm','mov') else
                    'Interactive demo' if ext == 'html' else 'Firmware' if ext == 'ino' else
                    'KiCad source' if ext.startswith('kicad_') or ext == 'library-table' else
                    'Manufacturing' if ext in ('zip','csv') else 'Documentation and schematic')
        note = 'Local only; not in tracked deployment' if rel not in tracked else ''
        if rel == 'Version_2.1/gerber/gerber.zip': note = 'Historical archive; predates current board changes. Regenerate and review before ordering.'
        if rel == 'Version_2.0/assets/tribit-lux-explorer.html': note = 'Historical 3.3 V explorer; its V2.1 concept predates the current 2.5 V design.'
        rows.append(dict(version=version,filename=p.name,path=rel,type=ext,mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream',category=category,bytes=p.stat().st_size,deployable=rel in tracked,note=note))
(ROOT/'website/inventory.json').write_text(json.dumps(rows,indent=2)+'\n')
with (ROOT/'website/inventory.csv').open('w') as f:
    writer=csv.DictWriter(f,fieldnames=rows[0].keys()); writer.writeheader(); writer.writerows(rows)
print(f'Inventoried {len(rows)} files; {sum(r["deployable"] for r in rows)} tracked files available to the site.')
