"use client";
import { useState, useRef, useEffect } from "react";

const PHD_CTX = `[PhD RESEARCH CONTEXT — READ FULLY]
Title: "Impact of social media influencer marketing on young consumers' purchase intention for beauty and lifestyle products — S-O-R framework"
Researcher: PhD student, Surat, Gujarat, India. Stage: conceptual model development + literature review.

CONFIRMED S-O-R MODEL (do not alter):
S (Stimuli): S1=Influencer Expertise, S2=Influencer Authenticity, S3=Perceived Attractiveness, S4=Relatability/Homophily
O (Organism): O1=Trust, O2=Cognitive Absorption, O3=FOMO (Fear of Missing Out)
R (Response): R1=Purchase Intention (primary), R2=eWOM Intention (secondary)

8 SELECTIVE S→O PATHS (all-to-all rejected per Jacoby 2002):
H1: Expertise→Trust | H2: Expertise→Cognitive Absorption
H3: Authenticity→Trust | H4: Authenticity→FOMO
H5: Attractiveness→Cognitive Absorption | H6: Attractiveness→FOMO
H7: Relatability→FOMO | H8: Relatability→Cognitive Absorption
O→R: H9:Trust→PI | H10:Trust→eWOM | H11:CogAbs→PI | H12:FOMO→PI | H13:FOMO→eWOM
Moderators: M1=Age cohort(GenZ/Millennials) | M2=Product involvement | M3=Platform(Instagram/TikTok/YouTube)

Theories: S-O-R(Mehrabian&Russell1974), SourceCredibility(Ohanian1990), ELM(Petty&Cacioppo1986), SocialComparison(Festinger1954), Flow(Csikszentmihalyi1990), ParasocialInteraction(Horton&Wohl1956)
Method: PLS-SEM primary(SmartPLS4.0), CB-SEM secondary, 7-pt Likert, n=350–450 age18–35
Quality thresholds: α≥0.70, CR≥0.70, AVE≥0.50, HTMT<0.85
LOCKED: Never suggest TAM/TPB/ATB/12-path model unless explicitly asked.`;

const ROLES = {
  task: "You are the PhD Task Agent — an ultra-expert research assistant for this specific PhD. Complete every task with academic rigour, precision, and publication-ready quality. Always stay consistent with the confirmed S-O-R model. Be specific, practical, and thorough.\n\n",
  paper: "You are the Research Paper Maker — you write polished academic content at PhD thesis and journal article standard. Use formal scholarly prose, appropriate hedging language, logical argument structure, and APA citations from the confirmed reference list. Every section should be submission-ready.\n\n",
  guide: "You are the PhD Supervisor Agent — a rigorous but supportive reviewer. Check work against the confirmed S-O-R model, assess academic quality, verify citations, and give specific actionable feedback. Structure feedback clearly. Be honest about issues but always constructive.\n\n",
};

