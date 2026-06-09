# API Endpoints Contract - BreadboardVision

All requests and responses use the `application/json` content type.

---

### Endpoint 1: POST /api/analyze/image

Upload an image (screenshot of a circuit simulator or photo of a breadboard) for AI analysis.

- **Method**: `POST`
- **Path**: `/api/analyze/image`
- **Request Body (Multipart Form-Data)**:
  - `sessionId`: `string` (UUID or session identifier)
  - `image`: `file` (PNG or JPEG file)

- **Response Body (201 Created)**:
```json
{
  "success": true,
  "submissionId": 45,
  "analysis": {
    "status": "error",
    "detectedComponents": ["9V Battery", "220 Ohm Resistor", "Red LED"],
    "detectedErrors": [
      {
        "component": "Red LED",
        "type": "Polarity Error",
        "description": "The Red LED is connected backwards. The anode (longer leg) should be connected to the resistor output, but it is currently connected to ground."
      }
    ],
    "guideSteps": [
      "Identify the flat edge or shorter leg of your Red LED (the cathode).",
      "Unplug the LED from rows 10 and 11.",
      "Re-insert the LED with the longer leg (anode) in row 10 (resistor side) and the shorter leg in row 11 (ground side)."
    ]
  }
}
```

- **Example curl**:
```bash
curl -X POST http://localhost:3000/api/analyze/image \
  -F "sessionId=session-1234" \
  -F "image=@/path/to/circuit.png"
```

---

### Endpoint 2: POST /api/analyze/netlist

Submit a text-based circuit netlist for logical troubleshooting.

- **Method**: `POST`
- **Path**: `/api/analyze/netlist`
- **Request Body**:
```json
{
  "sessionId": "session-1234",
  "netlist": "Battery 9V (Pos: pinA, Neg: pinB)\nResistor 1k (Pin1: pinA, Pin2: pinC)\nLED (Anode: pinB, Cathode: pinC)"
}
```

- **Response Body (201 Created)**:
```json
{
  "success": true,
  "submissionId": 46,
  "analysis": {
    "status": "error",
    "detectedComponents": ["Battery 9V", "Resistor 1k", "LED"],
    "detectedErrors": [
      {
        "component": "LED",
        "type": "Wrong Connections / No Loop",
        "description": "The LED has its anode connected to the negative terminal of the battery (pinB) and its cathode connected to the resistor output (pinC). The LED is currently reverse-biased and will not light up. Additionally, the circuit loop does not close to the positive terminal correctly."
      }
    ],
    "guideSteps": [
      "Verify the loop goes from Battery Positive -> Resistor -> LED Anode.",
      "Verify LED Cathode connects directly back to Battery Negative."
    ]
  }
}
```

- **Example curl**:
```bash
curl -X POST http://localhost:3000/api/analyze/netlist \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session-1234", "netlist": "Battery 9V (Pos: pinA, Neg: pinB)\nResistor 1k (Pin1: pinA, Pin2: pinC)\nLED (Anode: pinB, Cathode: pinC)"}'
```

---

### Endpoint 3: GET /api/sessions/:id/history

Retrieve history of past debug submissions and feedback logs for a given session.

- **Method**: `GET`
- **Path**: `/api/sessions/:id/history`
- **Response Body (200 OK)**:
```json
[
  {
    "submissionId": 45,
    "type": "image",
    "createdAt": "2026-06-09T15:00:00.000Z",
    "status": "error",
    "summary": "LED Polarity Error detected and resolved."
  },
  {
    "submissionId": 46,
    "type": "netlist",
    "createdAt": "2026-06-09T15:15:00.000Z",
    "status": "correct",
    "summary": "Circuit loop closed. No errors detected."
  }
]
```

- **Example curl**:
```bash
curl -X GET http://localhost:3000/api/sessions/session-1234/history
```
