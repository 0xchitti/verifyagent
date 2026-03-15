"use client";

import { useState } from 'react';
import { ArrowRight, Upload, Download } from 'lucide-react';

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !criteria) return;

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('criteria', criteria);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({ error: 'Verification failed. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadCertificate = (certificateId: string) => {
    window.location.href = `/api/certificate/${certificateId}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ cursor: 'default' }}>
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-slate-900 flex items-center justify-center text-xs font-mono text-white">
                  V
                </div>
                <span className="text-lg font-medium tracking-tight">VerifyAgent</span>
              </a>
            </div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              Verification Interface
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-4">AI Work Verification</h1>
          <p className="text-lg text-slate-600">Submit your work for AI analysis and cryptographic verification</p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-4">
                Upload Work Deliverable
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.md,.js,.py,.html,.css,.json"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  {file ? (
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-600">Click to upload file</p>
                      <p className="text-sm text-slate-500">Supports: TXT, MD, JS, PY, HTML, CSS, JSON</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Criteria */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-4">
                Verification Criteria
              </label>
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Describe what makes this work successful. What should the AI look for when verifying quality and completeness?"
                className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!file || !criteria || isAnalyzing}
              className="w-full h-12 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Start Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Results */}
        {result && !result.error && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">✓ Verification Complete</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-green-700 mb-1">Overall Score</p>
                  <p className="text-2xl font-bold text-green-900">{(result.certificate.score * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-1">Status</p>
                  <p className="text-lg font-semibold text-green-900">
                    {result.certificate.verified ? 'VERIFIED' : 'NEEDS IMPROVEMENT'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Analysis Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Completeness</span>
                  <span className="font-medium">{result.certificate.analysis.completeness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Technical Quality</span>
                  <span className="font-medium">{result.certificate.analysis.technical_quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Documentation</span>
                  <span className="font-medium">{result.certificate.analysis.documentation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Criteria Adherence</span>
                  <span className="font-medium">{result.certificate.analysis.criteria_adherence}</span>
                </div>
              </div>

              {result.certificate.analysis.feedback && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-2">Feedback</h4>
                  <ul className="space-y-1">
                    {result.certificate.analysis.feedback.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-slate-600">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => downloadCertificate(result.certificate.id)}
                className="flex-1 h-12 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate</span>
              </button>
              <button
                onClick={() => { setResult(null); setFile(null); setCriteria(''); }}
                className="h-12 px-6 border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
              >
                Verify Another
              </button>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Verification Failed</h2>
            <p className="text-red-700">{result.error}</p>
            <button
              onClick={() => setResult(null)}
              className="mt-4 h-10 px-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}