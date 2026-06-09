# Hackathon Tasks - BreadboardVision

A phased roadmap to build the BreadboardVision MVP within a 48-hour timeline.

---

## 🛠️ Phase 1: Foundation (Hours 0 - 4)
- [ ] Initialize Express.js application and package dependencies.
- [ ] Configure `.env` management with support for `GEMINI_API_KEY`.
- [ ] Initialize SQLite database with `better-sqlite3` and create tables:
  - `STUDENT_SESSION`, `CIRCUIT_SUBMISSION`, `FEEDBACK_LOG`
- [ ] Set up project structure and verify dev server starts on `localhost:3000`.

## 🚀 Phase 2: Core AI Diagnostics (Hours 4 - 24)
- [ ] Implement Gemini AI helper service in backend:
  - Formulate robust professor-themed system prompt.
  - Implement JSON structured output schemas for consistent API parsing.
- [ ] Build the text-based Netlist parser and testing script.
- [ ] Build image parsing endpoint using Multer and Gemini's multimodal interface.
- [ ] Write 3 critical integration tests:
  - Test correct circuit netlist parsing (returns `correct`).
  - Test short circuit netlist parsing (returns `error` + explanation).
  - Test image upload connection sanity test.

## 🔗 Phase 3: Frontend & Integration (Hours 24 - 36)
- [ ] Design responsive web dashboard (dark theme, Outfit typography).
- [ ] Build webcam capture interface and file drop-zone using HTML5 APIs.
- [ ] Implement netlist input text editor in frontend.
- [ ] Connect frontend forms to API endpoints `/api/analyze/image` and `/api/analyze/netlist`.
- [ ] Implement live rendering of Gemini response JSON (error alerts, step cards).
- [ ] Add the Judge Mock Panel to instantly inject invalid/valid circuits.

## ✨ Phase 4: Polish & Deploy (Hours 36 - 48)
- [ ] Implement session history sidebar syncing with SQLite.
- [ ] Polish UI transitions, hover states, and animations.
- [ ] Deploy frontend and backend to Vercel/Render.
- [ ] Record demo walkthrough and compile `pitch/demo.gif` using `vhs pitch/demo.tape`.
- [ ] Finalize pitch slides and run through the `pitch/demo-script.md` timing.
