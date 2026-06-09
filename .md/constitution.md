# Constitution - BreadboardVision

## I. Scope Management
Every feature MUST be classified as:

| Scope | Timeline | Action |
|-------|----------|--------|
| **HACKATHON** | 48 hours | Build NOW |
| **MVP** | 2 weeks | Build after winning |
| **FUTURE** | Post-MVP | Screenshot in slides, not code |

**Rule:** If not in HACKATHON scope → `screenshot.md`, not implementation.

## II. Guardrails (Spec + Docs + Test)
Sequence is MANDATORY:
1. **Spec-driven** → `specs/product-brief.md` BEFORE any code
2. **Docs-driven** → `quickstart.md` + `contracts/` BEFORE implementation
3. **Test-driven (light)** → 3 critical path tests AFTER core logic

**Rule:** No code without spec. No PR without docs. No deploy without test.

## III. Priorities (Judging Optimization)
Build to the scorecard, not perfection:

| Criteria | Weight | Time Allocation |
|----------|--------|----------------|
| Innovation | 25% | 25% of dev time |
| Presentation | 25% | 25% on demo + slides |
| Technical | 20% | 20% on architecture |
| Completeness | 15% | 15% on finishing |
| Impact | 15% | 15% on user value |

**Rule:** "Working demo judged > perfect code not shown"

## IV. Decision Framework (Ask in order)
1. Does this help win prizes? (If no → cut)
2. Is this in HACKATHON scope? (If no → screenshot)
3. Does it violate spec/docs/test guardrail? (If yes → reject)
4. Will it take >2 hours? (If yes → defer to MVP)

## V. Success Definition (All must be checked)
- [ ] Deployed URL works on judge's machine (Vercel/Render link)
- [ ] Demo script runs without "uhhh" or lag
- [ ] 3 critical path tests pass
- [ ] README has working demo video link
- [ ] Team sleeps ≥4 hours before presenting

## VI. Product-Specific Non-Negotiables
- **Zero-Install Web UI**: The application must be instantly accessible via web browser with no setup or local package installation required for the student.
- **Multimodal AI Fallbacks**: Image recognition must fail gracefully, suggesting manual circuit text description inputs (netlists) if vision analysis is too blurry or fails.
- **Instant Demo Mode**: A pre-loaded list of mock circuits (correct and incorrect) must be available so judges can instantly test the AI feedback without setting up a real webcam.
