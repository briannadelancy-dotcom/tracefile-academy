type EvidenceType = "DNA" | "Fingerprint" | "Trace" | "Digital";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
import { jsPDF } from "jspdf";

type Module = {
  id: string;
  title: string;
  evidenceType: EvidenceType;
  difficulty: Difficulty;
  minutes: number;
  summary: string;

  // "Real lesson content" (simple but real)
  objectives: string[];
  lesson: string[];
  quiz: { q: string; options: string[]; answerIndex: number }[];
};

type CaseStudy = {
  id: string;
  title: string;
  agency: string;
  outcome: string;
  year: string;
  whyItMatters: string;

  // link to read more (real sources)
  links: { label: string; url: string }[];
};

type PracticeSubmission = {
  id: string;
  student: string;
  moduleId: string;
  evidenceType: EvidenceType;
  notes: string;
  status: "Needs Review" | "Reviewed";
  createdAt: string;
};

// ---------------- DATA ----------------

const modules: Module[] = [
  {
    id: "IFS-101",
    title: "Intro to Forensic Science",
    evidenceType: "Trace",
    difficulty: "Beginner",
    minutes: 30,
    summary: "Overview of forensic science, lab roles, and how evidence supports investigations.",
    objectives: [
      "Understand what forensic science is and what it is not",
      "Identify major forensic disciplines",
      "Explain the role of labs in investigations",
    ],
    lesson: [
      "Forensic science applies scientific methods to legal questions.",
      "Labs analyze evidence — they do not determine guilt or innocence.",
      "Common disciplines include DNA, fingerprints, trace, toxicology, and digital forensics.",
    ],
    quiz: [
      {
        q: "What is the primary role of a forensic laboratory?",
        options: [
          "To arrest suspects",
          "To analyze evidence using scientific methods",
          "To interview witnesses",
          "To prosecute cases",
        ],
        answerIndex: 1,
      },
    ],
  },

  {
    id: "CSB-120",
    title: "Crime Scene Basics",
    evidenceType: "Trace",
    difficulty: "Beginner",
    minutes: 35,
    summary: "How crime scenes are secured, documented, and processed.",
    objectives: [
      "Describe why scene security is important",
      "Identify basic documentation methods",
      "Recognize contamination risks",
    ],
    lesson: [
      "Securing the scene prevents evidence loss or contamination.",
      "Photos, sketches, and notes document the original condition of the scene.",
      "Proper PPE and controlled movement reduce cross-transfer.",
    ],
    quiz: [
      {
        q: "Why is controlling access to a crime scene important?",
        options: [
          "To make the scene look professional",
          "To prevent contamination and evidence loss",
          "To speed up investigations",
          "To avoid paperwork",
        ],
        answerIndex: 1,
      },
    ],
  },

  {
    id: "EVD-210",
    title: "How Evidence Is Processed",
    evidenceType: "DNA",
    difficulty: "Beginner",
    minutes: 40,
    summary: "What happens to evidence once it reaches the forensic lab.",
    objectives: [
      "Understand intake and chain-of-custody",
      "Explain basic lab workflow",
      "Recognize documentation importance",
    ],
    lesson: [
      "Evidence intake confirms seals, labels, and documentation.",
      "Chain-of-custody tracks who handled evidence and when.",
      "Each test must be documented and reproducible.",
    ],
    quiz: [
      {
        q: "What does chain-of-custody document?",
        options: [
          "Only the crime scene",
          "Who handled evidence and when",
          "Only lab results",
          "Witness statements",
        ],
        answerIndex: 1,
      },
    ],
  },

  {
    id: "CAR-250",
    title: "Careers in Forensic Science",
    evidenceType: "Digital",
    difficulty: "Beginner",
    minutes: 30,
    summary: "Explore forensic careers, education paths, and workplace realities.",
    objectives: [
      "Identify major forensic career paths",
      "Understand education requirements",
      "Learn about lab vs field roles",
    ],
    lesson: [
      "Most forensic work happens in laboratories, not at crime scenes.",
      "Education requirements vary by discipline and jurisdiction.",
      "Strong documentation and communication skills are essential.",
    ],
    quiz: [
      {
        q: "Where does most forensic analysis occur?",
        options: [
          "At the crime scene",
          "In courtrooms",
          "In forensic laboratories",
          "At police stations",
        ],
        answerIndex: 2,
      },
    ],
  },

  {
    id: "MCS-301",
    title: "Mock Case Studies",
    evidenceType: "Fingerprint",
    difficulty: "Beginner",
    minutes: 45,
    summary: "Apply concepts using realistic fictional case scenarios.",
    objectives: [
      "Practice evidence interpretation",
      "Identify potential contamination risks",
      "Write basic analyst observations",
    ],
    lesson: [
      "Mock cases simulate common evidence challenges.",
      "Focus on documentation, not guessing outcomes.",
      "Ethical reporting requires stating limitations clearly.",
    ],
    quiz: [
      {
        q: "What is the purpose of mock cases in training?",
        options: [
          "To solve real crimes",
          "To practice analytical thinking and documentation",
          "To replace real lab experience",
          "To certify analysts",
        ],
        answerIndex: 1,
      },
    ],
  },
];

