import { ethers } from "ethers";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Config from environment
const RPC_URL = process.env.CELO_RPC || "https://forno.celo.org";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "";

let provider, wallet, contract, abi;

function getABI() {
  if (!abi) {
    try {
      const artifact = JSON.parse(
        readFileSync(join(__dirname, "../out/VerificationOracle.sol/VerificationOracle.json"), "utf8")
      );
      abi = artifact.abi;
    } catch {
      abi = [];
    }
  }
  return abi;
}

function getContract() {
  if (!contract && CONTRACT_ADDRESS && ORACLE_PRIVATE_KEY) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, getABI(), wallet);
  }
  return contract;
}

export function getContractInfo() {
  return {
    address: CONTRACT_ADDRESS || null,
    oracle: ORACLE_PRIVATE_KEY ? new ethers.Wallet(ORACLE_PRIVATE_KEY).address : null,
    chain: "Celo",
    rpc: RPC_URL,
  };
}

export async function submitVerdictOnchain(requestId, result) {
  const c = getContract();
  if (!c) throw new Error("Contract not configured");

  const verdictMap = { Pass: 1, Fail: 2, Partial: 3 };
  const verdictEnum = verdictMap[result.verdict] || 3;

  const tx = await c.submitVerdict(
    requestId,
    verdictEnum,
    result.qualityScore,
    result.reasoning.slice(0, 500) // limit onchain storage
  );
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getRequestFromChain(requestId) {
  const c = getContract();
  if (!c) throw new Error("Contract not configured");

  const req = await c.getRequest(requestId);
  const verdictNames = ["Pending", "Pass", "Fail", "Partial"];

  return {
    requestId,
    requester: req.requester,
    taskHash: req.taskHash,
    deliveryHash: req.deliveryHash,
    verdict: verdictNames[Number(req.verdict)] || "Unknown",
    qualityScore: Number(req.qualityScore),
    reasoning: req.reasoning,
    fee: ethers.formatUnits(req.fee, 6),
    createdAt: new Date(Number(req.createdAt) * 1000).toISOString(),
    resolvedAt: Number(req.resolvedAt) > 0
      ? new Date(Number(req.resolvedAt) * 1000).toISOString()
      : null,
  };
}

export async function getStatsFromChain() {
  const c = getContract();
  if (!c) throw new Error("Contract not configured");

  const [total, passed, failed, fees, verified] = await c.getStats();
  return {
    totalVerifications: Number(total),
    totalPassed: Number(passed),
    totalFailed: Number(failed),
    totalFeesCollected: ethers.formatUnits(fees, 6) + " USDC",
    oracleVerified: verified,
  };
}
