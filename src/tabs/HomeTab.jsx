import React, { useState, useMemo } from 'react';
import { V, Haptic } from '../utils/theme';
import { LS } from '../utils/storage';
import { Card, Btn, Progress, Field, Sheet } from '../components/ui';
import { Icons } from '../components/Icons';
import { today, ago, fmtShort, fmtFull, fmtTime, uid, sanitize, sanitizeEntry, validateMood } from '../utils/helpers';
import { EMOTIONS, COPING } from '../state/reducer';
import { SuccessToastCtrl } from '../components/ui';

export function HomeTab({ s, d }) {
  const [showCheckin, setShowCheckin] = useState(false);
  const [mood, setMood] = useState(5);
  const [emotions, setEmotions] = useState([]);
  const [note, setNote] = useState("");
  const [showGratitude, setShowGratitude] = useState(false);
  const [gText, setGText] = useState("");
  const [showCoping, setShowCoping] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  const td = today();
  const todayEntry = s.entries.find(e => e.date === td);
  const recent7 = s.entries.filter(e => e.date >= ago(6) && e.mood);
  const avgMood = recent7.length ? Math.round(recent7.reduce((a, e) => a + (e.mood || 0), 0) / recent7.length * 10) / 10 : 0;
  const streak = (() => { let c = 0, i = 0; while (s.entries.some(e => e.date === ago(i) && e.mood)) { c++; i++; } return c; })();
  const todayGratitude = s.gratitude.filter(g => g.date === td);
  const moodColor = avgMood <= 3 ? V.danger : avgMood <= 5 ? V.warm : avgMood <= 7 ? V.accent : V.green;
  const nextSession = s.profile?.nextSession;
  const daysUntil = nextSession ? Math.ceil((new Date(nextSession + "T12:00:00") - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening"; })();

  const saveCheckin = () => {
    const entry = { id: uid(), date: td, time: fmtTime(), mood: validateMood(mood), emotions: emotions.filter(e => EMOTIONS.some(em => em.label === e)), note: sanitizeEntry(note) };
    d({ type: "ADD_ENTRY", entry });
    SuccessToastCtrl.show("Check-in saved"); Haptic.success();
    setShowCheckin(false); setMood(5); setEmotions([]); setNote("");
  };

  const toggleEmotion = (label) => setEmotions(prev => prev.includes(label) ? prev.filter(e => e !== label) : [...prev, label]);

  const saveGratitude = () => {
    if (!gText.trim()) return;
    d({ type: "ADD_GRATITUDE", g: { id: uid(), date: td, text: sanitize(gText.trim()) } });
    SuccessToastCtrl.show("Gratitude logged"); setGText(""); setShowGratitude(false);
  };

  // Mini mood sparkline for last 7 days
  const sparkline = recent7.slice(0, 7).reverse();

  // Mood slider labels
  const moodLabels = { 1: "Awful", 2: "Very low", 3: "Low", 4: "Below avg", 5: "Okay", 6: "Decent", 7: "Good", 8: "Great", 9: "Excellent", 10: "Amazing" };
  const moodFaces = { 1: "😣", 2: "😞", 3: "😔", 4: "😕", 5: "😐", 6: "🙂", 7: "😊", 8: "😄", 9: "🤩", 10: "🌟" };
  const sliderColor = mood <= 3 ? V.danger : mood <= 5 ? V.warm : mood <= 7 ? V.accent : V.green;

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.text }}>{greeting}, {s.profile?.firstName || "there"}</div>
        <div style={{ fontSize: 11, color: V.text3 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
      </div>

      {/* Session countdown */}
      {nextSession && daysUntil !== null && daysUntil >= 0 && (
        <div className="scale-in" style={{ padding: "12px 16px", borderRadius: 14, background: `${V.accent}06`, border: `1px solid ${V.accent}18`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: V.text3 }}>Next therapy session</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.accent }}>{daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${V.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛋️</div>
        </div>
      )}

      {/* Today's mood card */}
      {!todayEntry ? (
        <Card style={{ padding: 24, textAlign: "center", background: `${V.accent}08`, border: `1px solid ${V.accent}25` }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "gentleFloat 3s ease-in-out infinite" }}>🌅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: V.text, marginBottom: 4 }}>How are you feeling today?</div>
          <div style={{ fontSize: 13, color: V.text3, marginBottom: 18 }}>Take a moment to check in with yourself</div>
          <Btn full onClick={() => setShowCheckin(true)}>Daily Check-in</Btn>
        </Card>
      ) : (
        <Card style={{ padding: 18, background: `linear-gradient(135deg,${(todayEntry.mood <= 3 ? V.danger : todayEntry.mood <= 6 ? V.warm : V.green)}06,transparent)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: V.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Today's Mood</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontSize: 40, fontWeight: 900, fontFamily: V.mono, color: todayEntry.mood <= 3 ? V.danger : todayEntry.mood <= 6 ? V.warm : V.green, animation: "countUp .4s ease" }}>{todayEntry.mood}</div>
                <span style={{ fontSize: 12, color: V.text3 }}>/10</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: V.text3 }}>{todayEntry.time || ""}</div>
              {todayEntry.emotions?.length > 0 && <div style={{ fontSize: 20, marginTop: 4 }}>{todayEntry.emotions.slice(0, 4).map(em => EMOTIONS.find(e => e.label === em)?.e || "").join(" ")}</div>}
            </div>
          </div>
          {todayEntry.note && <div style={{ fontSize: 13, color: V.text2, lineHeight: 1.6, fontStyle: "italic", borderLeft: `2.5px solid ${V.accent}40`, paddingLeft: 12, marginBottom: 10, borderRadius: 2 }}>"{todayEntry.note}"</div>}
          <Btn v="small" onClick={() => setShowCheckin(true)}>Update Check-in</Btn>
        </Card>
      )}

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "7d Avg", value: avgMood || "--", unit: "", color: moodColor, icon: "📊" },
          { label: "Streak", value: streak, unit: "d", color: streak >= 7 ? V.green : V.accent, icon: streak >= 3 ? "🔥" : "⚡" },
          { label: "Sessions", value: s.sessions.length, unit: "", color: V.accent2, icon: "🛋️" },
        ].map((m, i) => (
          <Card key={m.label} style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
            <div style={{ fontSize: 10, color: V.text3, fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: V.mono }}>{m.value}<span style={{ fontSize: 10, color: V.text3 }}>{m.unit}</span></div>
          </Card>
        ))}
      </div>

      {/* 7-day mood sparkline */}
      {sparkline.length >= 3 && (
        <Card style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: V.text }}>Last 7 Days</div>
            <div style={{ fontSize: 10, color: V.text3 }}>Mood overview</div>
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 4, height: 48 }}>
            {sparkline.map((e, i) => {
              const h = Math.max(8, (e.mood / 10) * 48);
              const c = e.mood <= 3 ? V.danger : e.mood <= 6 ? V.warm : e.mood <= 8 ? V.accent : V.green;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: "100%", height: h, borderRadius: 4, background: `linear-gradient(180deg,${c},${c}60)`, transition: "height .3s ease", minWidth: 8 }} />
                  <div style={{ fontSize: 8, color: V.text3 }}>{fmtShort(e.date).split(" ")[1]}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Gratitude section */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.text }}>Gratitude <span style={{ fontSize: 10, color: V.text3, fontWeight: 400 }}>({todayGratitude.length}/3 today)</span></div>
          {todayGratitude.length < 3 && <Btn v="small" onClick={() => setShowGratitude(true)}>+ Add</Btn>}
        </div>
        {todayGratitude.length === 0 ? (
          <div style={{ fontSize: 12, color: V.text3, textAlign: "center", padding: "12px 0" }}>Nothing logged yet. What are you grateful for?</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todayGratitude.map((g, i) => (
              <div key={g.id} style={{ fontSize: 13, color: V.text2, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${[V.accent, V.accent2, V.green][i % 3]}` }}>
                {g.text}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: V.text, marginBottom: 10 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={() => setShowBreathing(true)} style={{ padding: "14px 12px", borderRadius: 14, background: `${V.green}08`, border: `1px solid ${V.green}20`, cursor: "pointer", textAlign: "center", fontFamily: V.font }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🫧</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: V.green }}>Breathing</div>
            <div style={{ fontSize: 9, color: V.text3 }}>Box breathing</div>
          </button>
          <button onClick={() => setShowCoping(true)} style={{ padding: "14px 12px", borderRadius: 14, background: `${V.accent}08`, border: `1px solid ${V.accent}20`, cursor: "pointer", textAlign: "center", fontFamily: V.font }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🛡️</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: V.accent }}>Coping Kit</div>
            <div style={{ fontSize: 9, color: V.text3 }}>Strategies</div>
          </button>
        </div>
      </Card>

      {/* Crisis resources */}
      <Card style={{ padding: 14, background: "rgba(244,63,94,0.04)", border: `1px solid ${V.danger}15` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${V.danger}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>❤️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: V.text }}>Need support right now?</div>
            <div style={{ fontSize: 11, color: V.text3 }}>988 Suicide & Crisis Lifeline: call or text <strong style={{ color: V.text }}>988</strong></div>
          </div>
        </div>
      </Card>

      {/* Check-in sheet */}
      {showCheckin && (
        <Sheet title="Daily Check-in" onClose={() => setShowCheckin(false)} footer={<Btn full onClick={saveCheckin}>{todayEntry ? "Update Check-in" : "Save Check-in"}</Btn>}>
          <div style={{ marginBottom: 20 }}>
            {/* Mood Slider */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 4, animation: "breathe 2s ease-in-out infinite", display: "inline-block" }}>{moodFaces[mood]}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: sliderColor, fontFamily: V.mono, lineHeight: 1 }}>{mood}<span style={{ fontSize: 14, color: V.text3, fontWeight: 400 }}>/10</span></div>
              <div style={{ fontSize: 13, color: sliderColor, fontWeight: 600, marginTop: 2 }}>{moodLabels[mood]}</div>
            </div>
            <div style={{ padding: "0 4px" }}>
              <input type="range" min={1} max={10} value={mood} onChange={e => { setMood(parseInt(e.target.value)); Haptic.light(); }}
                style={{ width: "100%", WebkitAppearance: "none", height: 10, borderRadius: 5, outline: "none", cursor: "pointer",
                  background: `linear-gradient(90deg,${sliderColor} ${(mood - 1) / 9 * 100}%,rgba(255,255,255,0.08) ${(mood - 1) / 9 * 100}%)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: V.text3 }}>
                <span>😞 Low</span><span>High 😊</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: V.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Emotions (select all that apply)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOTIONS.map(em => (
                <button key={em.label} onClick={() => { toggleEmotion(em.label); Haptic.light(); }}
                  style={{ padding: "8px 14px", borderRadius: 22, border: `1.5px solid ${emotions.includes(em.label) ? V.accent : V.cardBorder}`,
                    background: emotions.includes(em.label) ? `${V.accent}15` : "rgba(255,255,255,0.03)", cursor: "pointer",
                    fontSize: 12, color: emotions.includes(em.label) ? V.accent : V.text2, fontFamily: V.font, display: "flex", alignItems: "center", gap: 5, transition: "all .15s ease" }}>
                  <span>{em.e}</span><span>{em.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Field label="Notes (optional)" value={note} onChange={setNote} rows={4} placeholder="What's on your mind? How was your day?" />
        </Sheet>
      )}

      {showGratitude && (
        <Sheet title="Gratitude" onClose={() => setShowGratitude(false)} footer={<Btn full onClick={saveGratitude} disabled={!gText.trim()}>Save</Btn>}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌸</div>
            <div style={{ fontSize: 13, color: V.text3 }}>What are you grateful for right now?</div>
          </div>
          <Field value={gText} onChange={setGText} rows={4} placeholder="I'm grateful for..." autoFocus />
        </Sheet>
      )}

      {showCoping && (
        <Sheet title="Coping Toolkit" onClose={() => setShowCoping(false)}>
          {COPING.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: V.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{cat.cat}</div>
              {cat.items.map((item, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: V.card, border: `1px solid ${V.cardBorder}`, marginBottom: 6, fontSize: 13, color: V.text2 }}>{item}</div>
              ))}
            </div>
          ))}
        </Sheet>
      )}

      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
    </div>
  );
}

// --- Breathing Exercise ---
function BreathingExercise({ onClose }) {
  const [phase, setPhase] = useState("ready");
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const totalCycles = 4;
  const phases = [{ name: "Breathe In", dur: 4, color: V.accent }, { name: "Hold", dur: 4, color: V.accent2 }, { name: "Breathe Out", dur: 4, color: V.green }, { name: "Hold", dur: 4, color: V.warm }];
  const timerRef = React.useRef(null);
  const stepRef = React.useRef(step);
  const cycleRef = React.useRef(cycle);
  stepRef.current = step; cycleRef.current = cycle;

  const start = () => {
    setPhase("active"); setStep(0); setCycle(0);
    const tick = () => {
      const s = stepRef.current; const c = cycleRef.current;
      const nextStep = (s + 1) % 4;
      if (nextStep === 0) {
        const nextCycle = c + 1;
        if (nextCycle >= totalCycles) { setPhase("done"); return; }
        setCycle(nextCycle); cycleRef.current = nextCycle;
      }
      setStep(nextStep); stepRef.current = nextStep;
      timerRef.current = setTimeout(tick, phases[nextStep].dur * 1000);
    };
    timerRef.current = setTimeout(tick, phases[0].dur * 1000);
  };

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const cur = phases[step];
  const scale = step === 0 ? 1.3 : step === 2 ? 0.9 : step === 1 ? 1.3 : 0.9;

  return (
    <Sheet title="Box Breathing" onClose={() => { if (timerRef.current) clearTimeout(timerRef.current); onClose(); }}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        {phase === "ready" && (
          <div className="fade-up">
            <div style={{ fontSize: 56, marginBottom: 16 }}>🫧</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: V.text, marginBottom: 8 }}>Box Breathing</div>
            <div style={{ fontSize: 13, color: V.text3, lineHeight: 1.6, marginBottom: 8, maxWidth: 280, margin: "0 auto 20px" }}>A calming technique used by therapists. Breathe in a 4-4-4-4 pattern for {totalCycles} cycles.</div>
            <Btn full onClick={start}>Begin</Btn>
          </div>
        )}
        {phase === "active" && (
          <div>
            <div style={{ fontSize: 11, color: V.text3, marginBottom: 20 }}>Cycle {cycle + 1} of {totalCycles}</div>
            <div style={{ width: 160, height: 160, borderRadius: "50%", background: `${cur.color}12`, border: `3px solid ${cur.color}60`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", transition: "transform 4s ease-in-out,border-color .5s,background .5s", transform: `scale(${scale})`, boxShadow: `0 0 40px ${cur.color}20` }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: cur.color }}>{cur.name}</div>
                <div style={{ fontSize: 12, color: V.text3 }}>{cur.dur}s</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
              {phases.map((p, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i === step ? p.color : `${V.text3}30`, transition: "background .3s" }} />
              ))}
            </div>
          </div>
        )}
        {phase === "done" && (
          <div className="fade-up">
            <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: V.green, marginBottom: 8 }}>Well done!</div>
            <div style={{ fontSize: 13, color: V.text3, lineHeight: 1.6, marginBottom: 20 }}>You completed {totalCycles} breathing cycles. Notice how your body feels now.</div>
            <Btn full onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); onClose(); }}>Done</Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