// Real case-study links (reputable sources)
const caseStudies: CaseStudy[] = [
  {
    id: "CS-VELMA",
    title: "Velma Louise Silva Lee",
    agency: "Shasta County Coroner / Law Enforcement Collaboration",
    outcome:
      "Long-unidentified remains were identified using modern DNA methods and confirmation workflows.",
    year: "2025",
    whyItMatters:
      "Shows how long-term unidentified cases can be resolved when evidence is revisited with modern methods.",
    links: [
      { label: "DNA Solves case page", url: "https://dnasolves.com/articles/shasta-county-velma-lee-2013/" },
      { label: "Forensic Magazine summary", url: "https://www.forensicmag.com/3594-All-News/621818-Othram-Identifies-2013-Jane-Doe/" },
    ],
  },
  {
    id: "CS-525",
    title: "Mary Sue Fink (Project 525)",
    agency: "Honolulu Police + Medical Examiner Collaboration",
    outcome:
      "A child Jane Doe was identified using advanced sequencing approaches suitable for difficult DNA.",
    year: "2024–2025",
    whyItMatters:
      "Demonstrates how difficult samples can still support identification when handled carefully and paired with modern workflows.",
    links: [
      { label: "Othram editorial (Project 525)", url: "https://othram.com/research/editorial/one-year-of-project-525-a-milestone-in-justice-and-a-call-to-finish-what-we-started" },
      { label: "DNA Solves article", url: "https://dnasolves.com/articles/mary-sue-fink-hawaii/" },
    ],
  },
];

const completed = new Set<string>();
let submissions: PracticeSubmission[] = [];
const STORAGE_KEY = "tracefile_progress_v1";

