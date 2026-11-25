// App logic: navigation, lesson progression, quiz, activities, and saved progress.
const STORAGE_KEY = "ts";
const NAV = [
  ["dashboard", "dash", "Dashboard"],
  ["lessons", "n_lessons", "Lessons"],
  ["activities", "n_acts", "Activities"],
  ["quiz", "n_quiz", "Quiz"],
  ["progress", "n_prog", "Progress"]
];
// Lesson colors (software lessons 1-8), matched to the TechSkill design:
// [gradient start, gradient end, body color, footer color, heading accent]
const LC = [
  ["#ff3b34", "#ff9a4d", "#8f1226", "#d93f4e", "#ffa3b0"],
  ["#ffd658", "#ff9a3c", "#a8330f", "#e8762b", "#ffc9a0"],
  ["#ffd658", "#ffc255", "#8a5a0b", "#d9a31c", "#ffe08a"],
  ["#0c9da9", "#7ddc5c", "#0f6b57", "#22a67c", "#a6f0c8"],
  ["#53d0e0", "#0a4fb3", "#1f4283", "#0f6d8c", "#8fd8f2"],
  ["#154eb3", "#c07af0", "#3b2fa0", "#5b4fe0", "#c9c2ff"],
  ["#616ff9", "#ff6fc1", "#5b1b9c", "#a63fd6", "#f0b3ff"],
  ["#ec4899", "#fda4af", "#8c1650", "#d62b7a", "#ffc2dc"]
];

function lessonColorStyle(index) {
  const c = LC[index % LC.length];
  return "--g1:" + c[0] + ";--g2:" + c[1] + ";--bd:" + c[2] + ";--ft:" + c[3] + ";--ac:" + c[4] + ";";
}

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderBlock(block) {
  const type = block[0];
  if (type === "p") { return "<p>" + esc(block[1]) + "</p>"; }
  if (type === "h3") { return "<h3>" + esc(block[1]) + "</h3>"; }
  if (type === "cards") {
    return '<div class="cardg">' + block[1].map(function (c) {
      return '<div class="cd"><span class="ic">' + c[0] + "</span><b>" + esc(c[1]) + "</b><p>" + esc(c[2]) + "</p>" +
        (c[3] ? '<p class="pp"><b>Possible problems:</b> ' + esc(c[3]) + "</p>" : "") +
        (c[4] ? '<img class="cimg" src="' + c[4] + '" alt="' + esc(c[1]) + '" loading="lazy">' : "") + "</div>";
    }).join("") + "</div>";
  }
  if (type === "ul" || type === "ol") {
    return "<" + type + (type === "ol" && block[2] ? ' start="' + block[2] + '"' : "") + ">" + block[1].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</" + type + ">";
  }
  if (type === "note") { return '<div class="note">' + esc(block[1]) + "</div>"; }
  if (type === "src") { return '<div class="srcn">' + esc(block[1]) + "</div>"; }
  if (type === "code") { return '<pre class="cmd"><span class="pr">cmd</span>' + block[1].map(esc).join("\n") + "</pre>"; }
  if (type === "img") {
    return '<figure><img class="shot" src="' + block[1] + '" alt="">' + (block[2] ? "<figcaption>Image source: " + esc(block[2]) + "</figcaption>" : "") + "</figure>";
  }
  if (type === "tbl") {
    return '<div class="tw"><table>' + block[1].map(function (row, r) {
      const tag = r === 0 ? "th" : "td";
      return "<tr>" + row.map(function (cell) { return "<" + tag + ">" + esc(cell) + "</" + tag + ">"; }).join("") + "</tr>";
    }).join("") + "</table></div>";
  }
  return "";
}

// Software lesson viewer: one section per page, colored by lesson number.
function softwareLesson(lessonIndex, categoryKey) {
  categoryKey = categoryKey || "s";
  const data = L[categoryKey][lessonIndex];
  const pages = data[3];
  const page = pages[cur.lp];
  const isLast = cur.lp === pages.length - 1;
  const pills = pages.map(function (p, i) { return '<i class="pill' + (i <= cur.lp ? " on" : "") + '"></i>'; }).join("");
  const sameTitle = cur.lp > 0 && pages[cur.lp - 1].t === page.t;

  return [
    '<div class="crumb"><a data-go="lessons">Lessons</a> &gt; <a data-go="' + (categoryKey === "s" ? "sw" : "hw") + '">' + (categoryKey === "s" ? "Software" : "Hardware") + '</a> &gt; <span>Lesson ' + (lessonIndex + 1) + '</span></div>',
    '<div class="sl" style="' + lessonColorStyle(lessonIndex) + '">',
    '<div class="eyebrow">LESSON ' + (lessonIndex + 1) + ' · ' + esc(data[0].toUpperCase()) + '</div>',
    '<h2>' + esc(page.t) + (sameTitle ? ' <small>(continued)</small>' : '') + '</h2>',
    page.b.map(renderBlock).join(""),
    '</div>',
    '<div class="slnav" style="' + lessonColorStyle(lessonIndex) + '">',
    '<button class="back-pill" data-act="lprev" data-k="' + categoryKey + '">← Previous</button>',
    '<span class="pills">' + pills + '</span><b>Page ' + (cur.lp + 1) + ' / ' + pages.length + '</b>',
    isLast
      ? '<span>' + (data[4] ? '<button class="back-pill" data-act="lquiz" data-k="' + categoryKey + '" data-i="' + lessonIndex + '">Take lesson quiz</button> ' : "") + '<button class="btn p" data-act="lfin" data-k="' + categoryKey + '" data-i="' + lessonIndex + '">Finish lesson ✔</button></span>'
      : '<button class="btn p" data-act="lnext" data-k="' + categoryKey + '" data-i="' + lessonIndex + '">Next →</button>',
    '</div>'
  ].join("");
}

