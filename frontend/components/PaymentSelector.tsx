"use client";

import { useState, useEffect } from 'react';
import { SUPPORTED_TOKENS, web3Service, PaymentToken } from '../lib/web3';

interface PaymentSelectorProps {
  onTokenSelect: (token: PaymentToken) => void;
  selectedToken: PaymentToken;
  userAddress?: string;
  contractAddress: string;
}

export default function PaymentSelector({ 
  onTokenSelect, 
  selectedToken, 
  userAddress,
  contractAddress 
}: PaymentSelectorProps) {
  const [balances, setBalances] = useState<{ [address: string]: string }>({});
  const [fees, setFees] = useState<{ [address: string]: string }>({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userAddress && contractAddress) {
      loadBalancesAndFees();
    }
  }, [userAddress, contractAddress]);
  
  const loadBalancesAndFees = async () => {
    setLoading(true);
    const newBalances: { [address: string]: string } = {};
    const newFees: { [address: string]: string } = {};
    
    try {
      // Load balances and fees for all supported tokens
      await Promise.all(
        SUPPORTED_TOKENS.map(async (token) => {
          try {
            if (userAddress) {
              const balance = await web3Service.getTokenBalance(token.address, userAddress);
              newBalances[token.address] = balance;
            }
            
            const fee = await web3Service.getRequiredFee(contractAddress, token.address);
            newFees[token.address] = fee;
          } catch (error) {
            console.error(`Error loading data for ${token.symbol}:`, error);
            newBalances[token.address] = '0';
            newFees[token.address] = '0';
          }
        })
      );
      
      setBalances(newBalances);
      setFees(newFees);
    } catch (error) {
      console.error('Error loading balances and fees:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals);
  };
  
  const hasEnoughBalance = (token: PaymentToken) => {
    const balance = parseFloat(balances[token.address] || '0');
    const fee = parseFloat(fees[token.address] || '0');
    return balance >= fee;
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Payment Method</h3>
        {loading && (
          <div className="text-xs text-gray-400">Loading...</div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {SUPPORTED_TOKENS.map((token) => {
          const isSelected = selectedToken.address === token.address;
          const balance = balances[token.address];
          const fee = fees[token.address];
          const hasEnough = hasEnoughBalance(token);
          
          return (
            <button
              key={token.address}
              onClick={() => onTokenSelect(token)}
              disabled={!hasEnough && userAddress}
              className={`
                relative p-3 rounded-lg border transition-all
                ${isSelected 
                  ? 'border-green-400 bg-green-400/10' 
                  : 'border-gray-700 hover:border-gray-600'
                }
                ${!hasEnough && userAddress 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                disabled:hover:border-gray-700
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{token.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-white">{token.symbol}</div>
                    {fee && (
                      <div className="text-xs text-gray-400">
                        Fee: {formatBalance(fee)} {token.symbol}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {balance && (
                    <div className={`text-sm ${
                      hasEnough ? 'text-gray-300' : 'text-red-400'
                    }`}>
                      {formatBalance(balance)} {token.symbol}
                    </div>
                  )}
                  {!hasEnough && userAddress && (
                    <div className="text-xs text-red-400">Insufficient</div>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 rounded-lg border border-green-400 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
      
      {!userAddress && (
        <div className="text-xs text-gray-500 text-center">
          Connect wallet to see balances
        </div>
      )}
      
      <div className="text-xs text-gray-400">
        <div>• ETH: Direct payment, fast processing</div>
        <div>• USDC/DAI: Automatically swapped to ETH via Uniswap</div>
        <div>• All payments secure with on-chain verification</div>
      </div>
    </div>
  );
}