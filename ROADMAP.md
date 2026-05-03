# TherapyLog — Enterprise Roadmap

> A deeply-considered, code-grounded plan to evolve TherapyLog from a personal mood tracker into a clinically-credible, enterprise-grade mental health platform.

---

## 0. Where We Are Today (Honest Baseline)

The app today is a high-quality personal PWA. Strengths and gaps, taken from the codebase:

**Strengths**
- Clean React 18 + Vite + Recharts stack (`package.json`).
- Offline-first PWA with versioned service worker (`sw.js`, cache `therapylog-v6`).
- Local-first persistence with optional AES-GCM encryption helper (`src/utils/storage.js`).
- Email + 6-digit PIN auth, PIN reset, email verification, lockout after attempts (`src/tabs/Onboarding.jsx`, `src/utils/auth.js`).
- Cloud sync to `api.ironlog.space` (`src/utils/sync.js`).
- Sentry crash reporting (`src/utils/sentry.js`).
- Light/dark theming, haptic feedback, accessibility-aware sheets and dialogs (`src/components/ui.jsx`).
- Daily mood check-in, gratitude (3/day), breathing, coping toolkit, 7-day sparkline, streaks, session countdown (`src/tabs/HomeTab.jsx`).
- Onboarding tour, age gate (13+), profanity filter, consent capture with version (`src/tabs/Onboarding.jsx`).

**Gaps the user will notice**
- `Journal` and `Sessions` tabs in `src/App.jsx` are placeholders ("coming from extraction").
- `EMOTIONS`, `SESSION_TOPICS`, `COPING`, `PROMPTS` are defined in `src/state/reducer.js` but only emotions/coping render.
- Recharts is shipped but not used in `HomeTab` — analytics are a hand-rolled bar sparkline.
- No reminders/notifications.
- No clinical screeners (PHQ-9, GAD-7, etc.) despite the obvious clinical positioning.
- Profile collects DOB/state/sex but never surfaces them as helpful context.

**Gaps a clinician or buyer will notice**
- Sync payload is plaintext to backend (encryption-in-transit only); no zero-knowledge / E2EE.
- No HIPAA Business Associate Agreement (BAA) posture, no audit log, no DPA story.
- No therapist-facing surface: no shared homework, between-session messaging, or outcomes export.
- No crisis-detection logic beyond a static 988 card.
- No accessibility statement or formal WCAG conformance level.
- Single-tenant data model; no organizations, no SSO/SAML, no SCIM, no EAP/employer deployment.
- No data residency, retention, or right-to-erasure controls beyond a "Clear All Data" button.

This roadmap addresses each of these directly, in priority order, and adds the differentiating features that make this a category-defining product.

---

## 1. North Star

> **TherapyLog is the trusted operating system for a person's mental health journey** — private by default, clinically rigorous, deeply personal, and seamlessly connected to the humans who help.

Three audiences, in order of priority:

1. **The individual user** — autonomy, dignity, hope, and measurable progress.
2. **The clinician** — better-prepared sessions, longitudinal evidence, less admin.
3. **The enterprise buyer** (employers, payers, health systems, EAPs) — outcomes, compliance, ROI.

Three non-negotiables:

1. **Safety first** — crisis detection and human escalation are as polished as any growth feature.
2. **Privacy as a feature** — zero-knowledge encryption, local-first defaults, clear data controls.
3. **Evidence over vibes** — every clinical claim is backed by a validated instrument or peer-reviewed protocol.

---

## 2. Operating Principles

- **Local-first, sync-second.** Continue treating the device as the source of truth (`src/App.jsx` already does this); the cloud is a backup and a collaboration substrate, not a dependency.
- **Two-tier data model.** Personal/journal content stays end-to-end encrypted. Operational metadata (auth, billing, audit) is server-readable. Never mix them.
- **Boring, secure backends.** Postgres + row-level security, KMS-managed keys, append-only audit logs. No bespoke crypto.
- **Progressive disclosure.** Power-user surfaces (clinician portal, analytics) live behind feature flags and tier gates. Users see a calm, focused app.
- **Don't pretend to be a clinician.** The app supports therapy; it does not replace it. Every AI surface is labeled, sourced, and bounded.

---

## 3. Phased Roadmap

The phases are sized so each one is independently shippable and creates user value, even if the next phase never lands.

