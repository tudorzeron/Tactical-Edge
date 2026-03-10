import { useState, useRef, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ============================================================
// PASTE YOUR ANTHROPIC API KEY BETWEEN THE QUOTES BELOW
// ============================================================
const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
// ============================================================

const FORMATIONS = [
  "4-4-2 Flat", "4-4-2 Diamond",
  "4-3-3", "4-2-3-1", "4-1-4-1", "4-5-1",
  "3-5-2", "3-4-3", "3-4-2-1",
  "5-3-2", "5-4-1",
  "4-4-1-1", "4-3-2-1"
];

const MODES = [
  { id: "pregame", label: "Pre-Game Scout", icon: "◈", desc: "Deep prep — full analysis" },
  { id: "sideline", label: "Sideline", icon: "◉", desc: "Live — fast insights" },
  { id: "halftime", label: "Halftime", icon: "◐", desc: "Adjustments now" },
  { id: "film", label: "Film Study", icon: "▶", desc: "Video observation input" },
];

const FORMATION_POSITIONS = {
  "4-4-2 Flat": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [14,50],[36,50],[64,50],[86,50],
    [36,25],[64,25],
  ],
  "4-4-2 Diamond": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [50,58],
    [25,46],[75,46],
    [50,34],
    [36,20],[64,20],
  ],
  "4-3-3": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [25,50],[50,50],[75,50],
    [16,20],[50,16],[84,20],
  ],
  "4-2-3-1": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [32,60],[68,60],
    [15,40],[50,38],[85,40],
    [50,16],
  ],
  "4-1-4-1": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [50,60],
    [12,43],[34,43],[66,43],[88,43],
    [50,16],
  ],
  "4-5-1": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [10,48],[27,48],[50,46],[73,48],[90,48],
    [50,16],
  ],
  "3-5-2": [
    [50,90],[25,74],[50,76],[75,74],
    [10,52],[28,50],[50,48],[72,50],[90,52],
    [34,22],[66,22],
  ],
  "3-4-3": [
    [50,90],[25,74],[50,76],[75,74],
    [15,52],[38,52],[62,52],[85,52],
    [16,20],[50,16],[84,20],
  ],
  "3-4-2-1": [
    [50,90],[25,74],[50,76],[75,74],
    [14,55],[38,55],[62,55],[86,55],
    [34,33],[66,33],
    [50,14],
  ],
  "5-3-2": [
    [50,90],[8,74],[26,74],[50,76],[74,74],[92,74],
    [25,52],[50,50],[75,52],
    [36,22],[64,22],
  ],
  "5-4-1": [
    [50,90],[8,74],[26,74],[50,76],[74,74],[92,74],
    [14,52],[36,52],[64,52],[86,52],
    [50,16],
  ],
  "4-4-1-1": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [14,52],[36,52],[64,52],[86,52],
    [50,33],[50,14],
  ],
  "4-3-2-1": [
    [50,90],[14,73],[36,73],[64,73],[86,73],
    [25,54],[50,54],[75,54],
    [34,33],[66,33],
    [50,14],
  ],
};

const FILM_FIELDS = [
  {
    section: "IN POSSESSION",
    fields: [
      { id: "buildupStyle", label: "Build-up Style", placeholder: "e.g. Short passing out of back, GK plays long, builds through #6..." },
      { id: "attackingPatterns", label: "Attacking Patterns", placeholder: "e.g. Early crosses from right, overlapping LB, #10 drops to receive..." },
      { id: "setPieceAttack", label: "Set Piece — Attacking", placeholder: "e.g. Near post runs on corners, #9 flicks on, direct free kicks top of box..." },
    ]
  },
  {
    section: "OUT OF POSSESSION",
    fields: [
      { id: "pressStyle", label: "Press Style", placeholder: "e.g. High press triggered by GK, mid-block 4-4-2, man-mark in final third..." },
      { id: "pressTriggers", label: "Press Triggers", placeholder: "e.g. Back pass to CB, GK has ball, long balls triggered by wide pass..." },
      { id: "setPieceDefend", label: "Set Piece — Defending", placeholder: "e.g. Zonal marking corners, man-mark throw-ins, #5 clears near post..." },
    ]
  },
  {
    section: "TRANSITIONS",
    fields: [
      { id: "transitionAttack", label: "Transition — Winning Ball", placeholder: "e.g. Quick vertical, #9 makes runs in behind, #8 carries forward..." },
      { id: "transitionDefend", label: "Transition — Losing Ball", placeholder: "e.g. Slow to recover shape, wingers don't track back, exposed wide..." },
    ]
  },
  {
    section: "KEY INDIVIDUALS",
    fields: [
      { id: "keyPlayers", label: "Danger Players", placeholder: "e.g. #10 links everything, #7 pace on right, #4 steps out aggressively..." },
      { id: "weaknesses", label: "Individual Weaknesses", placeholder: "e.g. LB slow to recover, #6 poor in the air, GK shaky on crosses..." },
    ]
  },
];

