// Mission game scenes: every picture is an SVG drawn in code (no image files).
// sceneSVG() builds one scene from a mission's own evidence list, so each of the 30 missions gets its own board.

// ---------- Client avatars ----------
var AV_SKIN = ["#f1c9a5", "#e0a57c", "#c68863", "#8d5a3b", "#f6d6b8"];
var AV_HAIR = ["#2b1b12", "#5a3825", "#111", "#8a5a2b", "#c9c9d0", "#a23b2a"];
var AV_SHIRT = ["#2d7fd6", "#d6452d", "#2f9e6a", "#7b4fd1", "#e0a21b", "#1f3f82"];
function avatarSVG(i) {
  var s = AV_SKIN[i % 5], h = AV_HAIR[(i * 7) % 6], t = AV_SHIRT[(i * 5) % 6], long = i % 3 === 1, glasses = i % 4 === 2;
  return '<svg class="av2" viewBox="0 0 64 64" role="img" aria-label="Client">' +
    '<rect width="64" height="64" fill="#dbe9f6"/><circle cx="50" cy="12" r="20" fill="#fff" opacity=".5"/>' +
    (long ? '<rect x="14" y="14" width="36" height="38" rx="14" fill="' + h + '"/>' : '') +
    '<path d="M8 64c2-14 12-18 24-18s22 4 24 18z" fill="' + t + '"/><path d="M26 46l6 8 6-8z" fill="#fff" opacity=".85"/>' +
    '<rect x="27" y="38" width="10" height="10" rx="4" fill="' + s + '"/><rect x="27" y="42" width="10" height="4" fill="#000" opacity=".12"/>' +
    '<ellipse cx="32" cy="28" rx="13" ry="15" fill="' + s + '"/>' +
    '<path d="M18 26c0-13 8-16 15-16s14 4 13 17c-3-6-6-9-13-9s-12 3-15 8z" fill="' + h + '"/>' +
    '<circle cx="26.5" cy="29" r="1.8" fill="#222"/><circle cx="37.5" cy="29" r="1.8" fill="#222"/>' +
    (glasses ? '<g fill="none" stroke="#222" stroke-width="1.2"><circle cx="26.5" cy="29" r="4.6"/><circle cx="37.5" cy="29" r="4.6"/><path d="M31 29h2"/></g>' : '') +
    '<path d="M27 36q5 4 10 0" stroke="#7a3b2a" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
}