| Phase | Theme | Duration | Outcome |
|-------|-------|----------|---------|
| **P0** | Foundation Hardening | 4–6 weeks | A trustworthy v1.1 — finish what's stubbed, lock down security |
| **P1** | The Real Therapy Companion | 8–10 weeks | Journal, Sessions, Insights, Reminders — the "complete" personal app |
| **P2** | Clinical Rigor | 8–10 weeks | Validated screeners, evidence-based modules (CBT/DBT/ACT), crisis safety net |
| **P3** | The Clinician Bridge | 10–12 weeks | Therapist portal, shared homework, outcomes reports, secure messaging |
| **P4** | Intelligence Layer | 10–14 weeks | Pattern detection, AI co-pilot, voice journaling, biometric correlation |
| **P5** | Enterprise & Trust | 12–16 weeks | HIPAA + SOC 2, SSO/SAML, EAP deployment, audit, multi-tenant |
| **P6** | Network & Ecosystem | Ongoing | Marketplace, peer support, integrations, internationalization |

A hard reading: P0–P2 must ship before any "enterprise" claim is credible. P3 is what differentiates from competitors. P4 is what makes it irreplaceable. P5 is what unlocks real revenue.

---

## 4. Phase 0 — Foundation Hardening (4–6 weeks)

Goal: every user-visible feature works, every security claim in `SettingsTab.PrivacyContent` is true.

### 4.1 Finish the stubbed tabs

`src/App.jsx:103-104` currently renders "coming from extraction" for Journal and Sessions. Build them:

- **Journal tab (`src/tabs/JournalTab.jsx`)**
  - List view of all entries grouped by month, with mood color chip.
  - "New entry" sheet with: free-write OR guided prompt (use the unused `PROMPTS` array in `src/state/reducer.js`).
  - Full-text search across notes (Lunr.js or fuse.js, indexed locally).
  - Filters: by emotion, by mood band (low/mid/high), by date range, by linked session.
  - Edit + delete with confirmation (`ConfirmCtrl` already exists in `ui.jsx`).
  - Tag system: optional user-defined tags + the existing `SESSION_TOPICS` as suggestions.
- **Sessions tab (`src/tabs/SessionsTab.jsx`)**
  - Reducer already has `ADD_SESSION` / `DEL_SESSION` — wire it.
  - Per session: date, therapist, modality, pre/post mood, topics covered, homework assigned, "what stuck", action items, next-session intentions.
  - "Prepare for session" view — auto-summarizes journal + mood since last session and highlights themes.

### 4.2 Real analytics surface

Recharts is already a dependency but unused. Add `src/tabs/InsightsTab.jsx` (or fold into Home):

- 30/90/365-day mood line chart with rolling 7-day average overlay.
- Emotion frequency heatmap (calendar) — leverages existing `EMOTIONS` valence.
- Day-of-week and time-of-day mood patterns.
- Word cloud / top themes from journal notes (client-side, no upload).
- Streak history with longest streak + current.

### 4.3 Reminders & notifications

- Local notifications via `Notification` API + service-worker `showNotification`.
- Scheduled daily check-in reminder (user-configurable time).
- Pre-session reminder (24h and 1h before `profile.nextSession`).
- "You haven't checked in for 3 days" gentle nudge — never shaming, always opt-out.
- iOS PWA limitation: ship a Capacitor wrapper later (P5) for true push.

### 4.4 Security cleanup (must ship before any marketing)

- **Apply the encrypted storage helper everywhere** — `src/utils/storage.js` defines `setSecure/getSecure` but `App.jsx` still uses plain `LS.set`. Migrate `tl-entries`, `tl-sessions`, `tl-gratitude`, `tl-profile` to `setSecure`.
- **Derive the LS key from a user secret**, not from origin alone (`storage.js:10` uses `_LS_CRYPTO_KEY_LABEL + window.location.origin`). Combine with the user's PIN-derived key so a stolen device file isn't trivially decryptable.
- **Per-request CSRF token** on the sync endpoints, not just the long-lived session token.
- **Rate limit and lockout already exist on PIN** — surface lockout state in the UI; today errors are generic.
- **Strict CSP** in `index.html` — currently the app loads CDN React/Babel/Recharts and inline JSX, which prevents a strict CSP. Move all dependencies into the Vite bundle (the build already does this) and remove the legacy CDN paths from `sw.js:9-14`.
- **Subresource Integrity** for any remaining external resources (Google Fonts).
- **Pen test** the IRONLOG sync API; document scope.

