// TLGO pilot plant — P100 production line. One board, one camera, keyed to T.
const C = {
  bg: '#f2f2f3', text: '#1d1f20', div: 'rgba(29,31,32,0.16)', line: 'rgba(29,31,32,0.55)',
  a: '#5980a6', a2: '#d6ebff', a3: '#b5d9fd', a4: '#94bce3', a7: '#416180', a9: '#1d2d3d',
  n4: '#b7b7ba', n6: '#7a7a7d', n7: '#5d5d60',
};
const HF = '"Barlow Condensed", system-ui, sans-serif';
const BF = '"Barlow", system-ui, sans-serif';
const MOTION = { enter: Easing.easeOutCubic, move: Easing.easeInOutCubic, pop: Easing.easeOutBack };
const prog = (T, a, b, e = MOTION.enter) => e(clamp((T - a) / Math.max(b - a, 0.001), 0, 1));
const lerp = (a, b, p) => a + (b - a) * p;
const hx = (h) => h[0] === '#' ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).map(Number);
const hx2 = (h) => h[0] === '#' ? h : '#' + hx(h).map((v) => v.toString(16).padStart(2, '0')).join('');
const mix = (a, b, p) => { const A = hx(a), B = hx(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',') + ')'; };

function chem(s) {
  s = String(s);
  const out = [], re = /([A-Za-z)])(\d{1,2})(?!\d)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(s))) {
    out.push(s.slice(last, m.index + 1));
    out.push(<sub key={k++} style={{ fontSize: '0.68em', verticalAlign: '-0.22em', lineHeight: 0 }}>{m[2]}</sub>);
    last = m.index + m[0].length;
  }
  out.push(s.slice(last));
  return out;
}

const SECTIONS = [
  { name: 'Synthesis', from: 0, to: 5 },
  { name: 'Washing & drying', from: 6, to: 10 },
  { name: 'Mixing & doping · BCK-KOH', from: 11, to: 14 },
  { name: 'Packaging', from: 15, to: 15 },
];
const STATIONS = [
  { key: 'PreG', struct: 'preg', adds: [['Graphite', 's'], ['K2S2O8', 's'], ['P2O5', 's'], ['H2SO4', 'l']], title: 'Pre-G reactor', vessel: 'reactor', feed: [['Graphite', ''], ['K2S2O8', ''], ['P2O5', ''], ['H2SO4', '']],
    read: ['Outlet pH', '< 0'], out: 'Pre-G + acid solution', color: '#2b2b2d', level: 0.5,
    cap: 'Graphite pre-oxidized with K2S2O8 and P2O5 in sulfuric acid.' },
  { key: 'Fix1', struct: 'preg', adds: [['RO water', 'w', 0.2, 1.6]], title: 'Fixing tank', vessel: 'tank', feed: [['RO water', '≈ 2,326 L'], ['Settle', 'overnight']],
    read: ['Outlet pH', '< 0'], out: 'Pre-G slurry', color: '#3a3a3d', level: 0.72,
    seq: [['Fill with water', 0.2], ['Transfer Pre-G', 0.9], ['Settle overnight', 2.2], ['Decant · check pH', 3.6]],
    ph: { settle: [2.2, 3.4], decant: [3.6, 4.8] },
    caps: [[0.4, 'The Pre-G slurry is pumped into the water-filled fixing tank, then rinsed through.'], [2.3, 'Settled overnight, decanted and pH checked; below pH 1, add water and repeat.']] },
  { key: 'Press', struct: 'preg', adds: [['RO water', 'w']], title: 'Filter press', vessel: 'press', feed: [['RO water', 'pH ≈ 6']],
    read: ['Outlet pH', '> 5'], sub: ['Solids', '≈ 80 wt %'], out: 'Wet Pre-G solids · ≈ 2 g/mL', side: 'Liquid −1 < pH < 5 → waste water tank', color: '#2b2b2d', level: 1,
    cap: 'The filter press separates wet Pre-G solids; acidic filtrate goes to waste treatment.' },
  { key: 'Dry', struct: 'preg', title: 'Plate drying · fume hood', vessel: 'hood', feed: [['Hot plate', '< 60 °C'], ['Fume hood', 'exhaust on']],
    read: ['Temp', '< 60 °C'], sub: ['QC', 'Sample 1'], qc: 1, out: 'Dry Pre-G powder · pH > 5', color: '#3d3d40', level: 0.35,
    cap: 'Wet Pre-G is spread on trays and dried on a hot plate below 60 °C inside a fume hood. QC sample 1 taken.' },
  { key: 'TLGO', struct: 'go', adds: [['H2SO4', 'l'], ['H3PO4', 'l'], ['KMnO4', 'o']], title: 'TLGO reactor', vessel: 'reactor', bath: '2ND OX REACTOR', feed: [['H2SO4', ''], ['H3PO4', ''], ['KMnO4', '']],
    read: ['Outlet pH', '< 0'], out: 'TLGO', color: '#4b3f2c', level: 0.55,
    cap: 'Second oxidation with H2SO4, H3PO4 and KMnO4 forms TLGO.' },
  { key: 'Fix2', struct: 'go', adds: [['RO water', 'w', 0.3, 2.0], ['H2O2 50 %', 'l', 0.9, 2.4], ['HCl 15 %', 'l', 7.4, 9.3]], title: 'Fixing tank', vessel: 'tank', feed: [['1 · H2O2 50 %, first', '≈ 10 L'], ['2 · HCl 15 %, after decant', '≈ 421 L']],
    read: ['Outlet pH', '> 1.1'], out: 'TLGO', color: '#c9a23a', level: 0.72,
    seq: [['H₂O₂ into water', 0.2], ['Transfer · < 40 °C', 1.5], ['Settle overnight', 3.6], ['Decant', 5.4], ['HCl acid wash', 7.4]],
    ph: { settle: [3.6, 5.2], decant: [5.4, 7.2], refill: [7.4, 9.4] },
    caps: [[0.4, 'First, 50 % H2O2 goes into the water-filled fixing tank.'], [1.8, 'The TLGO slurry is transferred in slowly, kept below 40 °C.'], [3.8, 'Left to settle overnight, then the clear layer is decanted.'], [7.4, 'Then 15 % HCl is added, about 10 % of the tank volume, as an acid wash to remove residual manganese and metal ions.']] },
  { key: 'Wash', struct: 'go', wash: true, adds: [['RO water', 'w', 0.3, 14.2]], title: 'Wash skid · TFF', vessel: 'tff', feed: [['RO water refill', 'each cycle']],
    read: ['Permeate pH', ''], out: 'Wet TLGO · 275 L at ≈ 1.1 wt %', side: 'Permeate → EQ tank', color: '#9a7a3a', level: 0.63,
    caps: [[0.4, 'TFF wash loop: filter the tank down, refill with RO water, repeat.'], [5.5, 'Batch A-1 washes 1 to 32: permeate pH climbs from 0.95 to 4.4 over about 41,000 L of water.'], [14.6, 'End of washing: 275 L of TLGO extracted at about 1.1 wt %.']] },
  { key: 'DMF', struct: 'go', adds: [['DMF', 'l']], title: 'DMF soak', vessel: 'reactor', bath: 'SEALED · 95 °C', feed: [['DMF : GO', '0.236 : 1'], ['Mix', '95 °C · 60 min']],
    read: ['Temp', '95 °C'], sub: ['Time', '60 min'], out: 'GO + DMF (nitrogen source)', color: '#7d5f3c', level: 0.62,
    cap: 'Washed GO soaks in DMF at 95 °C for an hour; DMF also brings in nitrogen for doping.' },
  { key: 'Sonic', struct: 'go', title: 'Flow-cell sonicator', vessel: 'sonic', feed: [['Frequency', '20 kHz'], ['Power', '30 %'], ['Flow', '2 L/min'], ['Energy', '50 J/mL']],
    read: ['Energy', '50 J/mL'], sub: ['Flow', '2 L/min'], out: 'Exfoliated GO dispersion', color: '#6e5536', level: 0.6,
    cap: 'A flow-cell sonicator at 20 kHz exfoliates the sheets: about 50 J/mL at 2 L/min.' },
  { key: 'MixB', struct: 'goB', adds: [['H3BO3', 's']], title: 'Boron mixer', vessel: 'reactor', bath: '250 L BARREL · 95 °C', feed: [['H3BO3 : GO', '0.2 : 1'], ['GO', '0.4 wt %']],
    read: ['Temp', '95 °C'], sub: ['Time', '4 h'], out: 'H₃BO₃:GO precursor', color: '#6e5536', level: 0.66,
    cap: 'Boric acid is dosed in at 0.2 to 1 with GO and stirred at 95 °C for four hours.' },
  { key: 'Spray', struct: 'goB', qc: 2, title: 'Spray dryer', vessel: 'spray', feed: [['Inlet', '145 °C'], ['Outlet', '80 °C'], ['Fan', '45 %']],
    read: ['Inlet', '145 °C'], sub: ['QC', 'Sample 2'], out: 'Dry H₃BO₃:GO powder', side: 'DMF → waste', color: '#6e5536', level: 0.7,
    cap: 'Spray dried at 145 °C inlet and 80 °C outlet to a dry precursor powder. QC sample 2 taken.' },
  { key: 'Furnace1', struct: 'bc', qc: 3, title: 'Continuous furnace 1', vessel: 'furnace', label: 'CONTINUOUS FURNACE 1 · 1,000 °C', feed: [['Argon', '5 SLPM'], ['Feed', '3.9 g/min'], ['Zones', '300/600/900 °C']],
    read: ['Temp', '1,000 °C'], live: { t: 1000 }, sub: ['QC', 'Sample 3'], out: 'BC · B, N-doped graphene', color: '#2b2b2d', level: 1,
    cap: 'First pyrolysis: continuous furnace to 1,000 °C under argon at about 3.9 g/min; boron and nitrogen enter the lattice. QC sample 3.' },
  { key: 'MixK', struct: 'bcK', adds: [['KOH 85 %', 's'], ['Water', 'w']], title: 'KOH mixer', vessel: 'reactor', bath: 'MIX 70 °C → OVEN DRY', feed: [['KOH : BC', '0.25 : 1'], ['Water', '144 L']],
    read: ['Temp', '70 °C'], sub: ['Oven dry', '70 °C · 96 h'], out: 'KOH:BC precursor', color: '#3a3a3d', level: 0.5,
    cap: 'KOH is wet-mixed with BC at 0.25 to 1 and 70 °C for an hour, then oven dried for about 96 hours.' },
  { key: 'Furnace2', struct: 'bck', title: 'Furnace 2', vessel: 'furnace', label: 'HOPPER → FURNACE 2 · 850 °C', inert: true, feed: [['Argon', '5 SLPM'], ['Feed', '≈ 2.3 g/min'], ['Zones', '300/600/750 °C']],
    read: ['Temp', '850 °C'], sub: ['O₂ · unload', '< 20 ppm'], live: { t: 850, o2: true }, out: 'BCK powder', color: '#2b2b2d', level: 1,
    cap: 'Second pyrolysis: 850 °C under argon for about 30 minutes activates the carbon and decorates it with potassium.' },
  { key: 'Compact', struct: 'bck', adds: [['Argon gas', 'g']], title: 'Pelletize', vessel: 'compactor', inert: true, feed: [['Pellet', '1 ± 0.3 g'], ['Atmosphere', 'inert']],
    read: ['H2O', '< 10 ppm'], sub: ['O₂', '< 20 ppm'], live: { o2: true }, out: 'P100 pellets', color: '#2b2b2d', level: 0.6,
    cap: 'Pressed into 1 g pellets under inert atmosphere, with H2O below 10 ppm.' },
  { key: 'Glove', struct: 'bck', qc: 4, adds: [['Tank parts', 's'], ['Bottle top assembly', 's']], title: 'Tank fill & outgas', vessel: 'glovebox', feed: [['Outgas', '100 °C · HV'], ['Time', '10 h']],
    read: ['Outgas', '100 °C'], sub: ['QC', 'Sample 4'], out: 'P100 tank', color: '#2b2b2d', level: 0.7,
    cap: 'Pellets are loaded into the tank, leak tested and outgassed at 100 °C under vacuum for 10 hours. QC sample 4.' },
];
const ADD_COL = { s: '#7a7a7d', l: '#5980a6', w: '#94bce3', o: '#4a3a5a', g: '#94bce3' };
// Chemical inlets in vessel-local coords: side entries through the left wall, or top entries.
// Every chemical header runs in from the frame's left edge above the vessel and drops in from the top.
function addPos(st, k) {
  const v = st.vessel, hy = 440 + k * 30;
  if (v === 'press') return { hy, lx: 230, ly: 104 };
  if (v === 'glovebox') return { hy, lx: [230, 180][k], ly: 70 };
  if (v === 'compactor') return { hy, lx: 108, ly: 30 };
  if (v === 'tff') return { hy, lx: 60, ly: 40 };
  return { hy, lx: [126, 106, 86, 72][k], ly: v === 'tank' ? 40 : 56 };
}
// TLGO A1 washing — [initial level %, final level %, total water L, permeate pH] per wash (BATCH003 record)
const WASH_A1 = [[63,38,700,0.95],[83,13,1960,1.14],[80,13,1876,1.54],[80,15.51,3681.72,1.74],[81.15,2.08,5895.68,1.94],[81.08,9.59,7897.4,2.28],[74,5,9829.4,2.52],[67,6.08,11535.16,2.74],[66.54,34.92,12420.52,3.27],[64.85,31.7,13348.72,3.25],[66.01,35.57,14201.04,3.32],[65.58,10.55,15741.88,3.17],[67.04,34.07,16665.04,3.5],[80,10,18625.04,3.2],[66.01,40.65,19335.12,3.67],[81.61,15.54,21185.08,3.46],[67.17,29,22253.84,3.65],[65.5,35.99,23080.12,3.85],[64.85,28.23,24105.48,3.26],[85.14,6.56,26305.72,3.45],[59.49,0,27971.44,2.88],[33,2.81,28816.76,3.11],[30.18,4.95,29523.2,3.8],[30.56,1,30350.88,3.26],[23.48,0,31008.32,3.4],[23,2,31596.32,3.89],[50,8,32772.32,3.5],[80,12,34676.32,3.3],[67,12,36216.32,3.8],[80,2,38400.32,3.7],[55,7.94,39718,4.13],[40,0,40838,4.4]];
const W_T0 = 0.9, W_DT = 0.42;
function washState(T, c) {
  const u = (T - (c + W_T0)) / W_DT, N = WASH_A1.length;
  if (u < 0) return { n: -1, f: 0, level: null, filtering: false, pH: null, water: 0 };
  const n = Math.min(Math.floor(u), N - 1), f = u >= N ? 1 : u - Math.floor(u);
  const [a, b] = WASH_A1[n], nx = n < N - 1 ? WASH_A1[n + 1][0] : 12;
  const lv = f < 0.75 ? lerp(a, b, f / 0.75) : lerp(b, nx, (f - 0.75) / 0.25);
  const done = u >= N;
  return { n, f, done, level: (done ? 12 : lv) / 100, filtering: !done && f < 0.75, pH: WASH_A1[n][3], water: lerp(n ? WASH_A1[n - 1][2] : 0, WASH_A1[n][2], clamp(f / 0.75, 0, 1)) };
}
function WashChart({ T, c, x }) {
  const ws = washState(T, c), W = 470, H = 104, ox = 50, oy = 22;
  const px = (w) => ox + w / 42000 * W, py = (p) => oy + H - p / 5 * H;
  const shown = WASH_A1.filter((_, k) => k < ws.n || (k === ws.n && ws.f > 0.7) || ws.done);
  return (
    <div style={{ position: 'absolute', left: x - 270, top: 1150, width: 540, height: 150, borderTop: '1px solid ' + C.div }}>
      <svg width="540" height="150" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <text x="0" y="18" style={{ font: '500 18px ' + BF, letterSpacing: '0.12em', fill: C.n7 }}>PERMEATE pH VS TOTAL WATER · TLGO A1</text>
        {[0, 1, 2, 3, 4, 5].map((p) => <g key={p}><line x1={ox} y1={py(p)} x2={ox + W} y2={py(p)} stroke={C.div} strokeWidth="1" /><text x={ox - 8} y={py(p) + 5} textAnchor="end" style={{ font: '500 14px ' + BF, fill: C.n7 }}>{p}</text></g>)}
        {[0, 10000, 20000, 30000, 40000].map((w) => <text key={w} x={px(w)} y={oy + H + 18} textAnchor="middle" style={{ font: '500 14px ' + BF, fill: C.n7 }}>{w ? (w / 1000) + 'k L' : '0'}</text>)}
        <line x1={ox} y1={oy} x2={ox} y2={oy + H} stroke={C.line} strokeWidth="1.2" />
        <line x1={ox} y1={oy + H} x2={ox + W} y2={oy + H} stroke={C.line} strokeWidth="1.2" />
        {shown.map((d, k) => <circle key={k} cx={px(d[2])} cy={py(d[3])} r={k === shown.length - 1 && !ws.done ? 6 : 4} fill={k === shown.length - 1 && !ws.done ? C.a7 : C.a} />)}
      </svg>
    </div>
  );
}
const SEC_OF = (i) => SECTIONS.findIndex((s) => i >= s.from && i <= s.to);
// Colour change waits until the chemicals have arrived (cause, then effect).
const colProg = (st, T, c) => st.adds ? prog(T, c + 1.6, c + 3.0, MOTION.move) : prog(T, c + 1.0, c + 2.6, MOTION.move);
// Authored time → playhead time, honouring per-scene retiming in OM_SCENES.
function toWall(Ta) {
  let sc = []; try { sc = JSON.parse(window.OM_SCENES); } catch (e) {}
  let p = 0, a = 0;
  for (const x of sc) { const nat = x.nat > 0 ? x.nat : x.dur; if (Ta < a + nat) return p + (Ta - a) * x.dur / nat; p += x.dur; a += nat; }
  return p;
}
const HZ = {
  splash: { sign: 'W023', tag: 'Corrosive splash', title: 'Acid or oxidizer splash',
    hz: 'Acid or oxidizer splash during charging, sampling or hose disconnection: skin and eye burns.',
    pv: 'Closed, compatible transfer and containment; splash protection; accessible eyewash and shower; training on the current SDS and line-opening procedure.',
    rs: 'Stop work, alert the supervisor, use emergency washing and first aid per the substance procedure; get medical help.',
    rg: 'OHSR 5.2 · WHMIS 5.3–5.18 · emergency washing 5.85–5.96 · PPE Part 8 · first aid 3.16–3.20' },
  runaway: { sign: 'W002', tag: 'Runaway reaction', title: 'Runaway, gas or overpressure',
    hz: 'Reaction runaway, gas evolution or overpressure from excess addition, contamination, or loss of cooling or agitation.',
    pv: 'Validate the recipe’s thermal and gas basis; approve dosing and limits; verify cooling, alarms and trips, and the relief/vent route.',
    rs: 'Raise the alarm; use only the approved remote safe-state action if safe; evacuate and call emergency services. Never improvise a quench.',
    rg: 'OHSR 5.2 and 5.97–5.104 · startup 4.10–4.11' },
  incompat: { sign: 'W001', tag: 'Incompatibles', title: 'Wrong chemical or incompatible mix',
    hz: 'Wrong chemical, concentration or addition order; incompatible storage or waste mixing.',
    pv: 'Verify identity and recipe revision; segregate incompatible materials, drains and wastes; use a compatibility matrix and labelled containers.',
    rs: 'Stop the transfer, keep people clear, notify the supervisor; activate the chemical-emergency plan if a reaction or release occurs. No improvised neutralization.',
    rg: 'OHSR 5.2 · 5.3–5.18 · storage 5.20–5.26 · emergency planning 5.97–5.104' },
  pressure: { sign: 'W001', tag: 'Stored pressure', title: 'Residual pressure on opening',
    hz: 'Residual pressure or hot, corrosive liquid when opening TFF, filter, pump or tank lines.',
    pv: 'Isolate all energy; verify depressurized, drained and at a safe temperature; use rated hoses and guarded connections.',
    rs: 'Stop and withdraw from a leak or unexpected pressure; restrict access. Reopen only when a competent person confirms a safe state.',
    rg: 'OHSR Part 10, esp. 10.3–10.6 · 5.2 · machinery safeguards 12.2' },
  inhal: { sign: 'W001', tag: 'Inhalation', title: 'Mist, aerosol or nanopowder inhalation',
    hz: 'Inhaling acid mist, manganese aerosol or nanoscale GO/rGO powder.',
    pv: 'Assess actual exposure; enclose transfers and capture at source; verify ventilation and safe cleaning; respiratory program where required.',
    rs: 'Stop the task and leave the area; notify the supervisor; first aid for symptoms. Investigate before restart.',
    rg: 'OHSR 5.48–5.58 · ventilation 5.60–5.71 · respiratory protection Part 8' },
  dmf: { sign: 'W016', tag: 'DMF exposure', title: 'DMF exposure or fire (proposed change)',
    hz: 'DMF inhalation and skin absorption; reproductive/developmental toxin; flammable.',
    pv: 'Complete change review and substitution assessment; closed handling, verified ventilation, gloves chosen from permeation data, ignition control.',
    rs: 'Stop work and move away; follow SDS-specific decontamination and first aid. Cleanup by trained responders only.',
    rg: 'OHSR 5.2 · 5.48–5.58 incl. 5.57 · 5.27–5.35 · Part 8 · 5.97–5.104' },
  koh: { sign: 'W023', tag: 'KOH · heat', title: 'KOH contact or heat release (proposed change)',
    hz: 'Corrosive KOH contact, or heat released while it is being prepared.',
    pv: 'Approve concentration, order of addition and cooling from route data; compatible equipment, containment and splash protection.',
    rs: 'Stop; immediate emergency washing and first aid for contact; alarm and withdraw if the reaction runs away.',
    rg: 'OHSR 5.2 · WHMIS 5.3–5.18 · 5.85–5.96 · Part 8 · 5.97–5.104' },
  dust: { sign: 'W021', tag: 'Dust · fire', title: 'Powder decomposition, fire or dust explosion',
    hz: 'Dryer or powder thermal decomposition, self-heating, fire or dust explosion.',
    pv: 'Test representative material and deposits; approved thermal limits, capture and cleaning, and any ignition/explosion protection. Inerting alone does not prevent decomposition.',
    rs: 'Alarm and evacuate; approved remote shutdown only if safe. Specialist responders choose the firefighting media.',
    rg: 'OHSR 5.2 · 5.81 combustible dust · 5.27–5.35 · 5.97–5.104 · dust amendments from 4 Jan 2027' },
  furnace: { sign: 'W017', tag: 'Hot off-gas', title: 'Furnace blockage, gas or hot discharge',
    hz: 'Furnace blockage, gas build-up, pressure excursion, air ingress or hot discharge.',
    pv: 'Verify receiver capacity, off-gas route, pressure protection, inert-gas controls, temperature monitoring and residue handling.',
    rs: 'Alarm and keep clear; follow the approved safe-state and evacuation procedure. Never open or clear a hot, pressurized system.',
    rg: 'OHSR 5.2 · 4.10–4.11 · 5.97–5.104 · Part 10 for maintenance' },
  o2: { sign: 'W029', tag: 'O₂ deficiency', title: 'Argon leak and oxygen deficiency',
    hz: 'Argon or nitrogen leak displacing oxygen; collapse in a room, pit or enclosure.',
    pv: 'Assess credible releases; ventilation, O₂ detection and alarms; secure cylinders and maintain regulators.',
    rs: 'Evacuate on alarm and prevent entry; call the planned rescue. No unprotected rescue: filter respirators do not supply oxygen.',
    rg: 'OHSR 5.56 · compressed gases 5.36–5.47 · 4.13–4.16 · Part 9 if a confined space' },
  utility: { sign: 'W001', tag: 'Utility loss', title: 'Loss of power, cooling or inert gas',
    hz: 'Loss of power, cooling, exhaust, controls or inert gas during a batch.',
    pv: 'Define failure consequences and a validated safe-state sequence; verify essential services, alarms and handover.',
    rs: 'Put the process in its approved safe state if safe; alarm or evacuate as required. Restart only after correction and authorization.',
    rg: 'OHSR 4.10–4.11 · 5.2 · 5.97–5.104' },
  pinch: { sign: 'W024', tag: 'Pinch point', title: 'Moving machinery',
    hz: 'Moving mixers, presses, atomizers or conveyors: entanglement and crush injury.',
    pv: 'Keep guards and interlocks; control access; isolate and verify energy before cleaning, jam removal or maintenance.',
    rs: 'Use the emergency stop if safe; call first aid. Never enter machinery or remove guards for rescue without isolation.',
    rg: 'OHSR 12.2 and Part 12 · lockout 10.3–10.6 · first aid 3.16–3.20' },
  confined: { sign: 'W001', tag: 'Confined space', title: 'Confined-space entry',
    hz: 'Entry into tanks or vessels: oxygen deficiency, toxic atmosphere or engulfment.',
    pv: 'Identify spaces and prevent unauthorized entry; where entry is needed, a program with assessment, isolation, testing, standby and rescue.',
    rs: 'Raise the alarm and use the rescue plan. Stop colleagues or bystanders from entering unprotected.',
    rg: 'OHSR Part 9 · 4.13–4.16 · Part 10 for isolation' },
  lifting: { sign: 'W015', tag: 'Falls · lifting', title: 'Falls, loads and manual handling',
    hz: 'Falls, dropped loads, forklift collisions, slips or manual-handling strain.',
    pv: 'Dry, clear routes; pedestrian separation; rated lifting gear; stable storage; fall protection and handling aids.',
    rs: 'Stop traffic or lifting and secure the area; first aid; planned rescue for a suspended or inaccessible worker.',
    rg: 'OHSR 4.39–4.45 · ergonomics 4.46–4.53 · Parts 11, 13–16' },
  noise: { sign: 'W001', tag: 'Noise · heat', title: 'Noise and heat stress',
    hz: 'Sonicator or machinery noise; heat stress near dryers and furnaces.',
    pv: 'Assess noise and heat; enclosure, separation, maintenance, work/rest cycles and hearing protection as assessed.',
    rs: 'Stop the exposure and move to a safe area; first aid for symptoms. Fix controls before returning.',
    rg: 'OHSR Part 7 · Part 8 for PPE' },
  alone: { sign: 'W001', tag: 'Working alone', title: 'Working alone or after hours',
    hz: 'Working alone, after hours or on unfamiliar tasks: delayed help or wrong response.',
    pv: 'Define permitted tasks and staffing; assess competence; documented check-ins, failed-contact response and shift handover.',
    rs: 'Report a missed check or unsafe condition at once; activate the response. Stop disputed unsafe work and use the refusal process.',
    rg: 'OHSR 4.20.1–4.23 · orientation 3.22–3.25 · refusal 3.12–3.13' },
  spill: { sign: 'W001', tag: 'Spill · waste', title: 'Spill or waste release',
    hz: 'Chemical spill, contaminated runoff or uncontrolled waste release.',
    pv: 'Compatible containment and spill kits; known drains, approved receivers and waste segregation; defined cleanup limits and notification roles.',
    rs: 'Alarm, restrict access and follow the response plan; trained, equipped staff clean up. Make the required spill notifications.',
    rg: 'OHSR 5.97–5.104 · BC Spill Reporting Regulation ss.2–6' },
};
const HZ_MAP = { PreG: ['runaway', 'splash', 'incompat'], Fix1: ['splash', 'spill', 'confined'], Press: ['pressure', 'pinch'], Dry: ['inhal', 'noise'],
  TLGO: ['runaway', 'incompat', 'splash'], Fix2: ['incompat', 'splash', 'spill'], Wash: ['pressure', 'spill'], DMF: ['dmf'], Sonic: ['noise', 'inhal'],
  MixB: ['inhal', 'pinch'], Spray: ['dust', 'inhal'], Furnace1: ['furnace', 'o2', 'noise'], MixK: ['koh'], Furnace2: ['furnace', 'o2', 'utility'],
  Compact: ['pinch', 'o2'], Glove: ['alone', 'lifting'] };
