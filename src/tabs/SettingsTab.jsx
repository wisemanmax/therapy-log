import React, { useState, useEffect } from 'react';
import { V, setTheme } from '../utils/theme';
import { LS } from '../utils/storage';
import { Card, Btn, Field, ConfirmCtrl, SuccessToastCtrl } from '../components/ui';
import { Icons } from '../components/Icons';
import { SessionManager } from '../utils/auth';
import { today, sanitize, validateDate } from '../utils/helpers';

export function TOSContent() {
  return (
    <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.8 }}>
      <h3 style={{ color: V.text, marginBottom: 8 }}>Terms of Service</h3>
      <p>By using TherapyLog, you agree to use the app responsibly. Your data is stored locally on your device. Cloud sync is optional and encrypted in transit. We do not sell your data. You must be 13 or older to use this service. We reserve the right to terminate accounts that violate these terms.</p>
      <p style={{ marginTop: 12 }}>Last updated: April 2026</p>
    </div>
  );
}

export function PrivacyContent() {
  return (
    <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.8 }}>
      <h3 style={{ color: V.text, marginBottom: 8 }}>Privacy Policy</h3>
      <p>TherapyLog stores your data locally on your device by default. When you enable cloud sync, your data is encrypted in transit and stored securely. We collect minimal analytics (crash reports via Sentry). We never sell, share, or monetize your personal or health data. You can export or delete all your data at any time from Settings.</p>
      <p style={{ marginTop: 12 }}>Last updated: April 2026</p>
    </div>
  );
}

