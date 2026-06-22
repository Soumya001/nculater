// All 12 calculator formulas — pure JS, same logic as the web app

export function fmt(n, dec = 2) {
  if (!isFinite(n)) return '0';
  return parseFloat(n.toFixed(dec)).toString();
}

export function calcDose({ doseToGive, doseInVial, diluent }) {
  const a = parseFloat(doseToGive), b = parseFloat(doseInVial), c = parseFloat(diluent);
  if ([a,b,c].some(isNaN) || b <= 0 || c <= 0 || a <= 0) return { err: 'Enter dose to give, vial strength, and diluent volume.' };
  const vol = (a / b) * c;
  return {
    val: fmt(vol, 2), unit: 'mL',
    working: `(${a} ÷ ${b}) × ${c} = ${fmt(vol, 2)} mL`,
    warn: a > b ? 'Dose to give exceeds vial strength — confirm the order and vial.' : vol > 10 ? 'Volume > 10 mL — consider a more concentrated vial.' : ''
  };
}

export function calcDrip({ volume, time, dropFactor }) {
  const v = parseFloat(volume), h = parseFloat(time), df = parseFloat(dropFactor);
  if ([v,h,df].some(isNaN) || v <= 0 || h <= 0 || df <= 0) return { err: 'Enter volume, time, and drop factor.' };
  const dpm = (v * df) / (h * 60), r = Math.round(dpm), sec = dpm > 0 ? 60 / dpm : 0;
  const in15 = Math.round(dpm / 4), in30 = Math.round(dpm / 2);
  return {
    val: String(r), unit: 'drops/min',
    sub: `≈${fmt(sec, 1)} s between drops`,
    working: `(${v} × ${df}) ÷ (${h} × 60) = ${r} drops/min`,
    spotChecks: [{ label: '15 s', count: in15, tip: 'count × 4' }, { label: '30 s', count: in30, tip: 'count × 2' }, { label: '1 min', count: r, tip: 'full minute' }],
    warn: r > 250 ? 'Very high drop rate — re-check inputs.' : ''
  };
}

export function calcPump({ pumpVolume, pumpTime }) {
  const v = parseFloat(pumpVolume), h = parseFloat(pumpTime);
  if ([v,h].some(isNaN) || v <= 0 || h <= 0) return { err: 'Enter volume and time.' };
  const rate = v / h;
  return { val: fmt(rate, 0), unit: 'mL/hr', working: `${v} ÷ ${h} = ${fmt(rate, 0)} mL/hr`, warn: rate > 999 ? 'Very high pump rate — re-check inputs.' : '' };
}

export function calcWeight({ weight, doseMgKg, dosesPerDay }) {
  const w = parseFloat(weight), d = parseFloat(doseMgKg), n = parseFloat(dosesPerDay);
  if ([w,d,n].some(isNaN) || w <= 0 || d <= 0 || n <= 0) return { err: 'Enter weight, dose per kg, and doses per day.' };
  const total = w * d, per = total / n;
  return {
    total: fmt(total, 1), per: fmt(per, 1), unit: 'mg',
    totalWorking: `${w} kg × ${d} mg/kg = ${fmt(total, 1)} mg/day`,
    perWorking: `${fmt(total, 1)} ÷ ${n} = ${fmt(per, 1)} mg per dose`,
    warn: w > 300 ? 'Weight looks implausible — confirm in kg.' : w < 0.5 ? 'Very low weight — confirm units.' : ''
  };
}

export function calcInfusion({ volLeft, rateMlHr }) {
  const v = parseFloat(volLeft), r = parseFloat(rateMlHr);
  if ([v,r].some(isNaN) || v <= 0 || r <= 0) return { err: 'Enter volume remaining and pump rate.' };
  const hours = v / r, h = Math.floor(hours), m = Math.round((hours - h) * 60);
  return { val: `${h}h ${m}m`, unit: '', working: `${v} mL ÷ ${r} mL/hr = ${fmt(hours, 2)} hr (${h}h ${m}m)`, warn: '' };
}