function qlist() {
  const base = cur.qc === "h" ? QH : Q;
  return cur.qf == null ? base : base.filter(function (q) { return (q[3] || 0) === cur.qf; });
}

const MISSION_LEVELS = ["EASY", "MODERATE", "CHALLENGE"];

// Persistent app state saved in localStorage.
let S = { read: {}, quiz: [], done: {}, last: null, log: [] };

try {
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
  if (savedState) {
    S = savedState;
  }
} catch (error) {
  // Ignore invalid saved data and keep the default state.
}

const cur = {
  ex: {},
  order: [],
  sel: null,
  qi: 0,
  qs: 0,
  fb: "",
  key: null
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (error) {
    // Storage can fail in restricted browser modes; do not break the app.
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function getLessonCategoryLabel(categoryKey) {
  return categoryKey === "s" ? "SOFTWARES" : "HARDWARE";
}

function getMissionLevelLabel(index) {
  return MISSION_LEVELS[index] || "CHALLENGE";
}

function getMissionBadgeClass(index) {
  return "EMC"[index] || "C";
}

function getLessonRoute(categoryKey, lessonIndex) {
  return "les-" + categoryKey + lessonIndex;
}

// Number of pages in a lesson (software/hardware lessons use their own pages, others use 5).
function lessonPageCount(categoryKey, lessonIndex) {
  const data = L[categoryKey] && L[categoryKey][lessonIndex];
  if (!data) { return 1; }
  return data[3] ? data[3].length : 5;
}

// The lesson the learner last opened, or null when nothing valid is saved.
function lastLesson() {
  const last = S.last;
  if (!last || !L[last.k] || !L[last.k][last.i]) { return null; }
  const count = lessonPageCount(last.k, last.i);
  const page = Math.min(Math.max(Number(last.p) || 0, 0), count - 1);
  return { k: last.k, i: last.i, p: page, count: count, title: L[last.k][last.i][0], done: !!S.read[last.k + last.i] };
}

function nread() {
  return Object.keys(S.read).length;
}

function avg() {
  if (!S.quiz.length) {
    return 0;
  }

  return Math.round(S.quiz.reduce((sum, value) => sum + value, 0) / S.quiz.length);
}

function mdone() {
  return Object.keys(S.done).length;
}

function opRange() {
  return cur.at === "s" ? [HW_OPS, OP.length] : [0, HW_OPS];
}

function mdoneIn(range) {
  return Object.keys(S.done).filter(function (key) {
    const op = Number(key.split("-")[0]);
    return op >= range[0] && op < range[1];
  }).length;
}

function opdone(operationId) {
  let count = 0;

  for (let missionIndex = 0; missionIndex < 3; missionIndex += 1) {
    if (S.done[operationId + "-" + missionIndex]) {
      count += 1;
    }
  }

  return count;
}

function bar(percent) {
  return '<div class="bar"><i style="width:' + percent + '%"></i></div>';
}

function go(hashValue) {
  location.hash = hashValue;
}

function sect(route) {
  const firstPart = route.split("-")[0];
  const sectionMap = {
    sw: "lessons",
    hw: "lessons",
    les: "lessons",
    op: "activities",
    m: "activities"
  };

  return sectionMap[firstPart] || firstPart;
}
function getPageForRoute(route) {
  if (route === "dashboard") {
    return dash();
  }

  if (route === "lessons") {
    return '<div class="grid g2" style="max-width:900px;margin:20px auto"><div class="choose" data-go="sw"><img class="ch" src="' + IM.sw + '"><div>SOFTWARE</div></div><div class="choose" data-go="hw"><img class="ch" src="' + IM.hw + '"><div>HARDWARE</div></div></div>';
  }

  if (route === "sw" || route === "hw") {
    return lessonList(route[0]);
  }

  if (route.indexOf("les-") === 0) {
    return lesson(route[4], Number(route.slice(5)));
  }

  if (route === "activities") {
    return acts();
  }

  if (route.indexOf("op-") === 0) {
    return opView(Number(route.slice(3)));
  }

  if (route.indexOf("m-") === 0) {
    const parts = route.split("-");
    return mission(Number(parts[1]), Number(parts[2]));
  }

  if (route === "quiz") {
    return quiz();
  }

  if (route === "progress") {
    return prog();
  }

  if (route === "about") {
    return about();
  }

  return dash();
}

function render() {
  const route = (location.hash || "#dashboard").slice(1);
  const section = sect(route);

  // Sidebar navigation.
  getElement("side").innerHTML = [
    '<div class="logo" data-act="navtoggle" role="button" tabindex="0" title="Click the logo to show or hide the menu" aria-label="Toggle menu"><img src="' + IM.logo + '"><div>Tech<b>Skill</b><small>Digital Learning</small></div><span class="lgc">›</span></div>',
    NAV.map(function (item) {
      const [slug, iconKey, label] = item;
      const isActive = section === slug;
      return '<a data-go="' + slug + '" class="' + (isActive ? "on" : "") + '"><img class="ni" src="' + IM[iconKey] + '">' + label + '</a>';
    }).join(""),
    '<div class="sp"></div>',
    '<a data-go="about" class="' + (section === "about" ? "on" : "") + '"><img class="ni" src="' + IM.about + '">About</a>'
  ].join("");

  // Header text, based on the selected route.
  let title = "Welcome to TechSkill!";
  let subtitle = "A Web-Based Interactive Learning System for Developing Computer Troubleshooting Skills";

  if (route === "lessons") {
    title = "Choose which Lesson to learn!";
    subtitle = "";
  }

  if (route === "sw" || route.indexOf("les-s") === 0) {
    title = "COMPUTER SOFTWARE TROUBLESHOOTING";
    subtitle = "Set of programs and instructions that direct a computer to perform specific tasks";
  }

  if (route === "hw" || route.indexOf("les-h") === 0) {
    title = "COMPUTER HARDWARE TROUBLESHOOTING";
    subtitle = "The physical components that make up a computer";
  }

  const opRoute = route.match(/^(?:op|m)-(\d+)/);
  if (opRoute) {
    cur.at = Number(opRoute[1]) >= HW_OPS ? "s" : "h";
  }

  if (section === "activities") {
    title = cur.at === "s" ? "SOFTWARE TROUBLESHOOTING" : "HARDWARE TROUBLESHOOTING";
    subtitle = "";
  }

  if (section === "quiz") {
    title = "Quiz";
    subtitle = "Test what you have learned";
  }

  if (section === "progress") {
    title = "Student’s Progress & Analytics";
    subtitle = "Detailed breakdown of completed lessons, quizzes, and practical competencies";
  }

  if (section === "about") {
    title = "Welcome to TechSkill!";
    subtitle = "A Web-Based Interactive Learning System for Developing Computer Systems Servicing and Troubleshooting Skills.";
  }

  getElement("hd").innerHTML = [
    '<div><h1>' + title + '</h1>' + (subtitle ? '<p>' + subtitle + '</p>' : "") + '</div>',
    '<div class="srch"><input id="q" placeholder="Search lessons, topics..." autocomplete="off"><div id="res" hidden></div></div>',
    '<img class="hbtn" src="' + IM.search + '">'
  ].join("");

  const page = getElement("pg");
  const keepY = window.scrollY;
  page.innerHTML = getPageForRoute(route);

  // Only jump to the top when the page really changes (or a lesson page turns).
  // Clicking things inside a page (inspecting, answering, tabs) keeps the scroll position.
  if (route !== lastRoute || cur.top) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, keepY);
  }
  lastRoute = route;
  cur.top = false;
}
let lastRoute = null;
function dash() {
  return [
    '<h2><img class="bi" style="height:32px" src="' + IM.bolt + '"> Quick Access</h2>',
    '<div class="grid g4">',
    '<div class="tile" data-go="lessons"><img class="ti" src="' + IM.t_lessons + '"><h3>Lessons</h3><p>14 lessons</p><div class="go">START LEARNING <span>→</span></div></div>',
    '<div class="tile" data-go="activities"><img class="ti" src="' + IM.t_acts + '"><h3>Activities</h3><p>' + (OP.length * 3) + ' Activities</p><div class="go">PRACTICE SKILLS <span>→</span></div></div>',
    '<div class="tile" data-go="quiz"><img class="ti" src="' + IM.t_quiz + '"><h3>Quiz</h3><p>' + (Q.length + QH.length) + ' questions</p><div class="go">START LEARNING <span>→</span></div></div>',
    '<div class="tile" data-go="progress"><img class="ti" src="' + IM.t_prog + '"><h3>View Progress</h3><p></p><div class="go">CHECK STATUS <span>→</span></div></div>',
    '</div>',
    '<div class="grid g2" style="margin-top:14px">',
    '<div class="stat"><img class="si" src="' + IM.s_book + '">Completed Lessons<b>' + nread() + ' / 14</b></div>',
    '<div class="stat"><img class="si" src="' + IM.s_trophy + '">Quiz Score Average<b>' + avg() + '%</b></div>',
    '</div>',
    continueCard(),
    overviewCard(),
    recentCards()
  ].join("");
}