const FormationPitch = ({ formation, label, color, flip }) => {
  const positions = FORMATION_POSITIONS[formation] || FORMATION_POSITIONS["4-4-2 Flat"];
  const pts = positions.map(([x, y]) => ({ x, y: flip ? (100 - y) : y }));

  // ViewBox: 100 wide x 152 tall
  // Playing area: x=4 to 96 (w=92), y=4 to 148 (h=144)
  const px0=4, py0=4, pw=92, ph=144;
  const cx = px0 + pw/2;   // 50
  const cy = py0 + ph/2;   // 76

  // Scale helpers
  const sx = (p) => px0 + (p/100)*pw;
  const sy = (p) => py0 + (p/100)*ph;

  // Penalty box: 58% wide, 16% tall
  const pbW = pw*0.58, pbH = ph*0.16;
  const pbX = px0 + (pw-pbW)/2;

  // 6-yard box: 32% wide, 7% tall
  const sbW = pw*0.32, sbH = ph*0.065;
  const sbX = px0 + (pw-sbW)/2;

  // Penalty spot: 10.5% from goal line
  const pSpot = ph*0.105;

  // Center circle: real ratio ~9.15m on 105m pitch length = 8.7%
  const ccR = ph*0.095;

  // Penalty arc radius (same as center circle)
  const arcR = ccR;

  return (
    <div style={{ position:"relative", width:"100%", paddingBottom:"152%" }}>
      <svg viewBox="0 0 100 152" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>

        {/* Base */}
        <rect x="0" y="0" width="100" height="152" rx="4" fill="#2e7d32" />

        {/* Grass stripes */}
        {Array.from({length:9},(_,i) => (
          <rect key={i} x={px0} y={py0+i*(ph/9)} width={pw} height={ph/9}
            fill={i%2===0 ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.08)"} />
        ))}

        {/* Outer boundary */}
        <rect x={px0} y={py0} width={pw} height={ph}
          fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.75" />

        {/* Halfway line */}
        <line x1={px0} y1={cy} x2={px0+pw} y2={cy}
          stroke="rgba(255,255,255,0.9)" strokeWidth="0.7" />

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={ccR}
          fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.7" />

        {/* Center spot */}
        <circle cx={cx} cy={cy} r="0.9" fill="rgba(255,255,255,0.9)" />

        {/* TOP penalty box */}
        <rect x={pbX} y={py0} width={pbW} height={pbH}
          fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />

        {/* TOP 6-yard box */}
        <rect x={sbX} y={py0} width={sbW} height={sbH}
          fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />

        {/* TOP penalty spot */}
        <circle cx={cx} cy={py0+pSpot} r="0.75" fill="rgba(255,255,255,0.85)" />

        {/* TOP penalty arc — small tight arc outside the box */}
        <path
          d={`M ${cx-arcR*0.7} ${py0+pbH} A ${arcR*0.75} ${arcR*0.75} 0 0 0 ${cx+arcR*0.7} ${py0+pbH}`}
          fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.65"
        />

        {/* BOTTOM penalty box */}
        <rect x={pbX} y={py0+ph-pbH} width={pbW} height={pbH}
          fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />

        {/* BOTTOM 6-yard box */}
        <rect x={sbX} y={py0+ph-sbH} width={sbW} height={sbH}
          fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />

        {/* BOTTOM penalty spot */}
        <circle cx={cx} cy={py0+ph-pSpot} r="0.75" fill="rgba(255,255,255,0.85)" />

        {/* BOTTOM penalty arc — small tight arc outside the box */}
        <path
          d={`M ${cx-arcR*0.7} ${py0+ph-pbH} A ${arcR*0.75} ${arcR*0.75} 0 0 1 ${cx+arcR*0.7} ${py0+ph-pbH}`}
          fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.65"
        />

        {/* Corner arcs */}
        <path d={`M ${px0+3} ${py0} A 3 3 0 0 0 ${px0} ${py0+3}`}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
        <path d={`M ${px0+pw-3} ${py0} A 3 3 0 0 1 ${px0+pw} ${py0+3}`}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
        <path d={`M ${px0} ${py0+ph-3} A 3 3 0 0 0 ${px0+3} ${py0+ph}`}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
        <path d={`M ${px0+pw} ${py0+ph-3} A 3 3 0 0 1 ${px0+pw-3} ${py0+ph}`}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />

        {/* Players */}
        {pts.map((pos, i) => {
          const ppx = sx(pos.x);
          const ppy = sy(pos.y);
          const isGK = i === 0;
          return (
            <g key={i}>
              <circle cx={ppx} cy={ppy} r="4.8"
                fill={isGK ? "#facc15" : color}
                stroke="white" strokeWidth="1.2" />
              {isGK && (
                <text x={ppx} y={ppy+1.7} textAnchor="middle"
                  fontSize="3.5" fill="#000" fontWeight="bold" fontFamily="Arial">GK</text>
              )}
            </g>
          );
        })}

        {/* Formation label */}
        <text x="50" y="151" textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontSize="3.8" fontFamily="monospace">{formation}</text>
      </svg>
    </div>
  );
};

const DualFormationSelector = ({ label, color, attackF, setAttackF, defendF, setDefendF, flip }) => {
  const [view, setView] = useState("attack");
  return (
    <div>
      <div style={{ fontSize:"9px", color:"#6b9f6b", letterSpacing:"1px", marginBottom:"6px", fontFamily:"monospace" }}>{label}</div>

      {/* Attack / Defend toggle */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
        {["attack","defend"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex:1, padding:"5px", borderRadius:"4px", cursor:"pointer",
            background: view===v ? color : "#f0fdf4",
            border: `1px solid ${view===v ? color : "#d1e5d1"}`,
            color: view===v ? "white" : "#527052",
            fontSize:"9px", fontWeight:"bold", letterSpacing:"1px",
            fontFamily:"monospace", transition:"all 0.15s"
          }}>
            {v === "attack" ? "⚔ ATTACK" : "🛡 DEFEND"}
          </button>
        ))}
      </div>

      {/* Formation dropdown */}
      <div style={{ position:"relative", marginBottom:"8px" }}>
        <select
          value={view==="attack" ? attackF : defendF}
          onChange={e => view==="attack" ? setAttackF(e.target.value) : setDefendF(e.target.value)}
          style={{
            width:"100%", background:"#f6fdf6", border:`1.5px solid ${color}44`,
            color, padding:"7px 28px 7px 10px", borderRadius:"6px",
            fontSize:"14px", fontFamily:"monospace", fontWeight:"bold", appearance:"none"
          }}>
          {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <span style={{ position:"absolute", right:"9px", top:"50%", transform:"translateY(-50%)", color, pointerEvents:"none", fontSize:"10px" }}>▼</span>
      </div>

      {/* Label showing both */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"8px", fontSize:"9px", fontFamily:"monospace" }}>
        <span style={{ background:"#f0fdf4", border:"1px solid #d1e5d1", borderRadius:"3px", padding:"2px 6px", color:"#527052" }}>
          ⚔ {attackF}
        </span>
        <span style={{ background:"#fff0f0", border:"1px solid #ffd1d1", borderRadius:"3px", padding:"2px 6px", color:"#7a3535" }}>
          🛡 {defendF}
        </span>
      </div>

      {/* Pitch showing current view */}
      <FormationPitch
        formation={view==="attack" ? attackF : defendF}
        label={view==="attack" ? "ATTACKING SHAPE" : "DEFENDING SHAPE"}
        color={color}
        flip={flip}
      />
    </div>
  );
};

