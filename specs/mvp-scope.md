# MVP Scope Classification - BreadboardVision

Every feature for BreadboardVision is categorized into HACKATHON, MVP, or FUTURE scope.

| Feature | Scope | Estimated Hours | Justification |
|---------|-------|----------------|----------------|
| **AI Netlist Debugger (Text-based)** | HACKATHON | 4 | Core fallback mechanism. Extremely robust and easy to verify. |
| **Interactive Simulator Screenshot Analysis** | HACKATHON | 5 | Main vision concept using clean virtual images. Crucial for demo value. |
| **Judge Demonstration Panel (Mock Data)** | HACKATHON | 2 | Crucial for the judging script. Allows instant trial of errors. |
| **Dark Mode & Responsive UI** | HACKATHON | 2 | High-polish visual presentation. |
| **Session Analysis History** | HACKATHON | 3 | SQLite persistence. Demonstrates data logging and state tracking. |
| **Physical Breadboard Camera Analyzer** | MVP | 10 | Harder vision recognition. Requires filtering real-world lighting/angles. |
| **Automatic Component Part-Number Lookup** | MVP | 8 | Connects to external APIs (e.g., DigiKey) to find datasheets. |
| **Interactive In-App Breadboard Builder** | FUTURE | 40 | Out of hackathon scope. Standard simulator tools can be reused instead. |
| **Classroom Dashboard for Teachers** | FUTURE | 24 | High-effort system management tool, not required for the immediate demo. |

## HACKATHON Scope (Max 5 Features)
1. **AI Netlist Debugger:** Web form accepting structured text input of components and pins, returning a detailed AI diagnosis.
2. **Interactive Screenshot Analysis:** Web interface to upload circuit simulator files or images (e.g., png/jpg), analyzed by Gemini 1.5 Flash.
3. **Judge Demo Panel:** Button to inject pre-configured valid/invalid circuit layouts to test immediately.
4. **Responsive UI & Dark Mode:** Curated dark-themed design with Outfit typography and smooth transitions.
5. **Session History:** SQLite persistent sidebar listing past submissions and resolved errors.