### 4.5 Quality bar

- Type system: migrate to TypeScript (`.jsx` → `.tsx`). The reducer + sync surfaces benefit most.
- Unit tests for `helpers.js` (sanitize, validateMood, validateDate, ago) — currently zero tests.
- Playwright e2e for the critical paths: sign up, sign in, daily check-in, export, sign out.
- Lighthouse budget in CI: PWA 100, A11y ≥ 95, Performance ≥ 90 on mobile.
- Bundle size budget: <120 KB gzipped initial.

**P0 Definition of Done:** Journal + Sessions are real, encrypted local storage is on by default, reminders work, and the app passes a third-party security review.

---

## 5. Phase 1 — The Real Therapy Companion (8–10 weeks)

Goal: a self-directed user gets clear, lasting value even without a therapist.

### 5.1 Mood tracking, deepened

- **Multiple check-ins per day** — morning/midday/evening; the data model already keys by `date` only (`reducer.js:57`), extend to `date + slot`.
- **Energy and anxiety** as separate axes from mood. The literature is clear that mood, energy, and anxiety dissociate; tracking only mood is lossy.
- **Trigger tagging** — what happened? sleep, conflict, work, news, substances, weather, hormonal, physical pain. These become powerful predictors later (P4).
- **Crisis detection at entry time** — if mood ≤ 2 with sustained pattern, or note contains crisis language, surface the safety panel (see P2.3) before the success toast.

### 5.2 Journal, deepened

- **Multiple entry types** — free-write, gratitude (already exists), thought record (CBT), values check-in (ACT), Pros/cons, letter-to-self, dream log.
- **Voice journaling** — record audio, transcribe locally with Whisper-Web (WebGPU when available). Audio never leaves the device unless the user opts in.
- **Photo/sketch attachments** — encrypted blobs in IndexedDB (Dexie); not in localStorage.
- **Time-locked entries** — "show me this entry in 6 months." Powerful for perspective.
- **Highlights & favorites** — pin entries to a dedicated "look back" view.

### 5.3 Sessions, deepened

- **Pre-session prep flow** — guided 5-minute walkthrough that surfaces themes since last session and lets the user pick 2–3 topics to bring.
- **Post-session reflection** — what landed, what didn't, what to try this week.
- **Homework tracker** — items appear on Home with completion checkbox. Sync to therapist when P3 ships.
- **Session recordings** (with consent on both sides) — audio stored locally, optional auto-summary by user-controlled LLM in P4.

### 5.4 Habits, gently

- **Coping toolkit, expanded** — current `COPING` list is 5 categories of 5 items. Make each item a real micro-experience: timed grounding, audio-guided body scan, scripted PMR, journaling prompt, reach-out template.
- **Skill streaks** separate from check-in streaks — "you've practiced grounding 12 times this month."
- **Routine builder** — morning/evening rituals the user composes (e.g., "wake → breathe 2min → gratitude → mood").

### 5.5 Personalization

- Surface DOB/state/sex (already collected in onboarding) as relevant — e.g., region-specific crisis lines for the user's `profile.state`, age-appropriate language.
- **Pronouns** field (currently missing).
- **Cultural/identity context** — optional disclosure for AI/therapist matching later, never required.

### 5.6 Onboarding upgrade

Current onboarding is solid (`Onboarding.jsx`) but front-loads PII before showing value. Re-order:

1. Show value immediately — let the user do a check-in *anonymously* on day 1.
2. Save data locally, prompt for account creation only when sync/restore is needed.
3. Move sex/state/DOB to a later "personalize" step that the user can skip.

This is a meaningful conversion win and respects users who are wary of sign-up forms — exactly the audience for a mental health app.

---

## 6. Phase 2 — Clinical Rigor (8–10 weeks)

Goal: a therapist looks at the app and says "this is real."

### 6.1 Validated screeners

Build a library of standardized instruments with proper scoring:

- **PHQ-9** — depression, 9 items.
- **GAD-7** — anxiety, 7 items.
- **PCL-5** — PTSD, 20 items.
- **AUDIT-C** — alcohol use, 3 items (10-item full version optional).
- **DAST-10** — drug use.
- **PSS-10** — perceived stress.
- **WHO-5** — wellbeing, 5 items, weekly cadence.
- **K10** — psychological distress.
- **ISI** — insomnia.
- **EDE-Q** — disordered eating.

For each: questions, response scale, scoring algorithm, severity bands, change-over-time chart, and clinician-readable summary.

