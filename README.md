# VerifyAgent - AI Verification Oracle for Agent Economy

**The oracle that tells you if the work was done right.**

## What It Is

An AI-powered verification oracle on Base. Any smart contract or agent can submit a task+delivery pair. The oracle evaluates quality and posts an onchain verdict (pass/fail + score + reasoning). Escrow contracts read the verdict to release or refund payment.

## Why It Matters

Everyone built payment rails (x402) and escrow systems. Nobody built the brain that decides if the work was actually good. Verification is the only part that REQUIRES intelligence. That's the gap.

## Revenue Model

x402 fee per verification call ($0.01-0.05)

## Architecture

- **Smart Contract**: VerificationOracle.sol on Base
- **API Server**: AI evaluation + onchain verdict posting
- **Frontend**: Demo interface for agent-to-agent verification
- **Integrations**: SelfProtocol, Uniswap API, x402 payments

## Build Progress

- [x] Project setup
- [ ] Smart contract development
- [ ] API server implementation
- [ ] Frontend demo
- [ ] SelfProtocol integration
- [ ] Documentation & submission

Built for The Synthesis Hackathon 2026