export function calcConvert({ convType, convVal }) {
  const v = parseFloat(convVal);
  if (isNaN(v) || v < 0) return { err: 'Enter a value to convert.' };
  const conversions = {
    kg_lb: { fn: x => x * 2.20462, unit: 'lb', working: (x, r) => `${x} kg × 2.20462 = ${r} lb` },
    lb_kg: { fn: x => x / 2.20462, unit: 'kg', working: (x, r) => `${x} lb ÷ 2.20462 = ${r} kg` },
    g_mg:  { fn: x => x * 1000,    unit: 'mg', working: (x, r) => `${x} g × 1000 = ${r} mg` },
    mg_mcg:{ fn: x => x * 1000,    unit: 'mcg',working: (x, r) => `${x} mg × 1000 = ${r} mcg` },
    L_mL:  { fn: x => x * 1000,    unit: 'mL', working: (x, r) => `${x} L × 1000 = ${r} mL` }
  };
  const c = conversions[convType];
  if (!c) return { err: 'Select a conversion type.' };
  const result = c.fn(v);
  return { val: fmt(result, result < 0.01 ? 4 : result < 10 ? 3 : 2), unit: c.unit, working: c.working(v, fmt(result, 2)), warn: '' };
}

export function calcOxygen({ spo2Reading, spo2Cat }) {
  const val = parseFloat(spo2Reading);
  if (isNaN(val)) return { err: "Enter the patient's current SpO₂ reading." };
  if (val < 0 || val > 100) return { err: 'SpO₂ must be between 0 and 100%.' };
  const cat = spo2Cat || 'general';
  const targets = {
    general: { low: 92, high: 96, label: 'General adult', note: 'BTS/TSANZ target 92–96%' },
    copd:    { low: 88, high: 92, label: 'COPD / hypercapnia risk', note: 'Lower target 88–92% — avoid suppressing hypoxic drive' },
    acute:   { low: 94, high: 98, label: 'Acutely ill', note: 'Higher target 94–98% for sepsis, MI, stroke (not COPD)' },
    paeds:   { low: 91, high: 95, label: 'Paediatric / neonate', note: 'Confirm 91–95% per unit protocol' }
  };
  const t = targets[cat];
  let status, action, severity;
  if (val >= t.low && val <= t.high) {
    status = 'On target'; action = 'Continue current oxygen therapy and monitor per local protocol.'; severity = 'ok';
  } else if (val < t.low) {
    const gap = t.low - val;
    status = `Below target (${gap}% low)`;
    action = gap >= 5 ? 'Significantly below target — escalate, increase oxygen delivery, reassess urgently.' : 'Below target — increase oxygen flow and reassess within minutes. If no improvement, escalate.';
    severity = 'danger';
  } else {
    const gap = val - t.high;
    status = `Above target (${gap}% high)`;
    action = 'Hyperoxia can be harmful. Consider reducing oxygen flow to bring SpO₂ within target. Reassess and confirm the order.';
    severity = 'warn';
  }
  return { val: fmt(val, 1), status, action, severity, target: `${t.low}–${t.high}%`, label: t.label, note: t.note };
}

export function calcTitration({ drugMg, bagVol, titWeight, ordDose }) {
  const mg = parseFloat(drugMg), vol = parseFloat(bagVol), wt = parseFloat(titWeight), dose = parseFloat(ordDose);
  if ([mg, vol, wt, dose].some(isNaN) || [mg, vol, wt, dose].some(x => x <= 0)) return { err: 'Enter all four values.' };
  const conc = (mg * 1000) / vol;
  const rate = (dose * wt * 60) / conc;
  return {
    conc: fmt(conc, 2), concUnit: 'µg/mL', concWorking: `(${mg} × 1000) ÷ ${vol} = ${fmt(conc, 2)} µg/mL`,
    rate: fmt(rate, 1), rateUnit: 'mL/hr', rateWorking: `(${dose} × ${wt} × 60) ÷ ${fmt(conc, 2)} = ${fmt(rate, 1)} mL/hr`,
    rateNum: rate,
    warn: rate > 500 ? 'Very high pump rate — recheck all inputs before infusing.' : ''
  };
}