export function SettingsTab({ s, d }) {
  const [isDark, setIsDark] = useState(V.mode === "dark");
  const [profile, setProfile] = useState(s.profile || {});
  const [open, setOpen] = useState(null);
  const email = s.profile?.email || LS.get("ft-session-email");

  useEffect(() => setProfile(s.profile || {}), [s.profile]);

  const toggle = (id) => setOpen(o => o === id ? null : id);

  const toggleTheme = () => {
    const mode = isDark ? "light" : "dark";
    setTheme(mode);
    setIsDark(!isDark);
  };

  const saveProfile = () => {
    d({ type: "SET_PROFILE", profile: { firstName: sanitize(profile.firstName), lastName: sanitize(profile.lastName), therapist: sanitize(profile.therapist), nextSession: validateDate(profile.nextSession) } });
    SuccessToastCtrl.show("Profile saved");
  };

  const exportData = () => {
    const data = { version: 2, entries: s.entries, sessions: s.sessions, gratitude: s.gratitude, profile: s.profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `therapylog-backup-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
    SuccessToastCtrl.show("Data exported");
  };

  const importData = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.entries && !data.sessions) { alert("Invalid backup file"); return; }
          d({ type: "IMPORT", data });
          SuccessToastCtrl.show("Data imported successfully");
        } catch (err) { alert("Invalid backup file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const signOut = async () => {
    await SessionManager.revoke();
    LS.set("tl-onboarded", null);
    window.location.reload();
  };

  const clearAll = () => {
    ConfirmCtrl.show("Delete All Data?", "This will permanently remove all your journal entries, sessions, and gratitude logs. This cannot be undone.", () => {
      d({ type: "CLEAR_ALL" });
      SuccessToastCtrl.show("All data cleared");
    });
  };

  const Row = ({ id, icon, label, desc, children }) => (
    <div style={{ background: V.card, border: `1px solid ${open === id ? `${V.accent}25` : V.cardBorder}`, borderRadius: 16, overflow: "hidden", marginBottom: 8, transition: "border-color .2s" }}>
      <button onClick={() => toggle(id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", WebkitTapHighlightColor: "transparent" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${V.accent}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: V.text, display: "block" }}>{label}</span>
          {desc && <span style={{ fontSize: 11, color: V.text3 }}>{desc}</span>}
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={V.text3} strokeWidth="2" strokeLinecap="round" style={{ transition: "transform .25s cubic-bezier(.22,1,.36,1)", transform: open === id ? "rotate(90deg)" : "none" }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      {open === id && <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${V.cardBorder}`, animation: "fadeUp .2s ease" }}><div style={{ paddingTop: 14 }}>{children}</div></div>}
    </div>
  );

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: V.text, marginBottom: 12 }}>Settings</div>

      <Row id="profile" icon="👤" label="Profile" desc="Name, therapist, schedule">
        <Field label="First Name" value={profile.firstName || ""} onChange={v => setProfile(p => ({ ...p, firstName: v }))} placeholder="Your first name" />
        <Field label="Last Name" value={profile.lastName || ""} onChange={v => setProfile(p => ({ ...p, lastName: v }))} placeholder="Your last name" />
        <Field label="Therapist Name" value={profile.therapist || ""} onChange={v => setProfile(p => ({ ...p, therapist: v }))} placeholder="Optional" />
        <Field label="Next Session Date" type="date" value={profile.nextSession || ""} onChange={v => setProfile(p => ({ ...p, nextSession: v }))} />
        <Btn full onClick={saveProfile}>Save Profile</Btn>
      </Row>

      <Row id="account" icon="🔐" label="Account" desc="IRONLOG authentication">
        <div style={{ fontSize: 13, color: V.text3, marginBottom: 12, lineHeight: 1.5 }}>TherapyLog uses your IRONLOG account for authentication. Your journal data stays on this device.</div>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", marginBottom: 12, border: `1px solid ${V.cardBorder}` }}>
          <div style={{ fontSize: 10, color: V.text3, marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: V.text }}>{email || "Not signed in"}</div>
        </div>
      </Row>

      <Row id="theme" icon="🎨" label="Appearance" desc={V.mode === "dark" ? "Dark mode" : "Light mode"}>
        <div style={{ display: "flex", gap: 8 }}>
          {["dark", "light"].map(mode => (
            <button key={mode} onClick={() => { setTheme(mode); setIsDark(mode === "dark"); }} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `1.5px solid ${V.mode === mode ? V.accent : V.cardBorder}`, background: V.mode === mode ? `${V.accent}12` : "rgba(255,255,255,0.03)", color: V.mode === mode ? V.accent : V.text3, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: V.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}>
              {mode === "dark" ? "🌙" : "☀️"} {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </Row>

      <Row id="privacy" icon="🔒" label="Privacy & Data" desc={`${s.entries.length} entries · ${s.sessions.length} sessions`}>
        <div style={{ fontSize: 13, color: V.text2, marginBottom: 12, lineHeight: 1.6 }}>All journal entries and mood data are stored <strong style={{ color: V.text }}>only on this device</strong>. Nothing is uploaded to any server.</div>
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.18)", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52,211,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: V.green }}>Privacy First</div>
              <div style={{ fontSize: 11, color: V.text3 }}>Zero data collection. No analytics. No tracking.</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "ENTRIES", val: s.entries.length, color: V.accent },
            { label: "SESSIONS", val: s.sessions.length, color: V.accent2 },
            { label: "GRATITUDES", val: s.gratitude.length, color: V.green }
          ].map(x => (
            <div key={x.label} style={{ textAlign: "center", padding: "10px 8px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${V.cardBorder}` }}>
              <div style={{ fontSize: 9, color: V.text3, marginBottom: 2 }}>{x.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: x.color, fontFamily: V.mono }}>{x.val}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn v="secondary" full onClick={exportData}>{Icons.download({ size: 14, color: V.text2 })} Export Backup</Btn>
          <Btn v="secondary" full onClick={importData}>{Icons.upload({ size: 14, color: V.text2 })} Import Backup</Btn>
        </div>
      </Row>

      {/* Danger zone */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.danger, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Danger Zone</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="danger" full onClick={clearAll}>{Icons.trash({ size: 14, color: V.danger })} Clear All Data</Btn>
          <Btn v="secondary" full onClick={signOut}>Sign Out</Btn>
        </div>
      </Card>

      {/* Version */}
      <div style={{ textAlign: "center", fontSize: 10, color: V.text3, padding: 12 }}>
        TherapyLog v1.0 · Part of the IRONLOG ecosystem
      </div>
    </div>
  );
}
