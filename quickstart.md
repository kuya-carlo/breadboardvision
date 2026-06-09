# Quickstart Guide - BreadboardVision

Get BreadboardVision up and running on your local machine in under 2 minutes.

## Prerequisites
- Node.js (v18 or higher recommended)
- A Google Gemini API Key (get a free key from [Google AI Studio](https://aistudio.google.com/))

## Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/breadboard-vision.git
   cd breadboard-vision
   ```

2. **Configure Environment Variables:**
   Copy the sample environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

3. **Install Dependencies:**
   We recommend `pnpm` for speed, but `npm` works fine as a fallback:
   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Initialize the SQLite Database:**
   Seed the database with mock circuits for immediate testing:
   ```bash
   npm run db:init
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Verify installation:**
   Open your browser to `http://localhost:3000`. You will see the BreadboardVision interface loaded and ready. Use the **Judge Demo Panel** on the left to inject circuit examples instantly.