const QUIZ = [
  { sec: 'Synthesis', next: 'Wash', qs: [
    { q: 'Acid splashes onto a worker during a hose disconnection. What comes first?', opts: ['Wipe it off and finish the transfer', 'Stop work, alert the supervisor, use the eyewash/shower and get first aid', 'Neutralize it with base from the spill kit'], a: 1, reg: 'OHSR 5.85–5.96 · 3.16–3.20' },
    { q: 'Reactor temperature is climbing and gas is evolving fast. What is the right response?', opts: ['Add water or another quench to cool it', 'Open the vessel to relieve pressure', 'Raise the alarm, use only the approved remote safe-state action if safe, and evacuate'], a: 2, reg: 'OHSR 5.97–5.104 · 4.10–4.11' } ] },
  { sec: 'Washing & drying', next: 'Furnace1', qs: [
    { q: 'You need to open a TFF line or the filter press. What must be done first?', opts: ['Isolate energy and verify it is depressurized, drained and at a safe temperature', 'Open it slowly while wearing a face shield', 'Ask the operator whether the pump is off'], a: 0, reg: 'OHSR Part 10, 10.3–10.6' },
    { q: 'GO powder from the spray dryer collector is on the floor. How should it be cleaned?', opts: ['Sweep it up, or blow it away with compressed air', 'Use the approved enclosed or filtered cleaning method; no dry sweeping or compressed air', 'Leave it until the end of the shift'], a: 1, reg: 'OHSR 5.81 · 5.48–5.58' } ] },
  { sec: 'Mixing & doping', next: 'Glove', qs: [
    { q: 'The O₂ alarm sounds near the inert line and a colleague has collapsed. What do you do?', opts: ['Run in and pull them out quickly', 'Put on a dust mask, then go in', 'Evacuate, prevent entry and call the planned rescue; no unprotected rescue'], a: 2, reg: 'OHSR 5.56 · 4.13–4.16 · Part 9' },
    { q: 'The furnace discharge appears blocked while the furnace is hot. What is correct?', opts: ['Keep clear and follow the approved safe-state procedure; never open a hot, pressurized system', 'Open the end cap and clear the blockage', 'Tap the tube to free the powder'], a: 0, reg: 'OHSR 5.2 · 4.10–4.11 · Part 10' } ] },
  { sec: 'Packaging', next: 'Product', qs: [
    { q: 'The pellet press jams. How do you clear it?', opts: ['Reach in quickly between strokes', 'Isolate and verify zero energy (lockout) before clearing the jam', 'Wait for it to cool, then clear it by hand'], a: 1, reg: 'OHSR 10.3–10.6 · 12.2' },
    { q: 'You are asked to fill tanks alone after hours. When is that acceptable?', opts: ['Any time, if the cameras are on', 'Never, under any circumstances', 'Only for permitted tasks, with documented check-ins and a failed-contact response'], a: 2, reg: 'OHSR 4.20.1–4.23' } ] },
];
// One question per step, for the "every step" quiz depth.
const STEP_Q = {
  PreG: { q: 'The Pre-G reactor starts to run away. Which response is correct?', opts: ['Add water to cool it down', 'Raise the alarm, use only the approved remote safe-state action if safe, and evacuate', 'Open the lid to let the gas out'], a: 1, reg: 'OHSR 5.97–5.104 · 4.10–4.11' },
  Fix1: { q: 'Acid splashes into your eye at the fixing tank. What comes first?', opts: ['Rinse at the eyewash or shower immediately and alert the supervisor', 'Finish the transfer, then rinse', 'Wipe it with a clean glove'], a: 0, reg: 'OHSR 5.85–5.96 · 3.16–3.20' },
  Press: { q: 'Before opening the filter press, you must…', opts: ['Check that the gauge looks low', 'Isolate and verify it is depressurized, drained and cool', 'Loosen the plates one at a time to test'], a: 1, reg: 'OHSR 10.3–10.6' },
  Dry: { q: 'Powder dust escapes from the drying trays in the fume hood. What do you do?', opts: ['Stop the task, leave the area and notify the supervisor', 'Put on a dust mask and keep going', 'Sweep it up straight away'], a: 0, reg: 'OHSR 5.48–5.58' },
  TLGO: { q: 'What controls the runaway risk while permanganate is added?', opts: ['Adding it as fast as possible', 'Extra acid to dilute it', 'The approved addition rate and limits, with cooling and alarms verified'], a: 2, reg: 'OHSR 5.2 · 4.10–4.11' },
  Fix2: { q: 'Before adding H2O2 or HCl, you should…', opts: ['Confirm the chemical identity, concentration and recipe revision', 'Check the container by smell', 'Pre-mix them to save time'], a: 0, reg: 'OHSR 5.3–5.18 · 5.20–5.26' },
  Wash: { q: 'A TFF hose starts leaking under pressure. What do you do?', opts: ['Hold the hose in place', 'Tighten the fitting while it runs', 'Withdraw, restrict access, and let a competent person make it safe'], a: 2, reg: 'OHSR Part 10 · 12.2' },
  DMF: { q: 'Which glove is right for handling DMF?', opts: ['Any nitrile glove', 'One selected from permeation data for the actual temperature and contact time', 'No glove if the task is quick'], a: 1, reg: 'OHSR 5.57 · Part 8' },
  Sonic: { q: 'How is sonicator noise controlled?', opts: ['Enclosure, separation and the hearing protection set by the noise assessment', 'Short visits only, with no protection', 'Turning the radio up'], a: 0, reg: 'OHSR Part 7 · Part 8' },
  MixB: { q: 'When charging boric acid powder into the mixer, what is required?', opts: ['Open the hatch while the mixer runs', 'Source capture running and guards in place', 'Pour from height to speed it up'], a: 1, reg: 'OHSR 5.48–5.58 · 12.2' },
  Spray: { q: 'Which cleaning method is allowed for GO powder deposits?', opts: ['Compressed air', 'Dry sweeping', 'The approved enclosed or filtered method'], a: 2, reg: 'OHSR 5.81' },
  Furnace1: { q: 'The furnace 1 discharge blocks while hot. You should…', opts: ['Keep clear and follow the approved safe-state procedure', 'Open the end cap and clear it', 'Raise the argon flow and tap the tube'], a: 0, reg: 'OHSR 5.2 · 4.10–4.11 · Part 10' },
  MixK: { q: 'KOH solution splashes on your arm. What comes first?', opts: ['Wipe it off with a rag', 'Neutralize it with acid', 'Use the emergency wash immediately and alert the supervisor'], a: 2, reg: 'OHSR 5.85–5.96' },
  Furnace2: { q: 'The O₂ alarm sounds in the inert line area. What do you do?', opts: ['Go in to find the leak', 'Evacuate, keep others out and call the planned rescue', 'Wear a filter respirator and carry on'], a: 1, reg: 'OHSR 5.56 · 4.13–4.16' },
  Compact: { q: 'The pellet press jams. Before clearing it, you…', opts: ['Lock out and verify zero energy', 'Jog the motor to free it', 'Reach in between strokes'], a: 0, reg: 'OHSR 10.3–10.6 · 12.2' },
  Glove: { q: 'When can tank filling be done alone after hours?', opts: ['Any time, if the cameras are on', 'Only for permitted tasks, with documented check-ins and a failed-contact response', 'Never ask; just do it'], a: 1, reg: 'OHSR 4.20.1–4.23' },
};
const STEP_QUIZ = STATIONS.map((st, i) => ({ sec: 'Step ' + String(i + 1).padStart(2, '0') + ' · ' + st.title, next: i < STATIONS.length - 1 ? STATIONS[i + 1].key : 'Product', qs: [STEP_Q[st.key]] }));
// ISO 7010-style warning signs (yellow triangle, black band, black pictogram) — simplified for screen.
const SIGN_NAME = { W001: 'General warning', W002: 'Explosive material', W015: 'Overhead load', W016: 'Toxic material', W017: 'Hot surface', W021: 'Flammable material', W023: 'Corrosive substance', W024: 'Crushing of hands', W029: 'Gas cylinder' };
function SignArt({ code }) {
  const k = '#1d1f20';
  switch (code) {
    case 'W002': return <g fill={k} stroke={k}><circle cx="50" cy="58" r="7" stroke="none" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="50" y1="58" x2={50 + 17 * Math.cos(a * Math.PI / 180)} y2={58 + 17 * Math.sin(a * Math.PI / 180)} strokeWidth="3.4" />)}<rect x="40" y="73" width="20" height="3" stroke="none" /></g>;
    case 'W015': return <g fill="none" stroke={k} strokeWidth="3.2" strokeLinejoin="round"><line x1="50" y1="30" x2="50" y2="40" /><path d="M50 40 a4 4 0 1 1 -4 4" /><line x1="50" y1="46" x2="39" y2="56" /><line x1="50" y1="46" x2="61" y2="56" /><rect x="37" y="56" width="26" height="15" fill={k} /></g>;
    case 'W016': return <g fill={k}><circle cx="50" cy="46" r="11" /><rect x="44" y="52" width="12" height="9" rx="2" /><circle cx="45.5" cy="45" r="3" fill="#F9C80E" /><circle cx="54.5" cy="45" r="3" fill="#F9C80E" /><g stroke={k} strokeWidth="3.6" strokeLinecap="round"><line x1="37" y1="62" x2="63" y2="74" /><line x1="63" y1="62" x2="37" y2="74" /></g></g>;
    case 'W017': return <g fill="none" stroke={k} strokeWidth="3.2" strokeLinecap="round">{[40, 50, 60].map((x) => <path key={x} d={'M' + x + ' 34 q4 4 0 8 q-4 4 0 8 q4 4 0 8'} />)}<rect x="32" y="64" width="36" height="6" fill={k} stroke="none" /></g>;
    case 'W021': return <g fill={k}><path d="M50 30 C58 40 64 47 61 58 C59 66 54 69 50 69 C44 69 38 64 39 55 C40 48 45 46 45 40 C49 44 51 48 51 52 C55 47 54 38 50 30 Z" /><rect x="36" y="72" width="28" height="4" /></g>;
    case 'W023': return <g fill={k} stroke={k}><rect x="33" y="31" width="7" height="16" rx="1" transform="rotate(-35 36 39)" stroke="none" /><rect x="56" y="31" width="7" height="16" rx="1" transform="rotate(-35 59 39)" stroke="none" /><circle cx="42" cy="52" r="2" stroke="none" /><circle cx="65" cy="52" r="2" stroke="none" /><path d="M30 64 L48 64 L48 70 L30 70 Z M36 64 l2 -2 l2 2" stroke="none" /><path d="M54 70 L54 63 Q58 60 62 62 L70 62 L70 66 L64 66 L64 70 Z" stroke="none" /><line x1="28" y1="74" x2="72" y2="74" strokeWidth="2.4" /></g>;
    case 'W024': return <g fill={k} stroke={k}><rect x="36" y="29" width="28" height="9" stroke="none" /><line x1="50" y1="40" x2="50" y2="50" strokeWidth="3" /><path d="M44 46 L50 53 L56 46" fill="none" strokeWidth="3" /><path d="M36 62 Q44 56 56 58 L66 58 L66 63 L56 63 L56 66 L36 66 Z" stroke="none" /><rect x="32" y="69" width="36" height="5" stroke="none" /></g>;
    case 'W029': return <g fill={k}><rect x="44" y="34" width="12" height="38" rx="6" transform="rotate(28 50 53)" /><rect x="53" y="28" width="6" height="7" transform="rotate(28 50 53)" /></g>;
    default: return <g fill={k}><rect x="46" y="32" width="8" height="28" rx="3" /><circle cx="50" cy="68" r="4.6" /></g>;
  }
}
function Sign({ code = 'W001', size = 28 }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 100 88" style={{ flex: 'none', display: 'block' }} role="img" aria-label={'ISO 7010 ' + code + ' ' + (SIGN_NAME[code] || '')}>
      <path d="M50 4 L96 84 L4 84 Z" fill="#F9C80E" stroke="#1d1f20" strokeWidth="7" strokeLinejoin="round" />
      <SignArt code={code} />
    </svg>
  );
}
function Tri({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M12 2 L22 20 L2 20 Z" /><line x1="12" y1="9" x2="12" y2="14" /><line x1="12" y1="17" x2="12" y2="17.5" /></svg>;
}
const CHAPTERS = [['Synthesis', 'PreG'], ['Washing', 'Wash'], ['Doping', 'Furnace1'], ['Packaging', 'Glove'], ['Use', 'Product'], ['Summary', 'Summary']];

const X0 = 500, DX = 720;
const SX = (i) => X0 + DX * i;
const PX = SX(STATIONS.length - 1) + 820, HX = PX + 900, BW = HX + 560, OX = (HX + 400) / 2;

// Process ports in vessel-local coords (svg 300×360 placed at x-150, y 520).
const PORTS = {
  reactor: { in: [200, 40, 'top'], out: [150, 330, 'bottom'] },
  tank: { in: [190, 40, 'top'], out: [150, 330, 'bottom'] },
  press: { in: [20, 180, 'left'], out: [150, 330, 'bottom'] },
  drum: { in: [150, 40, 'top'], out: [150, 330, 'bottom'] },
  hood: { in: [30, 200, 'left'], out: [150, 330, 'bottom'] },
  tff: { in: [100, 40, 'top'], out: [75, 300, 'bottom'] },
  sonic: { in: [170, 70, 'top'], out: [150, 330, 'bottom'] },
  spray: { in: [150, 0, 'top'], out: [150, 330, 'bottom'] },
  furnace: { in: [0, 180, 'left'], out: [300, 180, 'right'] },
  compactor: { in: [150, 30, 'top'], out: [300, 270, 'right'] },
  glovebox: { in: [30, 200, 'left'], out: [270, 200, 'right'] },
};
const VY = 520, TOPY = 392, HY = 895;
const portXY = (i, k) => { const p = PORTS[STATIONS[i].vessel][k]; return [SX(i) - 150 + p[0], VY + p[1], p[2]]; };
const ROUTES = [];
{
  const [ix, iy] = portXY(0, 'in');
  ROUTES.push([[120, TOPY], [ix, TOPY], [ix, iy]]);
  for (let i = 0; i < STATIONS.length; i++) {
    const [ox, oy, od] = portXY(i, 'out');
    if (i === STATIONS.length - 1) { ROUTES.push([[ox, oy], [PX - 400, oy]]); break; }
    const [nx, ny, nd] = portXY(i + 1, 'in');
    const gx = SX(i) + DX / 2;
    const pts = [[ox, oy]];
    if (od === 'bottom') pts.push([ox, HY], [gx, HY]); else pts.push([gx, oy]);
    if (nd === 'top') pts.push([gx, TOPY], [nx, TOPY], [nx, ny]); else pts.push([gx, ny], [nx, ny]);
    ROUTES.push(pts);
  }
}
const plen = (pts) => pts.slice(1).reduce((a, p, k) => a + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const ptAt = (pts, d) => {
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1], b = pts[k], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= l || k === pts.length - 1) { const p = l ? clamp(d / l, 0, 1) : 0; return [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]; }
    d -= l;
  }
  return pts[0];
};
// Marker path through each piece of equipment, in vessel-local coords, following its real internals.
const TFF_LOOP = [[120, 280], [168, 280], [212, 280], [265, 280], [265, 190], [265, 158], [150, 158], [80, 158], [80, 270], [100, 270]];
const INNER_LOCAL = {
  reactor: () => [[200, 40], [200, 210], [150, 300], [150, 330]],
  tank: () => [[190, 40], [190, 250], [150, 330]],
  press: () => [[20, 180], [150, 180], [150, 258], [150, 330]],
  drum: () => [[150, 40], [150, 80], [150, 180], [150, 280], [150, 330]],
  hood: () => [[30, 200], [112, 200], [112, 238], [188, 238], [188, 200], [150, 200], [150, 300], [150, 330]],
  tff: (st) => [[100, 40], [100, 270]].concat(...Array(st.wash ? 6 : 1).fill(TFF_LOOP), [[75, 300]]),
  sonic: () => [[170, 70], [170, 250], [150, 300], [150, 330]],
  spray: () => [[150, 0], [150, 48], [150, 250], [150, 290], [150, 330]],
  furnace: () => [[0, 180], [300, 180]],
  compactor: () => [[150, 30], [150, 120], [150, 200], [150, 270], [300, 270]],
  glovebox: () => [[30, 200], [150, 200], [270, 200]],
};
const INNER = STATIONS.map((st, i) => INNER_LOCAL[st.vessel](st).map(([lx, ly]) => [SX(i) - 150 + lx, VY + ly]));
const toD = (pts) => 'M' + pts.map((p) => p[0] + ' ' + p[1]).join(' L');
const cueOf = (CUES, i) => i < STATIONS.length ? CUES[STATIONS[i].key] : CUES.Product;