// Recent activity log (newest first, max 30 entries).
function logActivity(text) {
  if (!Array.isArray(S.log)) { S.log = []; }
  const now = new Date();
  S.log.unshift({ t: text, d: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) });
  S.log = S.log.slice(0, 30);
}

// "Continue Learning" card: shows the last lesson and jumps back to the saved page.
function continueCard() {
  const last = lastLesson();
  const img = '<img class="dimg" src="' + IM.hw + '" alt="">';
  if (!last) {
    return '<div class="dpanel">' + img + '<div class="dmain"><h3>Continue Learning</h3><p>You have not started a lesson yet.</p><div class="prow">' + bar(0) + '<b>0%</b></div></div><button class="btn p" data-go="lessons">Start a lesson →</button></div>';
  }
  const percent = last.done ? 100 : Math.round(last.p / last.count * 100);
  const category = last.k === "s" ? "Software" : "Hardware";
  const where = last.done ? "Completed — review it again" : "Page " + (last.p + 1) + " of " + last.count;
  return '<div class="dpanel">' + img + '<div class="dmain"><h3>Continue Learning</h3>' +
    '<p>Your last lesson: <b>' + category + ' Lesson ' + (last.i + 1) + ' — ' + esc(last.title) + '</b></p>' +
    '<small>' + where + '</small><div class="prow">' + bar(percent) + '<b>' + percent + '%</b></div></div>' +
    '<button class="btn p" data-go="les-' + last.k + last.i + '">' + (last.done ? 'Review Lesson' : 'Continue Lesson') + ' →</button></div>';
}

// Learning Progress Overview: lessons, activities and quizzes completed.
function overviewCard() {
  const lessons = nread(), lessonTotal = L.s.length + L.h.length;
  const acts = mdone(), actTotal = OP.length * 3;
  const quizzes = Math.min(S.quiz.length, lessonTotal);
  const percent = Math.round((lessons / lessonTotal + acts / actTotal + quizzes / lessonTotal) / 3 * 100);
  return '<div class="dpanel"><img class="dimg" src="' + IM.t_prog + '" alt=""><div class="dmain"><h3>Learning Progress Overview</h3>' +
    '<p>Track your overall learning progress</p><div class="prow">' + bar(percent) + '<b>' + percent + '%</b></div></div>' +
    '<div class="dcounts"><div><b>' + lessons + ' / ' + lessonTotal + '</b>Lessons</div><div><b>' + acts + ' / ' + actTotal + '</b>Activities</div><div><b>' + quizzes + ' / ' + lessonTotal + '</b>Quiz</div></div></div>';
}

