import { uid } from '../utils/helpers';

// --- Emotion & Data Constants ---
export const EMOTIONS = [
  { e: "😊", label: "Happy", valence: 1 }, { e: "😌", label: "Calm", valence: 1 },
  { e: "🤩", label: "Excited", valence: 1 }, { e: "🥰", label: "Grateful", valence: 1 },
  { e: "😔", label: "Sad", valence: -1 }, { e: "😰", label: "Anxious", valence: -1 },
  { e: "😤", label: "Angry", valence: -1 }, { e: "😶", label: "Numb", valence: -1 },
  { e: "😴", label: "Tired", valence: 0 }, { e: "😕", label: "Confused", valence: 0 },
  { e: "😞", label: "Disappointed", valence: -1 }, { e: "☺️", label: "Content", valence: 1 },
  { e: "😨", label: "Scared", valence: -1 }, { e: "🥺", label: "Vulnerable", valence: -1 },
  { e: "💪", label: "Empowered", valence: 1 }, { e: "😑", label: "Overwhelmed", valence: -1 },
];

export const SESSION_TOPICS = [
  "Anxiety", "Depression", "Trauma", "Relationships", "Work", "Family",
  "Self-esteem", "Grief", "Anger", "Boundaries", "Identity", "Goals",
];

export const COPING = [
  { cat: "Grounding", items: ["5-4-3-2-1 senses", "Box breathing (4-4-4-4)", "Hold ice cube", "Feet on floor", "Name 5 blue things"] },
  { cat: "Movement", items: ["10-min walk", "Shake hands & feet", "Progressive muscle relax", "Yoga flow", "Jump jacks x20"] },
  { cat: "Connection", items: ["Text a friend", "Call a loved one", "Pet an animal", "People-watch in public", "Journal to past self"] },
  { cat: "Self-care", items: ["Hot shower", "Make tea", "Read 10 pages", "Watch comfort show", "Cook something"] },
  { cat: "Mindfulness", items: ["Guided meditation", "Gratitude list", "Body scan", "Loving-kindness", "Mindful eating"] },
];

export const PROMPTS = [
  "What was the most challenging moment today, and how did you handle it?",
  "Describe a small win from today, no matter how tiny.",
  "What emotion surprised you today? Where did it come from?",
  "What would you tell your past self from a year ago?",
  "What boundaries did you maintain or need to set today?",
  "What are three things you're grateful for right now?",
  "What triggered a strong reaction today and why?",
  "How did your body feel today? Any tension, lightness, or numbness?",
  "What does your inner critic say most often? Is it true?",
  "Describe a moment today when you felt most like yourself.",
  "What do you need more of this week? Less of?",
  "Write a letter to the emotion you felt most strongly today.",
];

export const init = {
  tab: "home",
  entries: [],
  sessions: [],
  gratitude: [],
  loaded: false,
  onboarded: false,
  profile: { firstName: "", lastName: "", email: "", therapist: "", sessionFreq: "weekly" },
};

export function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ...a.p, loaded: true };
    case "TAB": return { ...s, tab: a.tab };
    case "ADD_ENTRY": {
      if (s.entries.some(e => e.id === a.entry.id)) return s;
      return { ...s, entries: [a.entry, ...s.entries] };
    }
    case "DEL_ENTRY": return { ...s, entries: s.entries.filter(e => e.id !== a.id) };
    case "ADD_SESSION": {
      if (s.sessions.some(se => se.id === a.session.id)) return s;
      return { ...s, sessions: [a.session, ...s.sessions] };
    }
    case "DEL_SESSION": return { ...s, sessions: s.sessions.filter(se => se.id !== a.id) };
    case "ADD_GRATITUDE": {
      if (s.gratitude.some(g => g.id === a.g.id)) return s;
      return { ...s, gratitude: [a.g, ...s.gratitude].slice(0, 90) };
    }
    case "SET_PROFILE": return { ...s, profile: { ...(s.profile || {}), ...a.profile } };
    case "ONBOARDED": return { ...s, onboarded: true };
    case "IMPORT": return { ...s, ...a.data, loaded: true };
    case "CLEAR_ALL": return { ...init, loaded: true, onboarded: true, profile: s.profile };
    default: return s;
  }
}
