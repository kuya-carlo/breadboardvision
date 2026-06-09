# Judging Q&A - BreadboardVision

Anticipated questions from judges and prepared responses optimized to address technical, feasibility, and impact rubrics.

---

### Q1: How does the AI recognize circuit components from photos? Does it require a custom computer vision model?
* **Answer:** "No, we do not train a custom object detection model from scratch, which would be fragile and time-consuming. Instead, we leverage the multimodal capabilities of Gemini 1.5 Flash. We send the image directly to the model along with a zero-shot system prompt that guides it to act as an electrical engineer. Because Gemini is pre-trained on millions of technical schematics and breadboard images, it handles component classification and connectivity mapping dynamically, which makes our solution incredibly lightweight and robust."

### Q2: Real-world photos of breadboards can be messy, with shadows and overlapping wires. How does your system handle poor image quality?
* **Answer:** "That is a major real-world bottleneck, which is why we built two distinct guardrails:
  1. **Image Fallback to Simulator Screenshots:** We recommend students upload clean screenshots from simulators like Tinkercad or Fritzing, where lighting and perspective are uniform.
  2. **The Netlist Fallback (Pivot):** If the image is unrecognizable, the user can describe their connections in plain text (e.g., 'Resistor 1 connected to row 10 and 15'). The AI processes this text description (netlist) directly. This bypasses computer vision constraints completely while delivering the same educational feedback."

### Q3: How do you prevent the AI from hallucinating incorrect circuit diagnoses?
* **Answer:** "We use strict output schemas and system constraint programming. In our API backend, we enforce a strict JSON output structure using Gemini's structured output mode. The model is instructed to return `correct`, `warning`, or `error` alongside structured arrays of components and steps. If the AI cannot resolve the circuit, it is programmed to return a `warning` prompting the student for more details (e.g., 'Resistor value unclear, please specify') rather than guessing. We also run database logging to track and audit responses."

### Q4: Why would a student use this instead of a traditional simulator like Falstad or LTSpice?
* **Answer:** "Traditional simulators only tell you *if* a circuit fails, or they output flat electrical charts (like flat voltage lines). They do not explain *why* the circuit failed or *how* to physically rearrange your board to fix it. BreadboardVision acts as a pedagogical tutor. It bridges the gap between raw hardware behavior and conceptual understanding, providing step-by-step guidance designed specifically for beginners."

### Q5: How does this scale to larger classrooms? What are the API cost implications?
* **Answer:** "Since we use Google Gemini 1.5 Flash, the cost is extremely low (fractions of a cent per request). In a typical 3-hour lab session, a student might make 5 to 10 debug queries, costing less than 2 cents per student. The backend is designed as a stateless Express server, and the database utilizes a lightweight SQLite file, meaning hosting costs are minimal. It can easily scale to handle thousands of concurrent classroom users on basic cloud tiers."
