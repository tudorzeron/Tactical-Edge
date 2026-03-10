import { useState, useRef } from "react";

// ============================================================
// PASTE YOUR ANTHROPIC API KEY BETWEEN THE QUOTES BELOW
// ============================================================
const ANTHROPIC_API_KEY = "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";
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
  const sx = (p) => 3 + (p / 100) * 94;
  const sy = (p) => 3 + (p / 100) * 140;

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "152%" }}>
      <svg viewBox="0 0 100 152" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect x="2" y="2" width="96" height="146" rx="3" fill="#2d5a27" />
        {Array.from({length:9},(_,i) => (
          <rect key={i} x="2" y={2+i*16.2} width="96" height="8.1" fill={i%2===0?"#2d5a27":"#295224"} />
        ))}
        <rect x="3.5" y="3.5" width="93" height="143" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" />
        <line x1="3.5" y1="75" x2="96.5" y2="75" stroke="rgba(255,255,255,0.65)" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="14" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="1.2" fill="rgba(255,255,255,0.65)" />
        <rect x="21" y="3.5" width="58" height="24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" />
        <rect x="34" y="3.5" width="32" height="11" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.55" />
        <rect x="21" y="118.5" width="58" height="24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" />
        <rect x="34" y="132.5" width="32" height="11" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.55" />
        {pts.map((pos, i) => {
          const px = sx(pos.x);
          const py = sy(pos.y);
          const isGK = i === 0;
          return (
            <g key={i}>
              <circle cx={px} cy={py} r="5" fill={isGK ? "#facc15" : color} stroke="white" strokeWidth="1.4" />
              {isGK && <text x={px} y={py+1.8} textAnchor="middle" fontSize="3.8" fill="#000" fontWeight="bold" fontFamily="Arial">GK</text>}
            </g>
          );
        })}
        <text x="50" y="150" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="4.5" fontFamily="monospace">{formation}</text>
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
];

const inputStyle = {
  width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1",
  color:"#1a3320", padding:"9px 10px", borderRadius:"6px",
  fontSize:"12px", fontFamily:"Georgia, serif", lineHeight:"1.5",
  resize:"vertical", minHeight:"60px", boxSizing:"border-box"
};