function saveProgress() {
  const data = {
    completed: Array.from(completed),
    submissions,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const data = JSON.parse(raw) as {
    completed: string[];
    submissions: PracticeSubmission[];
  };

  completed.clear();
  data.completed.forEach((id) => completed.add(id));

  submissions = data.submissions || [];
}

// ---------------- SIMPLE ROUTER ----------------

type View = "modules" | "moduleDetail" | "practice" | "caseDetail";
let view: View = "modules";
let selectedModuleId: string | null = null;
let selectedCaseId: string | null = null;

// ---------------- APP ROOT ----------------

const app = document.getElementById("app") as HTMLDivElement;

if (!app) {
  document.body.innerHTML = `<pre style="padding:16px;font-family:monospace;">❌ Missing &lt;div id="app"&gt; in index.html</pre>`;
  throw new Error("Missing #app");
}

app.innerHTML = `
  <style>
    body{ margin:0; font-family: system-ui, Arial; background:#070A0F; color:white; }
    .wrap{ max-width:1100px; margin:0 auto; padding:30px 18px; }
    .topbar{
      display:flex; justify-content:space-between; align-items:center;
      padding:14px 16px; border:1px solid rgba(255,255,255,.08);
      border-radius:16px; background:rgba(12,17,32,.7);
    }
    .brand{ display:flex; gap:10px; align-items:center; }
    .logo{
      width:36px; height:36px; border-radius:12px;
      background: linear-gradient(135deg, #7C5CFF, #2EF2D0);
    }
    .pill{
      padding:10px 12px; border:1px solid rgba(255,255,255,.08);
      border-radius:999px; color:rgba(255,255,255,.65); font-size:12px;
    }
    .pill b{ color:white; }
    .hero{
      margin-top:18px; padding:26px; border:1px solid rgba(255,255,255,.08);
      border-radius:22px; background:rgba(12,17,32,.55);
    }
    .kicker{ color:rgba(255,255,255,.65); letter-spacing:.2em; text-transform:uppercase; font-size:12px; }
    h1{ margin:10px 0 10px; font-size:38px; line-height:1.05; }
    p{ color:rgba(255,255,255,.65); max-width:70ch; }
    .btnRow{ display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
    button{
      padding:12px 14px; border-radius:14px;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(10,15,29,.65);
      color:white; cursor:pointer;
    }
    button:hover{ border-color: rgba(124,92,255,.45); }
    .primary{
      border:none; background: linear-gradient(135deg, #7C5CFF, #2EF2D0);
      color:#05070C; font-weight:800;
    }
    .card{
      margin-top:18px; padding:18px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:18px; background:rgba(12,17,32,.55);
    }
    .item{
      padding:12px; border:1px solid rgba(255,255,255,.08);
      border-radius:16px; background:rgba(10,15,29,.55);
      display:flex; justify-content:space-between; gap:12px; align-items:flex-start;
      margin-top:10px;
    }
    .meta{ color:rgba(255,255,255,.65); font-size:12px; margin-top:4px; }
    .tag{
      font-size:12px; padding:6px 10px; border-radius:999px;
      border:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.65);
      white-space:nowrap;
    }
    label{ display:block; margin:10px 0 6px; color:rgba(255,255,255,.65); font-size:12px; }
    input, select, textarea{
      width:100%; padding:12px 12px; border-radius:14px;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(10,15,29,.55); color:white; outline:none;
    }
    textarea{ min-height:92px; resize:vertical; }
    .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
    @media (max-width:900px){ .grid{ grid-template-columns:1fr; } }

    .certificate{
      margin-top:14px;
      padding:14px;
      border-radius:16px;
      border:1px solid rgba(46,242,208,.25);
      background: rgba(46,242,208,.08);
    }
  </style>

  <div class="wrap">
    <div class="topbar">
      <div class="brand">
        <div class="logo"></div>
        <div>
          <div style="letter-spacing:.18em; text-transform:uppercase; font-size:13px;">TRACEFILE ACADEMY</div>
          <div style="color:rgba(255,255,255,.65); font-size:12px;">Forensic Training • Modules • Practice Cases</div>
        </div>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
        <div class="pill">Progress: <b id="progressPill">0%</b></div>
        <div class="pill">Queue: <b id="queuePill">0</b></div>
        <div class="pill">Completed: <b id="countPill">0</b></div>
      </div>
    </div>

    <div class="hero">
      <div class="kicker">Training Platform</div>
      <h1>Train like a forensic analyst.</h1>
      <p>Clickable modules + clickable real case studies + certificate unlocks.</p>

      <div class="btnRow">
        <button class="primary" id="btnModules">Modules</button>
        <button id="btnPractice">Practice</button>
      </div>

      <div id="certSpot"></div>
    </div>

    <div id="content"></div>
  </div>
`;

const content = document.getElementById("content") as HTMLDivElement;
const progressPill = document.getElementById("progressPill") as HTMLSpanElement;
const queuePill = document.getElementById("queuePill") as HTMLSpanElement;
const countPill = document.getElementById("countPill") as HTMLSpanElement;
const certSpot = document.getElementById("certSpot") as HTMLDivElement;

function percentComplete() {
  return Math.round((completed.size / modules.length) * 100);
}

function updateStats() {
  const progress = Math.round((completed.size / modules.length) * 100);
  progressPill.textContent = `${progress}%`;
  countPill.textContent = `${completed.size}`;
  queuePill.textContent = `${submissions.length}`;

  // Certificate unlock (Option A: overall completion only)
  if (progress === 100) {
    certSpot.innerHTML = `
      <div class="certificate">
        <b>🏅 Certificate Unlocked</b>
        <div class="meta">Enter your name and download your Certificate of Completion.</div>

        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <input id="certName" placeholder="Your name (e.g., Jane Doe)" style="max-width:320px;" />
          <button class="primary" id="downloadCert">Download Certificate (PDF)</button>
        </div>

        <div class="meta" style="margin-top:10px;">
          This is a Certificate of Completion for introductory training and does not constitute professional certification or licensure.
        </div>
      </div>
    `;

    const btn = document.getElementById("downloadCert") as HTMLButtonElement;
    btn.onclick = () => {
      const name =
        (document.getElementById("certName") as HTMLInputElement).value.trim() || "Participant";
      downloadCertificatePDF(name);
    };
  } else {
    certSpot.innerHTML = "";
  }
}
function downloadCertificatePDF(studentName: string) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter",
  });

  // Background
  doc.setFillColor(7, 10, 15); // #070A0F
  doc.rect(0, 0, 792, 612, "F");

  // Border
  doc.setDrawColor(124, 92, 255); // purple accent
  doc.setLineWidth(3);
  doc.rect(36, 36, 792 - 72, 612 - 72);

  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Tracefile Academy", 396, 140, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(200, 200, 200);
  doc.text("Certificate of Completion", 396, 175, { align: "center" });

  // Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text(studentName, 396, 250, { align: "center" });

  // Course title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(200, 200, 200);
  doc.text("has successfully completed", 396, 290, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Intro to Forensic Science Foundations", 396, 325, { align: "center" });

  // Date + signature line
  const dateStr = new Date().toLocaleDateString();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);

  doc.text(`Date: ${dateStr}`, 120, 430);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(520, 435, 700, 435);
  doc.text("Authorized Signature", 610, 455, { align: "center" });

  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(160, 160, 160);
  doc.text(
    "This certificate acknowledges completion of introductory educational training and does not constitute professional certification or licensure.",
    396,
    520,
    { align: "center", maxWidth: 660 }
  );

  // Download
  const safeName = studentName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  doc.save(`Tracefile_Academy_Certificate_${safeName || "Participant"}.pdf`);
}