// Recent Activities and the motivational quote.
function recentCards() {
  const log = Array.isArray(S.log) ? S.log : [];
  const shown = cur.logAll ? log : log.slice(0, 3);
  const items = shown.length
    ? shown.map(function (e) { return '<li><span>' + esc(e.t) + '</span><i>' + esc(e.d) + '</i></li>'; }).join("")
    : '<li class="none">No activity yet. Open a lesson to get started.</li>';
  return '<div class="dcols"><div class="dpanel recent"><div class="rh"><h3>Recent Activities</h3>' +
    (log.length > 3 ? '<a data-act="logall">' + (cur.logAll ? "Show less" : "View All") + ' →</a>' : "") + '</div><ul>' + items + '</ul></div>' +
    '<div class="dpanel quote"><div><blockquote>“DON’T BE AFRAID TO FAIL, BE AFRAID NOT TO TRY”</blockquote><cite>Philipe Borges</cite></div></div></div>';
}

function svgSw() {
  return '<svg viewBox="0 0 300 200"><rect x="70" y="30" width="150" height="110" rx="8" fill="#a8cfc3"/><rect x="80" y="55" width="130" height="75" fill="#6f7a74"/><g fill="#fff"><rect x="88" y="65" width="50" height="4"/><rect x="88" y="76" width="80" height="4"/><rect x="98" y="87" width="60" height="4"/><rect x="88" y="98" width="90" height="4"/></g><circle cx="86" cy="42" r="4" fill="#0047ab"/><path d="M170 105l14 30 6-12 12-4z" fill="#fff" stroke="#000"/></svg>';
}

function svgHw() {
  return '<svg viewBox="0 0 300 200"><rect x="55" y="35" width="130" height="85" rx="6" fill="#7fc0e0"/><rect x="63" y="42" width="114" height="68" fill="#9cc7d6"/><rect x="110" y="120" width="20" height="14" fill="#7fc0e0"/><rect x="60" y="150" width="110" height="18" rx="3" fill="#8fd0ee"/><rect x="200" y="50" width="50" height="115" rx="6" fill="#a9d7e6"/><g fill="#e0b84a"><rect x="210" y="80" width="30" height="8"/><rect x="210" y="92" width="30" height="8"/><rect x="210" y="104" width="30" height="8"/></g><circle cx="225" cy="140" r="4" fill="#e22"/></svg>';
}

function unlocked(key, index) {
  return index === 0 || S.read[key + (index - 1)];
}
function lessonList(categoryKey) {
  const lessons = L[categoryKey];

  return [
    '<div class="banner"><b>LESSON FOR ' + getLessonCategoryLabel(categoryKey) + '</b>Read each lesson to unlock the next lesson.</div>',
    '<div class="grid g4">',
    lessons.map(function (lessonData, index) {
      const lessonName = "Lesson " + (index + 1) + ":";

      if (unlocked(categoryKey, index)) {
        const route = getLessonRoute(categoryKey, index);
        const isRead = S.read[categoryKey + index] ? "✔ " : "";
        return '<div class="les" style="' + lessonColorStyle(index) + '" data-go="' + route + '"><h4>' + lessonName + '</h4><p>' + lessonData[0] + '</p><em>' + isRead + '<img class="ar" src="' + IM.arrows + '" style="vertical-align:middle"></em></div>';
      }

      return '<div class="les lock"><h4 style="background:none;padding:0;color:#889">' + lessonName + '</h4><img class="k lk" src="' + IM.lock + '"></div>';
    }).join(""),
    '</div>'
  ].join("");
}

// Lesson viewer: 5 pages per lesson with Previous / Next buttons (Finish on the last page).
function lesson(categoryKey, lessonIndex) {
  const data = L[categoryKey][lessonIndex];
  const backRoute = categoryKey === "s" ? "sw" : "hw";
  const catName = categoryKey === "s" ? "SOFTWARE" : "HARDWARE";

  if (!unlocked(categoryKey, lessonIndex)) {
    return '<p>This lesson is locked. Read the previous lesson first.</p><button class="btn p" data-go="' + backRoute + '">Back</button>';
  }

  const id = categoryKey + lessonIndex;
  if (cur.lk !== id) {
    cur.lk = id;
    // Resume on the saved page if this is the lesson the learner left off on.
    const saved = S.last && S.last.k === categoryKey && S.last.i === lessonIndex && !S.read[id] ? Number(S.last.p) || 0 : 0;
    cur.lp = Math.min(Math.max(saved, 0), lessonPageCount(categoryKey, lessonIndex) - 1);
  }
  if (!S.last || S.last.k !== categoryKey || S.last.i !== lessonIndex || S.last.p !== cur.lp) {
    S.last = { k: categoryKey, i: lessonIndex, p: cur.lp };
    saveState();
  }

  if (data[3]) {
    return softwareLesson(lessonIndex, categoryKey);
  }

  const points = data[2];
  const half = Math.ceil(points.length / 2);
  const pages = [
    ["Overview", [data[1]]],
    ["Key Ideas", points.slice(0, half)],
    ["Key Ideas (continued)", points.slice(half).length ? points.slice(half) : points],
    ["Technician Tips", ["Start with the simplest and most likely cause.", "Change one thing at a time and test after each change.", "Write down what you find and what you fix."]],
    ["Recap", ["You finished: " + data[0] + "."].concat(points)]
  ];
  const page = pages[cur.lp];
  const isLast = cur.lp === pages.length - 1;
  const pills = pages.map(function (p, i) { return '<i class="pill' + (i <= cur.lp ? " on" : "") + '"></i>'; }).join("");
  const pageHtml = page[1].length === 1 && cur.lp === 0
    ? '<p class="lp">' + page[1][0] + '</p>'
    : '<ul class="lp">' + page[1].map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>";

  return [
    '<div class="lbar"><button class="back-pill" data-go="' + backRoute + '">← Back</button>',
    '<span class="lmeta">LESSON ' + (lessonIndex + 1) + ' OF ' + L[categoryKey].length + ' • ' + catName + ' TROUBLESHOOTING</span>',
    '<span class="pills">' + pills + '</span><b>Page ' + (cur.lp + 1) + ' / ' + pages.length + '</b></div>',
    '<div class="ltitle"><span class="chip">LESSON ' + (lessonIndex + 1) + '</span>' + data[0].toUpperCase() + '</div>',
    '<div class="lbody"><div class="lcard"><h2>' + page[0] + '</h2>' + pageHtml + '</div>',
    '<div class="lcard side"><img class="lill" src="' + (categoryKey === "s" ? IM.sw : IM.hw) + '">',
    points.slice(0, 3).map(function (t) { return '<div class="tipc">' + t + '</div>'; }).join(""),
    '</div></div>',
    '<div class="lfoot"><button class="back-pill" data-act="lprev">← Previous</button>',
    '<button class="btn p" data-act="' + (isLast ? "lfin" : "lnext") + '" data-k="' + categoryKey + '" data-i="' + lessonIndex + '">' + (isLast ? "Finish lesson ✔" : "Next →") + '</button></div>'
  ].join("");
}

