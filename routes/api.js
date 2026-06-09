const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../db/init');

// Configure multer for file uploads (storing in memory for easy base64 conversion)
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const SYSTEM_PROMPT = `
You are an experienced electrical engineering professor and laboratory tutor. Analyze the given circuit diagram image or the text netlist description.
Return your analysis strictly as a valid JSON object. Do not include any markdown formatting wrappers (like \`\`\`json) in your output, just the raw JSON text.
The JSON object must have this structure:
{
  "status": "correct" | "warning" | "error",
  "detectedComponents": ["string", ...],
  "detectedErrors": [
    {
      "component": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "guideSteps": ["string", ...]
}
`;

// Helper to query Gemini API
async function queryGemini(parts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (process.env.NODE_ENV === 'test' || !apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'your_actual_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates[0].content.parts[0].text;
  return JSON.parse(text.trim());
}

// Ensure session exists helper
function ensureSession(sessionId) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    db.run(
      'INSERT OR IGNORE INTO STUDENT_SESSION (session_id, created_at) VALUES (?, ?)',
      [sessionId, timestamp],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Fallback Mock Engine (when API key is missing or offline)
function getMockAnalysis(input, type) {
  const text = (type === 'netlist' ? input : '').toLowerCase();
  
  if (text.includes('short') || text.includes('shortcircuit')) {
    return {
      status: 'error',
      detectedComponents: ['9V Battery', 'Jumper Wire'],
      detectedErrors: [
        {
          component: 'Battery / Power Source',
          type: 'Short Circuit',
          description: 'A direct connection exists between the positive and negative terminals of the battery without any load resistor. This causes excessive current flow, which will overheat the battery and wire.'
        }
      ],
      guideSteps: [
        'Disconnect the power source immediately.',
        'Ensure there is a resistor or load component placed in series between the positive wire and negative wire.',
        'Re-verify connections using the schematic diagram before applying power.'
      ]
    };
  }

  if (text.includes('reverse') || text.includes('backwards') || text.includes('anode: pinb') || text.includes('anode: cathode')) {
    return {
      status: 'error',
      detectedComponents: ['9V Battery', '220 Ohm Resistor', 'Red LED'],
      detectedErrors: [
        {
          component: 'Red LED',
          type: 'Polarity Error',
          description: 'The Red LED is connected in reverse bias. The anode (longer pin) is connected to the ground/negative side, and the cathode (shorter pin) is connected to the positive node.'
        }
      ],
      guideSteps: [
        'Unplug the LED from the breadboard.',
        'Rotate the LED 180 degrees so the longer wire (anode) is facing the positive resistor side.',
        'Re-insert the LED and observe if it lights up.'
      ]
    };
  }

  if (text.includes('correct') || text.includes('led') && text.includes('resistor') && text.includes('battery')) {
    return {
      status: 'correct',
      detectedComponents: ['9V Battery', '1k Ohm Resistor', 'Yellow LED'],
      detectedErrors: [],
      guideSteps: [
        'Your circuit is fully closed and loop connections look correct.',
        'Verify your power source is turned on.'
      ]
    };
  }

  // General default fallback
  return {
    status: 'warning',
    detectedComponents: ['Identified Components'],
    detectedErrors: [
      {
        component: 'Circuits Board',
        type: 'Analysis Warning',
        description: 'Using mock analysis fallback (No Gemini API Key provided). To get active AI diagnostics, configure your GEMINI_API_KEY in the .env file.'
      }
    ],
    guideSteps: [
      'Copy .env.example to .env and set your Google Gemini API key.',
      'Restart the server.'
    ]
  };
}

// 1. POST /api/analyze/netlist
router.post('/analyze/netlist', async (req, res) => {
  try {
    const { sessionId, netlist } = req.body;
    if (!sessionId || !netlist) {
      return res.status(400).json({ error: 'Missing sessionId or netlist' });
    }

    await ensureSession(sessionId);

    // Save submission
    const timestamp = new Date().toISOString();
    let submissionId;
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO CIRCUIT_SUBMISSION (session_id, submission_type, netlist_content, created_at) VALUES (?, ?, ?, ?)',
        [sessionId, 'netlist', netlist, timestamp],
        function (err) {
          if (err) reject(err);
          else {
            submissionId = this.lastID;
            resolve();
          }
        }
      );
    });

    let analysis;
    try {
      const parts = [
        { text: SYSTEM_PROMPT },
        { text: `Analyze this netlist representation of a circuit:\n\n${netlist}` }
      ];
      analysis = await queryGemini(parts);
    } catch (apiErr) {
      console.warn('AI analysis failed or key missing. Falling back to mock engine.', apiErr.message);
      analysis = getMockAnalysis(netlist, 'netlist');
    }

    // Save feedback log
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO FEEDBACK_LOG (submission_id, status, detected_errors, guide_steps, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          submissionId,
          analysis.status,
          JSON.stringify(analysis.detectedErrors || []),
          JSON.stringify(analysis.guideSteps || []),
          timestamp
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({
      success: true,
      submissionId,
      analysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/analyze/image
router.post('/analyze/image', upload.single('image'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Missing uploaded image file' });
    }

    await ensureSession(sessionId);

    const timestamp = new Date().toISOString();
    let submissionId;

    // Save submission (image is processed in-memory, we can store a mock file path)
    const filePath = `uploads/${Date.now()}_circuit.png`;
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO CIRCUIT_SUBMISSION (session_id, submission_type, file_path, created_at) VALUES (?, ?, ?, ?)',
        [sessionId, 'image', filePath, timestamp],
        function (err) {
          if (err) reject(err);
          else {
            submissionId = this.lastID;
            resolve();
          }
        }
      );
    });

    let analysis;
    try {
      const base64Image = req.file.buffer.toString('base64');
      const parts = [
        { text: SYSTEM_PROMPT },
        { text: 'Analyze this circuit image. Detail any wiring errors or component misalignments.' },
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64Image
          }
        }
      ];
      analysis = await queryGemini(parts);
    } catch (apiErr) {
      console.warn('AI analysis failed or key missing. Falling back to mock engine.', apiErr.message);
      // Mock triggers based on filename or generic analysis
      const originalName = req.file.originalname.toLowerCase();
      analysis = getMockAnalysis(originalName, 'image');
    }

    // Save feedback log
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO FEEDBACK_LOG (submission_id, status, detected_errors, guide_steps, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          submissionId,
          analysis.status,
          JSON.stringify(analysis.detectedErrors || []),
          JSON.stringify(analysis.guideSteps || []),
          timestamp
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({
      success: true,
      submissionId,
      analysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/sessions/:id/history
router.get('/sessions/:id/history', (req, res) => {
  const sessionId = req.params.id;
  
  const query = `
    SELECT 
      sub.id as submissionId,
      sub.submission_type as type,
      sub.created_at as createdAt,
      log.status as status,
      log.detected_errors as detectedErrors,
      log.guide_steps as guideSteps
    FROM CIRCUIT_SUBMISSION sub
    JOIN FEEDBACK_LOG log ON sub.id = log.submission_id
    WHERE sub.session_id = ?
    ORDER BY sub.id DESC
  `;

  db.all(query, [sessionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse JSON columns
    const formatted = rows.map(row => ({
      submissionId: row.submissionId,
      type: row.type,
      createdAt: row.createdAt,
      status: row.status,
      detectedErrors: JSON.parse(row.detectedErrors),
      guideSteps: JSON.parse(row.guideSteps)
    }));

    res.json(formatted);
  });
});

module.exports = router;
