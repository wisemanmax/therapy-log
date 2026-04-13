import React, { useReducer, useEffect, useRef } from 'react';
import { V } from './utils/theme';
import { LS } from './utils/storage';
import { CloudSync } from './utils/sync';
import { SessionManager } from './utils/auth';
import { SentryUtil } from './utils/sentry';
import { today } from './utils/helpers';
import { reducer, init } from './state/reducer';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalConfirm, SuccessToast } from './components/ui';
import { Onboarding } from './tabs/Onboarding';
import { HomeTab } from './tabs/HomeTab';
import { SettingsTab } from './tabs/SettingsTab';

export default function App() {
  const [s, d] = useReducer(reducer, init);

  // --- Load persisted state ---
  useEffect(() => {
    const p = {
      entries: Array.isArray(LS.get("tl-entries")) ? LS.get("tl-entries") : [],
      sessions: Array.isArray(LS.get("tl-sessions")) ? LS.get("tl-sessions") : [],
      gratitude: Array.isArray(LS.get("tl-gratitude")) ? LS.get("tl-gratitude") : [],
      profile: LS.get("tl-profile") || init.profile,
      onboarded: !!LS.get("tl-onboarded"),
    };
    d({ type: "INIT", p });

    // Identify in Sentry
    if (p.profile?.email) SentryUtil.identify(p.profile.email, `${p.profile.firstName} ${p.profile.lastName}`);

    // Check admin
    SessionManager.checkAdmin();
  }, []);

  // --- Persist state changes ---
  useEffect(() => {
    if (!s.loaded) return;
    LS.set("tl-entries", s.entries);
    LS.set("tl-sessions", s.sessions);
    LS.set("tl-gratitude", s.gratitude);
    LS.set("tl-profile", s.profile);
    if (s.onboarded) LS.set("tl-onboarded", true);

    // Auto-sync to cloud
    if (s.onboarded && s.profile?.email) CloudSync.debouncedPush(s);
  }, [s.entries, s.sessions, s.gratitude, s.profile, s.onboarded, s.loaded]);

  // --- Sync on app open ---
  useEffect(() => {
    if (s.loaded && s.onboarded && s.profile?.email) CloudSync.push(s);
  }, [s.loaded, s.onboarded]);

  // --- Loading ---
  if (!s.loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: V.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${V.accent}20`, borderTopColor: V.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    </div>
  );

  // --- Onboarding ---
  if (!s.onboarded) return <ErrorBoundary><Onboarding d={d} /><GlobalConfirm /><SuccessToast /></ErrorBoundary>;

  // --- Main App ---
  const tabs = [
    { id: "home", label: "Today", icon: "🏠" },
    { id: "journal", label: "Journal", icon: "📓" },
    { id: "sessions", label: "Sessions", icon: "🛋️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <ErrorBoundary>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: V.bg }}>
        {/* Header */}
        <header style={{ paddingTop: "max(16px,env(safe-area-inset-top,0px))", paddingLeft: 16, paddingRight: 16, paddingBottom: 10, background: V.navBg, borderBottom: `1px solid ${V.cardBorder}`, flexShrink: 0, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${V.accent}15,${V.accent2}10)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20 }}>🧠</span>
              </div>
              <div>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: V.text, lineHeight: 1, margin: 0 }}>TherapyLog</h1>
                <div style={{ fontSize: 9, color: V.text3, fontWeight: 600, letterSpacing: ".1em" }}>by IRONLOG</div>
              </div>
            </div>
            {(() => {
              const t = s.entries.find(e => e.date === today());
              return t ? (
                <div style={{ textAlign: "right", padding: "4px 10px", borderRadius: 10, background: `${(t.mood <= 3 ? V.danger : t.mood <= 6 ? V.warm : V.green)}08` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: V.mono, color: t.mood <= 3 ? V.danger : t.mood <= 6 ? V.warm : V.green }}>{t.mood}<span style={{ fontSize: 9, color: V.text3 }}>/10</span></div>
                  <div style={{ fontSize: 9, color: V.text3 }}>today</div>
                </div>
              ) : null;
            })()}
          </div>
        </header>

        {/* Main content area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          <div style={{ padding: "16px 16px 100px", maxWidth: 700, margin: "0 auto" }}>
            {s.tab === "home" && <HomeTab s={s} d={d} />}
            {s.tab === "journal" && <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>Journal tab — coming from extraction</div>}
            {s.tab === "sessions" && <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>Sessions tab — coming from extraction</div>}
            {s.tab === "settings" && <SettingsTab s={s} d={d} />}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav style={{ display: "flex", background: V.navBg, borderTop: `1px solid ${V.cardBorder}`,
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))", flexShrink: 0, backdropFilter: "blur(20px)", paddingTop: 6 }}>
          {tabs.map(t => {
            const active = s.tab === t.id;
            return (
              <button key={t.id} onClick={() => d({ type: "TAB", tab: t.id })}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px",
                  background: "none", border: "none", cursor: "pointer", fontFamily: V.font,
                  color: active ? V.accent : V.text3, WebkitTapHighlightColor: "transparent", position: "relative" }}>
                {active && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 3, borderRadius: 2, background: `linear-gradient(90deg,${V.accent},${V.accent2})` }} />}
                <span style={{ fontSize: 19, opacity: active ? 1 : 0.45, transition: "opacity .2s", marginTop: 2 }}>{t.icon}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <GlobalConfirm />
      <SuccessToast />
    </ErrorBoundary>
  );
}