function acts() {
  const range = opRange();
  const total = (range[1] - range[0]) * 3;
  const doneCount = mdoneIn(range);

  return [
    '<div class="atabs"><button class="atab' + (cur.at === "s" ? "" : " on") + '" data-act="atab" data-f="h">Hardware Missions</button><button class="atab' + (cur.at === "s" ? " on" : "") + '" data-act="atab" data-f="s">Software Missions</button></div>',
    '<div class="row"><span>Mission Progress</span><span>' + doneCount + '/' + total + '</span></div>', bar(doneCount / total * 100),
    '<div class="grid g3" style="margin-top:20px">',
    OP.map(function (op, i) {
      if (i < range[0] || i >= range[1]) {
        return "";
      }
      const locked = i > range[0] && opdone(i - 1) < 3;
      return '<div class="op"><div style="display:flex;align-items:center"><span class="n">0' + (i - range[0] + 1) + '</span><div><h3>' + op[0].toUpperCase() + '</h3><small>' + op[1] + '</small></div></div>' +
        '<b style="font-size:13px;margin-top:8px">Available Missions</b><ul>' +
        op[2].map(function (title, j) {
          return '<li><span>0' + (j + 1) + '. ' + title + '</span><span class="' + getMissionBadgeClass(j) + '">' + getMissionLevelLabel(j) + '</span></li>';
        }).join("") + '</ul><button class="btn" ' + (locked ? "disabled" : "") + ' data-go="op-' + i + '" style="margin-top:auto">VIEW OPERATION ' +
        (locked ? '<img class="bi" src="' + IM.lockb + '">' : '<img class="bi" src="' + IM.playb + '">') + '</button></div>';
    }).join(""),
    '</div>'
  ].join("");
}

function opView(o) {
  const op = OP[o];
  return [
    '<button class="back" data-go="activities">← Back to activities</button>',
    '<div class="banner"><b>OPERATION 0' + (o - (o >= HW_OPS ? HW_OPS : 0) + 1) + ' - ' + op[0].toUpperCase() + '</b></div>',
    '<div class="row"><span>Mission Progress</span><span>' + opdone(o) + '/3</span></div>', bar(opdone(o) / 3 * 100),
    '<div class="grid g3" style="margin-top:20px">',
    op[3].map(function (ms, j) {
      return '<div class="mc m' + (j + 1) + '"><small><span>' + getMissionLevelLabel(j) + '</span><span>MISSION 0' + (j + 1) + '</span></small><h3>' + op[2][j].toUpperCase() + '</h3>' +
        '<div style="flex:1">' + avatarSVG(o * 3 + j) + '<b>Client’s message:</b><p>“' + ms.m + '”</p></div>' +
        '<button class="btn" data-go="m-' + o + '-' + j + '">' + (S.done[o + "-" + j] ? "✔ REPLAY" : "BEGIN MISSION") + ' ▶</button></div>';
    }).join(""),
    '</div>'
  ].join("");
}