// ---------- Evidence icons (each drawn around 0,0 in a ~100 x 90 box) ----------
var ICONS = {
  psu: '<rect x="-42" y="-28" width="84" height="56" rx="7" fill="url(#gMetal)" stroke="#222" stroke-width="2"/><circle cx="-14" cy="0" r="20" fill="#15191d" stroke="#555" stroke-width="2"/><g class="spin" stroke="#8ea0ad" stroke-width="3"><path d="M-14 -16v32M-30 0h32M-25 -11l22 22M-25 11l22 -22"/></g><circle cx="-14" cy="0" r="4" fill="#9fb2c0"/><rect x="18" y="-18" width="20" height="14" rx="2" fill="#ffd54a"/><text x="28" y="-8" font-size="8" font-weight="800" text-anchor="middle" fill="#333">600W</text><circle cx="28" cy="14" r="3.2" class="led" fill="#41e07a"/>',
  mobo: '<rect x="-40" y="-38" width="80" height="76" rx="5" fill="url(#gPcb)" stroke="#0b3d1f" stroke-width="2"/><rect x="-24" y="-24" width="26" height="26" rx="3" fill="#cfd6dc" stroke="#555"/><rect x="-18" y="-18" width="14" height="14" fill="#8e99a3"/><g fill="#111"><rect x="12" y="-34" width="5" height="40"/><rect x="21" y="-34" width="5" height="40"/><rect x="-34" y="12" width="60" height="6"/><rect x="-34" y="23" width="60" height="6"/></g><g fill="#e0b341"><circle cx="30" cy="16" r="3.3"/><circle cx="30" cy="26" r="3.3"/><circle cx="-32" cy="-30" r="3"/></g><path d="M-30 6h22M-30 -2h10" stroke="#7fe0a3" stroke-width="1" opacity=".6"/>',
  ram: '<rect x="-44" y="-14" width="88" height="26" rx="2" fill="url(#gPcb)" stroke="#0b3d1f" stroke-width="2"/><g fill="#15181b"><rect x="-38" y="-10" width="14" height="14"/><rect x="-20" y="-10" width="14" height="14"/><rect x="-2" y="-10" width="14" height="14"/><rect x="16" y="-10" width="14" height="14"/></g><path d="M-44 12h88" stroke="#e0b341" stroke-width="5" stroke-dasharray="2 1.5"/><rect x="-4" y="9" width="5" height="5" fill="#0b3d1f"/><circle cx="36" cy="-3" r="2" class="led" fill="#41e07a"/>',
  cpu: '<g fill="#d6b44a"><path d="M-30 -42v8M-20 -42v8M-10 -42v8M0 -42v8M10 -42v8M20 -42v8M30 -42v8M-30 34v8M-20 34v8M-10 34v8M0 34v8M10 34v8M20 34v8M30 34v8"/></g><rect x="-36" y="-36" width="72" height="72" rx="6" fill="#2c6b3f" stroke="#133" stroke-width="2"/><rect x="-24" y="-24" width="48" height="48" rx="4" fill="url(#gMetal)" stroke="#555"/><text y="4" font-size="11" font-weight="800" text-anchor="middle" fill="#333">CPU</text><path d="M-32 -32l8 0 -8 8z" fill="#ffd54a"/>',
  fan: '<rect x="-38" y="-38" width="76" height="76" rx="10" fill="#1a1f24" stroke="#000" stroke-width="2"/><circle cx="0" cy="0" r="31" fill="#0d1013" stroke="#39434c" stroke-width="2"/><g class="spin"><path id="bl" d="M0 0C-10 -8 -8 -28 4 -30C10 -22 8 -8 0 0z" fill="#5d86a6"/><use href="#bl" transform="rotate(72)"/><use href="#bl" transform="rotate(144)"/><use href="#bl" transform="rotate(216)"/><use href="#bl" transform="rotate(288)"/></g><circle r="7" fill="#c7d3dc" stroke="#222"/><g fill="#39434c"><circle cx="-33" cy="-33" r="2.6"/><circle cx="33" cy="-33" r="2.6"/><circle cx="-33" cy="33" r="2.6"/><circle cx="33" cy="33" r="2.6"/></g>',
  vent: '<rect x="-42" y="-34" width="84" height="68" rx="8" fill="#252b31" stroke="#0b0d10" stroke-width="2"/><g fill="#0b0d10"><rect x="-34" y="-26" width="68" height="7" rx="3"/><rect x="-34" y="-14" width="68" height="7" rx="3"/><rect x="-34" y="-2" width="68" height="7" rx="3"/><rect x="-34" y="10" width="68" height="7" rx="3"/><rect x="-34" y="22" width="68" height="7" rx="3"/></g><g fill="#b9b2a6" opacity=".8"><ellipse cx="-14" cy="-10" rx="16" ry="3"/><ellipse cx="14" cy="2" rx="18" ry="3"/><ellipse cx="-6" cy="14" rx="20" ry="3"/><ellipse cx="18" cy="-22" rx="10" ry="2.5"/></g>',
  temp: '<rect x="-9" y="-40" width="18" height="62" rx="9" fill="#e8f1f7" stroke="#6b7c88" stroke-width="2"/><circle cx="0" cy="26" r="15" fill="#e8f1f7" stroke="#6b7c88" stroke-width="2"/><circle cx="0" cy="26" r="10" fill="#e5392b"/><rect x="-4" y="-22" width="8" height="48" rx="4" fill="#e5392b"/><g stroke="#6b7c88" stroke-width="2"><path d="M13 -32h10M13 -20h7M13 -8h10M13 4h7"/></g><text x="30" y="-28" font-size="9" font-weight="800" fill="#ff8a7a">°C</text>',
  monitor: '<rect x="-46" y="-34" width="92" height="58" rx="5" fill="#15181b" stroke="#000" stroke-width="2"/><rect x="-41" y="-29" width="82" height="48" rx="2" fill="url(#gScreen)"/><path d="M-41 -29l60 0 -30 48h-30z" fill="#fff" opacity=".07"/><path d="M-8 24h16l4 12h-24z" fill="#9aa5ae"/><rect x="-20" y="36" width="40" height="5" rx="2.5" fill="#6d7881"/><circle cx="38" cy="22" r="1.8" class="led" fill="#41e07a"/>',
  cable: '<path d="M-38 18C-20 -40 20 40 38 -16" fill="none" stroke="#0c0e10" stroke-width="9" stroke-linecap="round"/><path d="M-38 18C-20 -40 20 40 38 -16" fill="none" stroke="#3a444c" stroke-width="3" stroke-linecap="round"/><rect x="-50" y="12" width="20" height="16" rx="3" fill="#cfd6dc" stroke="#444" stroke-width="1.6"/><rect x="30" y="-24" width="20" height="16" rx="3" fill="#cfd6dc" stroke="#444" stroke-width="1.6"/><g fill="#444"><rect x="-46" y="17" width="3" height="6"/><rect x="-40" y="17" width="3" height="6"/><rect x="34" y="-19" width="3" height="6"/><rect x="40" y="-19" width="3" height="6"/></g>',
  outlet: '<rect x="-30" y="-38" width="60" height="76" rx="10" fill="url(#gWhite)" stroke="#a9b2ba" stroke-width="2"/><g fill="#1c2024"><rect x="-14" y="-24" width="4" height="12" rx="1"/><rect x="10" y="-24" width="4" height="12" rx="1"/><circle cx="0" cy="-8" r="3"/><rect x="-14" y="8" width="4" height="12" rx="1"/><rect x="10" y="8" width="4" height="12" rx="1"/><circle cx="0" cy="24" r="3"/></g><circle cx="0" cy="-2" r="2.2" fill="#8d979f"/>',
  strip: '<rect x="-46" y="-18" width="92" height="36" rx="7" fill="url(#gWhite)" stroke="#9aa5ae" stroke-width="2"/><g fill="#1c2024"><rect x="-38" y="-8" width="11" height="14" rx="2"/><rect x="-20" y="-8" width="11" height="14" rx="2"/><rect x="-2" y="-8" width="11" height="14" rx="2"/><rect x="16" y="-8" width="11" height="14" rx="2"/></g><rect x="32" y="-10" width="9" height="18" rx="2" fill="#e5392b" stroke="#7a1a12"/><circle cx="36.5" cy="-14" r="2" class="led" fill="#ff7a6a"/>',
  button: '<circle r="34" fill="url(#gMetal)" stroke="#222" stroke-width="2.5"/><circle r="25" fill="#1c2227" stroke="#58636c" stroke-width="2"/><path d="M-9 -12a15 15 0 1 0 18 0" fill="none" stroke="#41e0ff" stroke-width="4" stroke-linecap="round"/><path d="M0 -18v14" stroke="#41e0ff" stroke-width="4" stroke-linecap="round"/>',
  chat: '<path d="M-42 -30h84a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H-8L-26 34V18h-16a6 6 0 0 1-6-6v-36a6 6 0 0 1 6-6z" fill="#fff" stroke="#7d8d99" stroke-width="2"/><g stroke="#9fb0bd" stroke-width="4" stroke-linecap="round"><path d="M-34 -14h60M-34 -2h74M-34 10h40"/></g>',
  doc: '<rect x="-34" y="-40" width="68" height="80" rx="6" fill="#9a6b3a" stroke="#5c3d1d" stroke-width="2"/><rect x="-26" y="-32" width="52" height="68" rx="2" fill="#fff"/><rect x="-12" y="-44" width="24" height="12" rx="3" fill="#b9c3cb" stroke="#555"/><g stroke="#b6c2cc" stroke-width="3" stroke-linecap="round"><path d="M-18 -16h36M-18 -6h30M-18 4h36"/></g><path d="M-16 22l7 7 15-16" fill="none" stroke="#2fa85a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  drive: '<rect x="-40" y="-30" width="80" height="60" rx="6" fill="url(#gMetal)" stroke="#222" stroke-width="2"/><circle cx="-6" cy="0" r="21" fill="#2a3036" stroke="#555"/><circle cx="-6" cy="0" r="6" fill="#aeb9c2"/><path d="M26 -20l-24 19" stroke="#e8edf1" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="-22" r="4" fill="#667"/><circle cx="32" cy="20" r="2.6" class="led" fill="#ffb02e"/>',
  printer: '<rect x="-24" y="-40" width="48" height="26" fill="#fff" stroke="#9aa5ae" stroke-width="2"/><rect x="-44" y="-16" width="88" height="40" rx="7" fill="#3b4650" stroke="#14181c" stroke-width="2"/><rect x="-30" y="12" width="60" height="26" fill="#fff" stroke="#9aa5ae" stroke-width="2"/><g stroke="#c0cad2" stroke-width="3"><path d="M-20 22h40M-20 30h28"/></g><circle cx="34" cy="-6" r="3" class="led" fill="#41e07a"/>',
  gear: '<circle r="28" fill="none" stroke="#cfd8df" stroke-width="12" stroke-dasharray="9.2 9.2"/><circle r="22" fill="#b5c1cb" stroke="#5d6b76" stroke-width="2"/><circle r="9" fill="#2a3a52"/>',
  shield: '<path d="M0 -40l34 12v22c0 22-14 36-34 44C-20 30-34 16-34 -6v-22z" fill="url(#gBlue)" stroke="#0a3f7f" stroke-width="2.5"/><path d="M-14 0l10 11 20-24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  term: '<rect x="-46" y="-32" width="92" height="64" rx="6" fill="#0b0e12" stroke="#58636c" stroke-width="2"/><rect x="-46" y="-32" width="92" height="12" rx="6" fill="#39434c"/><text x="-38" y="-2" font-size="15" font-family="monospace" font-weight="700" fill="#4be37f">C:\\&gt;_</text><path d="M-38 12h40M-38 22h60" stroke="#2e8f55" stroke-width="3" stroke-linecap="round"/>',
  wifi: '<g fill="none" stroke="#41c8ff" stroke-width="7" stroke-linecap="round"><path d="M-36 -8a50 50 0 0 1 72 0"/><path d="M-24 6a32 32 0 0 1 48 0"/><path d="M-12 20a14 14 0 0 1 24 0"/></g><circle cy="30" r="5" fill="#41c8ff"/>',
  win: '<rect x="-44" y="-32" width="88" height="64" rx="6" fill="#f4f8fb" stroke="#6d7f8f" stroke-width="2"/><path d="M-44 -26a6 6 0 0 1 6-6h76a6 6 0 0 1 6 6v8h-88z" fill="#2f7fd6"/><g fill="#fff"><circle cx="-36" cy="-25" r="2"/><circle cx="-29" cy="-25" r="2"/></g><g fill="#2f7fd6"><rect x="-30" y="-10" width="26" height="20" rx="2"/><rect x="-1" y="-10" width="26" height="20" rx="2" opacity=".75"/><rect x="-30" y="13" width="26" height="14" rx="2" opacity=".55"/><rect x="-1" y="13" width="26" height="14" rx="2" opacity=".4"/></g>',
  warn: '<path d="M0 -38l42 72h-84z" fill="#ffc42e" stroke="#8a5a00" stroke-width="3" stroke-linejoin="round"/><rect x="-4" y="-14" width="8" height="26" rx="4" fill="#3b2a00"/><circle cy="24" r="4.6" fill="#3b2a00"/>',
  clock: '<circle r="36" fill="#fff" stroke="#6d7f8f" stroke-width="4"/><g stroke="#9fb0bd" stroke-width="3"><path d="M0 -30v6M0 24v6M-30 0h6M24 0h6"/></g><path d="M0 0V-22M0 0l16 10" stroke="#1f3f82" stroke-width="5" stroke-linecap="round"/><circle r="4" fill="#e5392b"/>'
};
var ICON_RULES = [
  [/psu|power supply/i, "psu"], [/motherboard/i, "mobo"], [/\bram\b|memory/i, "ram"], [/temperature|thermal/i, "temp"], [/cpu/i, "cpu"],
  [/fan|airflow/i, "fan"], [/\bvents?\b/i, "vent"], [/power button|indicator/i, "button"], [/outlet/i, "outlet"], [/strip/i, "strip"],
  [/cable/i, "cable"], [/monitor|display|desktop status|screen/i, "monitor"], [/printer/i, "printer"], [/storage|drive|disk/i, "drive"],
  [/wi-?fi|internet|network|dns|browser/i, "wifi"], [/command prompt/i, "term"], [/event viewer|error|beep/i, "warn"],
  [/interview|observation|user report|client/i, "chat"], [/history|recent|timeline/i, "clock"], [/setting|config/i, "gear"],
  [/update|restore|recovery|repair|safe mode|permission|compat/i, "shield"],
  [/startup app|requirement|version|task manager|application|features|system|windows/i, "win"]
];
function iconKey(name) {
  for (var i = 0; i < ICON_RULES.length; i++) { if (ICON_RULES[i][0].test(name)) { return ICON_RULES[i][1]; } }
  return "doc";
}