function markerPos(T, CUES) {
  const legs = [[ROUTES[0], cueOf(CUES, 0) - 0.6, cueOf(CUES, 0) + 0.6, 'pipe', 0]];
  STATIONS.forEach((_, i) => {
    legs.push([INNER[i], cueOf(CUES, i) + 0.6, cueOf(CUES, i + 1) - 0.9, 'inner', i]);
    legs.push([ROUTES[i + 1], cueOf(CUES, i + 1) - 0.9, cueOf(CUES, i + 1) + 0.6, 'pipe', i + 1]);
  });
  if (T < legs[0][1]) return { xy: ROUTES[0][0], pipe: 0, pd: 0, inside: false };
  for (const [pts, a, b, kind, idx] of legs) {
    if (T <= b) {
      const p = kind === 'pipe' ? prog(T, a, b, MOTION.move) : clamp((T - a) / (b - a), 0, 1);
      const d = p * plen(pts);
      return { xy: ptAt(pts, d), pipe: kind === 'pipe' ? idx : idx + 1, pd: kind === 'pipe' ? d : 0, inside: kind === 'inner' };
    }
  }
  const last = ROUTES[ROUTES.length - 1];
  return { xy: last[last.length - 1], pipe: ROUTES.length, pd: 0, inside: false };
}

function useCamera(T, CUES) {
  const O = { x: OX, y: 640, s: 0.142 };
  const keys = [[0, O], [CUES.PreG - 0.7, { x: OX, y: 640, s: 0.148 }]];
  STATIONS.forEach((st, i) => {
    const c = cueOf(CUES, i), n = cueOf(CUES, i + 1);
    keys.push([c + 0.6, { x: SX(i), y: 715, s: 0.85 }], [n - 0.6, { x: SX(i) + 40, y: 715, s: 0.88 }]);
  });
  keys.push([CUES.Product + 0.6, { x: PX, y: 715, s: 0.85 }], [CUES.Hydrogen - 0.6, { x: PX + 30, y: 715, s: 0.88 }],
    [CUES.Hydrogen + 0.6, { x: HX, y: 715, s: 0.85 }], [CUES.Summary - 0.1, { x: HX - 30, y: 715, s: 0.88 }],
    [CUES.Summary + 1.4, O], [CUES.Close + 9, { x: OX, y: 640, s: 0.148 }]);
  let cam = keys[keys.length - 1][1];
  if (T <= keys[0][0]) cam = keys[0][1];
  else for (let k = 0; k < keys.length - 1; k++) {
    const [ta, A] = keys[k], [tb, B] = keys[k + 1];
    if (T <= tb) { const p = prog(T, ta, tb, MOTION.move); cam = { x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), s: lerp(A.s, B.s, p) }; break; }
  }
  // Pull out slightly mid-pan, push back in on arrival.
  let b = 0;
  STATIONS.slice(1).map((x) => CUES[x.key]).concat([CUES.Product, CUES.Hydrogen]).forEach((tc) => {
    const w = Math.abs(T - tc) / 0.6; if (w < 1) b = Math.max(b, 0.5 * (1 + Math.cos(Math.PI * w)));
  });
  return { x: cam.x, y: lerp(cam.y, 760, b), s: cam.s * (1 - 0.3 * b) };
}

function Marks({ color = C.text, size = 14 }) {
  const h = size / 2;
  const pos = [{ left: -h, top: -h }, { right: -h, top: -h }, { left: -h, bottom: -h }, { right: -h, bottom: -h }];
  return pos.map((p, i) => (
    <div key={i} style={Object.assign({ position: 'absolute', width: size, height: size }, p)}>
      <div style={{ position: 'absolute', left: h - 0.5, top: 0, width: 1, height: size, background: color }}></div>
      <div style={{ position: 'absolute', top: h - 0.5, left: 0, height: 1, width: size, background: color }}></div>
    </div>
  ));
}
function Frame({ style, children }) {
  return (
    <div style={Object.assign({ position: 'absolute', border: '1px solid ' + C.div, boxSizing: 'border-box' }, style)}>
      <Marks />{children}
    </div>
  );
}
function Label({ children, style }) {
  return <div style={Object.assign({ font: '500 22px ' + BF, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.n7 }, style)}>{children}</div>;
}