// Mission screen: the inspection area (whole PC or software desktop) with the checklist and evidence log beside it.
function mission(o, m) {
  const op = OP[o], ms = op[3][m], key = o + "-" + m, lv = "lv" + (m + 1), soft = o >= HW_OPS;
  if (cur.key !== key) {
    cur.key = key; cur.ex = {}; cur.order = []; cur.sel = null; cur.pick = null; cur.res = null;
  }
  const total = ms.e.length, n = Object.keys(cur.ex).length;
  const checklist = ms.e.map(function (e, i) {
    return '<button type="button" class="ck' + (cur.ex[i] ? " ok" : "") + (cur.sel === i ? " sel" : "") + '" data-act="insp" data-i="' + i + '">' +
      '<span class="ckn">' + (cur.ex[i] ? "✔" : i + 1) + '</span><span class="ckt">' + esc(e[0]) + '</span><small>' + (cur.ex[i] ? "inspected" : "to inspect") + '</small></button>';
  }).join("");
  const log = cur.order.slice().reverse().map(function (i) {
    return '<div class="ev' + (i === cur.sel ? " new" : "") + '"><b>' + (i + 1) + '. ' + esc(ms.e[i][0]) + '</b><span>' + esc(ms.e[i][1]) + '</span></div>';
  }).join("") || '<div class="ev empty">Nothing inspected yet. Your findings will appear here as you inspect each item.</div>';
  const options = ms.o.map(function (t, i) {
    return '<label class="opt"><input type="radio" name="dx" data-act="choose" data-i="' + i + '"' + (cur.pick === i ? " checked" : "") + (cur.res === "ok" ? " disabled" : "") + '> <span>' + t + '</span></label>';
  }).join("");
  const notes = {
    need: "Inspect all " + total + " items before submitting.",
    pick: "Choose a diagnosis first.",
    bad: "<b>NOT QUITE! REVIEW THE EVIDENCE.</b><br>The decision is not supported by the available findings. Revisit the inspection results and try again.",
    ok: "<b>CORRECT DIAGNOSIS!</b><br>" + ms.ok
  };
  const nextBtn = cur.res === "ok"
    ? '<button class="btn p" style="margin-top:10px" data-go="' + (m < 2 ? "m-" + o + "-" + (m + 1) : "op-" + o) + '">' + (m < 2 ? "NEXT MISSION ▶" : "FINISH OPERATION ▶") + '</button>' : "";

  return [
    '<button class="back" data-go="op-' + o + '">← Back to operation</button>',
    '<div class="banner" style="background:#aed8e0;color:#133">Mission 0' + (m + 1) + ': ' + op[2][m] + '</div>',
    '<div class="mz">',
    '<div class="mz-main">',
    '<div class="mc m' + (m + 1) + ' cl"><div class="clav">' + avatarSVG(o * 3 + m) + '</div><div><small><span>' + getMissionLevelLabel(m) + '</span><span>MISSION 0' + (m + 1) + '</span></small><b>Client’s message:</b><p>“' + ms.m + '”</p></div></div>',
    '<div class="pn ' + lv + '"><b>INSPECTION AREA</b><p style="margin:4px 0 10px">' + ms.d + '</p>' + sceneSVG(o, m, ms, cur) + '</div>',
    '</div>',
    '<div class="mz-side">',
    '<div class="chk"><b>' + (soft ? "Apps to open" : "Parts to inspect") + '</b>' + checklist,
    '<div class="row"><span>Evidence collected</span><span>' + n + '/' + total + '</span></div>' + bar(n / total * 100) + '</div>',
    '<div class="evlog"><b>Evidence log</b>' + log + '</div>',
    '</div></div>',
    '<div class="pn ' + lv + '" style="margin-top:14px"><h3 style="margin:0 0 6px">Diagnosis / Decision</h3><p>Based on the evidence you collected, what is the best troubleshooting decision?</p>' + options,
    '<button class="btn" data-act="diag">SUBMIT DIAGNOSIS</button>',
    '<div class="fb ' + (cur.res || "") + '">' + (notes[cur.res] || "") + '</div>' + nextBtn + '</div>'
  ].join("");
}

// Quiz section: choose Software or Hardware, then a lesson quiz. Back buttons step back one level.
function quiz() {
  if (cur.qc === undefined) {
    return [
      '<div class="panel"><h2>Choose a quiz</h2><div class="qgrid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">',
      '<button class="qpick" style="--g1:#5ee3e6;--g2:#0047ab;min-height:150px" data-act="qcat" data-c="s"><b>Software Quiz</b>Software lessons 1-8 and general questions<small>' + Q.length + ' questions</small></button>',
      '<button class="qpick" style="--g1:#ff9a4d;--g2:#da1b1b;min-height:150px" data-act="qcat" data-c="h"><b>Hardware Quiz</b>Hardware lessons 1-6<small>' + QH.length + ' questions</small></button>',
      '</div></div>'
    ].join("");
  }

  const isHw = cur.qc === "h";
  const base = isHw ? QH : Q;
  const name = isHw ? "Hardware" : "Software";

  if (cur.qf === undefined) {
    const counts = {};
    base.forEach(function (q) { counts[q[3] || 0] = (counts[q[3] || 0] || 0) + 1; });
    const buttons = L[cur.qc].map(function (lessonData, i) {
      return '<button class="qpick" style="' + lessonColorStyle(i) + '" data-act="qpick" data-f="' + (i + 1) + '"><b>Lesson ' + (i + 1) + '</b>' + esc(lessonData[0]) + '<small>' + (counts[i + 1] || 0) + ' questions</small></button>';
    }).join("");
    const general = !isHw && counts[0]
      ? '<button class="qpick gen" data-act="qpick" data-f="0"><b>General</b>Software &amp; hardware basics<small>' + counts[0] + ' questions</small></button>' : "";
    return [
      '<button class="back" data-act="qback">← Back to quiz types</button>',
      '<div class="panel"><h2>' + name + ' quizzes</h2><div class="qgrid"><button class="qpick all" data-act="qpick" data-f="all"><b>All ' + name.toLowerCase() + ' questions</b>Mixed practice<small>' + base.length + ' questions</small></button>' + buttons + general + '</div></div>'
    ].join("");
  }

  const list = qlist();
  if (cur.qi >= list.length) {
    const percent = Math.round(cur.qs / list.length * 100);
    return '<div class="panel"><h2>Quiz complete</h2><p style="font-size:18px">You scored ' + cur.qs + ' / ' + list.length + ' (' + percent + '%).</p><button class="btn p" data-act="qrestart">Choose another ' + name.toLowerCase() + ' quiz</button> <button class="btn" data-act="qback">← Back</button></div>';
  }

  const question = list[cur.qi];
  return [
    '<button class="back" data-act="qback">← Back to ' + name.toLowerCase() + ' quizzes</button>',
    '<div class="panel">',
    '<div class="row"><span>' + name + ' quiz · Question ' + (cur.qi + 1) + ' of ' + list.length + '</span><span>Average: ' + avg() + '%</span></div>',
    bar(cur.qi / list.length * 100),
    '<h2 style="margin-top:18px">' + question[0] + '</h2>',
    question[1].map(function (option, index) {
      return '<label class="opt"><input type="radio" name="qa" value="' + index + '"> <span>' + option + '</span></label>';
    }).join(""),
    '<button class="btn p" data-act="qnext">' + (cur.qi === list.length - 1 ? "Finish" : "Next") + '</button>',
    '<div class="fb">' + (cur.fb || "") + '</div>',
    '</div>'
  ].join("");
}

