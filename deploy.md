# VerifyAgent Deployment Guide

## Smart Contract Deployment

### Base Network
```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast --verify
```

### Environment Variables Needed
```bash
PRIVATE_KEY=your-deployer-private-key
ETHERSCAN_API_KEY=your-basescan-api-key
ORACLE_PRIVATE_KEY=oracle-wallet-private-key
```

## Frontend Deployment

### Vercel Deployment
```bash
cd frontend
vercel --prod
```

### Environment Variables for Vercel
```bash
ORACLE_PRIVATE_KEY=oracle-wallet-private-key
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed-contract-address
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Contract Setup

1. Deploy VerificationOracle.sol to Base
2. Fund oracle wallet with ETH for gas
3. Update CONTRACT_ADDRESS in frontend
4. Add oracle address as authorized verifier

## Testing

1. Connect MetaMask to Base network
2. Get testnet ETH/USDC from faucets
3. Test verification flow
4. Verify Uniswap swaps work correctly

## Production Checklist

- [ ] Contract deployed to Base mainnet
- [ ] Oracle wallet funded and authorized
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Payment tokens (ETH/USDC/DAI) tested
- [ ] Uniswap integration verified
- [ ] AI evaluation pipeline working
- [ ] Certificate generation functional