var SCENE_DEFS = '<defs>' +
  '<linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset=".5" stop-color="#aab6bf"/><stop offset="1" stop-color="#76838e"/></linearGradient>' +
  '<linearGradient id="gPcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f9a58"/><stop offset="1" stop-color="#1b6a3a"/></linearGradient>' +
  '<linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d6dde3"/></linearGradient>' +
  '<linearGradient id="gBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4aa8ff"/><stop offset="1" stop-color="#0b4fb3"/></linearGradient>' +
  '<linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e8bff"/><stop offset="1" stop-color="#0a2a72"/></linearGradient>' +
  '<radialGradient id="gLamp" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#6fa8c7" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>' +
  '<radialGradient id="gWall" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#3da0ff"/><stop offset=".55" stop-color="#0b3c9c"/><stop offset="1" stop-color="#071a4a"/></radialGradient>' +
  '<pattern id="pGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".05"/></pattern>' +
  '<filter id="fSh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000" flood-opacity=".55"/></filter>' +
  '</defs>';

// ---------- Mission scenes ----------
// Hardware missions show the WHOLE computer workstation (open case, monitor, power strip, wall outlet).
// Software missions show a simulated Windows desktop. In both, only the items the mission needs are clickable
// and numbered; they match the "Items to inspect" checklist beside the inspection area.