function Vessel({ st, T, c, liquid, level }) {
  const stroke = { fill: 'none', stroke: C.text, strokeWidth: 1.6 };
  const name = (t, x = 30, anchor = 'start', y = 352) => <text x={x} y={y} textAnchor={anchor} style={{ font: '500 18px ' + BF, letterSpacing: '0.12em', fill: C.n7 }}>{t}</text>;
  const small = { font: '500 16px ' + BF, letterSpacing: '0.12em', fill: C.n7 };
  const run = T > c + 0.8;
  const svg = (kids) => <svg width="300" height="360" viewBox="0 0 300 360" style={{ position: 'absolute', left: -150, top: 0, overflow: 'visible' }}>{kids}</svg>;
  const v = st.vessel;
  if (v === 'tank') {
    const body = 'M60 40 L240 40 L240 250 L150 330 L60 250 Z';
    const ph = st.ph || {};
    const se = ph.settle ? prog(T, c + ph.settle[0], c + ph.settle[1], MOTION.move) : 0;
    const de = ph.decant ? prog(T, c + ph.decant[0], c + ph.decant[1], MOTION.move) : 0;
    const rf = ph.refill ? prog(T, c + ph.refill[0], c + ph.refill[1], MOTION.move) : 0;
    const tot = level * (1 - 0.42 * de) + 0.3 * rf * (level > 0 ? 1 : 0);
    const sludge = tot * lerp(lerp(1, 0.5, se), 1, rf);
    const surf = 330 - tot * 290, sTop = 330 - sludge * 290;
    const clear = mix(hx2(liquid), '#d6ebff', se * (1 - rf));
    const decanting = ph.decant && T > c + ph.decant[0] && T < c + ph.decant[1];
    return svg(<>
      <defs><clipPath id={'cl-' + st.key}><path d={body} /></clipPath></defs>
      <rect x="60" y={surf} width="180" height={Math.max(sTop - surf, 0)} fill={clear} clipPath={'url(#cl-' + st.key + ')'} />
      <rect x="60" y={sTop} width="180" height={330 - sTop} fill={liquid} clipPath={'url(#cl-' + st.key + ')'} />
      <path d={body} {...stroke} />
      {ph.decant && <>
        <path d="M240 210 L330 210" {...stroke} stroke={decanting ? C.a : C.text} />
        <path d="M318 202 L332 210 L318 218" fill="none" stroke={decanting ? C.a : C.text} strokeWidth="2" />
        <text x="252" y="198" style={{ font: '500 16px ' + BF, letterSpacing: '0.12em', fill: C.n7 }}>DECANT</text>
        {decanting && [0, 1, 2].map((k) => { const p2 = (T * 1.4 + k / 3) % 1; return <circle key={k} cx={244 + p2 * 80} cy="210" r="5" fill={C.a4} />; })}
      </>}
      {se > 0.05 && se < 0.999 && rf < 0.01 && <text x="68" y={surf + 24} textAnchor="start" style={{ font: '500 16px ' + BF, letterSpacing: '0.12em', fill: C.a9 }}>SETTLING</text>}
      <line x1="75" y1="264" x2="75" y2="345" stroke={C.text} strokeWidth="1.6" />
      <line x1="225" y1="264" x2="225" y2="345" stroke={C.text} strokeWidth="1.6" />
      {name('FIXING TANK', 135, 'end')}
    </>);
  }
  if (v === 'press') {
    const cake = prog(T, c + 0.8, c + 2.6, MOTION.move);
    return svg(<>
      <line x1="20" y1="112" x2="280" y2="112" stroke={C.text} strokeWidth="1.6" />
      <line x1="20" y1="248" x2="280" y2="248" stroke={C.text} strokeWidth="1.6" />
      <rect x="20" y="104" width="22" height="152" fill={C.bg} {...{ stroke: C.text, strokeWidth: 1.6 }} />
      <rect x="258" y="104" width="22" height="152" fill={C.bg} {...{ stroke: C.text, strokeWidth: 1.6 }} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
        <g key={k}>
          <rect x={54 + k * 23} y={122 + 116 * (1 - cake)} width="15" height={116 * cake} fill={liquid} />
          <rect x={54 + k * 23} y="122" width="15" height="116" {...stroke} />
        </g>
      ))}
      <path d="M115 258 L185 258 L160 300 L140 300" {...stroke} />
      <line x1="140" y1="300" x2="140" y2="330" stroke={C.text} strokeWidth="1.6" />
      <line x1="160" y1="300" x2="160" y2="330" stroke={C.text} strokeWidth="1.6" />
      {run && [0, 1, 2].map((k) => { const ph = (T * 1.3 + k / 3) % 1; return <circle key={k} cx={240} cy={256 + ph * 50} r="4" fill={C.a} opacity={1 - ph} />; })}
      <text x="250" y="300" style={small}>FILTRATE</text>
      {name('FILTER PRESS', 128, 'end')}
    </>);
  }
  if (v === 'hood') {
    const heat = prog(T, c + 0.6, c + 2.0, MOTION.move);
    return svg(<>
      <rect x="130" y="0" width="40" height="40" {...stroke} />
      <path d="M150 34 L150 10 M143 18 L150 8 L157 18" fill="none" stroke={C.a} strokeWidth="1.6" />
      <text x="176" y="22" style={small}>EXHAUST</text>
      <rect x="31" y="61" width="238" height="89" fill={C.a2} opacity="0.55" />
      <rect x="30" y="40" width="240" height="290" {...stroke} />
      <line x1="30" y1="150" x2="270" y2="150" stroke={C.text} strokeWidth="3" />
      <line x1="30" y1="60" x2="270" y2="60" stroke={C.text} strokeWidth="1" />
      <text x="40" y="142" style={small}>SASH</text>
      <rect x="66" y="252" width="168" height="18" fill={mix('#f2f2f3', '#94bce3', heat)} stroke={C.text} strokeWidth="1.6" />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={78 + k * 24} y1="261" x2={90 + k * 24} y2="261" stroke={C.text} strokeWidth="1" opacity={0.4 + 0.6 * heat} />)}
      {[80, 156].map((tx) => (
        <g key={tx}>
          <rect x={tx + 1} y={252 - 12 * Math.max(level, 0.15)} width="62" height={12 * Math.max(level, 0.15)} fill={liquid} />
          <path d={'M' + tx + ' 236 L' + tx + ' 252 L' + (tx + 64) + ' 252 L' + (tx + 64) + ' 236'} {...stroke} />
        </g>
      ))}
      {run && [0, 1, 2, 3, 4, 5].map((k) => {
        const ph = (T * 0.55 + k / 6) % 1, x0 = k % 2 ? 188 : 112;
        const x = lerp(x0, 150, ph) + Math.sin((T + k) * 3) * 6 * (1 - ph), y = lerp(232, 44, ph);
        return <circle key={k} cx={x} cy={y} r={3 + 2 * ph} fill="none" stroke={C.a4} strokeWidth="1.4" opacity={(1 - ph) * heat} />;
      })}
      <line x1="30" y1="270" x2="270" y2="270" stroke={C.text} strokeWidth="1.6" />
      <line x1="150" y1="270" x2="150" y2="330" stroke={C.text} strokeWidth="1" strokeDasharray="4 4" />
      <text x="240" y="292" textAnchor="end" style={small}>HOT PLATE</text>
      {name('FUME HOOD', 128, 'end')}
    </>);
  }
  if (v === 'drum') {
    const ang = T * 70;
    return svg(<>
      <defs><clipPath id={'cl-' + st.key}><circle cx="150" cy="180" r="100" /></clipPath></defs>
      <rect x="40" y={280 - 200 * level} width="220" height={200 * level} fill={liquid} clipPath={'url(#cl-' + st.key + ')'} />
      <circle cx="150" cy="180" r="100" {...stroke} />
      <g transform={'rotate(' + ang + ' 150 180)'}>
        {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1="150" y1="80" x2="150" y2="104" stroke={C.text} strokeWidth="1.6" transform={'rotate(' + a + ' 150 180)'} />)}
      </g>
      {run && [0, 1, 2, 3, 4].map((k) => { const ph = (T * 0.9 + k / 5) % 1; return <circle key={k} cx={110 + k * 18} cy={110 + ph * 110} r="4" fill={liquid} />; })}
      <line x1="150" y1="40" x2="150" y2="80" stroke={C.text} strokeWidth="1.6" />
      <path d="M135 276 L135 330 M165 276 L165 330" {...stroke} />
      <path d="M85 255 L65 320 M215 255 L235 320" {...stroke} />
      {name('TUMBLE DRYER', 128, 'end')}
    </>);
  }
  if (v === 'compactor') {
    const r1 = T * 120;
    return svg(<>
      <path d="M90 30 L210 30 L170 120 L130 120 Z" fill={mix('#f2f2f3', liquid, level)} stroke={C.text} strokeWidth="1.6" />
      {run && [0, 1, 2].map((k) => { const ph = (T * 1.5 + k / 3) % 1; return <circle key={k} cx="150" cy={124 + ph * 46} r="4" fill={liquid} />; })}
      {[[118, -1], [182, 1]].map(([cx, dir]) => (
        <g key={cx}>
          <circle cx={cx} cy="200" r="30" {...stroke} />
          <g transform={'rotate(' + (r1 * dir) + ' ' + cx + ' 200)'}>
            <line x1={cx - 22} y1="200" x2={cx + 22} y2="200" stroke={C.text} strokeWidth="1.6" />
            <line x1={cx} y1="178" x2={cx} y2="222" stroke={C.text} strokeWidth="1.6" />
          </g>
        </g>
      ))}
      <path d="M150 230 L150 270 L300 270" fill="none" stroke={liquid} strokeWidth="8" opacity={run ? 1 : 0.25} />
      {name('CONVEYOR → HOPPER → ROLLER COMPACTOR', -40)}
    </>);
  }
  if (v === 'glovebox') {
    return svg(<>
      <path d="M30 120 L90 70 L270 70 L270 290 L30 290 Z" {...stroke} />
      <line x1="30" y1="120" x2="270" y2="120" stroke={C.text} strokeWidth="1" strokeDasharray="4 5" />
      <circle cx="95" cy="240" r="28" {...stroke} />
      <circle cx="205" cy="240" r="28" {...stroke} />
      <rect x="136" y={240 - 70 * level} width="28" height={70 * level} fill={liquid} />
      <rect x="135" y="160" width="30" height="80" {...stroke} />
      <rect x="141" y="146" width="18" height="14" fill={T > c + 1.6 ? C.a : 'none'} stroke={C.text} strokeWidth="1.6" />
      <line x1="30" y1="290" x2="30" y2="320" stroke={C.text} strokeWidth="1.6" />
      <line x1="270" y1="290" x2="270" y2="320" stroke={C.text} strokeWidth="1.6" />
      {name('GLOVE BOX', 30, 'start', 345)}
    </>);
  }
  if (v === 'tff') {
    const flow = { strokeDasharray: '10 8', strokeDashoffset: -T * 60 };
    const wsv = st.wash ? washState(T, c) : null;
    const run = wsv ? (wsv.n >= 0 && wsv.filtering) : T > c + 0.8;
    return svg(<>
      <rect x="31" y={300 - 200 * level} width="88" height={200 * level} fill={liquid} />
      <path d="M30 40 L30 300 L120 300 L120 40" {...stroke} />
      <path d="M120 280 L168 280" {...stroke} />
      <circle cx="190" cy="280" r="22" {...stroke} />
      <path d={'M190 280 L' + (190 + 16 * Math.cos(T * 8)) + ' ' + (280 + 16 * Math.sin(T * 8))} stroke={C.text} strokeWidth="1.6" />
      <path d="M212 280 L265 280 L265 192" {...stroke} />
      <rect x="150" y="140" width="130" height="50" {...stroke} />
      <line x1="152" y1="172" x2="278" y2="172" stroke={C.a} strokeWidth="1.6" strokeDasharray="3 4" />
      <path d="M150 158 L80 158 L80 60" {...stroke} />
      {run && <path d="M120 280 L168 280 M212 280 L265 280 L265 192 M265 158 L150 158 L80 158 L80 60" fill="none" stroke={C.a} strokeWidth="3" {...flow} />}
      {(() => {
        const eq = wsv && wsv.n >= 0 ? clamp((wsv.n + wsv.f) / WASH_A1.length, 0, 1) : 0;
        const perm = [[280, 180], [340, 180], [340, 222]];
        return <>
          <rect x="311" y={318 - 90 * (0.08 + 0.85 * eq)} width="58" height={90 * (0.08 + 0.85 * eq)} fill={C.a3} />
          <path d="M310 228 L310 318 L370 318 L370 228" {...stroke} />
          <line x1="310" y1="228" x2="370" y2="228" stroke={C.text} strokeWidth="1" strokeDasharray="3 4" />
          <path d={toD(perm)} fill="none" stroke={C.a} strokeWidth="1.6" />
          <path d="M333 212 L340 224 L347 212" fill="none" stroke={C.a} strokeWidth="1.6" />
          {run && [0, 1, 2].map((k) => { const q = ptAt(perm, ((T * 0.9 + k / 3) % 1) * plen(perm)); return <circle key={k} cx={q[0]} cy={q[1]} r="4" fill={C.a} />; })}
          <text x="286" y="170" style={small}>PERMEATE</text>
          <text x="310" y="340" style={small}>EQ TANK</text>
        </>;
      })()}
      <text x="150" y="128" style={small}>MEMBRANE</text>
      {name('WASH SKID', 100)}
    </>);
  }
  if (v === 'spray') {
    return svg(<>
      <path d="M90 40 L210 40 L210 220 L160 290 L140 290 L90 220 Z" {...stroke} />
      <rect x="140" y="290" width="20" height="40" {...stroke} />
      <rect x="141" y={330 - 39 * level} width="18" height={39 * level} fill={liquid} />
      <rect x="143" y="30" width="14" height="18" {...stroke} />
      <line x1="150" y1="0" x2="150" y2="30" stroke={C.text} strokeWidth="1.6" />
      <line x1="30" y1="70" x2="88" y2="70" stroke={C.a} strokeWidth="1.6" />
      <path d="M80 63 L90 70 L80 77" fill="none" stroke={C.a} strokeWidth="1.6" />
      <text x="10" y="58" style={small}>HOT AIR</text>
      <path d="M210 110 L262 110 L262 60" {...stroke} />
      <text x="222" y="50" style={small}>DMF WASTE</text>
      {run && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => {
        const ph = (T * 0.9 + k / 10) % 1, sp = ((k * 37) % 10) / 9 - 0.5;
        return <circle key={k} cx={150 + sp * 100 * ph} cy={52 + ph * 200} r={3.5 - ph * 1.5} fill={mix('#7d5f3c', '#b89a72', ph)} opacity={1 - ph * 0.5} />;
      })}
      {name('SPRAY DRYER', 135, 'end')}
    </>);
  }
  if (v === 'furnace') {
    const heat = prog(T, c + 0.8, c + 3.4, MOTION.move);
    const glow = heat * (0.75 + 0.25 * Math.sin(T * 5));
    const coil = mix('#1d1f20', '#5980a6', heat);
    return svg(<>
      <rect x="30" y="110" width="240" height="140" fill={C.a2} opacity={glow} />
      <rect x="30" y="110" width="240" height="140" {...stroke} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
        <g key={k}>
          <line x1={50 + k * 20} y1="122" x2={50 + k * 20} y2="156" stroke={coil} strokeWidth={1.6 + heat * 1.4} />
          <line x1={50 + k * 20} y1="204" x2={50 + k * 20} y2="238" stroke={coil} strokeWidth={1.6 + heat * 1.4} />
        </g>
      ))}
      <rect x="0" y="164" width="300" height="32" fill={C.bg} {...{ stroke: C.text, strokeWidth: 1.6 }} />
      {[0, 1, 2].map((k) => { const ph = (T * 0.25 + k / 3) % 1; return <rect key={k} x={10 + ph * 250} y="174" width="30" height="16" fill={liquid} />; })}
      <line x1="150" y1="40" x2="150" y2="108" stroke={C.a} strokeWidth="1.6" />
      <path d="M143 98 L150 110 L157 98" fill="none" stroke={C.a} strokeWidth="1.6" />
      <text x="162" y="62" style={small}>ARGON GAS</text>
      {name(st.label, 0, 'start', 282)}
    </>);
  }
  if (v === 'sonic') {
    return svg(<>
      <rect x="21" y="171" width="258" height="158" fill={C.a2} />
      <path d="M20 150 L20 330 L280 330 L280 150" {...stroke} />
      {[0, 1, 2].map((k) => {
        const ph = (T * 1.6 + k / 3) % 1;
        return <path key={k} d={'M' + (90 - ph * 20) + ' ' + (318 - ph * 50) + ' Q150 ' + (300 - ph * 70) + ' ' + (210 + ph * 20) + ' ' + (318 - ph * 50)} fill="none" stroke={C.a} strokeWidth="1.6" opacity={T > c ? 1 - ph : 0} />;
      })}
      <rect x="101" y={300 - 200 * level} width="98" height={200 * level} fill={liquid} />
      <path d="M100 70 L100 300 L200 300 L200 70" {...stroke} />
      <line x1="60" y1="330" x2="240" y2="330" stroke={C.text} strokeWidth="5" />
      <line x1="150" y1="300" x2="150" y2="330" stroke={C.text} strokeWidth="1.6" />
      {name('FLOW CELL', 135, 'end')}
    </>);
  }
  const imp = Math.cos(T * 9) * 50;
  const surf = 330 - level * 260;
  return svg(<>
    {st.bath && <rect x="30" y="80" width="240" height="262" {...stroke} stroke={C.n6} strokeDasharray="6 6" />}
    <rect x="61" y={surf} width="178" height={330 - surf} fill={liquid} />
    <path d="M60 40 L60 330 L240 330 L240 40" {...stroke} />
    <rect x="132" y="0" width="36" height="22" {...stroke} />
    <line x1="150" y1="330" x2="150" y2="342" stroke={C.text} strokeWidth="1.6" />
    <line x1="150" y1="22" x2="150" y2="300" stroke={C.text} strokeWidth="1.6" />
    <line x1={150 - imp} y1="300" x2={150 + imp} y2="300" stroke={level > 0.05 ? C.bg : C.text} strokeWidth="6" />
    <line x1={150 - imp} y1="300" x2={150 + imp} y2="300" stroke={C.text} strokeWidth="1.6" />
    {name(st.bath || (st.title === 'Wet mixer' || st.title === 'Mixer' ? 'MIXER' : 'REACTOR'), 40, 'start', st.bath ? 364 : 352)}
  </>);
}

