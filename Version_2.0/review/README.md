# V2.0 design checkpoint

Reviewed 19 October 2026 with KiCad 9.0.4. V2.0 remains an unfabricated THT milestone.

## Automated checks

- [PCB DRC](drc.json): 0 violations, 0 unconnected items, 0 schematic parity issues.
- [Schematic ERC](erc.json): 0 violations.
- No explicit PCB DRC exclusions are configured.
- Disabled PCB rules: `footprint_filters_mismatch`, `footprint_type_mismatch`, `missing_courtyard`, `npth_inside_courtyard`, `pth_inside_courtyard`. A clean configured DRC does not establish mechanical fit or manufacturer approval.

## Refreshed in this review

- README gallery now includes bare top, populated render, routing and underside; the deleted preview link was removed.
- A fresh schematic SVG was exported. The older schematic PNG remains an archival snapshot.
- JLCPCB BOM rebuilt from the current general BOM and board footprint names: 12 groups / 41 components.
- JLCPCB CPL rebuilt from the current KiCad top placement CSV: 41 components. Coordinates retain the source origin and units (mm); rotations are normalized to 0–359 degrees. No supplier-specific offsets or orientation corrections have been applied.
- Project-local copies of the two ClearSilk capacitor footprints and QR footprint are included under `TriBitLux.pretty`. The project library table preserves the existing `Extra Footprints` nickname.
- Netlist source path made relative to avoid exposing a local account name.
- Gerber folder capitalization aligned with Git's tracked `Gerber` path.

## Before any assembly order

1. **Select or revalidate supplier parts.** C1–C5 now use the 5 mm diameter ClearSilk footprint, C6 is 2.2 µF with 2 mm lead pitch, R9 has 15.5 mm lead pitch, RV1 is 10 kΩ, and U6 is the 3.3 V regulator. Their JLCPCB codes are blank. Previous codes were not transferred across changed values or packages. Other retained codes are historical selections, not newly verified matches. Confirm electrical ratings, dimensions, pinouts and availability.
2. **Review placement in the manufacturer's preview.** The updated CPL is a format conversion, not a validated assembly setup. Check orientation and placement origin for every selected part, particularly polarized parts, DIP ICs and the regulator. Confirm the intended THT assembly service supports the selected parts.
3. **Preserve the checked manufacturing package.** XEMACS reports that the KiCad export passed all checks in JLCONE. The earlier timestamp observation did not establish that the Gerbers were stale: a later PCB save can occur without manufacturing changes. Keep the exact checked archive; re-export and recheck only after changes affecting copper, holes, mask, silkscreen or outline. The archive also contains optional `__MACOSX` metadata. The pass is user-reported; its report was not independently inspected.
4. **Confirm mechanical fit.** The rendered display overhangs the board and the regulator extends toward the edge. Check actual component dimensions and enclosure clearance. LDR and potentiometer models are absent from the populated render. Mounting holes remain planned for V2.1.
5. **Mark power polarity and check the QR.** The visible label says `5V IN`; add visible +5 V / GND pin identification if this will be connected by hand. J2 pin 1 is VDD and pin 2 is GND. Scan a print of the QR at the intended physical size before fabrication.
6. **Choose a license before inviting reuse.** No repository license file was found. The creator needs to choose the intended hardware/documentation/software licensing terms.

The BOM and CPL use the formats described in [JLCPCB's KiCad guide](https://jlcpcb.com/help/article/how-to-generate-bom-and-centroid-files-from-kicad-8) and [placement file guide](https://jlcpcb.com/help/article/pick-place-file-for-pcb-assembly). Matching designators and upload-time part verification follow [JLCPCB's preparation recommendations](https://jlcpcb.com/help/article/advice-for-bom-and-cpl-files-preparation).

No fabrication order, repository push or publication was performed during this review.