// Hardware: where each kind of evidence lives on the workstation. t:"r" = rectangle, t:"p" = cable path.
// bx/by = position of the numbered marker.
var HSPOT = {
  mobo:   { t: "r", x: 450, y: 55,  w: 220, h: 265, bx: 456, by: 62 },
  cpu:    { t: "r", x: 500, y: 90,  w: 100, h: 100, bx: 506, by: 96 },
  fan:    { t: "r", x: 512, y: 102, w: 76,  h: 76,  bx: 582, by: 104 },
  temp:   { t: "r", x: 498, y: 58,  w: 104, h: 26,  bx: 498, by: 58 },
  ram:    { t: "r", x: 610, y: 62,  w: 44,  h: 152, bx: 632, by: 62 },
  beep:   { t: "r", x: 453, y: 286, w: 26,  h: 26,  bx: 455, by: 288 },
  psu:    { t: "r", x: 450, y: 335, w: 270, h: 67,  bx: 456, by: 341 },
  drive:  { t: "r", x: 406, y: 150, w: 40,  h: 140, bx: 410, by: 156 },
  vent:   { t: "r", x: 362, y: 130, w: 36,  h: 200, bx: 380, by: 136 },
  button: { t: "r", x: 362, y: 58,  w: 36,  h: 62,  bx: 380, by: 62 },
  monitor:    { t: "r", x: 32, y: 162, w: 246, h: 150, bx: 52, by: 180 },
  monitorpwr: { t: "r", x: 226, y: 314, w: 58, h: 24, bx: 262, by: 316 },
  vcable2:    { t: "r", x: 298, y: 384, w: 56, h: 36, bx: 326, by: 380 },
  pcable: { t: "p", d: "M722 372 H750 Q766 372 766 390 V460 Q766 480 776 492", bx: 766, by: 430 },
  vcable: { t: "p", d: "M712 262 H770 Q790 262 790 286 V440 Q790 460 768 460 H228 Q212 460 212 442 V414", bx: 790, by: 360 },
  strip:  { t: "r", x: 730, y: 490, w: 170, h: 34, bx: 880, by: 492 },
  outlet: { t: "r", x: 924, y: 330, w: 62,  h: 84, bx: 956, by: 334 },
  note1:  { t: "r", x: 796, y: 372, w: 28, h: 50, bx: 810, by: 372 },
  note2:  { t: "r", x: 824, y: 372, w: 28, h: 50, bx: 838, by: 372 },
  note3:  { t: "r", x: 852, y: 372, w: 28, h: 50, bx: 866, by: 372 },
  note4:  { t: "r", x: 880, y: 372, w: 28, h: 50, bx: 894, by: 372 }
};
var HSPOT_RULES = [
  [/known-good/i, "vcable2"], [/video cable|original video/i, "vcable"], [/power cable/i, "pcable"],
  [/psu|power supply/i, "psu"], [/motherboard/i, "mobo"], [/temperature|thermal/i, "temp"], [/\bcpu\b/i, "cpu"],
  [/\bram\b|memory/i, "ram"], [/beep/i, "beep"], [/fan|airflow|cooling/i, "fan"], [/\bvents?\b/i, "vent"],
  [/power button|desktop indicator|desktop status/i, "button"], [/monitor indicator|monitor power/i, "monitorpwr"],
  [/monitor/i, "monitor"], [/strip/i, "strip"], [/outlet/i, "outlet"], [/storage|drive/i, "drive"]
];
var NOTE_SLOTS = ["note1", "note2", "note3", "note4"];

// Assigns every evidence item of a mission to a place on the workstation (records and reports go on the notes tray).
function placeEvidence(list) {
  var used = {}, notes = 0, out = [];
  list.forEach(function (e) {
    var spot = null, i;
    for (i = 0; i < HSPOT_RULES.length; i++) { if (HSPOT_RULES[i][0].test(e[0])) { spot = HSPOT_RULES[i][1]; break; } }
    if (!spot || used[spot]) { spot = NOTE_SLOTS[Math.min(notes, NOTE_SLOTS.length - 1)]; notes += 1; }
    used[spot] = 1; out.push(spot);
  });
  return out;
}

function fanSVG(cx, cy, r, cls, col) {
  var b = "";
  for (var k = 0; k < 7; k++) { b += '<path d="M0 0C-' + r * 0.32 + ' -' + r * 0.2 + ' -' + r * 0.3 + ' -' + r * 0.86 + ' ' + r * 0.1 + ' -' + r * 0.9 + 'C' + r * 0.3 + ' -' + r * 0.65 + ' ' + r * 0.24 + ' -' + r * 0.25 + ' 0 0z" fill="' + col + '" transform="rotate(' + (k * 360 / 7) + ')"/>'; }
  return '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + r + '" fill="#0b0e11" stroke="#39434c" stroke-width="2"/><g class="' + cls + '">' + b + '</g><circle r="' + r * 0.2 + '" fill="#c7d3dc" stroke="#222"/></g>';
}

