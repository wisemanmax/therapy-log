import { LS } from './storage';

export const DARK_THEME = {
  bg: "#07060f", card: "rgba(129,140,248,0.04)", cardBorder: "rgba(129,140,248,0.1)",
  accent: "#818cf8", accent2: "#c084fc", warm: "#fb923c", danger: "#f43f5e", green: "#34d399",
  text: "#e8e4f0", text2: "#a099b8", text3: "#5c5475",
  font: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace",
  sheetBg: "linear-gradient(180deg,#12102a,#07060f)", navBg: "rgba(7,6,15,0.95)", mode: "dark",
};
export const LIGHT_THEME = {
  bg: "#f5f3ff", card: "rgba(99,102,241,0.04)", cardBorder: "rgba(99,102,241,0.12)",
  accent: "#4f46e5", accent2: "#7c3aed", warm: "#d97706", danger: "#dc2626", green: "#059669",
  text: "#1e1b4b", text2: "#4338ca", text3: "#8b8ba7",
  font: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace",
  sheetBg: "linear-gradient(180deg,#ffffff,#f5f3ff)", navBg: "rgba(245,243,255,0.97)", mode: "light",
};
export const V = { ...(LS.get("tl-theme") === "light" ? LIGHT_THEME : DARK_THEME) };
export const setTheme = (mode) => {
  const t = mode === "light" ? LIGHT_THEME : DARK_THEME;
  Object.assign(V, t);
  LS.set("tl-theme", mode);
  document.body.style.background = V.bg;
  document.body.style.color = V.text;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", V.bg);
};

export const Haptic = {
  light: () => { try { navigator.vibrate?.(10); } catch (e) {} },
  medium: () => { try { navigator.vibrate?.(25); } catch (e) {} },
  heavy: () => { try { navigator.vibrate?.([30, 20, 50]); } catch (e) {} },
  success: () => { try { navigator.vibrate?.([10, 30, 10, 30, 50]); } catch (e) {} },
};