export default function TacticalEdge() {
  const [mode, setMode] = useState("pregame");

  // Our dual formations
  const [ourAttackF, setOurAttackF] = useState("4-3-3");
  const [ourDefendF, setOurDefendF] = useState("4-4-2 Flat");

  // Their dual formations
  const [theirAttackF, setTheirAttackF] = useState("4-4-2 Flat");
  const [theirDefendF, setTheirDefendF] = useState("4-4-2 Flat");

  const [notes, setNotes] = useState("");
  const [htNotes, setHtNotes] = useState("");
  const [filmData, setFilmData] = useState({});
  const [opponentName, setOpponentName] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const activeMode = MODES.find(m => m.id === mode);
  const updateFilm = (id, val) => setFilmData(prev => ({ ...prev, [id]: val }));

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
- How to handle their transition moments

## Individual Matchup Alerts
- 2-3 specific player matchups to prepare for

## Game-Plan Summary
- 3-4 bullet point principles the whole team needs to execute`;
  };

  const buildPrompt = () => {
    if (mode === "film") return buildFilmPrompt();
    return `You are an elite college soccer tactical analyst. Analyze this matchup with sharp, specific, actionable insights — no generic advice.

OUR SHAPE: Attacking — ${ourAttackF} / Defending — ${ourDefendF}
OPPONENT SHAPE: Attacking — ${theirAttackF} / Defending — ${theirDefendF}
${notes ? `SCOUT NOTES / TENDENCIES:\n${notes}` : ""}
${mode==="halftime"&&htNotes ? `HALFTIME OBSERVATIONS:\n${htNotes}` : ""}
MODE: ${mode==="pregame"?"Pre-game deep analysis":mode==="sideline"?"Live sideline — fast, punchy bullets":"Halftime adjustments — what changes now"}

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

${mode==="sideline"?"Keep each bullet to 1 sharp sentence. Sideline-ready language.":""}
${mode==="halftime"?"Lead with the 1 most critical adjustment. Be direct and decisive.":""}`;
  };

  const run = async () => {
    setLoading(true); setAnalysis(null); setError(null);
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
          max_tokens: 1500,
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(`API Error: ${data.error.message}`);
      } else {
        const text = data.content?.map(b => b.text||"").join("\n") || "";
        setAnalysis(parseAnalysis(text));
      }
    } catch(e) {
      setError("Connection failed: " + e.message);
    }
    setLoading(false);
  };

  const filledCount = FILM_FIELDS.flatMap(s => s.fields).filter(f => filmData[f.id]?.trim()).length;
  const totalFields = FILM_FIELDS.flatMap(s => s.fields).length;

  const FormationCard = () => (
    <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"14px", fontFamily:"monospace" }}>FORMATION MATCHUP</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
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
        <div style={{ fontSize:"10px", color:"#a0bfa0", textAlign:"right", fontFamily:"monospace", letterSpacing:"1px" }}>
          {ourAttackF}/{ourDefendF} vs {theirAttackF}/{theirDefendF} · {activeMode.label} · Tactical Edge
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
      `}</style>

      {/* Header */}
      <div style={{
        background:"#1a3320", color:"white", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 10px rgba(0,0,0,0.25)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"22px" }}>⬡</span>
          <div>
            <div style={{ fontSize:"15px", fontWeight:"bold", letterSpacing:"3px", color:"#86efac", fontFamily:"monospace" }}>TACTICAL EDGE</div>
            <div style={{ fontSize:"9px", color:"#4ade8055", letterSpacing:"2px", fontFamily:"monospace" }}>FORMATION INTELLIGENCE SYSTEM</div>
          </div>
        </div>
        <div style={{
          fontSize:"10px", color:"#86efac", background:"rgba(134,239,172,0.12)",
          border:"1px solid rgba(134,239,172,0.3)", padding:"5px 14px",
          borderRadius:"3px", letterSpacing:"2px", fontFamily:"monospace"
        }}>
          {activeMode.icon} {activeMode.label.toUpperCase()}
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"20px 16px" }}>

        {/* Mode Tabs */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"20px", background:"#dce8dc", padding:"4px", borderRadius:"8px" }}>
          {MODES.map(m => (
            <button key={m.id} className="tab" onClick={() => { setMode(m.id); setAnalysis(null); }} style={{
              flex:1, background: mode===m.id ? "white" : "transparent",
              border: mode===m.id ? "1px solid #c1d5c1" : "1px solid transparent",
              color: mode===m.id ? "#14532d" : "#527052",
              padding:"10px 8px", borderRadius:"5px", cursor:"pointer", textAlign:"center",
              boxShadow: mode===m.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              transition:"all 0.15s"
            }}>
              <div style={{ fontSize:"15px" }}>{m.icon}</div>
              <div style={{ fontSize:"11px", fontWeight:"bold", letterSpacing:"0.5px", fontFamily:"monospace", marginTop:"3px" }}>{m.label}</div>
              <div style={{ fontSize:"9px", color:"#6b9f6b", marginTop:"2px" }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* FILM MODE */}
        {mode === "film" ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"14px", fontFamily:"monospace" }}>MATCHUP</div>
                <div style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"#6b9f6b", letterSpacing:"1px", marginBottom:"5px", fontFamily:"monospace" }}>OPPONENT NAME (OPTIONAL)</div>
                  <input value={opponentName} onChange={e => setOpponentName(e.target.value)}
                    placeholder="e.g. San Francisco State"
                    style={{ width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1", color:"#1a3320", padding:"8px 10px", borderRadius:"6px", fontSize:"13px", fontFamily:"Georgia, serif", boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
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
          <div style={{ display:"grid", gridTemplateColumns:"minmax(280px,420px) 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <FormationCard />

              <div style={{ background:"white", border:"1px solid #d1e5d1", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"8px", fontFamily:"monospace" }}>
                  {mode==="halftime" ? "WHAT WE'RE SEEING" : "SCOUT NOTES & TENDENCIES"}
                </div>
                <textarea
                  value={mode==="halftime" ? htNotes : notes}
                  onChange={e => mode==="halftime" ? setHtNotes(e.target.value) : setNotes(e.target.value)}
                  placeholder={mode==="halftime"
                    ? "e.g. Their 10 dropping deep, losing press trigger, RB getting forward..."
                    : "e.g. High press, dominant left side, GK distributes short, poor in transition..."}
                  style={{ width:"100%", background:"#f6fdf6", border:"1.5px solid #d1e5d1", color:"#1a3320", padding:"10px", borderRadius:"6px", fontSize:"13px", fontFamily:"Georgia, serif", lineHeight:"1.6", resize:"vertical", minHeight:"90px", boxSizing:"border-box" }}
                />
              </div>

              {mode==="pregame" && (
                <div style={{ background:"white", border:"1.5px dashed #c1d5c1", borderRadius:"10px", padding:"14px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#6b9f6b", marginBottom:"8px", fontFamily:"monospace" }}>SCOUT REPORT (OPTIONAL)</div>
                  <input type="file" ref={fileRef} accept=".pdf,.txt,.doc,.docx" style={{ display:"none" }} onChange={e => setFile(e.target.files[0])} />
                  <button onClick={() => fileRef.current.click()} style={{ background:"#f0fdf4", border:"1px solid #86efac", color:"#15803d", padding:"8px 16px", borderRadius:"6px", cursor:"pointer", fontSize:"12px", fontFamily:"monospace", letterSpacing:"1px" }}>
                    {file ? `✓ ${file.name}` : "↑ UPLOAD DOCUMENT"}
                  </button>
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
    </div>
  );
}