// The static computer: everything is drawn, but only the mission's items are marked as inspectable.
function pcArtSVG() {
  var a = [];
  // wall, floor, desk
  a.push('<rect width="1000" height="470" fill="url(#hWall)"/><rect y="470" width="1000" height="90" fill="#27313a"/><rect y="466" width="1000" height="5" fill="#1b232a"/>');
  a.push('<rect x="0" y="420" width="1000" height="18" rx="4" fill="#8a6a45"/><rect x="0" y="420" width="1000" height="5" fill="#a98558"/><rect x="40" y="438" width="12" height="32" fill="#5e472d"/><rect x="940" y="438" width="12" height="32" fill="#5e472d"/>');
  // monitor
  a.push('<rect x="140" y="340" width="30" height="66" fill="#59636c"/><rect x="100" y="404" width="112" height="16" rx="6" fill="#39434c"/>');
  a.push('<rect x="20" y="150" width="270" height="190" rx="12" fill="#15191d" stroke="#000" stroke-width="2"/><rect x="32" y="162" width="246" height="150" rx="4" fill="url(#hScreen)"/><path d="M32 162h140l-70 150H32z" fill="#fff" opacity=".06"/>');
  a.push('<rect x="52" y="190" width="86" height="56" rx="4" fill="#ffffff" opacity=".14"/><rect x="62" y="200" width="66" height="6" rx="3" fill="#fff" opacity=".35"/><rect x="62" y="214" width="46" height="6" rx="3" fill="#fff" opacity=".25"/>');
  a.push('<circle cx="270" cy="326" r="3.5" fill="#41e07a" class="led"/><rect x="244" y="322" width="16" height="8" rx="3" fill="#39434c"/><text x="40" y="330" font-size="11" fill="#6f7c86" font-weight="700">MONITOR</text>');
  // spare cable coil
  a.push('<g fill="none" stroke="#0c0e10" stroke-width="5"><ellipse cx="326" cy="406" rx="22" ry="10"/><ellipse cx="326" cy="402" rx="16" ry="7"/></g><rect x="344" y="398" width="14" height="9" rx="2" fill="#cfd6dc"/>');
  // tower shell
  a.push('<rect x="360" y="30" width="380" height="392" rx="14" fill="#1b232b" stroke="#0a0d10" stroke-width="3"/><rect x="400" y="42" width="328" height="368" rx="6" fill="#0e1318"/>');
  a.push('<text x="550" y="22" font-size="12" font-weight="800" fill="#9fb7c8" text-anchor="middle">DESKTOP COMPUTER (SIDE PANEL REMOVED)</text>');
  // front bezel: vents, power button, led
  a.push('<rect x="362" y="32" width="38" height="388" rx="10" fill="#222b33"/>');
  for (var v = 0; v < 18; v++) { a.push('<rect x="368" y="' + (134 + v * 11) + '" width="26" height="5" rx="2.5" fill="#06090c"/>'); }
  a.push('<g fill="#b9b2a6" opacity=".55"><rect x="370" y="150" width="20" height="3" rx="1.5"/><rect x="372" y="183" width="18" height="3" rx="1.5"/><rect x="370" y="238" width="20" height="3" rx="1.5"/></g>');
  a.push('<circle cx="381" cy="82" r="15" fill="url(#gMetal)" stroke="#222" stroke-width="2"/><circle cx="381" cy="82" r="10" fill="#1c2227"/><path d="M377 78a6 6 0 1 0 8 0M381 75v6" fill="none" stroke="#41e0ff" stroke-width="2" stroke-linecap="round"/><circle cx="381" cy="110" r="3" fill="#41e07a" class="led"/>');
  a.push('<text x="381" y="352" font-size="9" fill="#7d8d99" text-anchor="middle" font-weight="700">FRONT</text><text x="381" y="364" font-size="9" fill="#7d8d99" text-anchor="middle" font-weight="700">INTAKE</text>');
  // motherboard
  a.push('<rect x="450" y="55" width="220" height="265" rx="5" fill="url(#gPcb)" stroke="#0b3d1f" stroke-width="2"/><path d="M462 300h60M462 290h30M520 300V250h60M650 225v70M470 70v20M470 205h24" stroke="#7fe0a3" stroke-width="1.2" opacity=".5" fill="none"/>');
  a.push('<rect x="470" y="222" width="40" height="30" rx="3" fill="#8e99a3" stroke="#555"/><text x="490" y="241" font-size="8" font-weight="800" text-anchor="middle" fill="#333">CHIPSET</text>');
  a.push('<rect x="524" y="92" width="0" height="0"/>');
  // CPU + cooler
  a.push('<rect x="500" y="90" width="100" height="100" rx="8" fill="#39434c" stroke="#0b0d10" stroke-width="2"/>' + fanSVG(550, 140, 38, "spin", "#5d86a6") + '<text x="550" y="204" font-size="9" fill="#cfe" text-anchor="middle" font-weight="800">CPU + COOLER</text>');
  // temp display
  a.push('<rect x="498" y="58" width="104" height="26" rx="4" fill="#06120b" stroke="#2e8f55"/><text x="550" y="76" font-size="14" font-family="monospace" font-weight="700" fill="#4be37f" text-anchor="middle">--.-°C</text>');
  // RAM
  a.push('<rect x="612" y="68" width="14" height="140" rx="2" fill="#15181b" stroke="#e0b341"/><rect x="630" y="68" width="14" height="140" rx="2" fill="#15181b" stroke="#e0b341"/><rect x="648" y="68" width="12" height="140" rx="2" fill="#0a2f1a" stroke="#0b3d1f"/><text x="636" y="226" font-size="9" fill="#cfe" text-anchor="middle" font-weight="800">RAM</text>');
  // beep speaker
  a.push('<circle cx="466" cy="299" r="8" fill="#111" stroke="#555"/><circle cx="466" cy="299" r="3" fill="#333"/>');
  // GPU
  a.push('<rect x="470" y="250" width="232" height="52" rx="6" fill="#2a313a" stroke="#0b0d10" stroke-width="2"/>' + fanSVG(530, 276, 20, "spin", "#6b7f92") + fanSVG(618, 276, 20, "spin", "#6b7f92") + '<rect x="700" y="252" width="12" height="48" fill="#cfd6dc" stroke="#555"/><rect x="703" y="256" width="6" height="12" fill="#3a6ea5"/><text x="590" y="314" font-size="9" fill="#cfe" text-anchor="middle" font-weight="800">GRAPHICS CARD</text>');
  // storage drive
  a.push('<rect x="406" y="150" width="40" height="140" rx="5" fill="url(#gMetal)" stroke="#222" stroke-width="2"/><circle cx="426" cy="205" r="14" fill="#2a3036" stroke="#555"/><circle cx="426" cy="205" r="4" fill="#aeb9c2"/><circle cx="426" cy="272" r="3" class="led" fill="#ffb02e"/><text x="426" y="306" font-size="9" fill="#cfe" text-anchor="middle" font-weight="800">DRIVE</text>');
  // rear case fan
  a.push('<rect x="672" y="58" width="54" height="54" rx="6" fill="#1a1f24" stroke="#000"/>' + fanSVG(699, 85, 22, "spin", "#5d86a6") + '<text x="699" y="126" font-size="9" fill="#cfe" text-anchor="middle" font-weight="800">CASE FAN</text>');
  // PSU
  a.push('<rect x="450" y="335" width="270" height="67" rx="7" fill="url(#gMetal)" stroke="#222" stroke-width="2"/><circle cx="500" cy="368" r="27" fill="#15191d" stroke="#555" stroke-width="2"/><g class="spin" stroke="#8ea0ad" stroke-width="3"><path d="M500 345v46M477 368h46M484 352l32 32M484 384l32-32"/></g><circle cx="500" cy="368" r="5" fill="#9fb2c0"/><rect x="620" y="346" width="84" height="22" rx="3" fill="#ffd54a"/><text x="662" y="362" font-size="13" font-weight="800" text-anchor="middle" fill="#333">PSU 600W</text><circle cx="690" cy="386" r="3.5" class="led" fill="#41e07a"/>');
  // cables inside the case
  a.push('<g fill="none" stroke="#0c0e10" stroke-width="5" stroke-linecap="round"><path d="M700 335V318Q700 310 690 310H660"/><path d="M470 335V322"/></g><g fill="none" stroke="#e0b341" stroke-width="2" opacity=".7"><path d="M700 335V318Q700 310 690 310H660"/></g>');
  // outside cables
  a.push('<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M722 372 H750 Q766 372 766 390 V460 Q766 480 776 492" stroke="#0c0e10" stroke-width="8"/><path d="M722 372 H750 Q766 372 766 390 V460 Q766 480 776 492" stroke="#3a444c" stroke-width="2.5"/>' +
    '<path d="M200 414 V440 Q200 482 240 482 H800 Q840 482 840 492" stroke="#0c0e10" stroke-width="8"/><path d="M200 414 V440 Q200 482 240 482 H800 Q840 482 840 492" stroke="#3a444c" stroke-width="2.5"/>' +
    '<path d="M712 262 H770 Q790 262 790 286 V440 Q790 460 768 460 H228 Q212 460 212 442 V414" stroke="#1d4f8f" stroke-width="7"/><path d="M712 262 H770 Q790 262 790 286 V440 Q790 460 768 460 H228 Q212 460 212 442 V414" stroke="#6fb0ff" stroke-width="2"/>' +
    '<path d="M900 507 H954 V404" stroke="#0c0e10" stroke-width="8"/><path d="M900 507 H954 V404" stroke="#3a444c" stroke-width="2.5"/></g>');
  // power strip + outlet
  a.push('<rect x="730" y="490" width="170" height="34" rx="9" fill="url(#gWhite)" stroke="#9aa5ae" stroke-width="2"/><g fill="#1c2024"><rect x="748" y="500" width="14" height="14" rx="2"/><rect x="770" y="500" width="14" height="14" rx="2"/><rect x="792" y="500" width="14" height="14" rx="2"/><rect x="814" y="500" width="14" height="14" rx="2"/></g><rect x="860" y="498" width="14" height="18" rx="3" fill="#e5392b" stroke="#7a1a12"/><circle cx="888" cy="507" r="3.5" class="led" fill="#ff7a6a"/><text x="815" y="540" font-size="10" fill="#9fb0bd" text-anchor="middle" font-weight="700">POWER STRIP</text>');
  a.push('<rect x="924" y="330" width="62" height="84" rx="10" fill="url(#gWhite)" stroke="#a9b2ba" stroke-width="2"/><g fill="#1c2024"><rect x="944" y="342" width="5" height="14" rx="1"/><rect x="961" y="342" width="5" height="14" rx="1"/><circle cx="955" cy="364" r="3"/><rect x="944" y="378" width="5" height="14" rx="1"/><rect x="961" y="378" width="5" height="14" rx="1"/></g><text x="955" y="428" font-size="10" fill="#9fb0bd" text-anchor="middle" font-weight="700">WALL OUTLET</text>');
  // notes tray
  a.push('<text x="852" y="364" font-size="10" fill="#cdd8e0" text-anchor="middle" font-weight="800">NOTES &amp; RECORDS</text>');
  [798, 826, 854, 882].forEach(function (x, i) {
    a.push('<rect x="' + x + '" y="374" width="24" height="46" rx="3" fill="#f4f1e8" stroke="#8d8672" transform="rotate(' + (i % 2 ? 2 : -2) + ' ' + (x + 12) + ' 420)"/><path d="M' + (x + 4) + ' 386h16M' + (x + 4) + ' 394h16M' + (x + 4) + ' 402h10" stroke="#b6b09c" stroke-width="2" stroke-linecap="round"/><rect x="' + (x + 6) + '" y="370" width="12" height="6" rx="2" fill="#7d8d99"/>');
  });
  return a.join("");
}