export function calcCannula({ reqRate }) {
  const req = parseFloat(reqRate);
  if (isNaN(req) || req <= 0) return { err: 'Enter the required rate (mL/hr).', rows: buildRows(-1) };
  const pm = req / 60;
  const base = [
    { g: '14G', color: 'Orange', flow: '240–270', lower: 240, use: 'Major trauma, resuscitation' },
    { g: '16G', color: 'Grey',   flow: '180–235', lower: 180, use: 'Surgery, rapid transfusion' },
    { g: '18G', color: 'Green',  flow: '95–105',  lower: 95,  use: 'Blood products, larger volumes' },
    { g: '20G', color: 'Pink',   flow: '60–67',   lower: 60,  use: 'Standard adult access' },
    { g: '22G', color: 'Blue',   flow: '35–42',   lower: 35,  use: 'Fragile / difficult veins' },
    { g: '24G', color: 'Yellow', flow: '20–24',   lower: 20,  use: 'Neonates, fragile veins' }
  ];
  let pick = -1;
  for (let i = base.length - 1; i >= 0; i--) { if (base[i].lower >= pm) { pick = i; break; } }
  return {
    minVal: fmt(pm, 2), minUnit: 'mL/min',
    pick: pick === -1 ? '' : `Smallest sufficient: ${base[pick].g} (${base[pick].color}), max ${base[pick].flow} mL/min`,
    warn: pick === -1 ? 'Rate exceeds all listed gauges — consider larger cannula, pressure bag, or second access.' : '',
    rows: base.map((r, i) => ({ ...r, highlighted: i === pick }))
  };
}

function buildRows(pick) {
  const base = [
    { g: '14G', color: 'Orange', flow: '240–270', use: 'Major trauma, resuscitation' },
    { g: '16G', color: 'Grey',   flow: '180–235', use: 'Surgery, rapid transfusion' },
    { g: '18G', color: 'Green',  flow: '95–105',  use: 'Blood products, larger volumes' },
    { g: '20G', color: 'Pink',   flow: '60–67',   use: 'Standard adult access' },
    { g: '22G', color: 'Blue',   flow: '35–42',   use: 'Fragile / difficult veins' },
    { g: '24G', color: 'Yellow', flow: '20–24',   use: 'Neonates, fragile veins' }
  ];
  return base.map((r, i) => ({ ...r, highlighted: i === pick }));
}

export function calcCreatinine({ crWt, crAge, crScr, crSex }) {
  const wt = parseFloat(crWt), age = parseFloat(crAge), scr = parseFloat(crScr);
  const sex = crSex || 'male';
  if ([wt, age, scr].some(isNaN) || [wt, age, scr].some(x => x <= 0)) return { err: 'Enter weight, age, and serum creatinine (mg/dL).' };
  if (age > 120) return { err: 'Age looks implausible — confirm in years.' };
  if (wt > 400) return { err: 'Weight looks implausible — confirm in kg.' };
  const factor = sex === 'female' ? 0.85 : 1.0;
  const crcl = ((140 - age) * wt) / (72 * scr) * factor;
  let stage, stageSeverity;
  if (crcl >= 90) { stage = 'G1 — normal or high'; stageSeverity = 'ok'; }
  else if (crcl >= 60) { stage = 'G2 — mildly decreased'; stageSeverity = 'ok'; }
  else if (crcl >= 45) { stage = 'G3a — mildly-moderately decreased'; stageSeverity = 'warn'; }
  else if (crcl >= 30) { stage = 'G3b — moderately-severely decreased'; stageSeverity = 'warn'; }
  else if (crcl >= 15) { stage = 'G4 — severely decreased'; stageSeverity = 'danger'; }
  else { stage = 'G5 — kidney failure'; stageSeverity = 'danger'; }
  return {
    val: fmt(crcl, 1), unit: 'mL/min',
    working: `((140 − ${age}) × ${wt}) ÷ (72 × ${scr})${sex === 'female' ? ' × 0.85' : ''} = ${fmt(crcl, 1)} mL/min`,
    stage, stageSeverity,
    warn: crcl < 30 ? 'Severely reduced — review ALL renally cleared drugs. Dose adjust or withhold per pharmacy.' : crcl < 60 ? 'Reduced clearance — check drug-specific renal dose adjustments.' : ''
  };
}