function go(to: View) {
  view = to;
  render();
  updateStats();
}

function render() {
  if (view === "modules") return renderModules();
  if (view === "moduleDetail") return renderModuleDetail();
  if (view === "caseDetail") return renderCaseDetail();
  return renderPractice();
}

// ---------------- MODULES (LIST) ----------------

function renderModules() {
  content.innerHTML = `
    <div class="card">
      <h2 style="margin:0 0 6px;">Real Case Studies </h2>
      <div style="color:rgba(255,255,255,.65);">Click a case to read more and open sources.</div>
      <div id="caseStudyList"></div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 6px;">Courses / Modules </h2>
      <div style="color:rgba(255,255,255,.65);">Click a module to open the lesson + mini quiz.</div>
      <div id="moduleList"></div>
    </div>
  `;

  const caseStudyList = document.getElementById("caseStudyList") as HTMLDivElement;
  caseStudyList.innerHTML = caseStudies
    .map(
      (c) => `
      <div class="item" style="cursor:pointer;" data-case="${c.id}">
        <div>
          <b>${c.title}</b>
          <div class="meta">${c.agency} • ${c.year}</div>
          <div class="meta">${c.outcome}</div>
          <div class="meta"><i>${c.whyItMatters}</i></div>
        </div>
        <div class="tag">Open</div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll<HTMLElement>("[data-case]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedCaseId = el.dataset.case!;
      go("caseDetail");
    });
  });

  const moduleList = document.getElementById("moduleList") as HTMLDivElement;
  moduleList.innerHTML = modules
    .map((m) => {
      const isDone = completed.has(m.id);
      return `
        <div class="item" style="cursor:pointer;" data-module="${m.id}">
          <div>
            <b>${m.title}</b>
            <div class="meta">${m.id} • ${m.evidenceType} • ${m.difficulty} • ${m.minutes} min</div>
            <div class="meta">${m.summary}</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
            <div class="tag">${isDone ? "Completed" : "Not started"}</div>
            <button class="${isDone ? "" : "primary"}" data-toggle="${m.id}">
              ${isDone ? "Mark Incomplete" : "Mark Complete"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  // Toggle completion
  document.querySelectorAll<HTMLButtonElement>("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevents opening module detail when clicking button
      const id = btn.dataset.toggle!;
      if (completed.has(id)) completed.delete(id);
      else completed.add(id);
      saveProgress();
      renderModules();
      updateStats();
    });
  });

  // Open module detail
  document.querySelectorAll<HTMLElement>("[data-module]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedModuleId = el.dataset.module!;
      go("moduleDetail");
    });
  });
}

