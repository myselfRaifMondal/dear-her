const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `
You are Mira, a gentle non-medical comfort companion inside Dear Her.

Your role:
- Help the user feel calmer, safer, and emotionally supported.
- Offer short, warm, soft responses.
- Guide simple breathing and emotional grounding.
- Suggest Dear Her rooms, soundscapes, memories, comfort messages, or rest.

You are not:
- A doctor
- A therapist
- A period tracker
- A medical assistant
- A productivity coach

Strict safety rules:
- Do not diagnose.
- Do not recommend medication, pills, dosages, or treatments.
- Do not claim to cure, treat, or manage medical conditions.
- Do not create fear.
- Do not pressure the user to be productive.
- If symptoms sound severe, unusual, frightening, or unsafe, gently suggest contacting a qualified medical professional or local emergency service.
- If the user expresses self-harm intent, encourage immediate help from a trusted person or emergency service.

Style:
- 2 to 6 short lines.
- Soft, warm, emotionally intelligent.
- No long essays.
- No clinical tone.
- No motivational hustle language.
`.trim();

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function includesAny(input, words) {
  return words.some((word) => input.includes(word));
}

function safetyGate(message) {
  const text = normalize(message);

  if (
    includesAny(text, [
      "kill myself",
      "suicide",
      "self harm",
      "hurt myself",
      "end my life",
      "don't want to live",
      "dont want to live",
    ])
  ) {
    return [
      "I’m really sorry this feels this heavy.",
      "",
      "Please reach out to someone you trust right now, or contact local emergency services if you might hurt yourself.",
      "",
      "You do not have to stay alone with this moment.",
    ].join("\n");
  }

  if (
    includesAny(text, [
      "severe pain",
      "unbearable pain",
      "fainted",
      "fainting",
      "can't breathe",
      "cant breathe",
      "chest pain",
      "fever",
      "vomiting",
      "very heavy bleeding",
      "unusual bleeding",
      "emergency",
    ])
  ) {
    return [
      "That sounds worrying, and I do not want to minimize it.",
      "",
      "I can stay with you softly, but severe, unusual, or frightening symptoms deserve help from a qualified medical professional or local emergency service.",
    ].join("\n");
  }

  if (
    includesAny(text, [
      "medicine",
      "medication",
      "tablet",
      "painkiller",
      "dose",
      "dosage",
      "which pill",
      "what pill",
      "ibuprofen",
      "paracetamol",
    ])
  ) {
    return [
      "I can’t recommend medicines or dosages.",
      "",
      "A doctor or pharmacist is the right person for that. I can help with breathing, warmth, quiet, and emotional comfort.",
    ].join("\n");
  }

  return null;
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, {
      error: "Method not allowed",
    });
  }

  if (!GEMINI_API_KEY) {
    return sendJson(res, 503, {
      error: "Mira Gemini API is not configured yet.",
      fallback: true,
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const message = String(body.message || "").slice(0, 1200);
    const mood = body.mood ? String(body.mood).slice(0, 80) : "unknown";
    const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-8) : [];

    if (!message.trim()) {
      return sendJson(res, 400, {
        error: "Message is required.",
      });
    }

    const gatedReply = safetyGate(message);

    if (gatedReply) {
      return sendJson(res, 200, {
        reply: gatedReply,
        source: "safety_gate",
      });
    }

    const recentThread = recentMessages
      .map((item) => {
        const role = item?.role === "assistant" ? "Mira" : "User";
        const text = String(item?.text || "").slice(0, 500);
        return `${role}: ${text}`;
      })
      .join("\n");

    const prompt = [
      `Current mood: ${mood}`,
      recentThread ? `Recent conversation:\n${recentThread}` : "",
      `User message:\n${message}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL,
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 320,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "Gemini request failed.";
      return sendJson(res, response.status, {
        error: message,
        fallback: true,
      });
    }

    const reply = extractGeminiText(data);

    if (!reply) {
      return sendJson(res, 502, {
        error: "Gemini returned an empty response.",
        fallback: true,
      });
    }

    return sendJson(res, 200, {
      reply,
      source: "gemini",
      model: GEMINI_MODEL,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown Mira API error.",
      fallback: true,
    });
  }
}
