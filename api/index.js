import express from "express";
import { evaluate } from "./evaluate.js";
import { getContractInfo, submitVerdictOnchain, getRequestFromChain, getStatsFromChain } from "./chain.js";
import { initDB, getStats as getMemStats, addRequest, getRequest, updateRequest, updateStats } from "./db.js";

const app = express();
app.use(express.json());

// CORS for demo
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const PORT = process.env.PORT || 3402;

await initDB();

// === FREE ENDPOINTS ===

app.get("/", (req, res) => {
  const contract = getContractInfo();
  res.json({
    name: "VerifyAgent",
    tagline: "The oracle that tells you if the work was done right.",
    version: "0.1.0",
    chain: "Celo",
    contract: contract.address || "pending deployment",
    oracle: contract.oracle || "pending",
    oracleVerified: false, // Will be true after SelfProtocol verification
    endpoints: {
      free: [
        { method: "GET", path: "/", description: "Service info" },
        { method: "GET", path: "/stats", description: "Oracle stats" },
        { method: "GET", path: "/verdict/:requestId", description: "Get verdict by request ID" },
      ],
      paid: [
        {
          method: "POST",
          path: "/verify",
          price: "$0.05",
          description: "Submit task+delivery for AI verification. Returns quality verdict.",
        },
      ],
    },
    synthesis: {
      hackathon: "The Synthesis 2026",
      tracks: ["Agents that trust", "Agents that pay", "Agents that cooperate"],
      partners: ["Celo", "SelfProtocol"],
    },
  });
});

app.get("/stats", async (req, res) => {
  // Try onchain stats first, fall back to in-memory
  try {
    const stats = await getStatsFromChain();
    res.json(stats);
  } catch {
    res.json(getMemStats());
  }
});

app.get("/verdict/:requestId", async (req, res) => {
  const id = parseInt(req.params.requestId);

  // Try onchain first
  try {
    const data = await getRequestFromChain(id);
    return res.json(data);
  } catch {
    // Fall back to in-memory
    const req_data = getRequest(id);
    if (!req_data) return res.status(404).json({ error: "Request not found" });
    return res.json(req_data);
  }
});

// === VERIFICATION ENDPOINT ===

app.post("/verify", async (req, res) => {
  const { task, delivery, requestId } = req.body || {};

  if (!task || !delivery) {
    return res.status(400).json({
      error: "Missing 'task' and 'delivery' in request body",
      example: {
        task: "Scrape example.com and return the page title",
        delivery: "The page title is 'Example Domain'",
        requestId: 0,
      },
    });
  }

  try {
    // AI evaluation
    const result = await evaluate(task, delivery);

    // Store in memory
    const memId = addRequest({
      task: task.slice(0, 500),
      delivery: delivery.slice(0, 500),
      verdict: result.verdict,
      qualityScore: result.qualityScore,
      reasoning: result.reasoning,
    });
    updateStats(result.verdict);

    // If requestId provided, submit verdict onchain
    let txHash = null;
    if (requestId !== undefined && requestId !== null) {
      try {
        txHash = await submitVerdictOnchain(requestId, result);
      } catch (e) {
        console.error("Onchain submission failed:", e.message);
      }
    }

    res.json({
      id: memId,
      verdict: result.verdict,
      qualityScore: result.qualityScore,
      reasoning: result.reasoning,
      details: result.details,
      onchain: txHash ? { txHash, requestId } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Evaluation error:", e);
    res.status(500).json({ error: "Evaluation failed", message: e.message });
  }
});

// Start server (skip in serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🔍 VerifyAgent v0.1.0 | port ${PORT}`);
  });
}

export default app;
