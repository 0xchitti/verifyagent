import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { VERIFICATION_ORACLE_ABI, BASE_RPC_URL } from '../../../lib/web3';

// Mock contract address - replace with actual deployed address
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || 'your-oracle-private-key';

interface VerificationRequest {
  requestId: string;
  task: string;
  delivery: string;
  requester: string;
}

// In-memory store for pending verifications (use Redis/DB in production)
const pendingVerifications = new Map<string, VerificationRequest>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, task, delivery, requester } = body;

    if (!requestId || !task || !delivery) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store verification request for processing
    pendingVerifications.set(requestId, {
      requestId,
      task,
      delivery,
      requester
    });

    // Process verification asynchronously
    processVerification(requestId, task, delivery);

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Verification request received and processing'
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle webhook/polling for verification status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json(
      { error: 'Request ID required' },
      { status: 400 }
    );
  }

  try {
    // Check blockchain for verification status
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VERIFICATION_ORACLE_ABI, provider);
    
    const [score, reasoning, completed] = await contract.getVerification(requestId);

    return NextResponse.json({
      requestId,
      score: Number(score),
      reasoning,
      completed,
      success: true
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

async function processVerification(requestId: string, task: string, delivery: string) {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform AI evaluation
    const evaluation = await evaluateWithAI(task, delivery);

    // Post result to blockchain
    await postVerificationResult(requestId, evaluation.score, evaluation.reasoning);

    // Clean up pending verification
    pendingVerifications.delete(requestId);

  } catch (error) {
    console.error('Verification processing error:', error);
  }
}

async function evaluateWithAI(task: string, delivery: string): Promise<{ score: number; reasoning: string }> {
  // Mock AI evaluation - replace with actual AI service
  // This could be OpenAI GPT-4, Anthropic Claude, or a custom model
  
  const prompt = `
You are an AI quality evaluator. Analyze the following task and delivery:

TASK: ${task}

DELIVERY: ${delivery}

Provide a quality score from 0-100 and detailed reasoning. Consider:
- Completeness: Does the delivery fully address the task?
- Accuracy: Is the work correct and factual?
- Quality: Is it well-executed and professional?
- Requirements: Does it meet the specified criteria?

Respond with a JSON object: {"score": number, "reasoning": "detailed explanation"}
`;

  try {
    // Mock evaluation logic
    const taskWords = task.toLowerCase().split(' ');
    const deliveryWords = delivery.toLowerCase().split(' ');
    
    // Simple heuristic scoring
    let score = 50; // Base score
    
    // Check if delivery is substantially longer than task (good sign)
    if (delivery.length > task.length * 2) score += 20;
    
    // Check for common quality indicators
    if (delivery.includes('detailed') || delivery.includes('comprehensive')) score += 10;
    if (delivery.includes('example') || delivery.includes('specifically')) score += 10;
    if (delivery.length > 200) score += 10;
    if (delivery.length < 50) score -= 20;
    
    // Cap at 100
    score = Math.min(100, Math.max(0, score));
    
    const reasoning = `Evaluation completed based on task-delivery alignment analysis. 
    Task complexity: ${taskWords.length > 10 ? 'High' : 'Medium'}
    Delivery completeness: ${delivery.length > 200 ? 'Comprehensive' : 'Basic'}
    Quality indicators: ${score >= 80 ? 'Strong professional execution' : score >= 60 ? 'Good effort with room for improvement' : 'Needs significant improvement'}`;

    return { score, reasoning };

  } catch (error) {
    console.error('AI evaluation error:', error);
    return {
      score: 75,
      reasoning: 'Automated evaluation completed. Delivery appears to address the main task requirements.'
    };
  }
}

async function postVerificationResult(requestId: string, score: number, reasoning: string) {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VERIFICATION_ORACLE_ABI, wallet);

    const tx = await contract.postVerification(requestId, score, reasoning);
    await tx.wait();

    console.log(`Posted verification result for ${requestId}: ${score}/100`);

  } catch (error) {
    console.error('Failed to post verification result:', error);
    throw error;
  }
}