const STRUCT_NAME = { graphite: 'Graphite', preg: 'Pre-oxidized graphite', go: 'Graphite oxide · TLGO', goB: 'GO + boric acid', bc: 'B, N-doped graphene · BC', bcK: 'BC + KOH', bck: 'BCK TLGO' };
const SR_ = 21;
const shex = (q, r) => [q * SR_ * 1.732 + (r % 2 ? SR_ * 0.866 : 0) + 22, r * SR_ * 1.5 + 48];
const svert = (q, r, v) => { const [cx, cy] = shex(q, r); return hexPts(cx, cy, SR_)[v]; };
const SFEAT = [
  { t: 'COOH', at: () => { const p = svert(0, 1, 3); return [p[0] - 26, p[1]]; }, stub: [26, 0], in: ['preg', 'go', 'goB'] },
  { t: 'COOH', at: () => { const p = svert(6, 1, 0); return [p[0] + 26, p[1]]; }, stub: [-26, 0], in: ['preg', 'go', 'goB'] },
  { t: 'COOH', at: () => { const p = svert(3, 0, 5); return [p[0], p[1] - 22]; }, stub: [0, 22], in: ['go', 'goB'] },
  { t: 'OH', at: () => svert(1, 0, 5), in: ['go', 'goB', 'bc', 'bcK', 'bck'] },
  { t: 'OH', at: () => svert(4, 2, 2), in: ['go', 'goB'] },
  { t: 'OH', at: () => svert(5, 0, 5), in: ['go', 'goB'] },
  { t: 'ep', at: () => shex(2, 1), in: ['go', 'goB'] },
  { t: 'ep', at: () => shex(5, 2), in: ['go', 'goB'] },
  { t: 'Bf', at: () => [110, 8], in: ['goB'] },
  { t: 'Bf', at: () => [230, 8], in: ['goB'] },
  { t: 'B', at: () => svert(2, 0, 1), in: ['bc', 'bcK', 'bck'] },
  { t: 'B', at: () => svert(4, 1, 2), in: ['bc', 'bcK', 'bck'] },
  { t: 'Kf', at: () => [130, 6], in: ['bcK'] },
  { t: 'Kf', at: () => [250, 6], in: ['bcK'] },
  { t: 'K', at: () => shex(1, 1), in: ['bck'] },
  { t: 'K', at: () => shex(4, 1), in: ['bck'] },
];
function Structure({ from, to, p, x }) {
  const has = (s, f) => (f.in.indexOf(s) >= 0 ? 1 : 0);
  const name = p < 0.5 ? STRUCT_NAME[from] : STRUCT_NAME[to];
  return (
    <div style={{ position: 'absolute', left: x - 270, top: 1150, width: 540, height: 150, borderTop: '1px solid ' + C.div }}>
      <Label style={{ marginTop: 10 }}>Structure</Label>
      <div style={{ width: 210, font: '600 32px ' + HF, textTransform: 'uppercase', color: C.text, lineHeight: 1.05, marginTop: 4, textWrap: 'pretty' }}>{name}</div>
      <svg width="300" height="150" style={{ position: 'absolute', left: 244, top: 0, overflow: 'visible' }}>
        {[0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5, 6].map((q) => {
          const [cx, cy] = shex(q, r);
          return <polygon key={r + '-' + q} points={hexPts(cx, cy, SR_).map((v) => v.join(',')).join(' ')} fill="none" stroke={C.text} strokeWidth="1.3" />;
        }))}
        {SFEAT.map((f, k) => {
          const o = lerp(has(from, f), has(to, f), p);
          if (o <= 0.01) return null;
          const [fx, fy] = f.at();
          const free = f.t === 'Bf' || f.t === 'Kf', lab = f.t.replace('f', '');
          return (
            <g key={k} opacity={o} transform={'translate(' + fx + ' ' + fy + ') scale(' + (0.4 + 0.6 * o) + ')'}>
              {f.stub && <line x1="0" y1="0" x2={f.stub[0]} y2={f.stub[1]} stroke={C.a7} strokeWidth="1.4" />}
              {f.t === 'ep' ? <path d="M-10 7 L0 -8 L10 7 Z" fill={C.bg} stroke={C.a7} strokeWidth="1.6" />
                : f.t === 'COOH' ? <><rect x="-22" y="-11" width="44" height="22" fill={C.bg} stroke={C.a} strokeWidth="1.6" /><text textAnchor="middle" y="5" style={{ font: '600 14px ' + HF, fill: C.a9 }}>COOH</text></>
                : <><circle r={lab === 'K' ? 14 : 12} fill={lab === 'K' ? C.a2 : lab === 'B' && !free ? C.a3 : C.bg} stroke={free ? C.n6 : lab === 'OH' ? C.a : C.a7} strokeWidth="1.6" strokeDasharray={free ? '3 3' : 'none'} />
                  <text textAnchor="middle" y="5" style={{ font: '600 14px ' + HF, fill: C.a9 }}>{lab}</text></>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Station({ st, i, T, CUES, focus, safety }) {
  const x = SX(i), c = cueOf(CUES, i);
  const prev = i ? STATIONS[i - 1] : null;
  const frameIn = prog(T, 0.9 + i * 0.1, 1.6 + i * 0.1);
  const feedIn = prog(T, c + 0.2, c + 0.8);
  const fill = prev ? prog(T, c + 0.1, c + 0.9, MOTION.move) : prog(T, c + 0.4, c + 2.0, MOTION.move);
  const colP = colProg(st, T, c);
  const liquid = prev ? mix(prev.color, st.color, colP) : st.color;
  const wst = st.wash ? washState(T, c) : null;
  const level = wst && wst.level != null ? wst.level : st.level * fill;
  const panel = prog(T, c + 0.6, c + 1.2);
  const cell = { padding: '10px 0' };
  const heatP = prog(T, c + 0.8, c + 3.4, MOTION.move);
  const o2 = Math.round(lerp(400, 18, prog(T, c + 0.4, c + 2.8, MOTION.move)));
  const readVal = wst ? (wst.pH == null ? '—' : wst.pH.toFixed(2)) : st.live && st.live.t ? Math.round(lerp(25, st.live.t, heatP)).toLocaleString('en-US') + ' °C' : st.read[1];
  const subVal = st.live && st.live.o2 ? o2 + ' ppm' : st.sub && st.sub[1];
  const qcPulse = st.qc ? clamp(1 - Math.abs(T - (c + 2.8)) / 0.5, 0, 1) : 0;
  const rp = prog(T, c + 1.5, c + 2.4);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: frameIn * (0.3 + 0.7 * focus) }}>
      <Frame style={{ left: x - 300, top: 170, width: 600, height: 1150 }} />
      <div style={{ position: 'absolute', left: x - 270, top: 192, width: 540, display: 'flex', alignItems: 'baseline', gap: 16, whiteSpace: 'nowrap' }}>
        <span style={{ font: '600 30px ' + HF, color: C.a7 }}>{String(i + 1).padStart(2, '0')}</span>
        <span style={{ font: '600 48px ' + HF, textTransform: 'uppercase', letterSpacing: '0.02em', color: C.text }}>{st.title}</span>
        {st.qc && <span style={{ marginLeft: 'auto', alignSelf: 'center', font: '600 22px ' + HF, letterSpacing: '0.08em', color: C.a7, border: '1.5px solid ' + C.a7, padding: '2px 10px', background: mix(C.bg, C.a3, qcPulse) }}>QC {st.qc}</span>}
      </div>
      <div style={{ position: 'absolute', left: x - 270, top: 266, width: 540, opacity: feedIn, transform: 'translateY(' + (1 - feedIn) * 16 + 'px)' }}>
        <Label style={{ marginBottom: 6 }}>Feed</Label>
        <div style={{ display: 'grid', gridTemplateColumns: st.feed.length > 2 ? '1fr 1fr' : '1fr', columnGap: 28, borderTop: '1px solid ' + C.div }}>
          {st.feed.map((f, k) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', borderBottom: '1px solid ' + C.div, font: '500 26px ' + BF, color: C.text, whiteSpace: 'nowrap' }}>
              <span>{chem(f[0])}</span><span style={{ color: C.a7 }}>{f[1]}</span>
            </div>
          ))}
        </div>
      </div>
      {(st.adds || []).map(([nm, kind, w0, w1], k) => {
        const a0 = w0 ?? 0.3 + k * 0.18, a1 = w1 ?? 2.8;
        const p = addPos(st, k), col = ADD_COL[kind];
        const ex = x - 150 + p.lx, ey = VY + p.ly;
        const pts = [[x - 280, p.hy], [ex, p.hy], [ex, ey]], L = plen(pts);
        const d = prog(T, c + a0, c + a0 + 0.6, MOTION.move);
        const flowing = T > c + a0 + 0.6 && T < c + a1;
        return (
          <div key={nm} style={{ position: 'absolute', left: 0, top: 0, opacity: prog(T, c + a0, c + a0 + 0.3) }}>
            <svg width="10" height="10" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              <path d={toD(pts)} fill="none" stroke={col} strokeWidth="2.4" strokeDasharray={kind === 'g' ? '8 6' : (L * d) + ' ' + L} />
              <path d={'M' + (ex - 8) + ' ' + (ey - 14) + ' L' + ex + ' ' + ey + ' L' + (ex + 8) + ' ' + (ey - 14)} fill="none" stroke={col} strokeWidth="2.4" opacity={d > 0.97 ? 1 : 0} />
              {flowing && [0, 1, 2].map((j) => {
                const ph = ((T - c) * 0.8 + j / 3) % 1, q = ptAt(pts, L * (0.15 + 0.8 * ph));
                return <circle key={j} cx={q[0]} cy={q[1]} r="5" fill={kind === 'g' ? C.bg : col} stroke={col} strokeWidth="1.6" />;
              })}
            </svg>
            <div style={{ position: 'absolute', whiteSpace: 'nowrap', font: '600 22px ' + HF, letterSpacing: '0.04em', color: C.text, left: x - 280, top: p.hy - 28 }}>{chem(nm)}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: x, top: VY }}>
        <Vessel st={st} T={T} c={c} liquid={liquid} level={level} />
      </div>
      {safety && (HZ_MAP[st.key] || []).map((id, k) => (
        <div key={id} style={{ position: 'absolute', left: x - 292, top: 576 + k * 38, display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px 3px 4px', maxWidth: 172, boxSizing: 'border-box',
          background: k === 0 && focus > 0.5 ? mix(C.a9, C.a7, 0.5 + 0.5 * Math.sin(T * 5)) : C.a9, color: '#ffffff', font: '600 15px ' + HF, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          <Sign code={HZ[id].sign} size={24} />{HZ[id].tag}
        </div>
      ))}
      {st.adds && (st.vessel === 'reactor' || st.vessel === 'tank') && rp > 0 && rp < 1 && (
        <svg width="10" height="10" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <circle cx={x} cy={VY + 190} r={70 + 130 * rp} fill="none" stroke={C.a} strokeWidth={0.5 + 3 * (1 - rp)} opacity={1 - rp} />
        </svg>
      )}
      {st.qc && (() => {
        const qp = prog(T, c + 1.8, c + 2.8, MOTION.move);
        return (
          <div style={{ position: 'absolute', left: x + 214, top: lerp(VY + 240, VY + 350, qp), opacity: prog(T, c + 1.8, c + 2.1) }}>
            <svg width="32" height="70" style={{ display: 'block', overflow: 'visible' }}>
              <path d="M10 30 L10 54 A6 6 0 0 0 22 54 L22 30 Z" fill={liquid} />
              <path d="M5 2 L27 2 M9 2 L9 54 A7 7 0 0 0 23 54 L23 2" fill="none" stroke={C.text} strokeWidth="1.6" />
            </svg>
            <div style={{ font: '600 20px ' + HF, letterSpacing: '0.08em', color: C.a7, whiteSpace: 'nowrap', marginTop: 2 }}>QC {st.qc}</div>
          </div>
        );
      })()}
      <div style={{ position: 'absolute', left: x - 270, top: 925, width: 540, opacity: panel, transform: 'translateY(' + (1 - panel) * 16 + 'px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid ' + C.div, borderBottom: '1px solid ' + C.div }}>
          <div style={Object.assign({ borderRight: '1px solid ' + C.div }, cell)}>
            <Label>{chem(st.read[0])}</Label>
            <div style={{ font: '600 56px ' + HF, color: C.text, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{readVal}</div>
          </div>
          <div style={Object.assign({ paddingLeft: 20 }, cell)}>
            {wst ? <>
              <Label>{wst.n < 0 ? 'Wash cycle' : 'Wash ' + (wst.n + 1) + ' / ' + WASH_A1.length + (wst.done ? ' · done' : wst.filtering ? ' · filter' : ' · refill')}</Label>
              <div style={{ font: '600 40px ' + HF, color: C.text, lineHeight: 1.35, whiteSpace: 'nowrap' }}>{Math.round(wst.water).toLocaleString('en-US')} L</div>
              <div style={{ font: '500 18px ' + BF, color: C.n7 }}>total water used</div>
            </> : st.seq ? (() => {
              let si = 0; st.seq.forEach((q, k) => { if (T >= c + q[1]) si = k; });
              return <>
                <Label>Step {si + 1} / {st.seq.length}</Label>
                <div style={{ font: '600 34px ' + HF, color: C.text, lineHeight: 1.35, whiteSpace: 'nowrap' }}>{st.seq[si][0]}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>{st.seq.map((q, k) => <div key={k} style={{ width: 28, height: 6, background: k <= si ? C.a : 'transparent', border: '1px solid ' + (k <= si ? C.a : C.n4) }}></div>)}</div>
              </>;
            })() : <>
              <Label>{st.sub ? st.sub[0] : 'Section'}</Label>
              <div style={{ font: '600 40px ' + HF, color: C.text, lineHeight: 1.35, whiteSpace: 'nowrap' }}>{st.sub ? subVal : SECTIONS[SEC_OF(i)].name.split(' · ')[0]}</div>
            </>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + C.div }}>
          <Label style={{ width: 60 }}>Out</Label>
          <div style={{ width: 22, height: 22, background: liquid, border: '1px solid ' + C.line, flex: 'none' }}></div>
          <span style={{ font: '500 26px ' + BF, color: C.text }}>{st.out}</span>
        </div>
        {st.side && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', font: '500 22px ' + BF, color: C.a7 }}>
            <Label style={{ width: 60, fontSize: 18 }}>Side</Label><span>{st.side}</span>
          </div>
        )}
      </div>
      <div style={{ opacity: panel }}>
        {st.wash ? <WashChart T={T} c={c} x={x} /> : <Structure from={prev ? prev.struct : 'graphite'} to={st.struct} p={colP} x={x} />}
      </div>
    </div>
  );
}

function SectionBands({ T }) {
  return SECTIONS.map((s, k) => {
    const a = SX(s.from) - 300, b = SX(s.to) + 300, on = prog(T, 0.6 + k * 0.25, 1.4 + k * 0.25);
    return (
      <div key={s.name} style={{ position: 'absolute', left: a, top: 112, width: b - a, opacity: on }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, whiteSpace: 'nowrap' }}>
          <span style={{ font: '600 30px ' + HF, color: C.a }}>{String(k + 1).padStart(2, '0')}</span>
          <span style={{ font: '600 44px ' + HF, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.a7, lineHeight: 1 }}>{s.name}</span>
        </div>
        <div style={{ height: 2, background: C.a7, marginTop: 6, width: (on * 100) + '%' }}></div>
      </div>
    );
  });
}

function InertZone({ T }) {
  const idx = STATIONS.map((s, i) => s.inert ? i : -1).filter((i) => i >= 0);
  const a = SX(idx[0]) - 330, b = SX(idx[idx.length - 1]) + 330, on = prog(T, 1.8, 2.6);
  return (
    <div style={{ position: 'absolute', left: a, top: 150, width: b - a, height: 1190, border: '2px dashed ' + C.a7, boxSizing: 'border-box', opacity: on }}>
      <div style={{ position: 'absolute', right: 28, top: -36, font: '600 26px ' + HF, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.a7, whiteSpace: 'nowrap' }}>
        Inert environment · O₂ &lt; 20 ppm · target &lt; 10 ppm
      </div>
    </div>
  );
}

const CARRY = { PreG: 'Pre-G slurry', Fix1: 'Pre-G slurry', Press: 'Wet Pre-G', Dry: 'Pre-G powder', TLGO: 'TLGO slurry', Fix2: 'TLGO slurry', Wash: 'Wet TLGO',
  DMF: 'GO + DMF', Sonic: 'GO dispersion', MixB: 'H3BO3:GO slurry', Spray: 'Dry H3BO3:GO', Furnace1: 'BC powder', MixK: 'KOH:BC', Furnace2: 'BCK powder', Compact: 'P100 pellets', Glove: 'P100 tank' };
const pipeCol = (k) => k === 0 ? '#2b2b2d' : STATIONS[Math.min(k, STATIONS.length) - 1].color;
const pipeLab = (k) => k === 0 ? 'Graphite' : CARRY[STATIONS[Math.min(k, STATIONS.length) - 1].key];
const WY = 1336;
const WASTE = [['Fix1', 180, 210, 'decant'], ['Press', 90, 306, 'run'], ['Fix2', 180, 210, 'decant'], ['Wash', 190, 318, 'wash'], ['Spray', 112, 60, 'run']];
function Waste({ T, CUES }) {
  const items = WASTE.map(([key, lx, ly, kind]) => {
    const i = STATIONS.findIndex((q) => q.key === key), st = STATIONS[i], x = SX(i), c = CUES[key];
    const [a, b] = kind === 'decant' ? [c + st.ph.decant[0], c + st.ph.decant[1]] : kind === 'wash' ? [c + W_T0, c + W_T0 + WASH_A1.length * W_DT] : [c + 1.0, c + 3.0];
    return { pts: [[x + lx, VY + ly], [x + 285, VY + ly], [x + 285, WY]], active: T > a && T < b + 0.6, done: T >= b };
  });
  const TX = SX(STATIONS.length - 1) + 312, TW = 96;
  const hd = 'M' + items[0].pts[2][0] + ' ' + WY + ' L' + TX + ' ' + WY;
  const fill = items.filter((it) => it.done).length / items.length;
  const lv = 138 * (0.06 + 0.86 * fill);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: prog(T, 2.0, 2.8) }}>
      <svg width={BW} height="1500" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={hd} fill="none" stroke={C.n6} strokeWidth="1.6" />
        {items.some((it) => it.active) && <path d={hd} fill="none" stroke={C.n6} strokeWidth="4" strokeDasharray="10 16" strokeDashoffset={-T * 90} />}
        {items.map((it, k) => {
          const L = plen(it.pts);
          return (
            <g key={k}>
              <path d={toD(it.pts)} fill="none" stroke={C.n6} strokeWidth="1.4" strokeDasharray="6 5" />
              {it.active && [0, 1, 2].map((j) => { const q = ptAt(it.pts, ((T * 0.6 + j / 3) % 1) * L); return <circle key={j} cx={q[0]} cy={q[1]} r="5" fill={C.n6} />; })}
            </g>
          );
        })}
        <rect x={TX + 1} y={WY + 80 - lv} width={TW - 2} height={lv} fill={C.n4} />
        <path d={'M' + TX + ' ' + (WY - 60) + ' L' + TX + ' ' + (WY + 80) + ' L' + (TX + TW) + ' ' + (WY + 80) + ' L' + (TX + TW) + ' ' + (WY - 60)} fill="none" stroke={C.text} strokeWidth="1.6" />
        <text x={TX + TW / 2} y={WY + 108} textAnchor="middle" style={{ font: '600 22px ' + HF, letterSpacing: '0.08em', fill: C.n7 }}>WASTE · EQ</text>
        <text x={TX + TW / 2} y={WY + 132} textAnchor="middle" style={{ font: '600 22px ' + HF, letterSpacing: '0.08em', fill: C.n7 }}>TREATMENT</text>
      </svg>
    </div>
  );
}

function FlowLine({ T, mk }) {
  const lbl = { font: '600 18px ' + HF, letterSpacing: '0.1em', fill: C.a7 };
  return (
    <svg width={BW} height="1400" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {ROUTES.map((pts, k) => {
        const L = plen(pts), d = prog(T, 0.5 + k * 0.12, 1.3 + k * 0.12, MOTION.move);
        const lit = k < mk.pipe ? L : k === mk.pipe ? mk.pd : 0;
        const e = pts[pts.length - 1], q = pts[pts.length - 2];
        const ang = Math.atan2(e[1] - q[1], e[0] - q[0]) * 180 / Math.PI;
        return (
          <g key={k}>
            <path d={toD(pts)} fill="none" stroke={C.line} strokeWidth="1.6" strokeDasharray={L * d + ' ' + L} />
            <path d={toD(pts)} fill="none" stroke={C.a7} strokeWidth="11" strokeDasharray={lit + ' ' + (L + 10)} />
            <path d={toD(pts)} fill="none" stroke={pipeCol(k)} strokeWidth="7" strokeDasharray={lit + ' ' + (L + 10)} />
            {k === mk.pipe && !mk.inside && lit > 24 && lit < L - 1 && [0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
              const dd = lit - 20 - ((T * 140) % 46) - j * 46;
              if (dd < 8) return null;
              const p1 = ptAt(pts, dd - 1), p2 = ptAt(pts, dd + 1), q = ptAt(pts, dd);
              const an = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
              return <path key={j} d="M-4 -5 L2 0 L-4 5" fill="none" stroke={C.bg} strokeWidth="2.2" transform={'translate(' + q[0] + ' ' + q[1] + ') rotate(' + an + ')'} />;
            })}
            <g transform={'translate(' + e[0] + ' ' + e[1] + ') rotate(' + ang + ')'} opacity={d > 0.98 ? 1 : 0}>
              <path d="M-16 -9 L0 0 L-16 9" fill="none" stroke={lit >= L - 1 ? C.a : C.line} strokeWidth="2.4" />
            </g>
          </g>
        );
      })}
      {STATIONS.map((st, i) => {
        const a = portXY(i, 'in'), b = portXY(i, 'out'), on = prog(T, 1.0 + i * 0.1, 1.6 + i * 0.1);
        const tag = (p, t) => {
          const [x, y, dir] = p;
          const tx = dir === 'left' ? x - 12 : x + 12;
          const ty = dir === 'top' ? y - 18 : dir === 'bottom' ? y + 26 : y - 14;
          return <text x={tx} y={ty} textAnchor={dir === 'left' ? 'end' : 'start'} style={lbl}>{t}</text>;
        };
        return (
          <g key={'p' + i} opacity={on}>
            <rect x={a[0] - 6} y={a[1] - 6} width="12" height="12" fill={C.bg} stroke={C.a7} strokeWidth="1.6" />
            <rect x={b[0] - 6} y={b[1] - 6} width="12" height="12" fill={C.bg} stroke={C.a7} strokeWidth="1.6" />
            {tag(a, 'IN')}{tag(b, 'OUT')}
          </g>
        );
      })}
    </svg>
  );
}

function hexPts(cx, cy, r) { return [0, 1, 2, 3, 4, 5].map((k) => { const a = Math.PI / 180 * (60 * k - 30); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }); }
const R = 34, COLS = 9, ROWS = 6;
const HEX = [];
for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) {
  const cx = PX - (COLS - 1) * R * 0.866 + q * R * 1.732 + (r % 2 ? R * 0.866 : 0) - 15;
  const cy = 470 + r * R * 1.5;
  HEX.push({ cx, cy, d: Math.hypot(cx - PX, cy - 640) });
}
const DOPE = [{ h: 10, v: 0, t: 'B' }, { h: 22, v: 2, t: 'B' }, { h: 31, v: 4, t: 'B' }, { h: 40, v: 1, t: 'B' }, { h: 47, v: 3, t: 'B' },
  { h: 14, t: 'K' }, { h: 28, t: 'K' }, { h: 43, t: 'K' }, { h: 5, t: 'K' }];

