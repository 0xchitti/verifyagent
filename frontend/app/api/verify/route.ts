import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const criteria = formData.get('criteria') as string;

    if (!file || !criteria) {
      return NextResponse.json({ error: 'Missing file or criteria' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    
    // Simple AI analysis simulation for now
    // TODO: Replace with actual Claude API call
    const analysis = await analyzeWork(fileContent, criteria);
    
    // Generate verification certificate
    const certificate = {
      id: `verify_${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename: file.name,
      criteria,
      analysis,
      score: analysis.score,
      verified: analysis.score >= 0.7,
      signature: `${Date.now()}_${Math.random().toString(36)}`
    };

    return NextResponse.json({
      success: true,
      certificate,
      downloadUrl: `/api/certificate/${certificate.id}`
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

async function analyzeWork(content: string, criteria: string) {
  // Simulate AI analysis - replace with real AI call
  const words = content.split(' ').length;
  const hasCode = /function|class|import|export/.test(content);
  const hasComments = /\/\/|\/\*|\#/.test(content);
  
  let score = 0.5;
  let feedback = [];
  
  // Basic completeness check
  if (words > 100) {
    score += 0.2;
    feedback.push("Good length and detail");
  } else {
    feedback.push("Could be more detailed");
  }
  
  // Technical content check
  if (hasCode) {
    score += 0.15;
    feedback.push("Contains code implementation");
  }
  
  // Documentation check  
  if (hasComments) {
    score += 0.1;
    feedback.push("Well documented");
  }
  
  // Criteria relevance (simple keyword matching)
  const criteriaWords = criteria.toLowerCase().split(' ');
  const contentLower = content.toLowerCase();
  const matches = criteriaWords.filter(word => contentLower.includes(word)).length;
  const relevanceScore = Math.min(matches / criteriaWords.length, 0.3);
  score += relevanceScore;
  
  if (relevanceScore > 0.2) {
    feedback.push("Addresses specified criteria well");
  } else {
    feedback.push("Should better address the specified criteria");
  }
  
  return {
    score: Math.min(score, 1),
    feedback,
    completeness: words > 100 ? 'Pass' : 'Needs improvement',
    technical_quality: hasCode ? 'Good' : 'Basic',
    documentation: hasComments ? 'Good' : 'Minimal',
    criteria_adherence: relevanceScore > 0.2 ? 'Good' : 'Partial'
  };
}