export function calcReconstitution({ recoPowder, recoDiluent, recoDoseWant }) {
  const powder = parseFloat(recoPowder), diluent = parseFloat(recoDiluent), want = parseFloat(recoDoseWant);
  if (isNaN(powder) || isNaN(diluent) || powder <= 0 || diluent <= 0) return { err: 'Enter drug amount and diluent volume.' };
  const conc = powder / diluent;
  let volToDraw = null, drawWorking = '';
  if (!isNaN(want) && want > 0) {
    volToDraw = want / conc;
    drawWorking = `${want} mg ÷ ${fmt(conc, 2)} mg/mL = ${fmt(volToDraw, 2)} mL`;
  }
  return {
    conc: fmt(conc, 2), concUnit: 'mg/mL',
    concWorking: `${powder} mg ÷ ${diluent} mL = ${fmt(conc, 2)} mg/mL`,
    volToDraw: volToDraw !== null ? fmt(volToDraw, 2) : null,
    drawWorking,
    warn: volToDraw !== null && volToDraw > diluent ? 'Volume to draw exceeds vial — may require multiple vials.' : ''
  };
}

export function calcBSA({ bsaWt, bsaHt }) {
  const wt = parseFloat(bsaWt), ht = parseFloat(bsaHt);
  if (isNaN(wt) || isNaN(ht) || wt <= 0 || ht <= 0) return { err: 'Enter weight (kg) and height (cm).' };
  if (wt > 400 || ht > 280) return { err: 'Values look implausible — confirm units (kg, cm).' };
  const bsa = Math.sqrt((ht * wt) / 3600);
  return {
    val: fmt(bsa, 2), unit: 'm²',
    working: `√((${ht} × ${wt}) ÷ 3600) = ${fmt(bsa, 2)} m²`,
    warn: (bsa < 1.0 || bsa > 2.8) ? 'BSA outside typical adult range (1.5–2.0 m²) — double-check weight and height.' : ''
  };
}