function hardwareSVG(ms, state) {
  var spots = placeEvidence(ms.e), a = [];
  a.push('<svg class="pcsvg" viewBox="0 0 1000 560" role="img" aria-label="Computer workstation inspection area"><defs>' +
    '<linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5568"/><stop offset="1" stop-color="#26394a"/></linearGradient>' +
    '<linearGradient id="hScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e8bff"/><stop offset="1" stop-color="#0a2a72"/></linearGradient>' +
    '<linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset=".5" stop-color="#aab6bf"/><stop offset="1" stop-color="#76838e"/></linearGradient>' +
    '<linearGradient id="gPcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f9a58"/><stop offset="1" stop-color="#1b6a3a"/></linearGradient>' +
    '<linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d6dde3"/></linearGradient></defs>');
  a.push(pcArtSVG());
  // hotspots: the motherboard is drawn first so smaller parts on top of it stay clickable
  var order = ms.e.map(function (e, i) { return i; }).sort(function (x, y) { return (spots[x] === "mobo" ? 0 : 1) - (spots[y] === "mobo" ? 0 : 1); });
  order.forEach(function (i) {
    var sp = HSPOT[spots[i]], ok = state.ex[i], sel = state.sel === i;
    var cls = "hot" + (ok ? " ok" : "") + (sel ? " sel" : "");
    var shape = sp.t === "r"
      ? '<rect class="hz" x="' + sp.x + '" y="' + sp.y + '" width="' + sp.w + '" height="' + sp.h + '" rx="8"/>'
      : '<path class="hp" d="' + sp.d + '"/><path class="hz hpz" d="' + sp.d + '"/>';
    a.push('<g class="' + cls + '" data-act="insp" data-i="' + i + '" tabindex="0" role="button" aria-label="Inspect ' + esc(ms.e[i][0]) + '"><title>' + esc(ms.e[i][0]) + '</title>' + shape +
      '<g class="mk" transform="translate(' + sp.bx + ' ' + sp.by + ')"><circle class="mkp" r="13"/><circle class="mkc" r="13"/><text y="5">' + (ok ? "✔" : i + 1) + '</text></g></g>');
  });
  // floating name tag for the selected item
  if (state.sel !== null && state.sel !== undefined && ms.e[state.sel]) {
    var s = HSPOT[spots[state.sel]], name = ms.e[state.sel][0], tw = Math.max(80, name.length * 7.4 + 22), tx = Math.min(1000 - tw - 6, Math.max(6, s.bx - tw / 2)), ty = s.by < 90 ? s.by + 22 : s.by - 44;
    a.push('<g class="tag" pointer-events="none"><rect x="' + tx + '" y="' + ty + '" width="' + tw + '" height="24" rx="12"/><text x="' + (tx + tw / 2) + '" y="' + (ty + 16) + '">' + esc(name) + '</text></g>');
  }
  a.push('</svg>');
  return a.join("");
}