const LoadingDots = () => (
  <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        width: "6px", height: "6px", borderRadius: "50%", background: "#86efac",
        animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s`, display: "inline-block"
      }} />
    ))}
  </span>
);

const parseAnalysis = (text) => {
  const sections = [];
  const lines = text.split("\n").filter(l => l.trim());
  let cur = null;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("##") || (t.startsWith("**") && t.endsWith("**"))) {
      if (cur) sections.push(cur);
      cur = { title: t.replace(/^#+\s*/, "").replace(/\*\*/g, ""), items: [] };
    } else if ((t.startsWith("•")||t.startsWith("-")||t.startsWith("*")||/^\d+\./.test(t)) && cur) {
      cur.items.push(t.replace(/^[-•*]\s*/,"").replace(/^\d+\.\s*/,""));
    } else if (t && cur) {
      if (!cur.items.length) cur.items.push(t);
      else cur.items[cur.items.length-1] += " " + t;
    } else if (t) {
      cur = { title: "Analysis", items: [t] };
    }
  }
  if (cur) sections.push(cur);
  return sections;
};

const SC = [
  { border:"#16a34a", bg:"#f0fdf4", accent:"#15803d", badge:"#bbf7d0", text:"#14532d" },
  { border:"#2563eb", bg:"#eff6ff", accent:"#1d4ed8", badge:"#bfdbfe", text:"#1e3a8a" },
  { border:"#ea580c", bg:"#fff7ed", accent:"#c2410c", badge:"#fed7aa", text:"#7c2d12" },
  { border:"#7c3aed", bg:"#faf5ff", accent:"#6d28d9", badge:"#ddd6fe", text:"#4c1d95" },
  { border:"#0891b2", bg:"#ecfeff", accent:"#0e7490", badge:"#a5f3fc", text:"#164e63" },
];

const inputStyle = {
  width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1",
  color:"#1a3320", padding:"9px 10px", borderRadius:"6px",
  fontSize:"12px", fontFamily:"Georgia, serif", lineHeight:"1.5",
  resize:"vertical", minHeight:"60px", boxSizing:"border-box"
};

export default function TacticalEdge() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("pregame");

  useEffect(() => {
    let meta = document.querySelector("meta[name=viewport]");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1";

    // Load pdf.js
    if (!window["pdfjs-dist/build/pdf"]) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window["pdfjs-dist/build/pdf"].GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      };
      document.head.appendChild(script);
    }
  }, []);

  // Our dual formations
  const [ourAttackF, setOurAttackF] = useState("4-3-3");
  const [ourDefendF, setOurDefendF] = useState("4-4-2 Flat");

  // Their dual formations
  const [theirAttackF, setTheirAttackF] = useState("4-4-2 Flat");
  const [theirDefendF, setTheirDefendF] = useState("4-4-2 Flat");

  const [notes, setNotes] = useState("");
  const [htWorking, setHtWorking] = useState("");
  const [htNotWorking, setHtNotWorking] = useState("");
  const [htTheirAdjust, setHtTheirAdjust] = useState("");
  const [htBigProblem, setHtBigProblem] = useState("");
  const [filmData, setFilmData] = useState({});
  const [opponentName, setOpponentName] = useState("");
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [diagrams, setDiagrams] = useState(null);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedReports, setSavedReports] = useState(() => {
    try { return JSON.parse(localStorage.getItem("te_reports") || "[]"); } catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const fileRef = useRef();

  const activeMode = MODES.find(m => m.id === mode);
  const updateFilm = (id, val) => setFilmData(prev => ({ ...prev, [id]: val }));

  const saveReport = () => {
    if (!analysis || !saveLabel.trim()) return;
    const report = {
      id: Date.now(),
      label: saveLabel.trim(),
      date: new Date().toLocaleDateString(),
      mode,
      opponent: opponentName || "Unknown",
      ourAttackF, ourDefendF, theirAttackF, theirDefendF,
      analysis,
    };
    const updated = [report, ...savedReports].slice(0, 20);
    setSavedReports(updated);
    try { localStorage.setItem("te_reports", JSON.stringify(updated)); } catch {}
    setSaveLabel("");
    setShowSaveInput(false);
  };

  const loadReport = (report) => {
    setOurAttackF(report.ourAttackF);
    setOurDefendF(report.ourDefendF);
    setTheirAttackF(report.theirAttackF);
    setTheirDefendF(report.theirDefendF);
    setOpponentName(report.opponent);
    setMode(report.mode);
    setAnalysis(report.analysis);
    setShowSaved(false);
  };

  const deleteReport = (id) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    try { localStorage.setItem("te_reports", JSON.stringify(updated)); } catch {}
  };

  const handleTabSwitch = (newMode) => {
    if (analysis && newMode !== mode) {
      setPendingMode(newMode);
    } else {
      setMode(newMode);
      setAnalysis(null);
    }
  };

  const saveAndSwitch = () => {
    if (!saveLabel.trim()) return;
    const report = {
      id: Date.now(),
      label: saveLabel.trim(),
      date: new Date().toLocaleDateString(),
      mode,
      opponent: opponentName || "Unknown",
      ourAttackF, ourDefendF, theirAttackF, theirDefendF,
      analysis,
    };
    const updated = [report, ...savedReports].slice(0, 20);
    setSavedReports(updated);
    try { localStorage.setItem("te_reports", JSON.stringify(updated)); } catch {}
    setSaveLabel("");
    setMode(pendingMode);
    setAnalysis(null);
    setPendingMode(null);
  };

  const discardAndSwitch = () => {
    setMode(pendingMode);
    setAnalysis(null);
    setPendingMode(null);
  };

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setPdfText("");
    setPdfError("");

    const name = uploadedFile.name.toLowerCase();

    // Plain text files — read directly
    if (name.endsWith(".txt")) {
      const text = await uploadedFile.text();
      setPdfText(text);
      return;
    }

    // PDF — use pdf.js
    if (name.endsWith(".pdf")) {
      setPdfParsing(true);
      try {
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        if (!pdfjsLib) {
          setPdfError("PDF reader not loaded. Try a .txt file instead.");
          setPdfParsing(false);
          return;
        }
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(" ") + "\n";
        }
        if (fullText.trim().length < 50) {
          setPdfError("This looks like a scanned PDF — text couldn't be extracted. Try copy-pasting the content into Scout Notes instead.");
        } else {
          setPdfText(fullText.trim());
        }
      } catch (e) {
        setPdfError("Could not read PDF: " + e.message);
      }
      setPdfParsing(false);
      return;
    }

    setPdfError("Unsupported file type. Please upload a .pdf or .txt file.");
  };

  const buildFilmPrompt = () => {
    const filled = FILM_FIELDS.flatMap(s => s.fields)
      .filter(f => filmData[f.id]?.trim())
      .map(f => `${f.label}: ${filmData[f.id]}`)
      .join("\n");

    return `You are an elite college soccer tactical analyst. A coach has completed a structured film study of their upcoming opponent and entered detailed observations below. Synthesize these into sharp, actionable game-plan intelligence.

OUR SHAPE: Attacking — ${ourAttackF} / Defending — ${ourDefendF}
OPPONENT SHAPE: Attacking — ${theirAttackF} / Defending — ${theirDefendF}
${opponentName ? `OPPONENT: ${opponentName}` : ""}

FILM STUDY OBSERVATIONS:
${filled || "No observations entered yet."}

Provide a comprehensive game-plan brief using these ## headers:

## Key Tactical Themes
- 2-3 overarching patterns that define how this opponent plays

## How to Attack Them
- 3-4 specific ways our ${ourAttackF} attacking shape can exploit their ${theirDefendF} defensive shape — reference specific observations

## How to Defend Against Them
- 3-4 specific defensive priorities — how our ${ourDefendF} defends against their ${theirAttackF} attacking shape

## Press & Transition Plan
- How and when to press based on their triggers and build-up style
- How they transition defense to attack — outlet patterns and first passes
- How they transition attack to defense — recovery shape and vulnerabilities
- 1-2 specific transition moments we can exploit vs their shape
- 1 transition danger we must protect against

## Individual Matchup Alerts
- 2-3 specific player matchups to prepare for

## Game-Plan Summary
- 3-4 bullet point principles the whole team needs to execute`;
  };

  const buildPrompt = () => {
    if (mode === "film") return buildFilmPrompt();
    const htContext = mode === "halftime" ? `
HALFTIME OBSERVATIONS:
- What's working for us: ${htWorking || "Not specified"}
- What's not working: ${htNotWorking || "Not specified"}
- Their key adjustment at half: ${htTheirAdjust || "Not specified"}
- Biggest problem to solve: ${htBigProblem || "Not specified"}` : "";

    return `You are an elite college soccer tactical analyst. Analyze this matchup with sharp, specific, actionable insights — no generic advice.

OUR SHAPE: Attacking — ${ourAttackF} / Defending — ${ourDefendF}
OPPONENT SHAPE: Attacking — ${theirAttackF} / Defending — ${theirDefendF}
${notes ? `SCOUT NOTES / TENDENCIES:\n${notes}` : ""}
${pdfText ? `\nSCOUT REPORT DOCUMENT:\n${pdfText.slice(0, 4000)}` : ""}
${htContext}
MODE: ${mode==="pregame"?"Pre-game deep analysis":mode==="sideline"?"Live sideline — fast, punchy bullets":"Halftime adjustments — second half game plan"}

This is a modern dual-shape matchup. When we attack, we're in ${ourAttackF} against their defensive ${theirDefendF}. When we defend, we're in ${ourDefendF} against their attacking ${theirAttackF}.

Provide analysis using these ## headers:

## Attacking Patterns to Exploit
- 3-4 specific patterns our ${ourAttackF} can use against their ${theirDefendF} — zones, channels, movements

## In-Game Adjustments
- 2-3 tactical shifts if they adapt or if we're struggling

## Their Defensive Vulnerabilities
- 2-3 structural weaknesses in their ${theirDefendF} we can attack

## How They'll Come at Us
- 2-3 ways their ${theirAttackF} will threaten our ${ourDefendF} — what to be ready for

## Transition Moments
- How they transition defense to attack — their outlet patterns and first passes
- How they transition attack to defense — recovery shape and vulnerabilities
- 1-2 specific transition moments we can exploit
- 1 transition danger we must protect against

${mode==="sideline"?"Keep each bullet to 1 sharp sentence. Sideline-ready language.":""}
${mode==="halftime"?"Lead the ATTACKING and ADJUSTMENTS sections with the most critical second-half change based on what's not working. Be direct and decisive.":""}`;
  };

  const buildDiagramPrompt = (analysisText) => `You are a soccer tactics visualizer. Based on this tactical analysis, generate exactly 3 tactical diagrams as JSON.

ANALYSIS:
${analysisText}

OUR FORMATION (attacking): ${ourAttackF} — our players attack from bottom, opponent defends at top.
OPPONENT FORMATION (defending): ${theirDefendF}

Return ONLY a JSON array, no other text, no markdown, no explanation. Format:
[
  {
    "title": "Short diagram title (max 5 words)",
    "description": "One sentence explaining the pattern",
    "our_players": [[x, y], ...],
    "opp_players": [[x, y], ...],
    "arrows": [{"from": [x, y], "to": [x, y], "color": "green"}]
  }
]

COORDINATE SYSTEM: x=0 is left edge, x=100 is right edge. y=0 is TOP of pitch (opponent goal), y=100 is BOTTOM (our goal). Our players attack UPWARD so they start with higher y values (60-90). Opponent players defend at lower y values (10-45). Arrows show movement direction.

Rules:
- Each diagram shows 4-6 of our players and 3-5 opponent players (not all 11)
- Show only the players relevant to the pattern
- Arrows show runs, passes, or pressing movements
- Arrow colors: "green" for our moves, "red" for opponent moves, "white" for ball movement
- Make coordinates realistic — spread players across the width, respect formation shape
- Each diagram must show a DIFFERENT tactical pattern from the analysis`;

  const run = async () => {
    setLoading(true); setAnalysis(null); setError(null); setDiagrams(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1800,
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(`API Error: ${data.error.message}`);
      } else {
        const text = data.content?.map(b => b.text||"").join("\n") || "";
        const parsed = parseAnalysis(text);
        setAnalysis(parsed);
        // Kick off diagram generation in background
        generateDiagrams(text);
      }
    } catch(e) {
      setError("Connection failed: " + e.message);
    }
    setLoading(false);
  };

  const generateDiagrams = async (analysisText) => {
    setDiagramLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: buildDiagramPrompt(analysisText) }],
        }),
      });
      const data = await res.json();
      if (!data.error) {
        const text = data.content?.map(b => b.text||"").join("") || "";
        try {
          const clean = text.replace(/```json|```/g, "").trim();
          const diagData = JSON.parse(clean);
          setDiagrams(diagData);
        } catch { /* silent fail — diagrams just won't show */ }
      }
    } catch { /* silent fail */ }
    setDiagramLoading(false);
  };

  const filledCount = FILM_FIELDS.flatMap(s => s.fields).filter(f => filmData[f.id]?.trim()).length;
  const totalFields = FILM_FIELDS.flatMap(s => s.fields).length;

  const TacticalDiagram = ({ diagram }) => {
    const px0=4, py0=4, pw=92, ph=144;
    const sx = (x) => px0 + (x/100)*pw;
    const sy = (y) => py0 + (y/100)*ph;
    const cx = px0+pw/2, cy = py0+ph/2;
    const pbW=pw*0.58, pbH=ph*0.16, pbX=px0+(pw-pbW)/2;
    const sbW=pw*0.32, sbH=ph*0.065, sbX=px0+(pw-sbW)/2;
    const ccR=ph*0.095;

    const arrowHead = (x1,y1,x2,y2,color) => {
      const angle = Math.atan2(y2-y1, x2-x1);
      const len = 3;
      const p1x = x2 - len*Math.cos(angle-0.4);
      const p1y = y2 - len*Math.sin(angle-0.4);
      const p2x = x2 - len*Math.cos(angle+0.4);
      const p2y = y2 - len*Math.sin(angle+0.4);
      return `M ${p1x} ${p1y} L ${x2} ${y2} L ${p2x} ${p2y}`;
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        <div style={{ fontSize:"11px", fontWeight:"bold", color:"#1a3320", fontFamily:"monospace", letterSpacing:"1px" }}>
          {diagram.title?.toUpperCase()}
        </div>
        <div style={{ fontSize:"12px", color:"#527052", fontFamily:"Georgia, serif", lineHeight:"1.5" }}>
          {diagram.description}
        </div>
        <div style={{ position:"relative", width:"100%", paddingBottom:"152%" }}>
          <svg viewBox="0 0 100 152" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
            {/* Pitch base */}
            <rect x="0" y="0" width="100" height="152" rx="4" fill="#2e7d32" />
            {Array.from({length:9},(_,i)=>(
              <rect key={i} x={px0} y={py0+i*(ph/9)} width={pw} height={ph/9}
                fill={i%2===0?"rgba(0,0,0,0)":"rgba(0,0,0,0.08)"} />
            ))}
            <rect x={px0} y={py0} width={pw} height={ph} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.7" />
            <line x1={px0} y1={cy} x2={px0+pw} y2={cy} stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
            <circle cx={cx} cy={cy} r={ccR} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
            <circle cx={cx} cy={cy} r="0.9" fill="rgba(255,255,255,0.7)" />
            <rect x={pbX} y={py0} width={pbW} height={pbH} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <rect x={sbX} y={py0} width={sbW} height={sbH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <path d={`M ${cx-ccR*0.7} ${py0+pbH} A ${ccR*0.75} ${ccR*0.75} 0 0 0 ${cx+ccR*0.7} ${py0+pbH}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
            <rect x={pbX} y={py0+ph-pbH} width={pbW} height={pbH} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <rect x={sbX} y={py0+ph-sbH} width={sbW} height={sbH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <path d={`M ${cx-ccR*0.7} ${py0+ph-pbH} A ${ccR*0.75} ${ccR*0.75} 0 0 1 ${cx+ccR*0.7} ${py0+ph-pbH}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

            {/* Arrows — drawn before players so players sit on top */}
            {(diagram.arrows||[]).map((arrow, i) => {
              const x1=sx(arrow.from[0]), y1=sy(arrow.from[1]);
              const x2=sx(arrow.to[0]),   y2=sy(arrow.to[1]);
              const col = arrow.color==="red" ? "#f87171" : arrow.color==="white" ? "rgba(255,255,255,0.9)" : "#86efac";
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
                  <path d={arrowHead(x1,y1,x2,y2,col)} fill="none" stroke={col} strokeWidth="1.1" />
                </g>
              );
            })}

            {/* Opponent players — red, at top */}
            {(diagram.opp_players||[]).map(([x,y], i) => (
              <circle key={i} cx={sx(x)} cy={sy(y)} r="4.5" fill="#dc2626" stroke="white" strokeWidth="1.1" />
            ))}

            {/* Our players — green, at bottom */}
            {(diagram.our_players||[]).map(([x,y], i) => (
              <circle key={i} cx={sx(x)} cy={sy(y)} r="4.5" fill="#16a34a" stroke="white" strokeWidth="1.1" />
            ))}
          </svg>
        </div>
        {/* Legend */}
        <div style={{ display:"flex", gap:"12px", fontSize:"9px", fontFamily:"monospace", color:"#6b9f6b" }}>
          <span>🟢 US</span>
          <span>🔴 THEM</span>
          <span style={{color:"#86efac"}}>— RUN/PASS</span>
        </div>
      </div>
    );
  };

  const FormationCard = () => (
    <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"14px", fontFamily:"monospace" }}>FORMATION MATCHUP</div>
      <div className="formation-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
        <DualFormationSelector
          label="OUR SHAPE"
          color="#16a34a"
          attackF={ourAttackF} setAttackF={setOurAttackF}
          defendF={ourDefendF} setDefendF={setOurDefendF}
          flip={false}
        />
        <DualFormationSelector
          label="OPPONENT SHAPE"
          color="#dc2626"
          attackF={theirAttackF} setAttackF={setTheirAttackF}
          defendF={theirDefendF} setDefendF={setTheirDefendF}
          flip={true}
        />
      </div>
    </div>
  );

  const AnalysisOutput = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
      {!analysis && !loading && (
        <div style={{
          background:"white", border:"1px solid #d1e5d1", borderRadius:"10px",
          padding:"70px 20px", textAlign:"center", color:"#a0bfa0",
          boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize:"42px", marginBottom:"16px", opacity:0.25 }}>⬡</div>
          <div style={{ fontSize:"12px", letterSpacing:"2px", fontFamily:"monospace" }}>SELECT FORMATIONS AND RUN ANALYSIS</div>
          <div style={{ fontSize:"10px", marginTop:"10px", color:"#c1d5c1", fontFamily:"monospace", lineHeight:"1.8" }}>
            <div>⚔ OUR ATTACK: {ourAttackF}</div>
            <div>🛡 OUR DEFENSE: {ourDefendF}</div>
            <div style={{marginTop:"4px"}}>⚔ THEIR ATTACK: {theirAttackF}</div>
            <div>🛡 THEIR DEFENSE: {theirDefendF}</div>
          </div>
        </div>
      )}
      {loading && (
        <div style={{
          background:"white", border:"1px solid #d1e5d1", borderRadius:"10px",
          padding:"70px 20px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
        }}>
          <LoadingDots />
          <div style={{ fontSize:"11px", color:"#6b9f6b", letterSpacing:"2px", marginTop:"16px", fontFamily:"monospace" }}>
            ANALYZING DUAL-SHAPE MATCHUP…
          </div>
        </div>
      )}
      {analysis && analysis.map((sec, si) => {
        const c = SC[si % SC.length];
        return (
          <div key={si} className="fade" style={{
            background:c.bg, border:`1px solid ${c.border}30`,
            borderLeft:`4px solid ${c.border}`, borderRadius:"8px", padding:"16px",
            boxShadow:"0 1px 4px rgba(0,0,0,0.07)", animationDelay:`${si*0.09}s`
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
              <span style={{
                background:c.badge, color:c.text, fontSize:"10px", fontWeight:"bold",
                padding:"2px 8px", borderRadius:"20px", fontFamily:"monospace", letterSpacing:"1px"
              }}>{String(si+1).padStart(2,"0")}</span>
              <span style={{ fontSize:"11px", fontWeight:"bold", color:c.accent, letterSpacing:"1.5px", fontFamily:"monospace" }}>
                {sec.title.toUpperCase()}
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
              {sec.items.map((item, ii) => (
                <div key={ii} style={{ display:"flex", gap:"10px", fontSize:"13.5px", lineHeight:"1.6", color:"#1a2e1a" }}>
                  <span style={{ color:c.border, flexShrink:0, marginTop:"3px", fontSize:"9px" }}>▸</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {analysis && (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {/* Diagrams button */}
          {(diagrams || diagramLoading) && (
            <button onClick={() => setShowDiagrams(true)} disabled={diagramLoading} style={{
              background: diagramLoading ? "#e8f5e8" : "#1a3320",
              color: diagramLoading ? "#6b9f6b" : "white",
              border: diagramLoading ? "1px solid #d1e5d1" : "none",
              padding:"10px 16px", borderRadius:"6px", cursor: diagramLoading ? "not-allowed" : "pointer",
              fontSize:"11px", fontFamily:"monospace", letterSpacing:"1.5px",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"
            }}>
              {diagramLoading ? <><LoadingDots /> GENERATING DIAGRAMS…</> : "⬡ VIEW TACTICAL DIAGRAMS"}
            </button>
          )}
          {/* Save controls */}
          {!showSaveInput ? (
            <button onClick={() => setShowSaveInput(true)} style={{
              background:"#f0fdf4", border:"1px solid #86efac", color:"#15803d",
              padding:"8px 16px", borderRadius:"6px", cursor:"pointer",
              fontSize:"11px", fontFamily:"monospace", letterSpacing:"1px",
              display:"flex", alignItems:"center", gap:"6px"
            }}>💾 SAVE THIS REPORT</button>
          ) : (
            <div style={{ display:"flex", gap:"6px" }}>
              <input
                value={saveLabel}
                onChange={e => setSaveLabel(e.target.value)}
                placeholder="Name this report (e.g. vs SFSU Pregame)"
                onKeyDown={e => e.key === "Enter" && saveReport()}
                style={{ flex:1, background:"#f6fdf6", border:"1.5px solid #86efac", color:"#1a3320",
                  padding:"8px 10px", borderRadius:"6px", fontSize:"12px", fontFamily:"Georgia, serif" }}
              />
              <button onClick={saveReport} style={{
                background:"#1a3320", color:"white", border:"none", padding:"8px 14px",
                borderRadius:"6px", cursor:"pointer", fontSize:"11px", fontFamily:"monospace"
              }}>SAVE</button>
              <button onClick={() => setShowSaveInput(false)} style={{
                background:"#f0fdf4", border:"1px solid #d1e5d1", color:"#527052",
                padding:"8px 10px", borderRadius:"6px", cursor:"pointer", fontSize:"11px", fontFamily:"monospace"
              }}>✕</button>
            </div>
          )}
          <div style={{ fontSize:"10px", color:"#a0bfa0", textAlign:"right", fontFamily:"monospace", letterSpacing:"1px" }}>
            {ourAttackF}/{ourDefendF} vs {theirAttackF}/{theirDefendF} · {activeMode.label} · Tactical Edge
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#eef3ee", fontFamily:"Georgia, serif" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp 0.35s ease forwards;}
        select{appearance:none;-webkit-appearance:none;cursor:pointer;}
        select:focus,textarea:focus,input:focus{outline:2px solid #16a34a;outline-offset:1px;}
        .tab:hover{background:rgba(255,255,255,0.6)!important;}
        .run:hover{background:#15803d!important;transform:translateY(-1px);}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#c1d5c1;border-radius:3px;}
        * { box-sizing: border-box; }
        @media(max-width:767px){
          .main-grid { grid-template-columns: 1fr !important; }
          .film-grid { grid-template-columns: 1fr !important; }
          .formation-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .tab-label { display: none; }
          .tab-desc { display: none !important; }
          .header-badge { display: none; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background:"#1a3320", color:"white", padding: isMobile ? "12px 16px" : "14px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 10px rgba(0,0,0,0.25)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize: isMobile ? "18px" : "22px" }}>⬡</span>
          <div>
            <div style={{ fontSize: isMobile ? "13px" : "15px", fontWeight:"bold", letterSpacing:"3px", color:"#86efac", fontFamily:"monospace" }}>TACTICAL EDGE</div>
            {!isMobile && <div style={{ fontSize:"9px", color:"#4ade8055", letterSpacing:"2px", fontFamily:"monospace" }}>FORMATION INTELLIGENCE SYSTEM</div>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {savedReports.length > 0 && (
            <button onClick={() => setShowSaved(true)} style={{
              background:"rgba(134,239,172,0.12)", border:"1px solid rgba(134,239,172,0.3)",
              color:"#86efac", padding:"5px 12px", borderRadius:"3px",
              fontSize:"10px", fontFamily:"monospace", letterSpacing:"1px", cursor:"pointer"
            }}>📁 {savedReports.length} SAVED</button>
          )}
          <div className="header-badge" style={{
            fontSize:"10px", color:"#86efac", background:"rgba(134,239,172,0.12)",
            border:"1px solid rgba(134,239,172,0.3)", padding:"5px 14px",
            borderRadius:"3px", letterSpacing:"2px", fontFamily:"monospace"
          }}>
            {activeMode.icon} {activeMode.label.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding: isMobile ? "12px 10px" : "20px 16px" }}>

        {/* Mode Tabs */}
        <div style={{ display:"flex", gap:"4px", marginBottom:"16px", background:"#dce8dc", padding:"4px", borderRadius:"8px" }}>
          {MODES.map(m => (
            <button key={m.id} className="tab" onClick={() => handleTabSwitch(m.id)} style={{
              flex:1, background: mode===m.id ? "white" : "transparent",
              border: mode===m.id ? "1px solid #c1d5c1" : "1px solid transparent",
              color: mode===m.id ? "#14532d" : "#527052",
              padding: isMobile ? "8px 4px" : "10px 8px",
              borderRadius:"5px", cursor:"pointer", textAlign:"center",
              boxShadow: mode===m.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              transition:"all 0.15s"
            }}>
              <div style={{ fontSize: isMobile ? "18px" : "15px" }}>{m.icon}</div>
              <div className="tab-label" style={{ fontSize:"11px", fontWeight:"bold", letterSpacing:"0.5px", fontFamily:"monospace", marginTop:"3px" }}>{m.label}</div>
              <div className="tab-desc" style={{ fontSize:"9px", color:"#6b9f6b", marginTop:"2px" }}>{m.desc}</div>
              {isMobile && <div style={{ fontSize:"9px", fontWeight:"bold", fontFamily:"monospace", marginTop:"2px", color: mode===m.id ? "#14532d" : "#6b9f6b" }}>{m.label.split(" ")[0]}</div>}
            </button>
          ))}
        </div>

        {/* FILM MODE */}
        {mode === "film" ? (
          <div className="film-grid" style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"14px", fontFamily:"monospace" }}>MATCHUP</div>
                <div style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"#6b9f6b", letterSpacing:"1px", marginBottom:"5px", fontFamily:"monospace" }}>OPPONENT NAME (OPTIONAL)</div>
                  <input value={opponentName} onChange={e => setOpponentName(e.target.value)}
                    placeholder="e.g. San Francisco State"
                    style={{ width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1", color:"#1a3320", padding:"8px 10px", borderRadius:"6px", fontSize:"13px", fontFamily:"Georgia, serif", boxSizing:"border-box" }} />
                </div>
                <div className="formation-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <DualFormationSelector label="OUR SHAPE" color="#16a34a" attackF={ourAttackF} setAttackF={setOurAttackF} defendF={ourDefendF} setDefendF={setOurDefendF} flip={false} />
                  <DualFormationSelector label="OPPONENT SHAPE" color="#dc2626" attackF={theirAttackF} setAttackF={setTheirAttackF} defendF={theirDefendF} setDefendF={setTheirDefendF} flip={true} />
                </div>
              </div>

              {FILM_FIELDS.map(section => (
                <div key={section.section} style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"12px", fontFamily:"monospace", borderBottom:"1px solid #e8f5e8", paddingBottom:"8px" }}>
                    {section.section}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {section.fields.map(field => (
                      <div key={field.id}>
                        <div style={{ fontSize:"9px", color:"#527052", letterSpacing:"1px", marginBottom:"4px", fontFamily:"monospace" }}>{field.label}</div>
                        <textarea value={filmData[field.id]||""} onChange={e => updateFilm(field.id, e.target.value)} placeholder={field.placeholder} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <div style={{ fontSize:"10px", color:"#6b9f6b", fontFamily:"monospace", letterSpacing:"1px" }}>FILM NOTES COMPLETED</div>
                  <div style={{ fontSize:"11px", color:"#14532d", fontFamily:"monospace", fontWeight:"bold" }}>{filledCount}/{totalFields}</div>
                </div>
                <div style={{ background:"#e8f5e8", borderRadius:"4px", height:"6px", overflow:"hidden" }}>
                  <div style={{ background:"#16a34a", height:"100%", width:`${(filledCount/totalFields)*100}%`, transition:"width 0.3s", borderRadius:"4px" }} />
                </div>
              </div>

              <button className="run" onClick={run} disabled={loading} style={{
                background: loading ? "#15803d" : "#1a3320", border:"none", color:"white",
                padding:"15px", borderRadius:"8px", cursor: loading ? "not-allowed" : "pointer",
                fontSize:"12px", fontWeight:"bold", letterSpacing:"3px", fontFamily:"monospace",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                boxShadow:"0 2px 8px rgba(26,51,32,0.3)", transition:"all 0.2s"
              }}>
                {loading ? <><LoadingDots /> ANALYZING FILM STUDY…</> : "▶ GENERATE GAME-PLAN BRIEF"}
              </button>
              {error && <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"6px", padding:"10px", fontSize:"12px", color:"#dc2626", fontFamily:"monospace" }}>⚠ {error}</div>}
            </div>
            <AnalysisOutput />
          </div>

        ) : (

          /* STANDARD MODES */
          <div className="main-grid" style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(280px,420px) 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <FormationCard />

              <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"12px", fontFamily:"monospace" }}>
                  {mode==="halftime" ? "HALFTIME DEBRIEF" : "SCOUT NOTES & TENDENCIES"}
                </div>
                {mode === "halftime" ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    {[
                      { label:"WHAT'S WORKING FOR US", val:htWorking, set:setHtWorking, placeholder:"e.g. High press winning the ball in their half, #9 winning headers..." },
                      { label:"WHAT'S NOT WORKING", val:htNotWorking, set:setHtNotWorking, placeholder:"e.g. Losing the midfield battle, RB getting exposed on overlaps..." },
                      { label:"THEIR KEY ADJUSTMENT AT HALF", val:htTheirAdjust, set:setHtTheirAdjust, placeholder:"e.g. Dropping to a 5-4-1, switching #7 and #11, playing more direct..." },
                      { label:"BIGGEST PROBLEM TO SOLVE", val:htBigProblem, set:setHtBigProblem, placeholder:"e.g. Their #10 finding space between lines, our shape out of possession..." },
                    ].map(({ label, val, set, placeholder }) => (
                      <div key={label}>
                        <div style={{ fontSize:"9px", color:"#527052", letterSpacing:"1px", marginBottom:"4px", fontFamily:"monospace" }}>{label}</div>
                        <textarea
                          value={val}
                          onChange={e => set(e.target.value)}
                          placeholder={placeholder}
                          style={{ width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1", color:"#1a3320", padding:"9px 10px", borderRadius:"6px", fontSize:"12px", fontFamily:"Georgia, serif", lineHeight:"1.5", resize:"vertical", minHeight:"54px", boxSizing:"border-box" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. High press, dominant left side, GK distributes short, poor in transition..."
                    style={{ width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1", color:"#1a3320", padding:"10px", borderRadius:"6px", fontSize:"13px", fontFamily:"Georgia, serif", lineHeight:"1.6", resize:"vertical", minHeight:"90px", boxSizing:"border-box" }}
                  />
                )}
              </div>

              {mode==="pregame" && (
                <div style={{ background:"white", border:"1.5px dashed #c1d5c1", borderRadius:"10px", padding:"14px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"8px", fontFamily:"monospace" }}>SCOUT REPORT (OPTIONAL)</div>
                  <input type="file" ref={fileRef} accept=".pdf,.txt" style={{ display:"none" }}
                    onChange={e => handleFileUpload(e.target.files[0])} />
                  <button onClick={() => fileRef.current.click()} style={{
                    background:"#f0fdf4", border:"1px solid #86efac", color:"#15803d",
                    padding:"8px 16px", borderRadius:"6px", cursor:"pointer",
                    fontSize:"12px", fontFamily:"monospace", letterSpacing:"1px"
                  }}>
                    {pdfParsing ? "⏳ READING PDF…" : file ? `✓ ${file.name}` : "↑ UPLOAD PDF OR TXT"}
                  </button>
                  {pdfParsing && (
                    <div style={{ marginTop:"8px", fontSize:"11px", color:"#6b9f6b", fontFamily:"monospace" }}>
                      Extracting text from PDF…
                    </div>
                  )}
                  {pdfError && (
                    <div style={{ marginTop:"8px", fontSize:"11px", color:"#dc2626", fontFamily:"monospace", background:"#fef2f2", padding:"8px", borderRadius:"5px" }}>
                      ⚠ {pdfError}
                    </div>
                  )}
                  {pdfText && !pdfError && (
                    <div style={{ marginTop:"8px" }}>
                      <div style={{ fontSize:"9px", color:"#6b9f6b", fontFamily:"monospace", letterSpacing:"1px", marginBottom:"4px" }}>
                        ✓ {pdfText.length} CHARACTERS EXTRACTED — READY FOR ANALYSIS
                      </div>
                      <div style={{
                        background:"#f6fdf6", border:"1px solid #d1e5d1", borderRadius:"5px",
                        padding:"8px", fontSize:"10px", color:"#3d5c3d", fontFamily:"monospace",
                        maxHeight:"80px", overflowY:"auto", lineHeight:"1.5"
                      }}>
                        {pdfText.slice(0, 300)}…
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className="run" onClick={run} disabled={loading} style={{
                background: loading ? "#15803d" : "#1a3320", border:"none", color:"white",
                padding:"15px", borderRadius:"8px", cursor: loading ? "not-allowed" : "pointer",
                fontSize:"12px", fontWeight:"bold", letterSpacing:"3px", fontFamily:"monospace",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                boxShadow:"0 2px 8px rgba(26,51,32,0.3)", transition:"all 0.2s"
              }}>
                {loading ? <><LoadingDots /> ANALYZING MATCHUP…</> : `◈ RUN ${activeMode.label.toUpperCase()} ANALYSIS`}
              </button>

              {error && <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"6px", padding:"10px", fontSize:"12px", color:"#dc2626", fontFamily:"monospace" }}>⚠ {error}</div>}
            </div>

            <AnalysisOutput />
          </div>
        )}
      </div>

      {/* Tactical Diagrams Modal */}
      {showDiagrams && diagrams && (
        <div style={{
          position:"fixed", inset:0, zIndex:1050,
          background:"rgba(0,0,0,0.6)", display:"flex",
          alignItems:"flex-start", justifyContent:"center",
          padding:"16px", overflowY:"auto"
        }} onClick={() => setShowDiagrams(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#eef3ee", borderRadius:"12px", width:"100%", maxWidth:"860px",
            boxShadow:"0 8px 40px rgba(0,0,0,0.3)", overflow:"hidden", marginTop:"20px"
          }}>
            <div style={{
              background:"#1a3320", padding:"16px 20px",
              display:"flex", justifyContent:"space-between", alignItems:"center"
            }}>
              <div style={{ color:"#86efac", fontFamily:"monospace", letterSpacing:"2px", fontSize:"13px", fontWeight:"bold" }}>
                ⬡ TACTICAL DIAGRAMS
              </div>
              <button onClick={() => setShowDiagrams(false)} style={{
                background:"transparent", border:"none", color:"#86efac",
                fontSize:"20px", cursor:"pointer", lineHeight:1
              }}>✕</button>
            </div>
            <div style={{
              display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap:"20px", padding:"20px"
            }}>
              {diagrams.map((diagram, i) => (
                <div key={i} style={{
                  background:"white", borderRadius:"10px", padding:"16px",
                  border:"1px solid #d1e5d1", boxShadow:"0 1px 4px rgba(0,0,0,0.07)"
                }}>
                  <TacticalDiagram diagram={diagram} />
                </div>
              ))}
            </div>
            <div style={{ padding:"0 20px 16px", fontSize:"10px", color:"#6b9f6b", fontFamily:"monospace", letterSpacing:"1px" }}>
              {ourAttackF} attacking vs {theirDefendF} — AI-generated patterns from analysis
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Report Guard Modal */}
      {pendingMode && (
        <div style={{
          position:"fixed", inset:0, zIndex:1100,
          background:"rgba(0,0,0,0.5)", display:"flex",
          alignItems:"center", justifyContent:"center", padding:"20px"
        }}>
          <div style={{
            background:"white", borderRadius:"12px", padding:"24px",
            width:"100%", maxWidth:"380px", boxShadow:"0 8px 32px rgba(0,0,0,0.25)"
          }}>
            <div style={{ fontSize:"13px", fontWeight:"bold", color:"#1a3320", fontFamily:"monospace", letterSpacing:"1px", marginBottom:"6px" }}>
              💾 UNSAVED REPORT
            </div>
            <div style={{ fontSize:"13px", color:"#3d5c3d", fontFamily:"Georgia, serif", lineHeight:"1.6", marginBottom:"18px" }}>
              You have an active report. Do you want to save it before switching?
            </div>

            {/* Save input */}
            <input
              value={saveLabel}
              onChange={e => setSaveLabel(e.target.value)}
              placeholder="Name this report (e.g. vs SFSU Pregame)"
              onKeyDown={e => e.key === "Enter" && saveAndSwitch()}
              style={{
                width:"100%", background:"#f6fdf6", border:"1.5px solid #86efac",
                color:"#1a3320", padding:"9px 12px", borderRadius:"6px",
                fontSize:"12px", fontFamily:"Georgia, serif", marginBottom:"12px",
                boxSizing:"border-box"
              }}
            />

            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={saveAndSwitch} disabled={!saveLabel.trim()} style={{
                flex:2, background: saveLabel.trim() ? "#1a3320" : "#a0bfa0",
                color:"white", border:"none", padding:"10px",
                borderRadius:"6px", cursor: saveLabel.trim() ? "pointer" : "not-allowed",
                fontSize:"11px", fontFamily:"monospace", letterSpacing:"1px", fontWeight:"bold"
              }}>SAVE & SWITCH</button>
              <button onClick={discardAndSwitch} style={{
                flex:1, background:"#fff7ed", border:"1px solid #fed7aa",
                color:"#c2410c", padding:"10px", borderRadius:"6px",
                cursor:"pointer", fontSize:"11px", fontFamily:"monospace", letterSpacing:"1px"
              }}>DISCARD</button>
              <button onClick={() => setPendingMode(null)} style={{
                flex:1, background:"#f6fdf6", border:"1px solid #d1e5d1",
                color:"#527052", padding:"10px", borderRadius:"6px",
                cursor:"pointer", fontSize:"11px", fontFamily:"monospace", letterSpacing:"1px"
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports Drawer */}
      {showSaved && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"flex-end"
        }} onClick={() => setShowSaved(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: isMobile ? "100%" : "420px", height:"100%", background:"white",
            overflowY:"auto", boxShadow:"-4px 0 20px rgba(0,0,0,0.2)",
            display:"flex", flexDirection:"column"
          }}>
            <div style={{ background:"#1a3320", padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ color:"#86efac", fontFamily:"monospace", letterSpacing:"2px", fontSize:"13px", fontWeight:"bold" }}>📁 SAVED REPORTS</div>
              <button onClick={() => setShowSaved(false)} style={{
                background:"transparent", border:"none", color:"#86efac",
                fontSize:"18px", cursor:"pointer", lineHeight:1
              }}>✕</button>
            </div>
            <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {savedReports.length === 0 ? (
                <div style={{ textAlign:"center", color:"#a0bfa0", fontFamily:"monospace", fontSize:"12px", padding:"40px 0" }}>
                  No saved reports yet
                </div>
              ) : savedReports.map(r => (
                <div key={r.id} style={{
                  background:"#f6fdf6", border:"1px solid #d1e5d1", borderRadius:"8px",
                  padding:"14px", display:"flex", flexDirection:"column", gap:"8px"
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:"bold", color:"#1a3320", fontFamily:"Georgia, serif" }}>{r.label}</div>
                      <div style={{ fontSize:"10px", color:"#6b9f6b", fontFamily:"monospace", marginTop:"2px", letterSpacing:"0.5px" }}>
                        {r.date} · {r.mode.toUpperCase()} · {r.opponent}
                      </div>
                      <div style={{ fontSize:"10px", color:"#a0bfa0", fontFamily:"monospace", marginTop:"2px" }}>
                        {r.ourAttackF} / {r.ourDefendF} vs {r.theirAttackF} / {r.theirDefendF}
                      </div>
                    </div>
                    <button onClick={() => deleteReport(r.id)} style={{
                      background:"transparent", border:"none", color:"#fca5a5",
                      fontSize:"14px", cursor:"pointer", padding:"0 4px"
                    }}>✕</button>
                  </div>
                  <button onClick={() => loadReport(r)} style={{
                    background:"#1a3320", color:"white", border:"none",
                    padding:"8px", borderRadius:"5px", cursor:"pointer",
                    fontSize:"11px", fontFamily:"monospace", letterSpacing:"1px"
                  }}>↩ LOAD REPORT</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
