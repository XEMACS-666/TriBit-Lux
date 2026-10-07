# TriBit Lux

TriBit Lux is a 3-bit flash ADC brightness indicator. An LDR produces the input voltage; a comparator bank divides that voltage into one of eight levels, and the output is shown on a seven-segment display. The project began as a TinkerCAD simulation and grew through breadboard prototypes into a compact KiCad PCB design.

## Current status

Version 2.0 is the current PCB design. Its editable KiCad project is in [`Version_2.0/TriBitLux_V2_0/`](Version_2.0/TriBitLux_V2_0/), with manufacturing outputs and BOM/CPL exports in `Version_2.0/`. The board has not yet been fabricated.

## Version history

| Version | Build and change |
| --- | --- |
| [V0.0](Version_0.0/) | TinkerCAD simulation using a potentiometer in place of the LDR. An Arduino Uno reads the comparator outputs and drives the seven-segment display in software. |
| [V0.1](Version_0.1/) | TinkerCAD simulation updated to use an LDR and LM339 comparators. The Uno still handles the priority-encoding and seven-segment display logic in software. |
| [V1.0](Version_1.0/) | First breadboard build: an LDR and two LM339s provide comparator outputs, which the Arduino Nano reads and uses to drive the seven-segment display. |
| [V1.1](Version_1.1/) | Added a 74F148 priority encoder to the breadboard circuit. The Nano reads its 3-bit output and drives the seven-segment display. |
| [V1.2](Version_1.2/) | Added a 74LS48 so the display decoding is handled in hardware. The 74LS48 drives the physical display; the Nano reads the binary inputs and prints the three bits to the serial console as a check. |
| [V1.3](Version_1.3/) | Added a 16×2 I2C LCD for voltage and brightness readout. The Nano supplies 5 V and now has a display/monitoring role in the build. |
| [V2.0](Version_2.0/) | KiCad through-hole PCB design for a more compact build. The design enlarges the LDR opening to 20 mm, uses a potentiometer to adjust light sensitivity, and adds a 0.1 µF capacitor for IC protection. Awaiting fabrication. |

## How to browse the files

- **V0.0:** [TinkerCAD simulation](Version_0.0/link), [simulation image](Version_0.0/Tribit%20Lux%20V0.0.png), [schematic PDF](Version_0.0/Tribit%20Lux%20V0.0.pdf), [Arduino sketch](Version_0.0/tribit_lux_v0_00.ino), and [BOM](Version_0.0/bom.csv).
- **V0.1:** [TinkerCAD simulation](Version_0.1/link), [simulation image](Version_0.1/Tribit%20Lux%20V0.1.png), [schematic PDF](Version_0.1/Tribit%20Lux%20V0.1.pdf), [Arduino sketch](Version_0.1/tribit_lux_v0_01.ino), and [BOM](Version_0.1/bom.csv).
- **V1.0:** [breadboard video](Version_1.0/TriBitLux_V1_0%202026-10-06%20at%2023.10.18.mp4), [seven-segment pin visualizer](Version_1.0/TriBitLux_V1_0_pin_visualizer.html), and [serial seven-segment visualizer sketch](Version_1.0/TriBitLux_V1_0_visualizer.ino). The visualizer sketch is a learning/debug aid, not the complete V1.0 firmware.
- **V1.1:** [schematic PDF](Version_1.1/Schematic_TriBitLux_V1_1-LIC_2026-10-06.pdf), [PCB PDF](Version_1.1/PCB_PCB_TriBitLux_V1_1-LIC_2_2026-10-06.pdf), [BOM](Version_1.1/BOM_TriBitLux_V1_1-LIC_2026-10-06.csv), [top board SVG](Version_1.1/TriBitLux_V1_1%20Top.svg), [bottom board SVG](Version_1.1/TriBitLux_V1_1%20Bottom.svg), [prototype photo](Version_1.1/TriBitLux_V1_1.jpeg), and [Gerber archive](Version_1.1/Gerber_TriBitLux_V1_1-LIC_PCB_TriBitLux_V1_1-LIC_2_2026-10-06.zip).
- **V1.2:** [prototype photo 1](Version_1.2/TriBitLux_V1_2_135115.jpg), [photo 2](Version_1.2/TriBitLux_V1_2_135217.jpg), [photo 3](Version_1.2/TriBitLux_V1_2_140313.jpg), [Nano serial-monitor sketch](Version_1.2/TriBitLux_V1_2_LIC.ino), and [video](Version_1.2/TriBitLux_V1_2_0732.mov). The 74LS48 drives the physical seven-segment display; the Nano reads the three binary inputs and prints them to the serial console for verification. The sketch also contains seven-segment output code, but that is not the display path used in the photographed V1.2 build.
- **V1.3:** [photo 1](Version_1.3/TriBitLux_V1_3%20%281%29.jpg), [photo 2](Version_1.3/TriBitLux_V1_3%20%282%29.jpg), [LCD visualization](Version_1.3/TriBitLux_V1_3.html), and [LCD sketch](Version_1.3/TriBitLux_V1_3.ino). The sketch reads the LDR voltage with the Nano's analog input and calculates the displayed level in software; it does not read the 74F148 outputs.
- **V2.0:** Editable [KiCad project](Version_2.0/TriBitLux_V2_0/TriBitLux_V2_0.kicad_pro), [schematic](Version_2.0/TriBitLux_V2_0/TriBitLux_V2_0.kicad_sch), and [PCB](Version_2.0/TriBitLux_V2_0/TriBitLux_V2_0.kicad_pcb); [schematic PDF](Version_2.0/Schematic.pdf); [Gerber and drill outputs](Version_2.0/); [JLCPCB BOM](Version_2.0/Placement%20%26%20BOM/JLPCB/TriBitLux_V2_0_JLCPCB_BOM.csv); and [JLCPCB CPL](Version_2.0/Placement%20%26%20BOM/JLPCB/TriBitLux_V2_0_JLCPCB_CPL.csv).
- [`Others/`](Others/) contains additional component references, datasheets, and media that have not yet been assigned to a version.

## Notes

Some older KiCad backup archives and supporting component files still use “PhotoDiode” in their filenames. The sensor used in this project is an LDR (photoresistor). The HTML and SVG visuals help explain the project but do not replace the editable circuit-design sources.