// Software missions: a simulated Windows desktop. Each evidence item is an app on the desktop; clicking it opens its window.
function softwareDesk(ms, state) {
  var n = ms.e.length, sel = state.sel, win = "";
  var icons = ms.e.map(function (e, i) {
    var ok = state.ex[i], on = sel === i, k = iconKey(e[0]);
    return '<button type="button" class="oi' + (ok ? " ok" : "") + (on ? " sel" : "") + '" data-act="insp" data-i="' + i + '" aria-label="Open ' + esc(e[0]) + '">' +
      '<span class="oib"><svg viewBox="-52 -46 104 92">' + ICONS[k] + '</svg><i class="oin">' + (ok ? "✔" : i + 1) + '</i></span><span class="oit">' + esc(e[0]) + '</span></button>';
  }).join("");
  if (sel !== null && sel !== undefined && ms.e[sel]) {
    var e = ms.e[sel], k = iconKey(e[0]);
    win = '<div class="ow"><div class="owt"><svg viewBox="-52 -46 104 92" class="owi">' + ICONS[k] + '</svg><b>' + esc(appTitle(e[0])) + '</b><span class="owc"><i>–</i><i>▢</i><i class="x">✕</i></span></div>' +
      appBody(e[0], e[1]) + '<div class="owf"><span>✔ Inspected</span><span>Saved to evidence log</span></div></div>';
  } else {
    win = '<div class="ow idle"><div class="owt"><b>Technician Console</b><span class="owc"><i>–</i><i>▢</i><i class="x">✕</i></span></div><div class="owb"><div class="owh">Ready</div><p>Open each numbered app on the desktop to read what it reports. Everything you open is saved to the evidence log.</p></div></div>';
  }
  var tasks = Object.keys(state.ex).map(function (i) {
    return '<button type="button" class="tk' + (Number(i) === sel ? " on" : "") + '" data-act="insp" data-i="' + i + '">' + esc(ms.e[i][0]) + '</button>';
  }).join("");
  return '<div class="os"><div class="osd"><div class="osi">' + icons + '</div><div class="osw">' + win + '</div></div>' +
    '<div class="ost"><span class="stb">⊞</span><span class="stx">Search</span><div class="tks">' + tasks + '</div><span class="tray">📶 🔊 <b>' + Object.keys(state.ex).length + '/' + n + '</b></span></div></div>';
}