function Product({ T, CUES, focus }) {
  const P = CUES.Product, fin = prog(T, 2.4, 3.0);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: fin * (0.3 + 0.7 * focus) }}>
      <Frame style={{ left: PX - 400, top: 170, width: 800, height: 1150 }} />
      <div style={{ position: 'absolute', left: PX - 370, top: 192, display: 'flex', alignItems: 'baseline', gap: 16, whiteSpace: 'nowrap' }}>
        <span style={{ font: '600 30px ' + HF, color: C.a7 }}>OUT</span>
        <span style={{ font: '600 48px ' + HF, textTransform: 'uppercase', color: C.text }}>Product · P100 (BCK)</span>
      </div>
      <svg width={BW} height="1400" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {HEX.map((h, k) => {
          const p = prog(T, P + 0.3 + (h.d / 360) * 1.2, P + 0.8 + (h.d / 360) * 1.2);
          return <polygon key={k} points={hexPts(h.cx, h.cy, R * (0.6 + 0.4 * p)).map((v) => v.join(',')).join(' ')} fill="none" stroke={C.text} strokeWidth="1.4" opacity={p} />;
        })}
        {DOPE.map((g, k) => {
          const p = prog(T, P + 1.6 + k * 0.12, P + 2.1 + k * 0.12, MOTION.pop);
          const [x, y] = g.t === 'B' ? hexPts(HEX[g.h].cx, HEX[g.h].cy, R)[g.v] : [HEX[g.h].cx, HEX[g.h].cy];
          return (
            <g key={k} opacity={clamp(p, 0, 1)} transform={'translate(' + x + ' ' + y + ') scale(' + p + ')'}>
              <circle r={g.t === 'K' ? 22 : 17} fill={g.t === 'K' ? C.a2 : C.bg} stroke={g.t === 'K' ? C.a7 : C.a} strokeWidth="2" />
              <text textAnchor="middle" y="7" style={{ font: '600 20px ' + HF, fill: C.a9 }}>{g.t}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: PX - 370, top: 900, width: 740, opacity: prog(T, P + 2.8, P + 3.5) }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid ' + C.div, borderBottom: '1px solid ' + C.div }}>
          {[['B · K · O', '6–8 % each', 'composition · QCT-4'], ['C', '< 60 %', 'composition · QCT-4'], ['H₂', '4.0–5.5 wt %', 'in-range sorption · QCT-2']].map((g, k) => (
            <div key={k} style={{ padding: '12px 16px', borderLeft: k ? '1px solid ' + C.div : 'none' }}>
              <div style={{ font: '600 34px ' + HF, color: C.a7 }}>{g[0]}</div>
              <div style={{ font: '500 24px ' + BF, color: C.text }}>{g[1]}</div>
              <div style={{ font: '400 20px ' + BF, color: C.n7 }}>{g[2]}</div>
            </div>
          ))}
        </div>
        <div style={{ font: '500 24px ' + BF, color: C.text, marginTop: 16 }}>GO <span style={{ color: C.a7 }}>→</span> H₃BO₃:GO <span style={{ color: C.a7 }}>→</span> BC <span style={{ color: C.a7 }}>→</span> KOH:BC <span style={{ color: C.a7 }}>→</span> BCK <span style={{ color: C.a7 }}>→</span> P100</div>
      </div>
    </div>
  );
}

const H_ALL = DOPE.map((g) => {
  const [x, y] = g.t === 'B' ? hexPts(HEX[g.h].cx, HEX[g.h].cy, R)[g.v] : [HEX[g.h].cx, HEX[g.h].cy];
  return { x: x + (HX - PX), y, t: g.t };
});
const H_SITES = H_ALL.filter((p, k) => H_ALL.slice(0, k).every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 95));
function hState(T, H, k) {
  const a = prog(T, H + 0.8 + k * 0.2, H + 2.0 + k * 0.2, MOTION.move);
  const sp = prog(T, H + 2.0 + k * 0.2, H + 2.4 + k * 0.2);
  const d = prog(T, H + 4.6 + k * 0.15, H + 6.0 + k * 0.15, MOTION.move);
  return { a, sp, rc: clamp(d / 0.3, 0, 1), fly: clamp((d - 0.3) / 0.7, 0, 1) };
}
const uptake = (T, H) => H_SITES.reduce((acc, _, k) => { const h = hState(T, H, k); return acc + h.sp * (1 - h.rc); }, 0) / H_SITES.length;