Store as `assessments` table in the reducer — versioned (PHQ-9 v1) so scoring stays reproducible.

### 6.2 Evidence-based modules

Self-paced, structured, optional. Each is a multi-session program with explicit completion:

- **CBT essentials** — psychoeducation, thought records, behavioral activation, cognitive restructuring, behavioral experiments.
- **DBT skills** — mindfulness, distress tolerance (TIP, ACCEPTS, IMPROVE), emotion regulation (PLEASE, opposite action), interpersonal effectiveness (DEAR MAN, GIVE, FAST).
- **ACT** — values clarification, defusion, acceptance, committed action, the values bullseye.
- **Trauma-informed grounding** — psychoeducation on the window of tolerance, polyvagal-informed exercises, never re-exposure without a therapist.
- **Sleep CBT-I** — sleep restriction, stimulus control, sleep diary integration.

Each module: written by or reviewed by a licensed clinician; cite the manualized protocol it's drawn from; include "this is not a replacement for therapy" framing.

### 6.3 Crisis safety net (the most important feature in the entire roadmap)

Today: a static 988 card on Home. That is not enough.

Build **Project Lifeline**:

- **Safety plan builder** — Stanley-Brown Safety Planning Intervention, the gold standard. Six steps: warning signs, internal coping, distractions/social settings, people to contact, professionals/agencies, means restriction. Stored encrypted, accessible offline, accessible from a one-tap home-screen icon.
- **Crisis detection signals** — sustained low mood, journal text classifier (on-device), missed check-ins after a crisis period, self-harm language. All processed locally.
- **Tiered response** — low risk: gentle suggestion of safety plan. Moderate: prominent banner + grounding exercise. High: full-screen interstitial offering 988, Crisis Text Line (741741), regional services by `profile.state`, and an "I'm with someone" button.
- **Trusted contacts** — user-defined people who can be alerted (with explicit prior consent) on a crisis signal. Default off.
- **Means safety check-in** — for users at elevated risk, periodic prompts about lethal means access, with resources.
- **Aftercare** — 24h, 7d, 30d follow-ups after a crisis flag. Caring, never surveilling.

This is hard, ethically loaded work. **Do not ship it without a clinical advisory board signing off.**

### 6.4 Clinical advisory board

Before P2 ships, recruit:

- A licensed psychologist or psychiatrist as Chief Clinical Officer (or fractional equivalent).
- A clinical advisory board: at least one CBT specialist, one DBT specialist, one trauma specialist, one psychiatrist, one suicide-prevention researcher.
- Lived-experience advisors — people who have used mental health apps in crisis. Pay them.

Document an editorial policy for clinical content (review cadence, conflict-of-interest disclosure, sourcing standard).

---

## 7. Phase 3 — The Clinician Bridge (10–12 weeks)

Goal: the user's therapist is a first-class participant.

### 7.1 Therapist portal (`therapist.therapylog.app` or path under main app)

A separate React surface for clinicians:

- **Caseload dashboard** — clients listed with last check-in, mood trend arrow, upcoming session, screener flags, alerts.
- **Client view** — longitudinal mood/energy/anxiety chart, screener history with severity band overlays, journal entries the client has explicitly shared, homework completion, session history.
- **Session prep** — auto-generated summary of what the client tracked since last session, themes, AI-suggested talking points (clinician approves before use).
- **Progress notes** — DAP/SOAP/BIRP templates, voice-to-text, prefilled with client-shared context.
- **Outcomes reports** — PDF for insurance/audit; longitudinal MBC (measurement-based care) summary.

### 7.2 Shared workspace

The collaboration model is consent-driven, granular, and revocable:

- Client invites therapist via email — therapist creates a clinician account.
- Client controls what is shared per item: mood (always, on request, never), specific journal entries (per-entry toggle), screeners, homework, safety plan.
- Sharing is **read-only by default**; therapist can leave comments only on items the client made commentable.
- Audit log: every clinician access of client data is logged and visible to the client (`/account/access-log`).

### 7.3 Between-session work

- **Homework assignment** from clinician → appears on client's Home.
- **Bidirectional secure messaging** — async, threaded, end-to-end encrypted, with a clinician-defined response SLA. Not a chat; explicitly not for crises.
- **Crisis escalation channel** — if the client triggers a crisis flag, the therapist (with consent) is notified through a separate, prioritized inbox.