const CHIPS = {
  task: [
    ["H1–H13 hypotheses", "Write all hypothesis statements H1–H13 with theoretical justification for each path in the confirmed S-O-R model"],
    ["Survey items S1–S4", "Draft 5 survey items for each of the 4 stimulus constructs S1–S4 using 7-point Likert scale with scale sources"],
    ["Operationalisation table", "Create a full construct operationalisation table for all S-O-R variables: construct, definition, scale source, number of items"],
    ["Thesis chapter outline", "Write a detailed PhD thesis chapter outline with section titles and brief descriptions"],
    ["Sample size justification", "Formally justify sample size of 350–450 for PLS-SEM statistically and methodologically"],
    ["Discriminant validity risk", "Explain discriminant validity overlap risk between Relatability S4 and FOMO O3 and how to address it in PLS-SEM"],
    ["Pilot study design", "Design the pilot study: sample size, procedure, pre-test goals, and analysis plan"],
    ["PLS-SEM steps", "List all PLS-SEM assessment steps in correct sequence for SmartPLS 4.0 with thresholds for each step"],
    ["Survey items O1 & O2", "Draft 5 survey items for Trust O1 and 5 for Cognitive Absorption O2 using validated scales"],
    ["Moderator: Age cohort", "Explain the moderating role of Age cohort M1 and how to test it in PLS-SEM using multi-group analysis"],
  ],
  paper: [
    ["Abstract", "Write a 250-word abstract for this research paper including purpose, method, expected findings, and contribution"],
    ["Introduction", "Write the introduction section: research background, research gap, purpose statement, and paper structure overview"],
    ["S-O-R framework", "Write the S-O-R theoretical framework section citing Mehrabian and Russell 1974 and Jacoby 2002, mapping constructs to this research"],
    ["Lit review: FOMO", "Write a literature review section on FOMO in influencer marketing citing Przybylski et al 2013, Dinh et al 2023, Nguyen et al 2024"],
    ["Lit review: Cognitive Absorption", "Write a literature review section on Cognitive Absorption grounded in Flow Theory Csikszentmihalyi 1990 applied to social media influencer content"],
    ["Source Credibility + ELM", "Write a theoretical background section on Source Credibility Theory Ohanian 1990 and ELM Petty and Cacioppo 1986 applied to influencer marketing"],
    ["Methodology section", "Write the research methodology section: philosophical stance, quantitative deductive approach, PLS-SEM rationale, sampling strategy, and measurement design"],
    ["Lit review: Parasocial", "Write a literature review on Parasocial Interaction theory Horton and Wohl 1956 and its role in influencer-follower relationships"],
    ["Conclusion", "Write the conclusion section: theoretical contributions, managerial implications, limitations, and future research directions"],
  ],
};

const REVIEW_TYPES = [
  ["✓ S-O-R consistency", "S-O-R consistency check: identify any constructs, paths, or hypotheses that contradict the confirmed model. Be specific, cite the exact problematic sentence."],
  ["★ Academic quality", "Academic quality review: assess scholarly writing standard, argument structure, hedging language, coherence. Rate out of 10 and give specific improvement points."],
  ["👁 Full supervisor review", "Full supervisor review. Structure as: SUMMARY / ISSUES FOUND (numbered) / SUGGESTIONS FOR IMPROVEMENT. Be rigorous but constructive."],
  ["📚 Citation audit", "Citation audit: check all citations against the confirmed reference list, flag missing citations on unsupported claims, and note APA format errors."],
  ["⊕ Gap analysis", "Gap analysis: what is missing from this work? What should be added to make it publication-ready?"],
];