function Hydrogen({ T, CUES, focus }) {
  const H = CUES.Hydrogen, fin = prog(T, 2.6, 3.2);
  const absorbing = T < H + 4.4;
  const heat = prog(T, H + 4.2, H + 5.0) * (1 - prog(T, H + 7.0, H + 7.8));
  const panel = prog(T, H + 0.5, H + 1.1);
  const chart = [];
  for (let k = 0; k <= 60; k++) { const tt = lerp(H + 0.6, H + 7.4, k / 60); if (tt > T) break; chart.push([k / 60 * 300, 100 - uptake(tt, H) * 90]); }
  const last = chart[chart.length - 1];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: fin * (0.3 + 0.7 * focus) }}>
      <svg width={BW} height="1500" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={PX + 400} y1="700" x2={lerp(PX + 400, HX - 416, prog(T, 2.6, 3.4, MOTION.move))} y2="700" stroke={C.line} strokeWidth="1.6" />
        <path d={'M' + (HX - 416) + ' 691 L' + (HX - 400) + ' 700 L' + (HX - 416) + ' 709'} fill="none" stroke={C.line} strokeWidth="2.4" />
        <text x={PX + 450} y="684" style={{ font: '600 18px ' + HF, letterSpacing: '0.1em', fill: C.a7 }}>IN USE</text>
      </svg>
      <Frame style={{ left: HX - 400, top: 170, width: 800, height: 1150 }} />
      <div style={{ position: 'absolute', left: HX - 370, top: 192, display: 'flex', alignItems: 'baseline', gap: 16, whiteSpace: 'nowrap' }}>
        <span style={{ font: '600 30px ' + HF, color: C.a7 }}>USE</span>
        <span style={{ font: '600 48px ' + HF, textTransform: 'uppercase', color: C.text }}>Hydrogen storage</span>
      </div>
      <div style={{ position: 'absolute', left: HX - 370, top: 268, width: 740, display: 'flex', gap: 0, borderTop: '1px solid ' + C.div, borderBottom: '1px solid ' + C.div, opacity: panel }}>
        {[['Absorption', 'H₂ in · charge to 50 bar', absorbing], ['Desorption', 'H₂ out · heat, ≤ 85 °C', !absorbing]].map(([a, b, on], k) => (
          <div key={a} style={{ flex: 1, padding: '10px 16px', borderLeft: k ? '1px solid ' + C.div : 'none', background: on ? C.a2 : 'transparent' }}>
            <div style={{ font: '600 36px ' + HF, textTransform: 'uppercase', color: on ? C.a9 : C.n6 }}>{a}</div>
            <div style={{ font: '500 22px ' + BF, color: on ? C.text : C.n6 }}>{b}</div>
          </div>
        ))}
      </div>
      <svg width={BW} height="1500" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <rect x={HX - 360} y="420" width="720" height="440" fill={C.a2} opacity={heat * 0.6} />
        {HEX.map((h, k) => <polygon key={k} points={hexPts(h.cx + (HX - PX), h.cy, R).map((v) => v.join(',')).join(' ')} fill="none" stroke={C.text} strokeWidth="1.4" />)}
        {H_ALL.map((p, k) => (
          <g key={'s' + k} transform={'translate(' + p.x + ' ' + p.y + ')'}>
            <circle r={p.t === 'K' ? 22 : 17} fill={p.t === 'K' ? C.a2 : C.bg} stroke={p.t === 'K' ? C.a7 : C.a} strokeWidth="2" />
            <text textAnchor="middle" y="7" style={{ font: '600 20px ' + HF, fill: C.a9 }}>{p.t}</text>
          </g>
        ))}
        {H_SITES.map((p, k) => {
          const h = hState(T, H, k);
          const sx = p.x + ((k * 53) % 100) - 50, sy = 360 - (k % 3) * 30;
          const mx = lerp(sx, p.x, h.a), my = lerp(sy, p.y - 40, h.a);
          const cx = lerp(mx, sx + 50, h.fly), cy = lerp(my, 360, h.fly);
          const sep = h.sp * (1 - h.rc);
          const dx = lerp(13, 26, sep), dy = lerp(0, 14, sep) * (1 - h.fly);
          const o = prog(T, H + 0.4, H + 0.9) * (1 - clamp((h.fly - 0.75) / 0.25, 0, 1));
          if (o <= 0.01) return null;
          return (
            <g key={'h' + k} opacity={o}>
              {sep < 0.3 && <line x1={cx - dx} y1={cy + dy} x2={cx + dx} y2={cy + dy} stroke={C.a7} strokeWidth="2" />}
              {[-1, 1].map((sg) => (
                <g key={sg} transform={'translate(' + (cx + sg * dx) + ' ' + (cy + dy) + ')'}>
                  <circle r="14" fill={sep > 0.5 ? C.a3 : C.bg} stroke={C.a7} strokeWidth="1.8" />
                  <text textAnchor="middle" y="6" style={{ font: '600 17px ' + HF, fill: C.a9 }}>H</text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: HX - 370, top: 900, width: 740, opacity: panel }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', borderTop: '1px solid ' + C.div, borderBottom: '1px solid ' + C.div }}>
          <div style={{ padding: '12px 0', borderRight: '1px solid ' + C.div }}>
            <Label>Sites</Label>
            <div style={{ font: '500 24px ' + BF, color: C.text, marginTop: 6 }}>B in lattice</div>
            <div style={{ font: '500 24px ' + BF, color: C.text }}>K on the sheet</div>
            <Label style={{ marginTop: 14 }}>Bed temperature</Label>
            <div style={{ position: 'relative', height: 12, marginTop: 8, marginRight: 24, border: '1px solid ' + C.line }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (15 + 85 * heat) + '%', background: C.a }}></div>
            </div>
          </div>
          <div style={{ padding: '12px 0 12px 20px', position: 'relative' }}>
            <Label>H₂ uptake</Label>
            <svg width="300" height="110" style={{ marginTop: 8, overflow: 'visible' }}>
              <line x1="0" y1="100" x2="300" y2="100" stroke={C.line} strokeWidth="1.2" />
              <line x1="0" y1="0" x2="0" y2="100" stroke={C.line} strokeWidth="1.2" />
              {chart.length > 1 && <path d={'M' + chart.map((p) => p.join(' ')).join(' L')} fill="none" stroke={C.a} strokeWidth="3" />}
              {last && <circle cx={last[0]} cy={last[1]} r="6" fill={C.a7} />}
              <text x="300" y="122" textAnchor="end" style={{ font: '500 16px ' + BF, letterSpacing: '0.12em', fill: C.n7 }}>TIME →</text>
            </svg>
          </div>
        </div>
        <div style={{ font: '500 24px ' + BF, color: C.text, marginTop: 16 }}>Absorb <span style={{ color: C.a7 }}>⇄</span> desorb · target <span style={{ color: C.a7 }}>4.0–5.5 wt % H₂</span></div>
      </div>
    </div>
  );
}

function rawCaps(CUES, total) {
  return [{ at: 0.8, raw: 'TLGO pilot plant: P100 production, from graphite to bottled product.', plain: true }]
    .concat([].concat(...STATIONS.map((st, i) => st.caps ? st.caps.map(([o, tx]) => ({ at: cueOf(CUES, i) + o, raw: tx })) : [{ at: cueOf(CUES, i) + 0.4, raw: st.cap }])))
    .concat([
      { at: CUES.Product + 0.4, raw: 'P100: BCK pellets in an outgassed tank, ready to ship.', plain: true },
      { at: CUES.Hydrogen + 0.4, raw: 'In use: H2 molecules split and bind at the boron and potassium sites.' },
      { at: CUES.Hydrogen + 4.6, raw: 'Heated, the atoms recombine and H2 is released, so the material can cycle again.' },
      { at: CUES.Summary + 0.3, until: total - 0.9, raw: 'Sixteen operations, four QC points, one product line.', plain: true },
    ]);
}
// Caption text → words a narrator can say.
const SAY = [[/H2SO4/g, 'sulfuric acid'], [/H3PO4/g, 'phosphoric acid'], [/KMnO4/g, 'potassium permanganate'], [/K2S2O8/g, 'potassium persulfate'],
  [/P2O5/g, 'phosphorus pentoxide'], [/H2O2/g, 'hydrogen peroxide'], [/\bHCl\b/g, 'hydrochloric acid'], [/\bKOH\b/g, 'potassium hydroxide'],
  [/\bO2\b/g, 'oxygen'], [/\bH2\b/g, 'hydrogen'], [/\bDMF\b/g, 'D M F'], [/\brTLGO\b/g, 'reduced T L G O'], [/\bTLGO\b/g, 'T L G O'],
  [/\bBCK\b/g, 'B C K'], [/\bBC\b/g, 'B C'], [/\bQC\b/g, 'Q C'], [/\bP100\b/g, 'P one hundred'], [/\bpH\b/g, 'P H'], [/\bTFF\b/g, 'T F F'],
  [/\bRO\b/g, 'R O'], [/\bEQ\b/g, 'E Q'], [/Pre-G/g, 'pre G'], [/A-1/g, 'A one'], [/ °C/g, ' degrees Celsius'], [/wt %/g, 'weight percent'], [/ %/g, ' percent'],
  [/(\d) L\b/g, '$1 liters'], [/≈/g, 'about'], [/→/g, 'to'], [/·/g, ','], [/−/g, 'minus ']];
const toSpeech = (t) => SAY.reduce((a, [re, w]) => a.replace(re, w), t);
function pickMaleVoice() {
  const vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
  const en = vs.filter((v) => /^en/i.test(v.lang));
  const male = /\b(male|man|david|daniel|alex|fred|tom|aaron|arthur|guy|james|george|oliver|rishi|reed|ryan|christopher|eric|mark)\b/i;
  return en.find((v) => male.test(v.name) && !/female/i.test(v.name)) || en[0] || vs[0] || null;
}
// Narrator script: short spoken lines with connecting phrases, timed to fit each step.
const VO = [
  ['Opening', 0.6, 'Follow one batch through the T L G O pilot plant, from graphite to a hydrogen tank.'],
  ['PreG', 0.3, 'In the pre G reactor, graphite is pre-oxidized with persulfate and phosphorus pentoxide in sulfuric acid.'],
  ['Fix1', 0.3, 'In the fixing tank, the slurry is diluted, settles overnight, and the clear acid layer is decanted.'],
  ['Press', 0.3, 'The filter press leaves wet pre G solids, and the acidic filtrate goes to waste treatment.'],
  ['Dry', 0.3, 'The solids are spread on trays and dried on a hot plate in the fume hood.'],
  ['TLGO', 0.3, 'A second oxidation, with permanganate in strong acid, turns it into graphite oxide: T L G O.'],
  ['Fix2', 0.3, 'Hydrogen peroxide goes in first. The batch then settles overnight and is decanted.'],
  ['Fix2', 7.4, 'Then a hydrochloric acid wash removes the leftover manganese and metal ions.'],
  ['Wash', 0.3, 'Now the wash loop: filter the tank down, refill with clean water, and repeat, thirty-two times.'],
  ['Wash', 7.3, 'The permeate P H climbs from about one to four point four as the acid rinses out.'],
  ['DMF', 0.3, 'The washed G O soaks in D M F at ninety-five degrees, which also adds nitrogen for doping.'],
  ['Sonic', 0.3, 'A flow-cell sonicator splits the stacked sheets apart, so dopants reach every layer.'],
  ['MixB', 0.3, 'Boric acid, the boron source, is stirred in at ninety-five degrees for four hours.'],
  ['Spray', 0.3, 'The spray dryer flashes off the solvent, leaving a fine, dry precursor powder.'],
  ['Furnace1', 0.3, 'In furnace one, at up to a thousand degrees under argon, boron and nitrogen lock into the carbon.'],
  ['MixK', 0.3, 'Potassium hydroxide is wet-mixed in at seventy degrees, then oven-dried for about four days.'],
  ['Furnace2', 0.3, 'Inside the inert line, furnace two activates the carbon at eight fifty, opening pores to store hydrogen.'],
  ['Compact', 0.3, 'Still under argon, the powder is pressed into one-gram pellets that pack densely into each tank.'],
  ['Glove', 0.3, 'Finally, the pellets are loaded, leak-tested, and outgassed at one hundred degrees under vacuum.'],
  ['Product', 0.4, 'The result is P one hundred: two point seven five kilograms of B C K per tank.'],
  ['Hydrogen', 0.4, 'In use, hydrogen splits and binds at boron and potassium sites.'],
  ['Hydrogen', 5.4, 'Add heat, and the hydrogen is released, ready for the next cycle.'],
  ['Summary', 0.6, 'Sixteen steps, four quality checks, and up to five and a half percent hydrogen by weight.'],
];
const VO_LATE = 1.4; // a line that can't start within this many seconds of its cue is dropped, never rushed
function Narrator({ on, volume }) {
  const { time, playing, CUES } = useComposition();
  const r = React.useRef({ last: time, time, playing, pending: null, busy: false, on, volume });
  const st = r.current;
  st.time = time; st.playing = playing; st.on = on; st.volume = volume;
  const speak = React.useCallback((line) => {
    const ss = window.speechSynthesis; if (!ss) return;
    const u = new SpeechSynthesisUtterance(line.text);
    const v = pickMaleVoice(); if (v) u.voice = v;
    u.rate = 1.0; u.pitch = 0.9; u.volume = clamp(r.current.volume, 0, 1);
    const done = () => {
      r.current.busy = false;
      setTimeout(() => {
        const s2 = r.current, p = s2.pending;
        s2.pending = null;
        if (p && s2.on && s2.playing && s2.time < p.at + VO_LATE) { s2.busy = true; speak(p); }
      }, 140);
    };
    u.onend = done; u.onerror = done;
    r.current.busy = true;
    ss.speak(u);
  }, []);
  React.useEffect(() => {
    const ss = window.speechSynthesis; if (!ss) return;
    const prev = st.last; st.last = time;
    if (!on || time < prev || time - prev > 0.6) {
      st.pending = null;
      if (ss.speaking || ss.pending) ss.cancel();
      st.busy = false;
      return;
    }
    if (!playing || window.__tlgoHold != null) return;
    const hits = VO.map(([k, o, text]) => ({ at: CUES[k] + o, text })).filter((l) => l.at > prev && l.at <= time);
    if (!hits.length) return;
    const line = hits[hits.length - 1];
    if (st.busy) st.pending = line; else speak(line);
  });
  React.useEffect(() => () => window.speechSynthesis && window.speechSynthesis.cancel(), []);
  return null;
}

const MAP = STATIONS.map((st, i) => ({ x: SX(i), sec: SEC_OF(i) })).concat([{ x: PX, sec: 4 }, { x: HX, sec: 4 }]);
const MAP_LABS = ['01', '02', '03', '04', 'USE'];
const MAP_L = [];
MAP.forEach((m, k) => { m.first = !k || MAP[k - 1].sec !== m.sec; m.lab = MAP_LABS[m.sec]; MAP_L.push(11 + (k ? MAP_L[k - 1] - 11 + 26 + (m.first ? 10 : 0) : 0)); });
const MAP_W = MAP_L[MAP_L.length - 1] + 11;
const SEC_NOW = (step) => step < 0 ? -1 : step < STATIONS.length ? SEC_OF(step) : 4;

const STOP_KEYS = STATIONS.map((x) => x.key).concat(['Product', 'Hydrogen', 'Summary']);
function Controls({ t, setTweak }) {
  const tl = useTimeline();
  const { T, CUES } = useComposition();
  const stops = STOP_KEYS.map((k) => toWall(CUES[k] - 0.7)).concat([toWall(CUES.Close - 0.05)]);
  const r = React.useRef({ last: tl.time });
  const st = r.current;
  st.stops = stops; st.tl = tl; st.presenter = !!t.presenter;
  React.useEffect(() => {
    const prev = st.last; st.last = tl.time;
    if (!t.presenter || !(tl.playing || tl.extPlaying)) return;
    const hit = stops.find((x) => x > prev && x <= tl.time && tl.time - prev < 0.6);
    if (hit != null) { tl.setPlaying(false); tl.setTime(hit); st.last = hit; if (tl.extPlaying) window.__tlgoHold = STOP_A[stops.indexOf(hit)]; }
  });
  const STOP_A = STOP_KEYS.map((k) => CUES[k] - 0.7).concat([CUES.Close - 0.05]);
  if (!window.__tlgoQuizOpen && window.__tlgoHold != null && !tl.extPlaying && tl.playing) window.__tlgoHold = null;
  st.next = () => {
    if (window.__tlgoQuizOpen) return;
    window.__tlgoHold = null;
    const tl2 = st.tl;
    if (!tl2.playing) { tl2.setPlaying(true); return; }
    const n = st.stops.find((x) => x > tl2.time + 0.05);
    if (n != null) { tl2.setPlaying(false); tl2.setTime(n); st.last = n; }
  };
  st.back = () => {
    window.__tlgoHold = null;
    const tl2 = st.tl, p = st.stops.filter((x) => x < tl2.time - 0.1).pop();
    tl2.setPlaying(false); tl2.setTime(p != null ? p : 0); st.last = p != null ? p : 0;
  };
  React.useEffect(() => {
    const onKey = (e) => {
      const s2 = r.current;
      if (!s2.presenter || (e.target && /input|textarea|select/i.test(e.target.tagName))) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); s2.next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); e.stopImmediatePropagation(); s2.back(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
  let cur = -1;
  CHAPTERS.forEach(([, key], k) => { if (T >= CUES[key] - 0.3) cur = k; });
  const jump = (key) => { window.__tlgoHold = null; window.__tlgoQuizOpen = false; const w = toWall(CUES[key] - 0.1); tl.setTime(w); st.last = w; };
  const [shown, setShown] = React.useState(true);
  const hov = React.useRef(false);
  React.useEffect(() => {
    let tm = null;
    const wake = () => { setShown(true); clearTimeout(tm); tm = setTimeout(() => { if (!hov.current) setShown(false); }, 2500); };
    wake();
    window.addEventListener('mousemove', wake); window.addEventListener('keydown', wake);
    return () => { clearTimeout(tm); window.removeEventListener('mousemove', wake); window.removeEventListener('keydown', wake); };
  }, []);
  const btn = (active, k) => ({ padding: '4px 8px', border: 'none', borderLeft: k ? '1px solid ' + C.n4 : 'none', borderRadius: 0, cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? C.a : 'transparent', color: active ? '#ffffff' : C.text, font: '600 12px ' + HF, letterSpacing: '0.08em', textTransform: 'uppercase' });
  const grp = { display: 'flex', border: '1px solid ' + C.n4, background: C.bg };
  const stop = (e) => e.stopPropagation();
  const bar = (
    <div onClick={stop} onMouseDown={stop} onPointerDown={stop}
      onMouseEnter={() => { hov.current = true; setShown(true); }} onMouseLeave={() => { hov.current = false; }}
      style={{ position: 'fixed', top: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', flexWrap: 'nowrap', gap: 4, whiteSpace: 'nowrap',
        opacity: shown ? 1 : 0, transition: 'opacity 400ms', pointerEvents: shown ? 'auto' : 'none' }}>
      <div style={grp}>
        {CHAPTERS.map(([nm, key], k) => <button key={nm} onClick={() => jump(key)} style={btn(k === cur, k)}>{nm}</button>)}
      </div>
      <div style={grp}>
        <button onClick={() => setTweak('presenter', !t.presenter)} aria-pressed={!!t.presenter} title="Pause at the end of every step" style={btn(!!t.presenter, 0)}>Present</button>
        {t.presenter && <button onClick={() => st.back()} title="Previous step (←)" style={btn(false, 1)}>‹</button>}
        {t.presenter && <button onClick={() => st.next()} title="Next step (→)" style={btn(false, 1)}>{tl.playing ? 'Skip ›' : 'Next ›'}</button>}
      </div>
      <div style={grp}>
        <button onClick={() => setTweak('safety', !t.safety)} aria-pressed={!!t.safety} title="Safety plan cards, hazard tags and section quizzes"
          style={Object.assign(btn(!!t.safety, 0), { display: 'flex', alignItems: 'center', gap: 5 })}><Tri size={12} />Safety</button>
        {t.safety && <button onClick={() => setTweak('quizDepth', t.quizDepth === 'off' ? 'section' : t.quizDepth === 'step' ? 'off' : 'step')} title="Quiz: per section → every step → off"
          style={btn(t.quizDepth !== 'off', 1)}>{t.quizDepth === 'off' ? 'Quiz · off' : t.quizDepth === 'step' ? 'Quiz · every step' : 'Quiz · per section'}</button>}
      </div>
      <div style={grp}>
        <button onClick={() => setTweak('narration', !t.narration)} aria-pressed={!!t.narration} title="Toggle narration"
          style={Object.assign(btn(!!t.narration, 0), { display: 'flex', alignItems: 'center', gap: 5 })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {t.narration ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></> : <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>}
          </svg>
          {t.narration ? 'Voice on' : 'Voice off'}
        </button>
      </div>
    </div>
  );
  return typeof ReactDOM !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(bar, document.body) : bar;
}

function SafetyQuiz({ on, depth }) {
  const tl = useTimeline();
  const { CUES } = useComposition();
  const [q, setQ] = React.useState(null);
  const last = React.useRef(tl.time), score = React.useRef({});
  const LIST = depth === 'step' ? STEP_QUIZ : QUIZ;
  const stops = LIST.map((z) => toWall(CUES[z.next] - 0.7));
  React.useEffect(() => { setQ(null); score.current = {}; }, [depth]);
  React.useEffect(() => {
    const prev = last.current; last.current = tl.time;
    window.__tlgoQuizOpen = !!q;
    if (q) {
      // Only a seek back before the stop closes the quiz; forward drift (host clock) keeps it open and held.
      if (tl.time < stops[q.k] - 0.5) { setQ(null); return; }
      window.__tlgoHold = CUES[LIST[q.k].next] - 0.7;
      if (tl.playing) tl.setPlaying(false);
      return;
    }
    if (!on || !(tl.playing || tl.extPlaying)) return;
    const k = stops.findIndex((x) => x > prev && x <= tl.time && tl.time - prev < 0.6);
    if (k >= 0) { tl.setPlaying(false); tl.setTime(stops[k]); last.current = stops[k]; window.__tlgoHold = CUES[LIST[k].next] - 0.7; setQ({ k, qi: 0, picked: null }); }
  });
  React.useEffect(() => { if (!q) window.__tlgoHold = null; }, [q]);
  React.useEffect(() => { if (!on) setQ(null); }, [on]);
  React.useEffect(() => () => { window.__tlgoQuizOpen = false; window.__tlgoHold = null; }, []);
  if (!q) return null;
  const z = LIST[q.k], item = z.qs[q.qi], done = q.picked != null, lastQ = q.qi === z.qs.length - 1;
  const pick = (i) => { if (done) return; score.current[q.k + '-' + q.qi] = i === item.a; setQ(Object.assign({}, q, { picked: i })); };
  const cont = () => {
    if (!lastQ) { setQ({ k: q.k, qi: q.qi + 1, picked: null }); return; }
    window.__tlgoQuizOpen = false; window.__tlgoHold = null; tl.setTime(stops[q.k]); last.current = stops[q.k]; setQ(null); tl.setPlaying(true);
  };
  const vals = Object.values(score.current), right = vals.filter(Boolean).length;
  const secRight = z.qs.filter((_, i) => score.current[q.k + '-' + i]).length;
  const stop = (e) => e.stopPropagation();
  return (
    <div onClick={stop} onMouseDown={stop} onPointerDown={stop} style={{ position: 'absolute', inset: 0, background: 'rgba(242,242,243,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
      <div style={{ position: 'relative', width: 1120, background: C.bg, border: '1px solid ' + C.text, padding: '30px 40px 32px', boxSizing: 'border-box' }}>
        <Marks />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.a7 }}>
          <Sign code="W001" size={30} />
          <Label style={{ color: C.a7 }}>Safety check · {z.sec}{z.qs.length > 1 ? ' · question ' + (q.qi + 1) + ' of ' + z.qs.length : ''}</Label>
          <span style={{ marginLeft: 'auto', font: '600 22px ' + HF, letterSpacing: '0.06em', color: C.a7 }}>SCORE {right} / {vals.length}</span>
        </div>
        <div style={{ font: '600 44px ' + HF, color: C.text, lineHeight: 1.15, margin: '12px 0 20px', textWrap: 'pretty' }}>{item.q}</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {item.opts.map((o, i) => {
            const isA = i === item.a, isP = i === q.picked;
            const bg = done && isA ? C.a2 : 'transparent', bd = done && isA ? C.a7 : done && isP ? C.text : C.n4;
            return (
              <button key={i} onClick={() => pick(i)} style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', padding: '12px 16px', background: bg, border: '1.5px solid ' + bd, borderRadius: 0, cursor: done ? 'default' : 'pointer', color: done && !isA && !isP ? C.n7 : C.text, font: '500 26px ' + BF }}>
                <span style={{ width: 36, height: 36, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid ' + (done && isA ? C.a7 : C.n6), background: done && isA ? C.a : 'transparent', color: done && isA ? '#ffffff' : C.text, font: '600 22px ' + HF }}>{done && isA ? '✓' : done && isP ? '✕' : 'ABC'[i]}</span>
                <span>{chem(o)}</span>
              </button>
            );
          })}
        </div>
        {done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid ' + C.div }}>
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 30px ' + HF, textTransform: 'uppercase', color: q.picked === item.a ? C.a7 : C.text }}>{q.picked === item.a ? 'Correct' : 'Not quite: the correct answer is ' + 'ABC'[item.a]}</div>
              <div style={{ font: '500 22px ' + BF, color: C.n7 }}>{item.reg}{lastQ && z.qs.length > 1 ? ' · section score ' + secRight + ' / ' + z.qs.length : ''}</div>
            </div>
            <button onClick={cont} style={{ padding: '12px 22px', border: '1px solid ' + C.a7, borderRadius: 0, background: C.a, color: '#ffffff', cursor: 'pointer', font: '600 24px ' + HF, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lastQ ? 'Continue ›' : 'Next question ›'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Piece({ t }) {
  const comp = useComposition();
  const { CUES, authoredTotal } = comp;
  const held = window.__tlgoHold != null;
  const T = held ? window.__tlgoHold : comp.T;
  const tlc = useTimeline();
  const [cardPaused, setCardPaused] = React.useState(false);
  React.useEffect(() => { if (cardPaused && window.__tlgoHold == null) setCardPaused(false); });
  const toggleCard = (e) => {
    e.stopPropagation();
    if (window.__tlgoQuizOpen) return;
    if (!cardPaused) { window.__tlgoHold = T; tlc.setPlaying(false); setCardPaused(true); }
    else { const w = toWall(window.__tlgoHold); window.__tlgoHold = null; setCardPaused(false); tlc.setTime(w); tlc.setPlaying(true); }
  };
  const cam = useCamera(T, CUES);
  const over = clamp((0.6 - cam.s) / 0.3, 0, 1);
  const mk = markerPos(T, CUES);
  const fadeOut = 1 - prog(T, authoredTotal - 0.9, authoredTotal - 0.1, MOTION.move);
  const hud = prog(T, 0.2, 0.9) * fadeOut;
  const N = STATIONS.length;
  let step = -1;
  for (let k = 0; k <= N; k++) if (T >= cueOf(CUES, k) - 0.3) step = k;
  if (T >= CUES.Hydrogen - 0.3 && T < CUES.Summary - 0.3) step = N + 1;
  if (T >= CUES.Summary - 0.3) step = N + 2;
  const stepName = step < 0 ? 'Overview' : step < N ? STATIONS[step].title : step === N ? 'Product' : step === N + 1 ? 'Hydrogen storage' : 'Summary';
  const kicker = step >= 0 && step < N ? 'Step ' + String(step + 1).padStart(2, '0') + ' / ' + N + ' · ' + SECTIONS[SEC_OF(step)].name.split(' · ')[0] : 'Stage';
  const focusOf = (x) => Math.max(over, clamp(1 - Math.abs(cam.x - x) / 480, 0, 1));
  let mkCol = '#2b2b2d';
  if (mk.inside) { const i = mk.pipe - 1, st = STATIONS[i]; mkCol = mix(i ? STATIONS[i - 1].color : '#2b2b2d', st.color, colProg(st, T, cueOf(CUES, i))); }
  else if (mk.pipe >= 1) mkCol = STATIONS[Math.min(mk.pipe, STATIONS.length) - 1].color;
  const mkLab = pipeLab(mk.pipe);
  // Label rides only on pipes, fades out near ports, and sits beside the run: above horizontal runs, right of vertical drops.
  let labO = 0, labVert = false;
  const rt = !mk.inside && ROUTES[mk.pipe];
  if (rt) {
    const L = plen(rt), p1 = ptAt(rt, Math.max(mk.pd - 2, 0)), p2 = ptAt(rt, Math.min(mk.pd + 2, L));
    labVert = Math.abs(p2[1] - p1[1]) > Math.abs(p2[0] - p1[0]);
    labO = clamp(Math.min(mk.pd, L - mk.pd) / 70, 0, 1);
  }
  const mapX = (() => {
    if (cam.x <= MAP[0].x) return MAP_L[0];
    for (let k = 1; k < MAP.length; k++) if (cam.x <= MAP[k].x) return lerp(MAP_L[k - 1], MAP_L[k], (cam.x - MAP[k - 1].x) / (MAP[k].x - MAP[k - 1].x));
    return MAP_L[MAP.length - 1];
  })();
  const S = CUES.Summary, sp = prog(T, S + 0.9, S + 1.6) * fadeOut;
  const caps = rawCaps(CUES, authoredTotal).map((c) => ({ at: c.at, until: c.until, text: c.plain ? c.raw : <>{chem(c.raw)}</> }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: BW, height: 1500, transformOrigin: '0 0', opacity: fadeOut,
        transform: 'translate(' + (960 - cam.x * cam.s) + 'px,' + (540 - cam.y * cam.s) + 'px) scale(' + cam.s + ')',
        backgroundImage: t.showGrid ? 'linear-gradient(rgba(89,128,166,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(89,128,166,0.10) 1px, transparent 1px)' : 'none',
        backgroundSize: '40px 40px' }}>
        <SectionBands T={T} />
        <InertZone T={T} />
        <Waste T={T} CUES={CUES} />
        <div style={{ position: 'absolute', left: 40, top: 420, opacity: prog(T, 0.4, 1.0) }}>
          <Label style={{ color: C.a7 }}>Raw feed</Label>
          <div style={{ font: '600 30px ' + HF, color: C.text, textTransform: 'uppercase' }}>Graphite</div>
        </div>
        {STATIONS.map((st, i) => <Station key={st.key} st={st} i={i} T={T} CUES={CUES} focus={focusOf(SX(i))} safety={!!t.safety} />)}
        <Product T={T} CUES={CUES} focus={focusOf(PX)} />
        <Hydrogen T={T} CUES={CUES} focus={focusOf(HX)} />
        <FlowLine T={T} mk={mk} />
        {T > CUES.PreG - 0.6 && T < CUES.Summary + 0.8 && (
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - prog(T, CUES.Summary, CUES.Summary + 0.8) }}>
            <div style={{ position: 'absolute', left: mk.xy[0] - 11, top: mk.xy[1] - 11, width: 22, height: 22, borderRadius: 11, background: mkCol, border: '3px solid ' + C.a7, boxShadow: '0 0 0 3px ' + C.bg, boxSizing: 'border-box' }}></div>
            <div style={{ position: 'absolute', left: labVert ? mk.xy[0] + 24 : mk.xy[0], top: labVert ? mk.xy[1] - 18 : mk.xy[1] - 58, transform: labVert ? 'none' : 'translateX(-50%)', opacity: labO, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
              background: C.bg, border: '1.5px solid ' + C.a7, padding: '3px 10px', font: '600 22px ' + HF, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.a9 }}>
              <span style={{ width: 14, height: 14, background: mkCol, border: '1px solid ' + C.line, flex: 'none' }}></span>
              <span>{chem(mkLab)}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', left: 64, top: 52, opacity: hud, background: C.bg, padding: '14px 22px 16px', border: '1px solid ' + C.div }}>
        <Marks />
        <Label style={{ fontSize: 18, color: C.a7 }}>Pilot plant · P100 production</Label>
        <div style={{ font: '600 44px ' + HF, textTransform: 'uppercase', color: C.text, lineHeight: 1.05 }}>TLGO process flow</div>
        <div style={{ font: '500 22px ' + BF, color: C.n7 }}>Graphite → BCK TLGO</div>
      </div>
      <div style={{ position: 'absolute', right: 64, top: 52, opacity: hud, textAlign: 'right', background: C.bg, padding: '14px 22px 16px', border: '1px solid ' + C.div, minWidth: 300 }}>
        <Marks />
        <Label style={{ fontSize: 18, color: C.a7 }}>{kicker}</Label>
        <div style={{ font: '600 44px ' + HF, textTransform: 'uppercase', color: C.text, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{stepName}</div>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 52, opacity: hud, background: C.bg, border: '1px solid ' + C.div, padding: '12px 18px 12px' }}>
        <Marks />
        <Label style={{ fontSize: 16, color: C.a7 }}>Line map</Label>
        <div style={{ position: 'relative', width: MAP_W, height: 52, marginTop: 6 }}>
          {MAP.map((m, k) => m.first && <div key={'l' + k} style={{ position: 'absolute', left: MAP_L[k] - 11, top: 0, font: '600 14px ' + HF, letterSpacing: '0.08em', color: SEC_NOW(step) === m.sec ? C.a7 : C.n6 }}>{m.lab}</div>)}
          {MAP.map((m, k) => <div key={k} style={{ position: 'absolute', left: MAP_L[k] - 11, top: 18, width: 22, height: 14, boxSizing: 'border-box', background: k < step ? C.a3 : k === step ? C.a : 'transparent', border: '1px solid ' + (k <= step ? C.a : C.n4) }}></div>)}
          <div style={{ position: 'absolute', left: mapX - 6, top: 38, width: 12, height: 12, background: mkCol, border: '2px solid ' + C.a7, boxSizing: 'border-box', transform: 'rotate(45deg)' }}></div>
        </div>
      </div>
      {t.safety && step >= 0 && step < N && HZ_MAP[STATIONS[step].key] && (() => {
        const ids = HZ_MAP[STATIONS[step].key], h = HZ[ids[0]], c0 = cueOf(CUES, step), o = hud * prog(T, c0 + 0.2, c0 + 0.8);
        const sec = (lab, txt) => (
          <div style={{ padding: '7px 0', borderTop: '1px solid ' + C.div }}>
            <Label style={{ fontSize: 15, color: C.a7 }}>{lab}</Label>
            <div style={{ font: '500 21px ' + BF, lineHeight: 1.28, color: C.text, marginTop: 2, textWrap: 'pretty' }}>{chem(txt)}</div>
          </div>
        );
        return (
          <div onClick={toggleCard} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} title={cardPaused ? 'Click to continue' : 'Click to pause and read'}
            style={{ position: 'absolute', left: 1250, width: 606, top: 196, opacity: o, transform: 'translateX(' + (1 - o) * 30 + 'px)', background: C.bg, border: (cardPaused ? '2px solid ' + C.a7 : '1px solid ' + C.text), padding: '12px 20px 10px', boxSizing: 'border-box', cursor: 'pointer' }}
            style-hover={{ borderColor: C.a7 }}>
            <Marks />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 6px' }}>
              <Sign code={h.sign} size={58} />
              <div style={{ minWidth: 0 }}>
                <Label style={{ fontSize: 15, color: C.a7 }}>Safety plan · step {String(step + 1).padStart(2, '0')} · ISO 7010 {h.sign}</Label>
                <div style={{ font: '600 30px ' + HF, textTransform: 'uppercase', color: C.text, lineHeight: 1.05 }}>{h.title}</div>
              </div>
            </div>
            {sec('Potential hazard & consequence', h.hz)}
            {sec('Prevent & prepare', h.pv)}
            {sec('What to do if it occurs', h.rs)}
            <div style={{ padding: '7px 0 4px', borderTop: '1px solid ' + C.div }}>
              <Label style={{ fontSize: 15, color: C.a7 }}>Regulation · WorkSafeBC</Label>
              <div style={{ font: '600 21px ' + HF, letterSpacing: '0.02em', color: C.a9, marginTop: 2 }}>{h.rg}</div>
            </div>
            {ids.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingTop: 7, borderTop: '1px solid ' + C.div }}>
                <Label style={{ fontSize: 15 }}>Also</Label>
                {ids.slice(1).map((id) => <span key={id} style={{ display: 'flex', flex: 'none', whiteSpace: 'nowrap', alignItems: 'center', gap: 5, padding: '2px 8px 2px 4px', border: '1px solid ' + C.a7, color: C.a9, font: '600 15px ' + HF, letterSpacing: '0.06em', textTransform: 'uppercase' }}><Sign code={HZ[id].sign} size={18} />{HZ[id].tag}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, font: '400 14px ' + BF, color: C.n7 }}>From the draft H2M Pilot Plant Safety Plan · for review. Follow approved site procedures.</div>
              <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: cardPaused ? C.a : 'transparent', border: '1px solid ' + C.a7, color: cardPaused ? '#ffffff' : C.a7, font: '600 15px ' + HF, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {cardPaused ? '▶ Paused · click to continue' : '❚❚ Click to pause'}
              </div>
            </div>
          </div>
        );
      })()}
      {sp > 0 && (
        <div style={{ position: 'absolute', left: 230, right: 230, top: 200, opacity: sp, transform: 'translateY(' + (1 - sp) * 20 + 'px)', background: C.bg, border: '1px solid ' + C.text, padding: '30px 44px 36px', boxSizing: 'border-box' }}>
          <Marks />
          <Label style={{ color: C.a7 }}>Summary · P100 production line</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1.1fr)', columnGap: 30, marginTop: 18, alignItems: 'start' }}>
            <div>
              <div style={{ font: '600 44px ' + HF, textTransform: 'uppercase', color: C.text }}>Inputs</div>
              {['Graphite', 'K2S2O8 · P2O5 · H2SO4', 'H3PO4 · KMnO4', 'H2O2 · HCl · RO water', 'DMF · H3BO3 · KOH', 'Argon'].map((x) => <div key={x} style={{ font: '500 26px ' + BF, color: C.text, padding: '6px 0', borderBottom: '1px solid ' + C.div }}>{chem(x)}</div>)}
            </div>
            <div style={{ font: '600 64px ' + HF, color: C.a, alignSelf: 'center' }}>→</div>
            <div>
              <div style={{ font: '600 44px ' + HF, textTransform: 'uppercase', color: C.text }}>Process</div>
              {['16 operations · 4 sections', '4 QC sampling points', 'Pyrolysis · 1,000 °C, then 850 °C', 'Inert line · O₂ < 20 ppm'].map((x) => <div key={x} style={{ font: '500 26px ' + BF, color: C.text, padding: '6px 0', borderBottom: '1px solid ' + C.div }}>{x}</div>)}
            </div>
            <div style={{ font: '600 64px ' + HF, color: C.a, alignSelf: 'center' }}>→</div>
            <div>
              <div style={{ font: '600 44px ' + HF, textTransform: 'uppercase', color: C.text }}>Output · P100</div>
              <div style={{ font: '500 26px ' + BF, color: C.text, padding: '6px 0', borderBottom: '1px solid ' + C.div }}>BCK fill · 2.75 kg ± 5 % per tank</div>
              <div style={{ font: '500 26px ' + BF, color: C.text, padding: '6px 0', borderBottom: '1px solid ' + C.div }}>1 ± 0.3 g pellets</div>
              <div style={{ font: '500 26px ' + BF, color: C.text, padding: '6px 0', borderBottom: '1px solid ' + C.div }}>≈ 150 g H₂ per tank · 122–168 g</div>
              <div style={{ font: '600 112px ' + HF, color: C.a7, lineHeight: 1, marginTop: 14 }}>4.0–5.5</div>
              <div style={{ font: '600 30px ' + HF, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.text }}>wt % H₂ · reversible storage</div>
            </div>
          </div>
        </div>
      )}
      {t.captions && !held && (
        <Captions items={caps} style={{ left: 'auto', right: 64, bottom: 52, width: 600, boxSizing: 'border-box', textAlign: 'left', background: C.bg, border: '1px solid ' + C.div, padding: '16px 22px', font: '500 28px ' + BF, lineHeight: 1.3, color: C.text, textShadow: 'none', textWrap: 'pretty' }} />
      )}
    </div>
  );
}

const MUSIC_LEN = 163.4;
const VO_LEN = 164.4;
// Recorded narration: vo_XX.mp3 clips, each started at its VO cue and kept in sync with the timeline.
// Recorded narration: one timeline-aligned mix of uploads/tlgo-voiceover/vo_XX.mp3 — same player for preview and export.
function VoiceTrack({ on, volume }) {
  const { time, playing, duration } = useComposition();
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    el.volume = clamp(volume, 0, 1);
    el.muted = !on;
    const target = Math.min(time, Math.max((el.duration || VO_LEN) - 0.05, 0));
    if (Math.abs(el.currentTime - target) > 0.25) el.currentTime = target;
    if (playing && on && window.__tlgoHold == null) { if (el.paused) el.play().catch(() => {}); } else if (!el.paused) el.pause();
  });
  return <video ref={ref} src="vo-track.wav" preload="auto" playsInline
    data-om-exportable-video-play-start="0" data-om-exportable-video-play-end={String(Math.min(duration, VO_LEN))}
    style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />;
}
// Recorded safety lines: play when the picture is held (card click) or parked at a step's end stop.
function SafetyVoice({ on, volume, safety }) {
  const { T: T0, CUES, playing } = useComposition();
  const held = window.__tlgoHold != null, T = held ? window.__tlgoHold : T0;
  const ref = React.useRef(null), cur = React.useRef(null);
  let idx = -1;
  STATIONS.forEach((x, i) => { if (T >= cueOf(CUES, i) - 0.3) idx = i; });
  if (T >= CUES.Product - 0.3) idx = -1;
  const nearStop = idx >= 0 && Math.abs(T - (cueOf(CUES, idx + 1) - 0.7)) < 0.08;
  const want = on && safety && !window.__tlgoQuizOpen && idx >= 0 && (held || (!playing && nearStop)) ? idx : null;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    el.volume = clamp(volume, 0, 1);
    if (want == null) { if (!el.paused) el.pause(); cur.current = null; return; }
    if (cur.current !== want) {
      cur.current = want;
      el.src = 'uploads/tlgo-voiceover/safe_' + String(want + 1).padStart(2, '0') + '.mp3';
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  });
  return <audio ref={ref} preload="none" style={{ display: 'none' }} />;
}
function Music({ on, volume, ducked }) {
  const { time, playing, duration } = useComposition();
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    el.volume = clamp(volume, 0, 1);
    el.muted = !on;
    const target = Math.min(time, Math.max((el.duration || MUSIC_LEN) - 0.05, 0));
    if (Math.abs(el.currentTime - target) > 0.25) el.currentTime = target;
    if (playing && on && window.__tlgoHold == null) { if (el.paused) el.play().catch(() => {}); } else if (!el.paused) el.pause();
  });
  return <video ref={ref} src={ducked ? 'music-v3-duck.wav' : 'music-v3.wav'} preload="auto" playsInline
    data-om-exportable-video-play-start="0" data-om-exportable-video-play-end={String(Math.min(duration, MUSIC_LEN))}
    style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />;
}

function TLGOFlow() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Piece t={t} />
        <Music on={t.music} volume={t.volume} ducked={!!t.narration} />
        {t.narration && <VoiceTrack on={true} volume={t.narrationVolume ?? 1} />}
        <SafetyVoice on={!!t.narration} safety={!!t.safety} volume={t.narrationVolume ?? 1} />
        <SafetyQuiz on={!!t.safety && t.quizDepth !== 'off'} depth={t.quizDepth === 'step' ? 'step' : 'section'} />
        <Controls t={t} setTweak={setTweak} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Playback" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        <TweakToggle label="Presenter mode (pause each step)" value={!!t.presenter} onChange={(v) => setTweak('presenter', v)} />
        <TweakToggle label="Safety training (cards + quiz)" value={!!t.safety} onChange={(v) => setTweak('safety', v)} />
        <TweakRadio label="Quiz" value={t.quizDepth === 'off' ? 'Off' : t.quizDepth === 'step' ? 'Every step' : 'Per section'} options={['Off', 'Per section', 'Every step']} onChange={(v) => setTweak('quizDepth', v === 'Off' ? 'off' : v === 'Every step' ? 'step' : 'section')} />
        <TweakToggle label="Background music" value={t.music} onChange={(v) => setTweak('music', v)} />
        <TweakSlider label="Music volume" value={t.volume} min={0} max={1} step={0.05} onChange={(v) => setTweak('volume', v)} />
        <TweakToggle label="Narration (recorded voice)" value={t.narration} onChange={(v) => setTweak('narration', v)} />
        <TweakSlider label="Narrator volume" value={t.narrationVolume ?? 1} min={0} max={1} step={0.05} onChange={(v) => setTweak('narrationVolume', v)} />
        <TweakSection label="Display" />
        <TweakToggle label="Blueprint grid" value={t.showGrid} onChange={(v) => setTweak('showGrid', v)} />
        <TweakToggle label="Captions" value={t.captions} onChange={(v) => setTweak('captions', v)} />
      </TweaksPanel>
    </div>
  );
}
window.TLGOFlow = TLGOFlow;
