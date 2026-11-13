// Curated against README.md, the version sources, and the verified inventory.
const media = (path, caption, extra = {}) => ({ path, caption, ...extra });
const asset = (v, name, caption, extra) => media(`Version_${v}/assets/${name}`, caption, extra);
export const versions = [
  { id: '0.0', title: 'Starting with a knob', short: 'The first simulation', stage: 'TinkerCAD simulation',
    objective: 'Prove the voltage-to-level idea before adding a light sensor.',
    changes: 'A potentiometer feeds the comparator circuit. The Arduino Uno performs priority encoding and drives the seven-segment display.',
    challenge: 'Establishing eight voltage bands and the corresponding segment patterns in simulation.',
    outcome: 'The first simulated conversion from an adjustable voltage to a displayed level.',
    note: 'Simulation record; no physical build is documented for this version.',
    gallery: [asset('0.0','Tribit Lux V0.0.png','Potentiometer-driven TinkerCAD circuit · simulation')]
  },
  { id: '0.1', title: 'Let there be light', short: 'The sensor arrives', stage: 'TinkerCAD simulation',
    objective: 'Make illumination the input to the experiment.',
    changes: 'An LDR replaces the potentiometer input and LM339 devices form the comparator bank. The Uno still handles encoding and display decoding.',
    challenge: 'Translating a light-dependent resistance into a useful input voltage.',
    outcome: 'The simulated circuit responds to light, with firmware and a schematic saved alongside it.',
    note: 'The saved image is a simulation screenshot, not a hardware photograph.',
    gallery: [asset('0.1','Tribit Lux V0.1.png','LDR and LM339 TinkerCAD circuit · simulation')]
  },
  { id: '1.0', title: 'Out of the simulator', short: 'The first breadboard', stage: 'Physical breadboard',
    objective: 'Move the light sensor and comparator front end onto real hardware.',
    changes: 'Two LM339s and an Arduino Nano form the first breadboard build. The Nano reads the comparator states and drives the display.',
    challenge: 'Managing jumper connections and checking seven-segment pin assignments.',
    outcome: 'A 24-second recording documents the physical prototype; a separate pin visualizer supports debugging.',
    note: 'The saved visualizer sketch is a debugging aid, not the complete original display firmware.',
    gallery: [asset('1.0','TriBitLux_V1_0 2026-10-06 at 23.10.18.mp4','First breadboard demonstration · 24 seconds, silent', {kind:'video',poster:'docs/media/v1-0-breadboard-video.jpg'}),
      asset('1.0','TriBitLux_pin_visualizer_demo_dark.gif','Animated seven-segment pin guide · historical demonstration')]
  },
  { id:'1.1', title:'An encoder of its own', short:'Hardware priority encoding', stage:'Breadboard + EasyEDA design',
    objective:'Transfer priority encoding from software to a dedicated logic IC.',
    changes:'The 74F148 encodes the comparator states. The Nano reads the three bits and continues to drive the display. EasyEDA schematic and PCB exports are preserved.',
    challenge:'Following the active-LOW encoder signals through the breadboard and display code.',
    outcome:'Photographs document the breadboard; separate renders and layer files document an EasyEDA board design.',
    note:'The blue board render is a CAD design, not evidence of a fabricated PCB.',
    gallery:[...['3132','3134','3135','3136'].map((n,i)=>media(`docs/media/v1-1-${n}.png`,['Schematic alongside the breadboard','Breadboard displaying level 2','Hardware and serial monitoring','The workbench from another angle'][i])),
      asset('1.1','TriBit_Lux_V1_1.png','EasyEDA schematic'),asset('1.1','PCB_PCB_TriBit_Version_1_1-LIC_2_2026-10-08.png','EasyEDA copper routing'),
      media('Version_1.1/pcb/TriBitLux_V1_1.jpeg','EasyEDA board render with Nano · not fabricated'),
      asset('1.1','TriBitLux_V1_1_Top.png','Top board-view export'),asset('1.1','TriBitLux_V1_1_Bottom.png','Bottom board-view export')]
  },
  { id:'1.2', title:'The display goes hardware', short:'Hardware display decoding', stage:'Physical breadboard',
    objective:'Complete the dedicated hardware path from comparators to display.',
    changes:'The 74LS48 takes over display decoding. The Nano supplies power and reads the encoder bits for serial monitoring.',
    challenge:'Checking the wiring and observing the encoder output while the decoder drives the display.',
    outcome:'Five photographs preserve the wired prototype and its powered display states.',
    note:'The saved sketch includes experimental segment-driving code. In this build, the 74LS48 drives the display. The last two photos use existing JPEG previews of HEIC originals.',
    gallery:['135115','135217','140313','0733','0734'].map((n,i)=>media(`docs/media/v1-2-${n}.jpg`,['Overhead wiring view','LDR and jumper connections','Powered hardware display','Powered build · HEIC preview 0733','Powered build · HEIC preview 0734'][i], i<3?{full:`Version_1.2/assets/TriBitLux_V1_2_${n}.jpg`}:{}))
  },
  { id:'1.3', title:'A window into the voltage', short:'LCD monitoring', stage:'Physical breadboard',
    objective:'Make the input voltage visible alongside the hardware level display.',
    changes:'A 16×2 I²C LCD joins the build. The Nano samples the LDR voltage using its own ADC and computes a separate LCD level.',
    challenge:'Keeping the LCD’s software-derived reading distinct from the comparator and encoder path.',
    outcome:'Two build photographs and separate 5 V / 3.3 V interactive demonstrations document the monitoring experiment.',
    note:'The LCD firmware does not read encoder bits. These historical demos do not describe V2.1’s 2.5 V reference.',
    gallery:[asset('1.3','TriBitLux_V1_3_(1).jpg','LCD-equipped breadboard with seven-segment display'),asset('1.3','TriBitLux_V1_3_(2).jpg','Second view of the LCD build'),asset('1.3','TriBitLux_5V_demo_dark.gif','Historical 5 V LCD demonstration')]
  },
  { id:'2.0',title:'From jumpers to copper',short:'Through-hole PCB',stage:'KiCad design · unfabricated',
    objective:'Translate the breadboard connections into an editable through-hole board.',
    changes:'KiCad brings together the LDR, sensitivity potentiometer, comparators, 74LS148 and 74LS48. Logic uses 5 V; the sensor and reference ladder use 3.3 V.',
    challenge:'Component footprints, placement, decoupling and routing now become part of the engineering work.',
    outcome:'Saved schematic, PCB, parts lists, placement files and a Gerber snapshot. The 19 October review reports zero configured DRC / ERC violations.',
    note:'Not fabricated. Some DRC checks are disabled; a clean report is not supplier approval. LDR and potentiometer 3D models are absent from the populated render.',
    gallery:[asset('2.0','TriBitLux_V2_0_Top_Components.png','Populated top · CAD render'),asset('2.0','TriBitLux_V2_0_Top.png','Top · silkscreen and placement'),asset('2.0','TriBitLux_V2_0_Bottom.png','Back · through-hole pads'),asset('2.0','TriBitLux_V2_0.png','Layout · both copper layers'),asset('2.0','TriBitLux_V2_0.svg','Current schematic · scalable SVG'),asset('2.0','TriBit_Lux_V2_0_Schematics.png','Earlier schematic PNG · archival snapshot')]
  },
  { id:'2.1',title:'Smaller board. Clearer feedback.',short:'The current hybrid design',stage:'KiCad design · unfabricated',
    objective:'Fit the circuit into a compact board and make every threshold crossing visible.',
    changes:'An 80 × 41 mm THT + SMT layout, TL431-based 2.5 V reference, seven cumulative LEDs, 74HCT244 buffer and four mounting holes.',
    challenge:'Combining the logic path with the LED buffer and preparing the SMT assembly files. Supplier orientation and physical validation remain open.',
    outcome:'56 electrical parts: 39 SMT and 17 through-hole, verified from the current BOM. The README records zero DRC errors and 57 remaining warnings on 30 October.',
    note:'Not fabricated or bench-tested. Saved renders predate the final label-alignment pass. The existing Gerber ZIP is historical and must be regenerated before ordering.',
    gallery:[asset('2.1','TriBitLux_V2_1_Top.png','Populated top · CAD render by XEMACS'),asset('2.1','TriBitLux_V2_1_Top(Non-Populated).png','Front · labels and placement'),asset('2.1','TriBitLux_V2_1_Bottom.png','Back · threshold guide and repository QR'),asset('2.1','TriBitLux_V2_1_Layout.png','Layout · copper routing and placement'),asset('2.1','Schematic.png','V2.1 circuit schematic',{full:'Version_2.1/schematic/TriBitLux_V2_1.svg'})]
  }
];
export const pcbViews = {
  '2.1': [{label:'Populated',index:0},{label:'Front',index:1},{label:'Back',index:2},{label:'Copper / layout',index:3},{label:'Schematic',index:4}],
  '2.0': [{label:'Populated',index:0},{label:'Front',index:1},{label:'Back',index:2},{label:'Copper / layout',index:3},{label:'Schematic',index:4}]
};
