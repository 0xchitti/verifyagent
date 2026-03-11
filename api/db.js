/**
 * Simple in-memory database for demo/serverless deployment.
 * For production, replace with SQLite or PostgreSQL.
 */

const agents = new Map();
const requests = [];
let stats = {
  totalVerifications: 0,
  totalPassed: 0,
  totalFailed: 0,
  totalFeesCollected: 0,
};

export async function initDB() {
  // In-memory, nothing to init
}

export function getStats() {
  return {
    ...stats,
    totalAgents: agents.size,
    totalRequests: requests.length,
  };
}

export function addRequest(req) {
  const id = requests.length;
  requests.push({ ...req, id, createdAt: new Date().toISOString() });
  return id;
}

export function getRequest(id) {
  return requests[id] || null;
}

export function updateRequest(id, updates) {
  if (requests[id]) {
    Object.assign(requests[id], updates);
  }
}

export function updateStats(verdict) {
  stats.totalVerifications++;
  if (verdict === "Pass") stats.totalPassed++;
  if (verdict === "Fail") stats.totalFailed++;
}
