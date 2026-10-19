# Supplier candidates — pending final selection

Research date: 19 October 2026. These are candidates, not an approved purchasing list. No PCB changes or supplier-code assignments were made in this pass.

| References | Candidate | Evidence and remaining check |
|---|---|---|
| C1–C5 | [SHM DCS104Z26Y5VFEFJ5A0 / C2896075](https://jlcpcb.com/partdetail/SHM-DCS104Z26Y5VFEFJ5A0/C2896075) | Catalog lists 100 nF, 50 V, 5 mm diameter and 5 mm lead pitch. Verify body thickness, lead diameter and suitability for the regulator input. Previous C254085 is listed as 6 mm diameter / 5.08 mm pitch, so is not an exact match to the current footprint dimensions. |
| RV1 | [BOCHEN RM065-103(10K) / C5205021](https://jlcpcb.com/partdetail/RM065-103%2810K%29/C5205021) | 10 kΩ RM065 candidate. Compare the manufacturer's pin spacing, pin numbering and wiper assignment with the Runtron footprint before approval. |
| R9 | [GL20528 / C779581](https://jlcpcb.com/partdetail/830709-GL20528/C779581) | Catalog confirms 15.5 mm lead pitch; better aligned with the current board than the old 17.5 mm footprint. Verify full mechanical drawing and desired resistance/light-response range. |
| C6 | [HRK 50V2.2uF CD110 / C2960206](https://jlcpcb.com/partdetail/HRK-50V2_2uFCD110/C2960206) | 2.2 µF, 50 V, 5 mm diameter, 2 mm pitch, 11 mm height. Mechanical/value candidate; regulator output-capacitor stability/ESR requirements still require verification. |
| U6 | SPX2920U-3.3, TO-220 | No exact JLCPCB listing confirmed in this search. Do not substitute an arbitrary 3.3 V TO-220 regulator: pin assignment and output-capacitor requirements must match. |

Whether this becomes a JLCPCB assembly list or a hand-soldering shopping list depends on the intended assembly route. The existing production-format BOM retains blank codes for these unresolved selections.