### 7.4 Telehealth integration

- Embed Doxy.me / Zoom for Healthcare / proprietary WebRTC for sessions (BAA-eligible providers only).
- One-tap join from session card.
- Optional session transcript (consent on both sides), stored client-side.

### 7.5 Practice management — the boring stuff that wins clinicians

- Calendar with two-way sync (Google/Outlook).
- Appointment reminders to clients (SMS/email).
- Cancellation/no-show policy enforcement.
- Stripe-backed billing — copay collection, sliding scale, package billing.
- Superbill PDF generation with CPT/ICD-10 codes for client insurance reimbursement.
- Insurance verification (Eligible / Stedi / Availity).
- HIPAA-compliant intake forms.

### 7.6 Group practice support

- Multi-clinician orgs.
- Supervisor view (with explicit client consent for supervision).
- Referral routing inside a practice.

---

## 8. Phase 4 — Intelligence Layer (10–14 weeks)

Goal: the app sees what the user can't, and tells them gently.

### 8.1 Pattern detection (on-device first)

All of this runs locally by default; cloud option is opt-in:

- **Mood change-points** — Bayesian change-point detection on the mood time series highlights "something shifted around April 12."
- **Trigger correlation** — when sleep < 6h, mood drops 1.4 points on average over the next 48h. Surface as gentle insight.
- **Cycle detection** — for menstruating users (opt-in), correlate mood with cycle phase.
- **Seasonal patterns** — SAD-relevant patterns flagged in fall/winter for users in northern states (we already have `profile.state`).
- **Therapy ROI** — pre-/post-session mood deltas; cumulative effect over 12 weeks.

### 8.2 AI co-pilot — bounded, transparent, optional

Every AI feature is **off by default**, **labeled as AI**, and **shows its sources**.

- **Reflective companion** — Socratic, validating, non-judgmental; never gives clinical advice. Modeled on motivational interviewing principles. Hard-coded refusal patterns for crisis content (route to safety net).
- **Theme summaries** — "Your last 30 days have come back to themes of work boundaries, sleep, and sister." Generated from journal text.
- **Pre-session brief** — for the user, not the therapist: what came up, what to bring up.
- **Thought-record assistant** — helps the user identify cognitive distortions in real time during a CBT thought record. Suggests reframes; user always picks.
- **Skill recommender** — surfaces a coping strategy based on logged emotion + time of day + what's worked historically.

Implementation rules:

- **On-device for sensitive content** (Whisper-Web for transcription; small open models for theme extraction).
- **Cloud LLM only with explicit consent** and a configurable provider (BYO API key option for power users).
- **System prompt is open-source.** Users can read it.
- **Output guardrails** — clinical-content classifier; if it triggers, the model output is replaced with a hand-crafted message + safety plan link.
- **No training on user data, ever.** Codified in the privacy policy and the BAA.

### 8.3 Voice journaling (P1.b feature, fully realized in P4)

- WebGPU Whisper transcription, on-device.
- Live emotion/sentiment overlay during playback (user can review and re-tag).
- Auto-detect topics; suggest tags.
- Optional: prosody-based mood inference (research-grade only, clearly labeled).

### 8.4 Biometric integration

Mental health is a whole-body phenomenon. Connect (read-only by default):

- **Apple HealthKit / Google Fit** — sleep, HRV, resting HR, activity, mindful minutes.
- **Oura, Whoop, Garmin, Fitbit** — direct OAuth.
- **Continuous glucose monitors** (Dexcom/Libre) — emerging research on glucose variability and mood.
- **Menstrual cycle data** — Apple Health / Clue / Flo.

Surface correlations (P4.1) only when statistically meaningful and clinically validated.

### 8.5 Environmental context

- Weather and barometric pressure (correlated with migraine, mood for some).
- Daylight hours (SAD).
- Air quality (correlated with mood and cognition).
- News-consumption time (self-reported or, with permission, screen-time integration on iOS).

### 8.6 The privacy contract for intelligence features

Every insight surface answers four questions:

1. **What signal did we see?** ("Your mood drops on Tuesdays.")
2. **What data did we use?** ("Last 90 days of check-ins, time-of-day stamps.")
3. **Where did it run?** ("On your device.")
4. **Where does it go?** ("Nowhere unless you share it.")

---

## 9. Phase 5 — Enterprise & Trust (12–16 weeks)

Goal: a CISO and a benefits manager both say yes.

### 9.1 Compliance