function prog() {
  function buildLessonRows(categoryKey, labelPrefix) {
    return L[categoryKey].map(function (lessonData, index) {
      const percent = S.read[categoryKey + index] ? 100 : 0;
      const title = labelPrefix + (index + 1) + ' :';
      return '<div class="row"><span><b>' + title + '</b> ' + lessonData[0] + '</span><span>' + percent + '% Completed</span></div>' + bar(percent);
    }).join("");
  }

  return [
    '<div class="panel">',
    buildLessonRows("s", "Lesson "),
    '<h2 style="margin-top:24px">Hardware lessons</h2>',
    buildLessonRows("h", "Hardware "),
    '<h2 style="margin-top:24px">Activities &amp; quiz</h2>',
    '<div class="row"><span>Missions completed</span><span>' + mdone() + '/' + (OP.length * 3) + '</span></div>',
    bar(mdone() / (OP.length * 3) * 100),
    '<div class="row"><span>Quiz score average</span><span>' + avg() + '%</span></div>',
    bar(avg()),
    '<button class="btn" style="margin-top:20px;background:var(--mut);color:var(--fg)" data-act="reset">Reset my progress</button>',
    '</div>'
  ].join("");
}

function about() {
  const names = ["Jordan S. Batu", "Champaigne A. Escultura", "Hanelyn C. Gontinas", "Lyn-Lyn P. Layague", "Patricia May Manset", "Jay C. Mella", "Darryl Naval"];
  const offer = [["Interactive Lessons", "Provides organized learning materials about computer hardware, software, networking, and troubleshooting.", "ab_lessons"], ["Learning Activities", "Allows students to apply their knowledge through different exercises and practical learning tasks.", "ab_books"], ["Quizzes and Assessments", "Helps students test their understanding and evaluate what they have learned.", "ab_quiz"], ["Progress Tracking", "Allows students to monitor their learning progress and see their performance.", "ab_prog"]];
  return [
    '<div class="abt"><h1 class="abh">MEET THE TEAM</h1><p>The students behind the development of TechSkill.</p>',
    '<div class="team">' + names.map(function (name, i) { return '<div><div class="av" style="background-image:url(' + IM.team[i] + ')"></div>' + name + '</div>'; }).join("") + '</div>',
    '<h1 class="abh" style="margin-top:34px">About <span style="color:#4fd0e0">TechSkill</span></h1>',
    '<p class="abp"><b style="color:#4fd0e0">TechSkill</b> is a web-based interactive learning system designed to help students develop their knowledge and skills in Computer Systems Servicing (CSS). It provides an accessible platform where learners can explore lessons, participate in activities, take quizzes, and monitor their learning progress.</p>',
    '<p class="abp">Our platform aims to make learning easier, more engaging, and more accessible through the use of technology.</p>',
    '<div class="grid g2"><div class="abc"><img src="' + IM.ab_target + '"><div><h3>Our Mission</h3>To provide an interactive and accessible digital learning platform that helps students improve their knowledge, understanding, and technical skills in Computer Systems Servicing.</div></div>',
    '<div class="abc"><img src="' + IM.ab_eye + '"><div><h3>Our Vision</h3>To become a helpful digital learning platform that encourages students to become knowledgeable, confident, and skilled in computer servicing and troubleshooting.</div></div></div>',
    '<h2 class="abh" style="text-align:center;margin:28px 0 14px">What We Offer</h2>',
    offer.map(function (x, i) { return '<div class="abc off"><span class="num">' + (i + 1) + '</span><h3>' + x[0] + '</h3><span class="od">' + x[1] + '</span><img src="' + IM[x[2]] + '"></div>'; }).join(""),
    '<div class="abc" style="margin-top:18px"><img src="' + IM.ab_goal + '"><div><h3>Our Goal</h3>TechSkill aims to support students in developing essential computer servicing knowledge and troubleshooting skills through interactive digital learning resources.</div></div></div>'
  ].join("");
}

function search(value) {
  const searchTerm = value.toLowerCase();
  const matches = [];

  if (searchTerm.length < 2) {
    return matches;
  }

  ["s", "h"].forEach(function (categoryKey) {
    L[categoryKey].forEach(function (lessonData, index) {
      const text = (lessonData[0] + " " + lessonData[1] + " " + lessonData[2].join(" ")).toLowerCase();
      if (text.indexOf(searchTerm) >= 0) {
        matches.push([(categoryKey === "s" ? "Software" : "Hardware") + " Lesson " + (index + 1) + ": " + lessonData[0], "les-" + categoryKey + index]);
      }
    });
  });

  OP.forEach(function (operation, index) {
    const text = (operation[0] + " " + operation[2].join(" ")).toLowerCase();
    if (text.indexOf(searchTerm) >= 0) {
      matches.push(["Activity: " + operation[0], "op-" + index]);
    }
  });

  return matches.slice(0, 6);
}

// Search input updates the results list. The search is lightweight and only shows
// the closest matching lessons or activities to keep the UI responsive.
document.addEventListener("input", function (event) {
  if (event.target.id !== "q") {
    return;
  }

  const matches = search(event.target.value);
  const resultBox = getElement("res");
  resultBox.hidden = !matches.length;
  resultBox.innerHTML = matches.map(function (item) {
    return '<div data-go="' + item[1] + '">' + item[0] + '</div>';
  }).join("");
});

