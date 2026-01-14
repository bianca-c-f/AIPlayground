import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let activeSelectors = ["#curious-button", "#submit-button", "#input-field"];
    if (!input.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const systemPrompt = `
    System prompt
You are a UI automation controller that translates natural-language instructions into a deterministic, UI-safe plan expressed as a JSON payload. Do not execute actions yourself. Your outputs must be executable commands represented as JSON in the following format:

{
  "actions": [
    {
      "actionType": "ADD" | "DELETE",
      "type": ""  // optional: one of a, b, c, d
    }
  ]
}

Rules and constraints:


Allowed task types: a, b, c, d.

Ordering constraints (for added tasks only):

A task of type "b" may only follow a task of type "a" (i.e., there must exist an earlier "a" before a "b" in the sequence).

A task of type "c" may only follow a task of type "d" (i.e., there must exist an earlier "d" before a "c" in the sequence).

If the current plan already contains neither a nor d in a way that would satisfy the constraint return empty command.

If a not allowed task  taskntains neither a nor d in a way that would satisfy the constraint return empty command.



Deletions may target any of the four types (a, b, c, d).

Instructions that cannot be satisfied without violating constraints should produce a brief clarification request rather than an invalid plan.

Output only the JSON payload. Do not include any commentary, rationale, or extraneous text.

Prompt usage note:


The UI will supply the current workflow state when relevant. If needed, you may reference the existing tasks to determine valid adds/deletes, but your JSON must remain a simple actions array with no implicit side effects.

If you need to add multiple actions to satisfy a user instruction, you may include multiple items in the actions array, preserving the order that satisfies the constraints.

User instruction: ${input}
Optional refinements (choose one or both if you want):


If you want to allow a and d to be created on-demand to enable subsequent b or c, add a clarifying rule in the prompt that explicit predecessor creation is allowed within the same batch.

If your DSL expects type hints for the added task, you can include "type": "" in the ADD actions.

If you’d like, I can tailor this to your exact DSL nuances (e.g., whether taskName is optional, whether you allow multiple ADDs in one batch, or if you want more fields like config).
  `;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      console.error("Full error:", err);
      if (err.message.includes("quota") || err.message.includes("429")) {
        setError(
          "API Quota exceeded. Please wait a moment and try again, or check your API key billing/quota limits at https://ai.google.dev/gemini-api/docs/rate-limits",
        );
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Gemini AI Chat</h1>

      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt here..."
            rows="4"
            className="text-input"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Generating..." : "Send to Gemini"}
        </button>
        <button
          className="submit-button"
          disabled={loading}
          id={"curious-button"}
        >
          {loading ? "Generating..." : "I am curious about Gemini"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {response && (
        <div className="response-container">
          <h2>Response:</h2>
          <div className="response-text">{response}</div>
        </div>
      )}
    </div>
  );
}

export default App;