- **HIPAA** — full Security Rule + Privacy Rule program. Risk assessment, designated Security Officer, incident response plan, BAA template.
- **SOC 2 Type II** — control selection, evidence collection (Vanta/Drata), audit. Plan: control selection in P3, type I in P4, type II covering 6+ months in P5.
- **GDPR + UK GDPR** — DPO, DPIA for AI features, lawful basis for each processing activity, SCCs for any cross-border transfer.
- **CCPA / CPRA** — Do Not Sell / Limit Use of Sensitive PI controls in-app.
- **HITRUST CSF** — for health-system buyers; pursue after SOC 2.
- **State-specific** — Texas TX-RAMP, NY SHIELD, MA 201 CMR 17.00, WA My Health My Data Act.
- **Outside US** — APEC CBPR (where applicable), Australia Privacy Act, India DPDP Act.
- **Children** — COPPA: keep the 13+ age gate; consider parental-consent flow for 13–17 in some jurisdictions.

### 9.2 Architecture upgrade

- **Multi-tenant** — orgs/teams above users. Row-level security in Postgres tied to tenant_id everywhere.
- **Zero-knowledge encryption** for PHI: client-side encrypts journal/screener content with a key derived from the user's password + a server-stored salt. The server stores ciphertext only. PIN today gives device unlock; password is the recovery secret.
- **Key recovery** — Shamir secret sharing across user-chosen recovery contacts, OR clinician-held recovery key with explicit consent (the latter is a feature for enterprise EAP).
- **Append-only audit log** — every read/write of PHI; signed, tamper-evident; exportable per HIPAA.
- **Field-level data classification** — PHI / PII / metadata / public; encryption and retention rules per class.
- **Region-specific data residency** — US, EU, AU, CA at a minimum. Per-tenant pinning.
- **Disaster recovery** — RPO 1h, RTO 4h; documented runbooks; quarterly DR drills.

### 9.3 Identity

- **SSO** — SAML 2.0 + OIDC (Okta, Entra ID, Google Workspace, Auth0).
- **SCIM 2.0** — automated provisioning/deprovisioning for enterprise customers.
- **MFA** — TOTP, WebAuthn (passkey), SMS as last resort.
- **Step-up auth** for sensitive actions (export all data, delete account, view safety plan from new device).
- **Session controls** — admin-set max session length, IP allowlist for clinician portal.

### 9.4 Admin & governance

- **Org admin console** — seat management, audit log access, SSO config, retention policy, data residency selection.
- **Role-based access control** — owner, billing admin, clinical lead, clinician, supervisee, support, read-only.
- **Just-in-time access** — break-glass for support with full audit trail.
- **Custom retention policies** — per data type, per tenant, with legal-hold support.
- **Data subject access requests (DSAR)** — self-serve export and erasure within 30 days.

### 9.5 Deployment models

- **B2C SaaS** — current model, freemium → premium.
- **B2B2C — EAPs and benefits platforms** — employers buy seats; employee data never visible to employer. Aggregate dashboards only (n ≥ 5 cohorts).
- **B2B — health systems** — embedded in patient portals; BAA, Epic/Cerner FHIR integration.
- **B2B — therapy practices** — group practice license; clinician portal as the entry point.
- **On-prem / private cloud** — for very large customers; managed Kubernetes deploy with Anthos / EKS.

### 9.6 Trust artifacts

Make trust legible:

- **Public trust center** (`trust.therapylog.app`): live status, current sub-processors, certifications, pen-test summaries (redacted), policy library.
- **Open-source clinical content** — modules, screener implementations, safety-plan logic on GitHub. Encourages scrutiny, builds credibility.
- **Bug bounty** — HackerOne or Intigriti.
- **Annual transparency report** — government data requests, DSARs handled, incidents.

---

## 10. Phase 6 — Network & Ecosystem (Ongoing)

### 10.1 Therapist marketplace

- Verified clinician directory; license-board verification (Sertifi/Verifiable).
- Filtered search by modality, specialty, identity (queer-affirming, BIPOC, faith-aligned), insurance accepted, fee structure.
- In-app booking, video, payment, intake — closed loop.
- Outcomes-based ranking (with consent and aggregation).

### 10.2 Peer support communities

This is the highest-leverage, highest-risk feature in the roadmap. Done right, it's life-changing. Done wrong, it's harmful.

