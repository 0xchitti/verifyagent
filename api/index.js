import express from "express";
import { evaluate } from "./evaluate.js";
import { getContractInfo, submitVerdictOnchain, getRequestFromChain, getStatsFromChain } from "./chain.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3402;

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
  });
});

app.get("/stats", async (req, res) => {
  try {
    const stats = await getStatsFromChain();
    res.json(stats);
  } catch (e) {
    res.json({
      totalVerifications: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalFeesCollected: "0",
      oracleVerified: false,
      note: "Contract not yet deployed or chain unavailable",
    });
  }
});

app.get("/verdict/:requestId", async (req, res) => {
  try {
    const data = await getRequestFromChain(parseInt(req.params.requestId));
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: "Request not found or chain unavailable" });
  }
});

// === PAID ENDPOINT ===

app.post("/verify", async (req, res) => {
  const { task, delivery, taskHash, deliveryHash, requestId } = req.body || {};

  if (!task || !delivery) {
    return res.status(400).json({
      error: "Missing 'task' and 'delivery' in request body",
      example: {
        task: "Scrape example.com and return the page title",
        delivery: "The page title is 'Example Domain'",
        requestId: 0, // optional: onchain request ID to auto-submit verdict
      },
    });
  }

  try {
    // AI evaluation
    const result = await evaluate(task, delivery);

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

app.listen(PORT, () => {
  console.log(`🔍 VerifyAgent v0.1.0 | port ${PORT}`);
});
