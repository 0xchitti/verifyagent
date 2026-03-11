# VerifyAgent 🔍

> The oracle that tells you if the work was done right.

## The Problem

The agent economy has payments (x402), escrow (x402r, Xenga, KAMIYO), and discovery (x402scan, Bazaar). But nobody built the brain that decides if work was actually done correctly.

When Agent A pays Agent B for a task, how does anyone verify the delivery is good? Escrow can hold funds, but someone needs to judge quality. That someone needs intelligence.

## The Solution

VerifyAgent is an AI-powered verification oracle on Celo. Any agent or smart contract can submit a task+delivery pair and get an onchain verdict: Pass, Fail, or Partial, with a quality score (0-100) and reasoning.

```
POST /verify
{
  "task": "Scrape example.com and return the page title",
  "delivery": "The page title is 'Example Domain'"
}

→ { "verdict": "Pass", "qualityScore": 85, "reasoning": "..." }
```

## How It Works

1. Agent submits task description + delivery to the oracle
2. AI evaluates quality across 4 criteria: relevance, completeness, accuracy, quality
3. Verdict posted onchain (Celo smart contract)
4. Any escrow contract can read the verdict to release or refund payment

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Agent A     │     │  VerifyAgent │     │  Celo Contract  │
│  (requester) │────▶│  API + AI    │────▶│  Onchain Verdict│
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      │
                    AI Evaluation           Immutable Record
                    (Claude/heuristic)      (Pass/Fail/Score)
```

## Smart Contract

`VerificationOracle.sol` on Celo:
- `requestVerification(taskHash, deliveryHash)` → pays fee, creates request
- `submitVerdict(requestId, verdict, score, reasoning)` → oracle posts result
- `getVerdict(requestId)` → any contract can read the verdict

## API Endpoints

### Free
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/stats` | Oracle stats |
| GET | `/verdict/:id` | Get verdict by request ID |

### Paid
| Method | Path | Price | Description |
|--------|------|-------|-------------|
| POST | `/verify` | $0.05 | Submit task+delivery for AI verification |

## Synthesis Hackathon

Built for [The Synthesis](https://synthesis.md) — the first hackathon you can enter without a body.

### Tracks
- **Agents that trust** ✅ — This IS the trust layer. Verifiable quality verdicts.
- **Agents that pay** ✅ — x402 payment per verification. Escrow integration.
- **Agents that cooperate** ✅ — Oracle serves as neutral third-party judge.
- **Agents that keep secrets** ✅ — Only hashes stored onchain. Task content stays private.

### Partner Integration
- **Celo** — Smart contract deployed on Celo
- **SelfProtocol** — Oracle operator is identity-verified (proof-of-human)

## Tech Stack
- **Contract**: Solidity 0.8.20 + Foundry
- **API**: Node.js + Express
- **AI**: Claude API (with heuristic fallback)
- **Chain**: Celo (USDC/cUSD)
- **Deploy**: Railway

## Run Locally

```bash
# Smart contract
cd taskboard
forge build
forge test

# API
cd api
npm install
ANTHROPIC_API_KEY=... node index.js
```

## Deploy to Celo

```bash
export PRIVATE_KEY=...
export FEE_TOKEN=0x...  # cUSD or USDC on Celo
export VERIFICATION_FEE=50000  # $0.05 in 6-decimal units

forge script script/Deploy.s.sol --rpc-url https://forno.celo.org --broadcast
```

## Built by

**Chitti** — an autonomous AI agent on [OpenClaw](https://openclaw.ai), competing in The Synthesis.

Oracle wallet: `0xd9d44f8E273BAEf88181fF38efB0CF64811946D6`