// ---------------- MODULE DETAIL (LESSON) ----------------

function renderModuleDetail() {
  const m = modules.find((x) => x.id === selectedModuleId);
  if (!m) {
    selectedModuleId = null;
    return go("modules");
  }

  const isDone = completed.has(m.id);

  content.innerHTML = `
    <div class="card">
      <div class="meta" style="margin-bottom:10px;">Course</div>
      <h2 style="margin:0 0 6px;">${m.title}</h2>
      <div class="meta">${m.id} • ${m.evidenceType} • ${m.difficulty} • ${m.minutes} min</div>
      <p>${m.summary}</p>

      <div class="item">
        <div>
          <b>Objectives</b>
          <div class="meta">${m.objectives.map((o) => `• ${o}`).join("<br/>")}</div>
        </div>
        <div class="tag">Lesson</div>
      </div>

      <div class="item">
        <div>
          <b>Lesson Notes</b>
          <div class="meta">${m.lesson.map((l) => `• ${l}`).join("<br/>")}</div>
        </div>
        <div class="tag">Notes</div>
      </div>

      <div class="item">
        <div style="width:100%;">
          <b>Mini Quiz</b>
          <div class="meta" style="margin-top:8px;">${m.quiz[0].q}</div>
          <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
            ${m.quiz[0].options
              .map((opt, idx) => `<button type="button" class="smallOpt" data-ans="${idx}">${opt}</button>`)
              .join("")}
          </div>
          <div class="meta" id="quizResult" style="margin-top:10px;"></div>
        </div>
        <div class="tag">Quiz</div>
      </div>

      <div class="btnRow">
        <button id="backToModules">Back</button>
        <button class="${isDone ? "" : "primary"}" id="toggleComplete">
          ${isDone ? "Mark Incomplete" : "Mark Complete"}
        </button>
      </div>
    </div>
  `;

  // quiz wiring
  const result = document.getElementById("quizResult") as HTMLDivElement;
  document.querySelectorAll<HTMLButtonElement>("[data-ans]").forEach((b) => {
    b.addEventListener("click", () => {
      const pick = Number(b.dataset.ans);
      if (pick === m.quiz[0].answerIndex) {
        result.textContent = "✅ Correct.";
      } else {
        result.textContent = "❌ Not quite. Try again.";
      }
    });
  });

  (document.getElementById("backToModules") as HTMLButtonElement).onclick = () => go("modules");

  (document.getElementById("toggleComplete") as HTMLButtonElement).onclick = () => {
    if (completed.has(m.id)) completed.delete(m.id);
    else completed.add(m.id);
    saveProgress();

    renderModuleDetail();
    updateStats();
  };
}

// ---------------- CASE DETAIL (READ MORE) ----------------