// Tool metadata
export const TOOLS = [
  { id: 'dose',          name: 'Drug dose',              icon: 'pill',                  desc: 'mL to draw up from a vial',             color: '#4ade80', rgb: '74,222,128',   fields: [
    { key: 'doseToGive', label: 'Dose to give',    unit: 'mg',     mode: 'decimal' },
    { key: 'doseInVial', label: 'Dose in vial',    unit: 'mg',     mode: 'decimal' },
    { key: 'diluent',    label: 'Diluent volume',  unit: 'mL',     mode: 'decimal' }
  ], calc: calcDose },
  { id: 'drip',          name: 'IV drip rate',           icon: 'water',                 desc: 'drops/min on a gravity set',            color: '#38bdf8', rgb: '56,189,248',   fields: [
    { key: 'volume',     label: 'Volume',          unit: 'mL',     mode: 'decimal' },
    { key: 'time',       label: 'Time',            unit: 'hr',     mode: 'decimal' },
    { key: 'dropFactor', label: 'Drop factor',     unit: '',       mode: 'select', options: [
      { value: '20', label: '20 gtt/mL — standard adult' },
      { value: '15', label: '15 gtt/mL — adult set' },
      { value: '12', label: '12 gtt/mL — blood / viscous' },
      { value: '10', label: '10 gtt/mL — adult / blood' },
      { value: '50', label: '50 gtt/mL — burette' },
      { value: '60', label: '60 gtt/mL — microdrip / paediatric' }
    ]}
  ], calc: calcDrip },
  { id: 'pump',          name: 'IV pump rate',           icon: 'lightning-bolt',        desc: 'mL per hour',                           color: '#a78bfa', rgb: '167,139,250',  fields: [
    { key: 'pumpVolume', label: 'Volume',          unit: 'mL',     mode: 'decimal' },
    { key: 'pumpTime',   label: 'Time',            unit: 'hr',     mode: 'decimal' }
  ], calc: calcPump },
  { id: 'weight',        name: 'Weight-based dose',      icon: 'scale',                 desc: 'total/day and per dose',                color: '#fbbf24', rgb: '251,191,36',   fields: [
    { key: 'weight',     label: 'Patient weight',  unit: 'kg',     mode: 'decimal' },
    { key: 'doseMgKg',   label: 'Dose ordered',   unit: 'mg/kg',  mode: 'decimal' },
    { key: 'dosesPerDay',label: 'Doses per day',   unit: '',       mode: 'numeric' }
  ], calc: calcWeight },
  { id: 'infusion',      name: 'Infusion time',          icon: 'timer-outline',         desc: 'time remaining at current rate',         color: '#f472b6', rgb: '244,114,182',  fields: [
    { key: 'volLeft',    label: 'Volume left',     unit: 'mL',     mode: 'decimal' },
    { key: 'rateMlHr',   label: 'Pump rate',       unit: 'mL/hr',  mode: 'decimal' }
  ], calc: calcInfusion },
  { id: 'convert',       name: 'Unit converter',         icon: 'swap-horizontal',       desc: 'kg↔lb, g→mg, mg→mcg, L→mL',            color: '#2dd4bf', rgb: '45,212,191',   fields: [
    { key: 'convType',   label: 'Conversion',      unit: '',       mode: 'select', options: [
      { value: 'kg_lb', label: 'kg → lb' }, { value: 'lb_kg', label: 'lb → kg' },
      { value: 'g_mg',  label: 'g → mg'  }, { value: 'mg_mcg',label: 'mg → mcg' }, { value: 'L_mL', label: 'L → mL' }
    ]},
    { key: 'convVal',    label: 'Value',           unit: '',       mode: 'decimal' }
  ], calc: calcConvert },
  { id: 'oxygen',        name: 'Oxygen / SpO₂',          icon: 'lungs',                 desc: 'SpO₂ target assessment',               color: '#60a5fa', rgb: '96,165,250',   fields: [
    { key: 'spo2Reading',label: 'Current SpO₂',    unit: '%',      mode: 'decimal' },
    { key: 'spo2Cat',    label: 'Patient category', unit: '',      mode: 'select', options: [
      { value: 'general', label: 'General adult' }, { value: 'copd', label: 'COPD / hypercapnia risk' },
      { value: 'acute',   label: 'Acutely ill (sepsis, MI, stroke)' }, { value: 'paeds', label: 'Paediatric / neonate' }
    ]}
  ], calc: calcOxygen },
  { id: 'titration',     name: 'Titration',              icon: 'alert-decagram',        desc: 'µg/kg/min critical-care infusion',      color: '#f87171', rgb: '248,113,113',  danger: true, fields: [
    { key: 'drugMg',     label: 'Drug in bag',     unit: 'mg',     mode: 'decimal' },
    { key: 'bagVol',     label: 'Bag volume',      unit: 'mL',     mode: 'decimal' },
    { key: 'titWeight',  label: 'Patient weight',  unit: 'kg',     mode: 'decimal' },
    { key: 'ordDose',    label: 'Ordered dose',    unit: 'µg/kg/min', mode: 'decimal' }
  ], calc: calcTitration },
  { id: 'cannula',       name: 'Cannula gauge',          icon: 'needle',                desc: 'flow-ceiling sanity check',             color: '#fb923c', rgb: '251,146,60',   fields: [
    { key: 'reqRate',    label: 'Required rate',   unit: 'mL/hr',  mode: 'decimal' }
  ], calc: calcCannula },
  { id: 'creatinine',    name: 'Creatinine clearance',   icon: 'flask-outline',         desc: 'Cockcroft–Gault · mL/min',              color: '#e879f9', rgb: '232,121,249',  fields: [
    { key: 'crWt',       label: 'Patient weight',  unit: 'kg',     mode: 'decimal' },
    { key: 'crAge',      label: 'Age',             unit: 'years',  mode: 'numeric' },
    { key: 'crScr',      label: 'Serum creatinine',unit: 'mg/dL',  mode: 'decimal' },
    { key: 'crSex',      label: 'Biological sex',  unit: '',       mode: 'select', options: [
      { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }
    ]}
  ], calc: calcCreatinine },
  { id: 'reconstitution',name: 'Reconstitution',         icon: 'test-tube',             desc: 'concentration from powder + diluent',   color: '#c084fc', rgb: '192,132,252',  fields: [
    { key: 'recoPowder', label: 'Drug in vial',    unit: 'mg',     mode: 'decimal' },
    { key: 'recoDiluent',label: 'Diluent to add',  unit: 'mL',     mode: 'decimal' },
    { key: 'recoDoseWant',label:'Dose wanted (opt)',unit: 'mg',     mode: 'decimal' }
  ], calc: calcReconstitution },
  { id: 'bsa',           name: 'Body surface area',      icon: 'human-male-height',     desc: 'Mosteller formula · m²',               color: '#34d399', rgb: '52,211,153',   fields: [
    { key: 'bsaWt',      label: 'Weight',          unit: 'kg',     mode: 'decimal' },
    { key: 'bsaHt',      label: 'Height',          unit: 'cm',     mode: 'decimal' }
  ], calc: calcBSA }
];