// Shared click handling for navigation, lesson actions, mission logic, and quiz controls.
// The app uses hash routing, so each action either updates the URL or mutates saved state.
document.addEventListener("click", function (event) {
  const target = event.target.closest("[data-go],[data-act]");

  if (!target) {
    return;
  }

  if (target.dataset.go) {
    if (target.disabled) {
      return;
    }

    if (target.dataset.go === location.hash.slice(1)) {
      render();
    } else {
      go(target.dataset.go);
    }
    return;
  }

  const action = target.dataset.act;

  if (action === "navtoggle") {
    const open = document.body.classList.toggle("navopen");
    try { localStorage.setItem("ts-nav", open ? "1" : "0"); } catch (error) { /* ignore */ }
    return;
  }

  if (action === "read") {
    S.read[target.dataset.k + target.dataset.i] = 1;
    logActivity("Completed " + L[target.dataset.k][Number(target.dataset.i)][0]);
    saveState();

    const lessonKey = target.dataset.k;
    const lessonIndex = Number(target.dataset.i);
    const nextRoute = lessonIndex < L[lessonKey].length - 1 ? "les-" + lessonKey + (lessonIndex + 1) : (lessonKey === "s" ? "sw" : "hw");
    go(nextRoute);
  }

  if (action === "lprev") {
    if (cur.lp > 0) {
      cur.lp -= 1;
      cur.top = true;
      render();
    } else {
      go(target.dataset.k === "h" ? "hw" : "sw");
    }
  }

  if (action === "lnext") {
    cur.lp += 1;
    cur.top = true;
    render();
  }

  if (action === "lfin") {
    const lessonKey = target.dataset.k;
    const lessonIndex = Number(target.dataset.i);
    if (!S.read[lessonKey + lessonIndex]) { logActivity("Completed " + L[lessonKey][lessonIndex][0]); }
    S.read[lessonKey + lessonIndex] = 1;
    saveState();
    cur.lk = null;
    go(lessonIndex < L[lessonKey].length - 1 ? "les-" + lessonKey + (lessonIndex + 1) : (lessonKey === "s" ? "sw" : "hw"));
  }

  if (action === "insp") {
    cur.sel = Number(target.dataset.i);
    cur.ex[cur.sel] = 1;
    if (cur.order.indexOf(cur.sel) < 0) { cur.order.push(cur.sel); }
    cur.res = null;
    render();
  }

  if (action === "choose") {
    cur.pick = Number(target.dataset.i);
  }

  if (action === "diag") {
    const parts = cur.key.split("-");
    const ms = OP[Number(parts[0])][3][Number(parts[1])];

    if (Object.keys(cur.ex).length < ms.e.length) {
      cur.res = "need";
    } else if (cur.pick === null) {
      cur.res = "pick";
    } else if (cur.pick === ms.c) {
      cur.res = "ok";
      if (!S.done[cur.key]) { logActivity("Completed mission: " + OP[Number(parts[0])][2][Number(parts[1])]); }
      S.done[cur.key] = 1;
      saveState();
    } else {
      cur.res = "bad";
    }
    render();
  }

  if (action === "qnext") {
    const selectedAnswer = document.querySelector('input[name=qa]:checked');
    if (!selectedAnswer) {
      cur.fb = "Pick an answer to continue.";
      render();
      return;
    }

    if (Number(selectedAnswer.value) === qlist()[cur.qi][2]) {
      cur.qs += 1;
    }

    cur.qi += 1;
    cur.fb = "";

    if (cur.qi >= qlist().length) {
      S.quiz.push(Math.round(cur.qs / qlist().length * 100));
      logActivity("Finished a quiz (" + Math.round(cur.qs / qlist().length * 100) + "%)");
      saveState();
    }

    render();
  }

  if (action === "qcat") {
    cur.qc = target.dataset.c;
    cur.qf = undefined;
    cur.qi = 0;
    cur.qs = 0;
    cur.fb = "";
    render();
  }

  if (action === "qback") {
    if (cur.qf !== undefined) {
      cur.qf = undefined;
      cur.qi = 0;
      cur.qs = 0;
      cur.fb = "";
    } else {
      cur.qc = undefined;
    }
    render();
  }

  if (action === "qrestart") {
    cur.qi = 0;
    cur.qs = 0;
    cur.qf = undefined;
    render();
  }

  if (action === "atab") {
    cur.at = target.dataset.f;
    render();
  }

  if (action === "qpick") {
    cur.qf = target.dataset.f === "all" ? null : Number(target.dataset.f);
    cur.qi = 0;
    cur.qs = 0;
    render();
  }

  if (action === "lquiz") {
    cur.qc = target.dataset.k || "s";
    cur.qf = Number(target.dataset.i) + 1;
    cur.qi = 0;
    cur.qs = 0;
    go("quiz");
  }

  if (action === "logall") {
    cur.logAll = !cur.logAll;
    render();
  }

  if (action === "reset") {
    S = { read: {}, quiz: [], done: {}, last: null, log: [] };
    cur.lk = null;
    saveState();
    cur.ex = {};
    cur.order = [];
    cur.sel = null;
    cur.qi = 0;
    cur.qs = 0;
    cur.fb = "";
    cur.key = null;
    render();
  }
});

try { if (localStorage.getItem("ts-nav") === "1") { document.body.classList.add("navopen"); } } catch (error) { /* ignore */ }
cur.qi = 0;
cur.qs = 0;
cur.qf = undefined;
cur.qc = undefined;
cur.at = "h";
window.addEventListener("hashchange", render);
render();

// Keyboard access for the logo toggle.
document.addEventListener("keydown", function (ev) {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList && ev.target.classList.contains("logo")) {
    ev.preventDefault();
    ev.target.click();
  }
});