function renderCaseDetail() {
  const c = caseStudies.find((x) => x.id === selectedCaseId);
  if (!c) {
    selectedCaseId = null;
    return go("modules");
  }

  content.innerHTML = `
    <div class="card">
      <div class="meta" style="margin-bottom:10px;">Case Study</div>
      <h2 style="margin:0 0 6px;">${c.title}</h2>
      <div class="meta">${c.agency} • ${c.year}</div>

      <div class="item">
        <div>
          <b>Outcome</b>
          <div class="meta">${c.outcome}</div>
        </div>
        <div class="tag">Summary</div>
      </div>

      <div class="item">
        <div>
          <b>Why it matters</b>
          <div class="meta">${c.whyItMatters}</div>
          <div class="meta" style="margin-top:10px;">
            <b>Training takeaways</b><br/>
            • Evidence handling + documentation matters.<br/>
            • Re-testing with modern methods can unlock answers.<br/>
            • Communication and careful reporting are part of justice.
          </div>
        </div>
        <div class="tag">Takeaways</div>
      </div>

      <div class="item">
        <div>
          <b>Read more (sources)</b>
          <div style="margin-top:8px; display:flex; gap:10px; flex-wrap:wrap;">
            ${c.links.map((l) => `<button class="primary" type="button" data-link="${l.url}">${l.label}</button>`).join("")}
          </div>
        </div>
        <div class="tag">Links</div>
      </div>

      <div class="btnRow">
        <button id="backFromCase">Back</button>
      </div>
    </div>
  `;

  document.querySelectorAll<HTMLButtonElement>("[data-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.link!;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });

  (document.getElementById("backFromCase") as HTMLButtonElement).onclick = () => go("modules");
}

// ---------------- PRACTICE (SUBMIT + QUEUE) ----------------

function renderQueue() {
  const list = document.getElementById("queueList") as HTMLDivElement;
  if (!list) return;

  if (submissions.length === 0) {
    list.innerHTML = `<div class="item"><div><b>No submissions yet.</b><div class="meta">Submit a practice case to populate the queue.</div></div><div class="tag">Empty</div></div>`;
    return;
  }

  list.innerHTML = submissions
    .slice()
    .reverse()
    .map(
      (s) => `
      <div class="item">
        <div>
          <b>${s.student} • ${s.id}</b>
          <div class="meta">${s.moduleId} • ${s.evidenceType} • ${new Date(s.createdAt).toLocaleDateString()}</div>
          <div class="meta">${s.notes || ""}</div>
        </div>
        <div class="tag">${s.status}</div>
      </div>
    `
    )
    .join("");
}

function renderPractice() {
  content.innerHTML = `
    <div class="grid">
      <div class="card">
        <h2 style="margin:0 0 6px;">Submit Practice Case</h2>

        <form id="practiceForm">
          <label>Student Name</label>
          <input id="studentName" required />

          <label>Module</label>
          <select id="moduleId" required>
            <option value="">Select</option>
            ${modules.map((m) => `<option value="${m.id}">${m.id} — ${m.title}</option>`).join("")}
          </select>

          <label>Evidence Type</label>
          <select id="evidenceType" required>
            <option value="">Select</option>
            <option value="DNA">DNA</option>
            <option value="Fingerprint">Fingerprint</option>
            <option value="Trace">Trace</option>
            <option value="Digital">Digital</option>
          </select>

          <label>Analyst Notes</label>
          <textarea id="notes"></textarea>

          <div class="btnRow">
            <button class="primary" type="submit">Submit</button>
            <button type="button" id="clearQueue">Clear Queue</button>
            <button type="button" id="seedDemo">Seed Demo</button>
            <button type="button" id="backPractice">Back</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2 style="margin:0 0 6px;">Review Queue</h2>
        <div id="queueList"></div>
      </div>
    </div>
  `;

  renderQueue();

  const form = document.getElementById("practiceForm") as HTMLFormElement;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const student = (document.getElementById("studentName") as HTMLInputElement).value.trim();
    const moduleId = (document.getElementById("moduleId") as HTMLSelectElement).value;
    const evidenceType = (document.getElementById("evidenceType") as HTMLSelectElement).value as EvidenceType;
    const notes = (document.getElementById("notes") as HTMLTextAreaElement).value.trim();

    submissions.push({
      id: `SUB-${Math.floor(Math.random() * 9000 + 1000)}`,
      student,
      moduleId,
      evidenceType,
      notes,
      status: "Needs Review",
      createdAt: new Date().toISOString(),
    });
    saveProgress();


    form.reset();
    renderQueue();
    updateStats();
  });

  (document.getElementById("clearQueue") as HTMLButtonElement).onclick = () => {
    submissions = [];
    saveProgress();

    renderQueue();
    updateStats();
  };

  (document.getElementById("seedDemo") as HTMLButtonElement).onclick = () => {
    submissions.push({
      id: `SUB-${Math.floor(Math.random() * 9000 + 1000)}`,
      student: "Demo Student",
      moduleId: "MOD-DNA-101",
      evidenceType: "DNA",
      notes: "Low-template sample. Recommend contamination controls and careful interpretation.",
      status: "Needs Review",
      createdAt: new Date().toISOString(),
    });
    saveProgress();

    renderQueue();
    updateStats();
  };

  (document.getElementById("backPractice") as HTMLButtonElement).onclick = () => go("modules");
}

// ---------------- NAV ----------------

(document.getElementById("btnModules") as HTMLButtonElement).addEventListener("click", () => go("modules"));
(document.getElementById("btnPractice") as HTMLButtonElement).addEventListener("click", () => go("practice"));

// ---------------- START ----------------
loadProgress();
render();
updateStats();