// ---------- Software apps: each evidence item opens a realistic window for that exact tool ----------
// [name pattern, window title, sidebar entries, detail rows [label, value]]
var APPS = [
  [/network adapter/i, "Device Manager", ["Network adapters", "Display adapters", "Disk drives", "Sound devices"], [["Ethernet", "Realtek PCIe GbE Family Controller"], ["Wi-Fi", "Intel(R) Wi-Fi 6 AX201 160MHz"], ["Bluetooth", "Intel(R) Wireless Bluetooth(R)"]]],
  [/wi-?fi status|internet connection/i, "Settings › Network & internet", ["Wi-Fi", "Ethernet", "VPN", "Airplane mode"], [["Network", "TechSkill-Home (Wi-Fi)"], ["Adapter", "Intel(R) Wi-Fi 6 AX201 160MHz"], ["Gateway", "192.168.1.1"]]],
  [/network connection|browser error/i, "Network Connections", ["Ethernet", "Wi-Fi", "Bluetooth Network"], [["Wi-Fi", "Intel(R) Wi-Fi 6 AX201 160MHz"], ["Browser", "Microsoft Edge"], ["Gateway", "192.168.1.1"]]],
  [/dns/i, "Network Connections › IPv4 properties", ["Ethernet", "Wi-Fi"], [["Adapter", "Intel(R) Wi-Fi 6 AX201 160MHz"], ["DNS mode", "Obtain DNS server automatically"], ["Gateway", "192.168.1.1"]]],
  [/task manager|running applications|system performance|application status/i, "Task Manager", ["Processes", "Performance", "App history", "Startup apps"], [["Google Chrome", "Application"], ["Microsoft Word", "Application"], ["Windows Explorer", "Windows process"], ["Antimalware Service Executable", "Background process"]]],
  [/startup app|startup status/i, "Settings › Apps › Startup", ["Installed apps", "Startup", "Default apps"], [["Microsoft Teams", "Startup app"], ["Cloud Sync Client", "Startup app"], ["Chat Launcher", "Startup app"], ["Update Helper", "Startup app"]]],
  [/storage/i, "Settings › System › Storage", ["Storage", "Storage Sense", "Advanced storage"], [["Local Disk (C:)", "Windows system drive"], ["Apps & features", "Installed programs"], ["Temporary files", "Cleanup recommendations"]]],
  [/event viewer|error history|error messages?|error message$/i, "Event Viewer › Windows Logs › System", ["Application", "Security", "System", "Setup"], [["Source", "Windows system log"], ["Log", "System"], ["Level", "See description below"]]],
  [/update history|windows update/i, "Settings › Windows Update › Update history", ["Windows Update", "Update history", "Advanced options"], [["Quality updates", "Cumulative update"], ["Driver updates", "Device drivers"], ["Definition updates", "Windows Security"]]],
  [/restore|recovery|safe mode|startup repair|startup diagnostic|startup report|startup beeps/i, "Windows Recovery Environment › Advanced options", ["Startup Repair", "System Restore", "System Image Recovery", "Command Prompt", "Startup Settings"], [["Environment", "Windows RE"], ["Tools", "Startup Repair, System Restore, Safe Mode"]]],
  [/printer|usb cable|device/i, "Devices and Printers", ["Printers", "Devices", "Scanners"], [["Printer", "Office Laser Printer"], ["Connection", "USB"], ["Driver", "Printer class driver"]]],
  [/version|requirement|compat|permission|application|features|recent software/i, "Program Properties", ["General", "Compatibility", "Security", "Details"], [["Application", "Installed program"], ["Windows", "Windows 11 Pro"], ["Mode", "Standard user"]]],
  [/windows|system status|system|recent changes|observation|user report/i, "Settings › System › About", ["About", "Device specifications", "Windows specifications"], [["Device name", "TECHSKILL-PC"], ["Edition", "Windows 11 Pro"], ["Processor", "Intel(R) Core(TM) i5"]]]
];
function appBody(name, finding) {
  var cmd = /command prompt/i.test(name);
  if (cmd) {
    var c = /dns|nslookup/i.test(finding) ? "nslookup www.example.com" : /sfc|file|repair|corrupt/i.test(finding) ? "sfc /scannow" : /gateway|ping|unreachable|reach/i.test(finding) ? "ping 192.168.1.1" : "ipconfig /all";
    return '<div class="term"><div class="tl">Microsoft Windows [Version 10.0.22631]</div><div class="tl">C:\\Users\\Student&gt;<b>' + c + '</b></div><div class="tl out">' + esc(finding) + '</div><div class="tl">C:\\Users\\Student&gt;<span class="cur">_</span></div></div>';
  }
  var a = null, i;
  for (i = 0; i < APPS.length; i++) { if (APPS[i][0].test(name)) { a = APPS[i]; break; } }
  if (!a) { a = [0, name + ".txt - Notepad", ["File", "Edit"], []]; }
  return '<div class="ap"><div class="apn">' + a[2].map(function (t, k) { return '<span' + (k === 0 ? ' class="on"' : "") + '>' + t + '</span>'; }).join("") + '</div>' +
    '<div class="apm"><div class="apt">' + esc(name) + '</div>' + a[3].map(function (r) { return '<div class="apk"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join("") +
    '<div class="apr"><small>RESULT FOR THIS CASE</small>' + esc(finding) + '</div></div></div>';
}
function appTitle(name) {
  if (/command prompt/i.test(name)) { return "Command Prompt"; }
  for (var i = 0; i < APPS.length; i++) { if (APPS[i][0].test(name)) { return APPS[i][1]; } }
  return name + ".txt - Notepad";
}

function sceneSVG(o, m, ms, state) {
  var soft = o >= HW_OPS, n = ms.e.length, n2 = Object.keys(state.ex).length;
  var last = state.sel !== null && state.sel !== undefined ? ms.e[state.sel] : null;
  return '<div class="scn"><div class="hud"><span>🔍 INSPECTED <b>' + n2 + '/' + n + '</b></span><span>⭐ XP <b>' + n2 * 50 + '</b></span><span class="lvl">' + (soft ? "SOFTWARE WORKSTATION" : "HARDWARE WORKBENCH") + '</span></div>' +
    (soft ? softwareDesk(ms, state) : hardwareSVG(ms, state)) +
    '<div class="call' + (last ? " on" : "") + '">' + (last ? '<b>' + esc(last[0]) + ':</b> ' + esc(last[1]) : (soft ? "Open the numbered apps on the desktop. Each one you open is saved to the evidence log." : "Click the numbered parts on the computer. Each one you inspect is saved to the evidence log.")) + '</div></div>';
}

document.addEventListener("keydown", function (ev) {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList && ev.target.classList.contains("hot")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});