export default function Home() {
  const [activeAgent, setActiveAgent] = useState("task");
  const [histories, setHistories] = useState({ task: [], paper: [], guide: [] });
  const [ctxSent, setCtxSent] = useState({ task: false, paper: false, guide: false });
  const [inputs, setInputs] = useState({ task: "", paper: "", guide: "" });
  const [guidePaste, setGuidePaste] = useState("");
  const [loading, setLoading] = useState({ task: false, paper: false, guide: false });
  const [counts, setCounts] = useState({ task: 0, paper: 0, guide: 0 });
  const chatRefs = { task: useRef(null), paper: useRef(null), guide: useRef(null) };

  useEffect(() => {
    const ref = chatRefs[activeAgent];
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [histories, activeAgent]);

  async function callAPI(agent, userMsg) {
    const isCtxSent = ctxSent[agent];
    const fullMsg = isCtxSent ? ROLES[agent] + userMsg : PHD_CTX + "\n\n" + ROLES[agent] + userMsg;
    const newHistory = [...histories[agent], { role: "user", content: fullMsg }];

    setCtxSent(p => ({ ...p, [agent]: true }));
    setHistories(p => ({ ...p, [agent]: [...p[agent], { role: "user", content: userMsg, display: true }] }));
    setLoading(p => ({ ...p, [agent]: true }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHistories(p => ({
        ...p,
        [agent]: [...p[agent], { role: "assistant", content: data.text, display: true }],
      }));
      // store full msg in a parallel array for api calls
      setCounts(p => ({ ...p, [agent]: p[agent] + 1 }));
    } catch (err) {
      setHistories(p => ({
        ...p,
        [agent]: [...p[agent], { role: "assistant", content: "⚠ Error: " + err.message, display: true }],
      }));
    }
    setLoading(p => ({ ...p, [agent]: false }));
  }

  // We need to track real API history separately from display history
  const apiHistories = useRef({ task: [], paper: [], guide: [] });

  async function sendMessage(agent, text) {
    if (!text.trim() || loading[agent]) return;
    setInputs(p => ({ ...p, [agent]: "" }));

    const isCtxSent = ctxSent[agent];
    const fullMsg = isCtxSent ? ROLES[agent] + text : PHD_CTX + "\n\n" + ROLES[agent] + text;
    apiHistories.current[agent] = [...apiHistories.current[agent], { role: "user", content: fullMsg }];

    setCtxSent(p => ({ ...p, [agent]: true }));
    setHistories(p => ({ ...p, [agent]: [...p[agent], { role: "user", content: text }] }));
    setLoading(p => ({ ...p, [agent]: true }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistories.current[agent] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      apiHistories.current[agent] = [...apiHistories.current[agent], { role: "assistant", content: data.text }];
      setHistories(p => ({ ...p, [agent]: [...p[agent], { role: "assistant", content: data.text }] }));
      setCounts(p => ({ ...p, [agent]: p[agent] + 1 }));
    } catch (err) {
      setHistories(p => ({ ...p, [agent]: [...p[agent], { role: "assistant", content: "⚠ Error: " + err.message }] }));
    }
    setLoading(p => ({ ...p, [agent]: false }));
  }

  async function sendReview(instruction) {
    const work = guidePaste.trim();
    if (!work) { alert("Please paste work to review first."); return; }
    const combined = instruction + "\n\nWORK TO REVIEW:\n\n" + work;
    await sendMessage("guide", combined);
  }

  function clearAll() {
    if (!confirm("Clear all chat histories?")) return;
    setHistories({ task: [], paper: [], guide: [] });
    setCtxSent({ task: false, paper: false, guide: false });
    setCounts({ task: 0, paper: 0, guide: 0 });
    apiHistories.current = { task: [], paper: [], guide: [] };
  }

  const agentColor = { task: "var(--task)", paper: "var(--paper)", guide: "var(--guide)" };
  const agentDim = { task: "var(--task-dim)", paper: "var(--paper-dim)", guide: "var(--guide-dim)" };
  const agentEmoji = { task: "🧠", paper: "📄", guide: "🛡️" };
  const agentName = { task: "PhD Task Agent", paper: "Research Paper Maker", guide: "Guide / Supervisor" };
  const agentDesc = {
    task: "Hypotheses · Survey items · Operationalisation · Methodology · Chapter outline",
    paper: "Academic sections · APA citations · PhD thesis / journal style",
    guide: "Reviews work · S-O-R consistency · Academic quality · Citations",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* HEADER */}
      <header style={{ padding: "1rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", flexShrink: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", letterSpacing: "-0.01em" }}>PhD Agent System</div>
          <div style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "2px" }}>S-O-R · Influencer Marketing · Surat</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", border: "1px solid var(--border2)", background: "var(--bg3)", fontSize: "12px", color: "var(--text2)", fontFamily: "'DM Mono', monospace" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: Object.values(ctxSent).some(Boolean) ? "var(--paper)" : "var(--guide)", boxShadow: Object.values(ctxSent).some(Boolean) ? "0 0 6px var(--paper)" : "none" }} />
          {Object.values(ctxSent).some(Boolean) ? "Context loaded" : "Ready"}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* SIDEBAR */}
        <aside style={{ width: "210px", borderRight: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column", padding: "1rem 0", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ fontSize: "10px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", letterSpacing: ".1em", textTransform: "uppercase", padding: "0 1.25rem", marginBottom: "6px" }}>Agents</div>
          {["task", "paper", "guide"].map(agent => (
            <button key={agent} onClick={() => setActiveAgent(agent)} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 1.25rem", background: activeAgent === agent ? "var(--bg3)" : "none", border: "none", borderLeft: activeAgent === agent ? `2px solid ${agentColor[agent]}` : "2px solid transparent", color: activeAgent === agent ? agentColor[agent] : "var(--text2)", fontFamily: "'Sora',sans-serif", fontSize: "13px", cursor: "pointer", textAlign: "left", width: "100%", transition: "all .15s" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", background: activeAgent === agent ? agentDim[agent] : "transparent", flexShrink: 0 }}>{agentEmoji[agent]}</div>
              <span style={{ flex: 1 }}>{agent === "task" ? "Task Agent" : agent === "paper" ? "Paper Maker" : "Guide"}</span>
              {counts[agent] > 0 && <span style={{ fontSize: "11px", fontFamily: "'DM Mono',monospace", background: "var(--bg2)", padding: "1px 7px", borderRadius: "100px", border: "1px solid var(--border2)", color: "var(--text2)" }}>{counts[agent]}</span>}
            </button>
          ))}
          <div style={{ height: "1px", background: "var(--border)", margin: "8px 1.25rem" }} />
          <div style={{ fontSize: "10px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", letterSpacing: ".1em", textTransform: "uppercase", padding: "0 1.25rem", marginBottom: "6px" }}>Session</div>
          <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 1.25rem", background: "none", border: "none", borderLeft: "2px solid transparent", color: "var(--text3)", fontFamily: "'Sora',sans-serif", fontSize: "12px", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🗑️</div>
            Clear all chats
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg2)" }}>

          {/* PANEL HEADER */}
          <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: agentDim[activeAgent], flexShrink: 0 }}>{agentEmoji[activeAgent]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{agentName[activeAgent]}</div>
              <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "1px" }}>{agentDesc[activeAgent]}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontFamily: "'DM Mono',monospace", color: ctxSent[activeAgent] ? "var(--paper)" : "var(--text3)", padding: "4px 10px", borderRadius: "100px", border: `1px solid ${ctxSent[activeAgent] ? "rgba(62,207,142,0.25)" : "var(--border)"}` }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
              {ctxSent[activeAgent] ? "Context loaded" : "Context pending"}
            </div>
          </div>

          {/* CHAT AREA */}
          <div ref={chatRefs[activeAgent]} style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "14px" }}>
            {histories[activeAgent].length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center", padding: "3rem 1rem", marginTop: "2rem" }}>
                <div style={{ fontSize: "2.5rem", opacity: .2 }}>{agentEmoji[activeAgent]}</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.2rem", color: "var(--text2)" }}>{agentName[activeAgent]} ready</div>
                <div style={{ fontSize: "13px", color: "var(--text3)", maxWidth: "260px", lineHeight: 1.6 }}>
                  {activeAgent === "guide" ? "Paste your work below and choose a review type." : "Click a quick task below or type your own."}
                </div>
              </div>
            )}
            {histories[activeAgent].map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: "11px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", padding: "0 4px" }}>
                  {msg.role === "user" ? "You" : agentName[activeAgent]}
                </div>
                <div style={{ padding: "11px 15px", borderRadius: "11px", borderBottomRightRadius: msg.role === "user" ? "3px" : "11px", borderBottomLeftRadius: msg.role === "assistant" ? "3px" : "11px", background: msg.role === "user" ? "var(--bg3)" : "var(--bg)", border: msg.role === "user" ? "1px solid var(--border2)" : `1px solid var(--border)`, borderLeft: msg.role === "assistant" ? `2px solid ${agentColor[activeAgent]}` : undefined, fontSize: "13.5px", lineHeight: 1.75, maxWidth: "84%", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading[activeAgent] && (
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-start" }}>
                <div style={{ fontSize: "11px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", padding: "0 4px" }}>{agentName[activeAgent]}</div>
                <div style={{ padding: "12px 16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "11px", borderBottomLeftRadius: "3px", display: "flex", gap: "5px", alignItems: "center" }}>
                  {[0, 200, 400].map(d => (
                    <div key={d} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--text3)", animation: "bounce 1.3s infinite", animationDelay: d + "ms" }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CHIPS */}
          {activeAgent !== "guide" && (
            <div style={{ padding: ".75rem 2rem .5rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontSize: "10px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>Quick tasks</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {CHIPS[activeAgent].map(([label, task]) => (
                  <button key={label} onClick={() => sendMessage(activeAgent, task)} disabled={loading[activeAgent]} style={{ padding: "4px 11px", borderRadius: "100px", border: "1px solid var(--border2)", fontSize: "12px", color: "var(--text2)", cursor: "pointer", background: "var(--bg3)", fontFamily: "'Sora',sans-serif", transition: "all .12s" }}
                    onMouseEnter={e => { e.target.style.color = agentColor[activeAgent]; e.target.style.borderColor = agentColor[activeAgent]; }}
                    onMouseLeave={e => { e.target.style.color = "var(--text2)"; e.target.style.borderColor = "var(--border2)"; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GUIDE PASTE */}
          {activeAgent === "guide" && (
            <div style={{ padding: ".875rem 2rem .5rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontSize: "10px", fontFamily: "'DM Mono',monospace", color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>Paste work to review</div>
              <textarea value={guidePaste} onChange={e => setGuidePaste(e.target.value)} placeholder="Paste output from Task Agent, Paper Maker, or your own writing here…" style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--text)", fontFamily: "'Sora',sans-serif", fontSize: "13px", padding: "9px 13px", resize: "vertical", outline: "none", lineHeight: 1.6, minHeight: "70px" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "7px" }}>
                {REVIEW_TYPES.map(([label, instruction]) => (
                  <button key={label} onClick={() => sendReview(instruction)} disabled={loading.guide} style={{ padding: "5px 13px", borderRadius: "8px", border: "1px solid var(--border2)", background: "var(--bg3)", color: "var(--text2)", fontFamily: "'Sora',sans-serif", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--guide)"; e.currentTarget.style.borderColor = "rgba(245,166,35,.4)"; e.currentTarget.style.background = "var(--guide-dim)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--bg3)"; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <div style={{ padding: ".875rem 2rem 1.25rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <textarea value={inputs[activeAgent]} onChange={e => setInputs(p => ({ ...p, [activeAgent]: e.target.value }))} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(activeAgent, inputs[activeAgent]); } }} placeholder={activeAgent === "guide" ? "Or ask the supervisor a direct question…" : "Type any task…"} rows={1} style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--text)", fontFamily: "'Sora',sans-serif", fontSize: "13.5px", padding: "10px 14px", resize: "none", outline: "none", lineHeight: 1.6, minHeight: "42px", maxHeight: "120px" }} />
              <button onClick={() => sendMessage(activeAgent, inputs[activeAgent])} disabled={loading[activeAgent] || !inputs[activeAgent].trim()} style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--border2)", background: loading[activeAgent] ? "var(--bg3)" : "var(--bg3)", cursor: loading[activeAgent] ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", opacity: loading[activeAgent] || !inputs[activeAgent].trim() ? 0.3 : 1, color: agentColor[activeAgent], transition: "all .15s" }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "5px", fontFamily: "'DM Mono',monospace" }}>↵ send · Shift+↵ new line · context sent once per session</div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
