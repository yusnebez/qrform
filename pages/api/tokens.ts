import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const TOKENS_PATH = path.join(process.cwd(), 'pages', 'api', 'tokens.json');
const EXPIRATION_DAYS = 14;

function loadTokens() {
  if (!fs.existsSync(TOKENS_PATH)) return { tokens: [], adminToken: '' };
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
}

function saveTokens(data: any) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(data, null, 2));
}

function purgeExpired(tokens: any[]) {
  const now = Date.now();
  return tokens.filter(t => !t.used && (now - t.created < EXPIRATION_DAYS * 86400000));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let { tokens, adminToken } = loadTokens();
  let changed = false;

  // Purge expired tokens on every call
  const validTokens = purgeExpired(tokens);
  if (validTokens.length !== tokens.length) {
    tokens = validTokens;
    saveTokens({ tokens, adminToken });
    changed = true;
  }

  if (req.method === 'GET') {
    // Validate a token
    const { token } = req.query;
    if (!token || typeof token !== 'string') return res.status(400).json({ valid: false });
    if (token === adminToken) return res.status(200).json({ valid: true, admin: true });
    const found = tokens.find(t => t.token === token && !t.used);
    return res.status(200).json({ valid: !!found, admin: false });
  }

  if (req.method === 'POST') {
    // Mark token as used
    const { token } = req.body;
    if (!token || typeof token !== 'string') return res.status(400).json({ success: false });
    if (token === adminToken) return res.status(200).json({ success: true });
    const idx = tokens.findIndex(t => t.token === token && !t.used);
    if (idx === -1) return res.status(404).json({ success: false });
    tokens[idx].used = true;
    saveTokens({ tokens, adminToken });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    // Generate tokens
    const { count } = req.body;
    if (!count || typeof count !== 'number' || count < 1) return res.status(400).json({ tokens: [] });
    const newTokens = Array.from({ length: count }, () => ({ token: crypto.randomUUID(), created: Date.now(), used: false }));
    tokens = [...tokens, ...newTokens];
    saveTokens({ tokens, adminToken });
    return res.status(200).json({ tokens: newTokens.map(t => t.token) });
  }

  return res.status(405).end();
}