- **Curated, moderated** small groups by life context (new parent, grief, caregiving, queer, veteran, eating-disorder recovery).
- **Trained peer specialists** — lived experience + certified training (e.g., NAMI Peer-to-Peer, Wellbeing Trust models). Paid.
- **Strict moderation** — community guidelines, AI-assisted toxicity/risk detection, human review, fast escalation to crisis line.
- **Safety-tested patterns** — no public posting; small groups only; no engagement metrics visible to users.
- **Research partnerships** — academic IRB-approved studies on outcomes.

Do not ship this until P2 (crisis safety net) and P5 (compliance) are live.

### 10.3 Integrations

- **Calendar** — Google, Outlook, Apple Calendar, Calendly.
- **Wearables** — Apple Health, Google Fit, Oura, Whoop, Garmin, Fitbit, Withings (P4 already covers).
- **Pharmacy** — RxNorm-backed medication tracking; later, optional adherence reminders.
- **Telehealth** — Doxy.me, Zoom for Healthcare; later, proprietary WebRTC.
- **EHR** — FHIR R4 read/write where allowed; SMART on FHIR for embedded patient-portal use.
- **Productivity** — selective Slack / Teams nudges for work-life balance (opt-in, employer EAP context).

### 10.4 Internationalization

- i18n across the app (react-intl or i18next). Start with English, Spanish, French, Brazilian Portuguese, German, Japanese, Hindi, Arabic.
- RTL layout for Arabic/Hebrew.
- Locale-specific crisis lines (we already have `profile.state` for US — extend to country, then region).
- Cultural adaptation of clinical content (translation alone is insufficient — review by in-language clinicians).
- Time-zone correctness — there was a timezone bug fixed in commit `3c30028`; the discipline must continue.

### 10.5 Accessibility (WCAG 2.2 AAA)

- Screen reader: every interactive element has an accessible name; live regions for toast/confirm.
- Keyboard: every flow completable without a pointer.
- Cognitive: plain-language alternatives for every clinical term; reading-level checker.
- Motor: large hit targets (already 44px min in `ui.jsx:57`), reduced-motion respect (`prefers-reduced-motion`).
- Visual: AAA contrast option, dyslexia-friendly font option (OpenDyslexic), text-size controls separate from system zoom.
- Hearing: captions on all audio; transcripts.
- Voice control compatibility (iOS Voice Control, Windows Speech).

### 10.6 Research & evidence

- Annual outcomes report — N, demographics, mood/screener change distributions, retention.
- Independent academic partnerships for RCTs of specific modules (CBT module vs. control).
- Open-data initiatives where users opt in — fully de-identified, IRB-approved.
- Publish in peer-reviewed venues; cite on the marketing site.

---

## 11. Pricing Model

A coherent pricing model funds the work without compromising the mission.

| Tier | Price | Audience | Includes |
|------|-------|----------|----------|
| **Free** | $0 | Everyone | Mood, journal, gratitude, breathing, coping, 1 active screener (PHQ-9), local-first, optional cloud sync, full crisis safety net |
| **Plus** | $7.99/mo or $59/yr | Engaged users | All screeners, all evidence-based modules, voice journaling, full insights, biometric integration, AI co-pilot, unlimited time-locked entries |
| **Care** | $14.99/mo | Users in active therapy | Plus + therapist sharing, secure messaging, homework, between-session AI brief, telehealth |
| **Practice** | $39/clinician/mo | Solo therapists | Therapist portal, calendar, billing, superbills, intake forms, telehealth, up to 50 clients |
| **Group** | $59/clinician/mo (10+) | Group practices | Practice + supervision, multi-clinician orgs, advanced reporting |
| **Enterprise / EAP** | Custom | Employers, payers, health systems | All of above + SSO/SAML/SCIM, BAA, custom data residency, audit, dedicated CSM |

Crisis safety net is **always free**. Always.

---

## 12. Differentiating Features (the "wow")

Anchor features that, in aggregate, make TherapyLog the obvious choice:

