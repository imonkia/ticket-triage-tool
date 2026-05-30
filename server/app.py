import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "*").split(","))

client = Anthropic()

TRIAGE_PROMPT = """You are a support ticket triage assistant. Analyze the following customer support transcript.

Return ONLY a valid JSON object with exactly these fields:
- "category": one of "billing", "technical", "account", "bug_report", "feature_request", "general"
- "severity": one of "low", "medium", "high", "critical"
- "suggested_response": a concise, empathetic reply to send to the customer (2-4 sentences)

No extra text, no markdown fences — raw JSON only.

Transcript:
{transcript}"""


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/triage", methods=["POST"])
def triage():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "invalid JSON body"}), 400

    transcript = (data.get("transcript") or "").strip()
    if not transcript:
        return jsonify({"error": "transcript is required"}), 400

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": TRIAGE_PROMPT.format(transcript=transcript)}
        ],
    )

    raw = message.content[0].text.strip()
    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    result = json.loads(raw)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
