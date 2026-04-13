// --- Helpers ---
export const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 11));
export const today = () => new Date().toISOString().split("T")[0];
export const thisMonth = () => today().slice(0, 7);
export const monthAgo = (n) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d.toISOString().split("T")[0].slice(0, 7); };
export const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; };
export const fmtShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fmtFull = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const fmtDate = (d) => {
  if (d === today()) return "Today";
  if (d === ago(1)) return "Yesterday";
  return fmtShort(d);
};

export const fmtTime = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const mShort = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m.split("-")[1]) - 1] || m;

// Validation
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// Input sanitization
export const sanitize = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] || c)).slice(0, 5000);
};
export const sanitizeEntry = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*on\w+\s*=/gi, "").slice(0, 10000);
};

// Data validation
export const validateMood = (v) => { const n = parseInt(v); return isNaN(n) ? 5 : Math.max(1, Math.min(10, n)); };
export const validateDate = (d) => { if (!d || typeof d !== "string") return ""; return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ""; };

// Shared recharts config
export const chartCfg = {
  grid: { stroke: "rgba(129,140,248,0.06)" },
  axis: { stroke: "transparent", fontSize: 9, fill: "#5c5475", tickLine: false, axisLine: false },
  tip: { contentStyle: { background: "#12102a", border: "1px solid rgba(129,140,248,0.1)", borderRadius: 10, fontSize: 11, color: "#a099b8", fontFamily: "'Outfit',sans-serif", padding: "8px 12px" }, cursor: { stroke: "#818cf8", strokeWidth: 1, strokeDasharray: "4 4" } },
};