1. **Project Lifeline** — best-in-class crisis safety net, free for all (P2).
2. **Local-first + zero-knowledge** — competitors store everything plaintext on their servers; we don't (P0/P5).
3. **Real evidence-based modules** with named clinical authors (P2).
4. **Therapist Bridge** with granular consent — not a feature in any major direct-to-consumer competitor (P3).
5. **On-device intelligence** — voice journaling, theme detection, AI co-pilot that doesn't leak (P4).
6. **Biometric correlation engine** — clinically meaningful insights from wearables (P4).
7. **Trusted Contacts crisis network** — opt-in alerting with explicit consent loops (P2).
8. **Cycle-aware mental health** for menstruating users (P4).
9. **Cultural & identity match** in therapist marketplace (P6).
10. **Outcomes transparency report** annual public publication (P5/P6).
11. **Open clinical content** — content modules and screener implementations are public, scrutinizable (P5).
12. **Time-locked entries** — write a letter, see it in 6 months (P1).
13. **Group practice with supervision support** — under-served niche (P3).
14. **EHR + SMART-on-FHIR embedding** — health systems can drop the app into MyChart (P5/P6).
15. **EAP deployment with employer-blind aggregate dashboards** — no employer can ever see an individual's data (P5).

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Clinical liability — user harms self while using app | Crisis safety net (P2) reviewed by clinical board; clear "not a replacement for treatment" framing; safety-plan accessibility offline; insurance: errors-and-omissions + media liability + cyber. |
| AI hallucination giving harmful advice | Bounded AI surfaces, hard-coded crisis routing, system prompts public, output guardrail classifier, human-reviewed clinical content. |
| Data breach | Zero-knowledge encryption (P5) limits blast radius even if servers are compromised; SOC 2 + pen tests; bug bounty; incident response plan. |
| Scope creep / never shipping | Phased plan above. P0 ships before any enterprise pursuit. Each phase has a hard DoD. |
| HIPAA/regulatory misstep | Hire a healthcare-experienced privacy counsel before P3. Don't claim BAA-readiness until you've signed one with at least one customer. |
| Therapist adoption is hard | Practice tier (P3) gives standalone value even without clients on TherapyLog — calendar, billing, superbills are sticky on their own. |
| Peer support harm | Don't ship until P5; gated behind moderation + crisis safety net; trained peer specialists; lived-experience advisors throughout design. |
| Competitor moats (Headspace, Calm, BetterHelp, etc.) | Our wedge is local-first privacy + clinician bridge. Don't compete on content library; compete on trust and integration. |

---

## 14. What to Build This Week

Concrete, code-grounded P0 backlog to start tomorrow:

1. **Wire the Journal tab** (`src/tabs/JournalTab.jsx`) with the existing reducer + `PROMPTS` array.
2. **Wire the Sessions tab** (`src/tabs/SessionsTab.jsx`); extend reducer to support a richer session shape.
3. **Add an Insights tab** with Recharts (already a dependency) — 30-day mood line + emotion frequency.
4. **Migrate persistence to `LS.setSecure`** in `src/App.jsx:40-43`.
5. **Add reminders** — local notification scheduler in service worker; settings UI in `SettingsTab`.
6. **Replace CDN script paths in `sw.js`** with bundled equivalents and tighten the CSP in `index.html`.
7. **Add TypeScript** — convert `src/state/reducer.js` and `src/utils/sync.js` first.
8. **Add Vitest** — unit tests for `src/utils/helpers.js`.
9. **Lighthouse CI** in `.github/workflows/deploy.yml`.
10. **Start the clinical advisory board search** — recruiting takes months; start now.

---

## 15. Appendix — Code Touch Points

For implementers, the files most affected per phase:

- **P0:** `src/App.jsx`, `src/tabs/JournalTab.jsx` (new), `src/tabs/SessionsTab.jsx` (new), `src/tabs/InsightsTab.jsx` (new), `src/utils/storage.js`, `sw.js`, `vite.config.js`, `index.html`, `.github/workflows/`.
- **P1:** `src/state/reducer.js` (new entry types, multi-slot mood), `src/tabs/HomeTab.jsx`, `src/tabs/JournalTab.jsx`, new `src/utils/notifications.js`, new `src/utils/voice.js`.
- **P2:** new `src/clinical/screeners/` directory, new `src/clinical/modules/`, new `src/safety/SafetyPlan.jsx`, new `src/safety/CrisisDetection.js`.
- **P3:** new `apps/clinician/` workspace; backend additions for sharing, messaging, billing.
- **P4:** new `src/intelligence/` — pattern detection, on-device models, biometric adapters.
- **P5:** infrastructure-heavy — backend rewrite for multi-tenant + zero-knowledge; new `apps/admin/`.
- **P6:** new `apps/therapist-marketplace/`, `apps/peer-support/`; i18n throughout.

---

*Last updated: May 2026. Living document — revise quarterly.*
