
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const coinId = req.query.coinId as string || req.body.coinId as string;

  if (!coinId) {
    return res.status(400).json({ error: 'coinId is required' });
  }

  // Use a hash in KV to store both hodl and dump counts for a coin
  const key = `votes:${coinId}`;

  if (req.method === 'POST') {
    const { decision } = req.body;
    if (decision !== 'HODL' && decision !== 'DUMP') {
      return res.status(400).json({ error: 'Decision must be HODL or DUMP' });
    }

    try {
      const fieldToIncrement = decision === 'HODL' ? 'hodl' : 'dump';
      // Atomically increment the count for the given decision
      await kv.hincrby(key, fieldToIncrement, 1);
      
      // Return the new counts
      const newCounts = await kv.hgetall(key);
      return res.status(200).json({
        hodl: Number(newCounts?.hodl || 0),
        dump: Number(newCounts?.dump || 0),
      });

    } catch (error) {
      console.error('VOTES_API_POST_ERROR', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        body: req.body,
      });
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ETIMEDOUT'))) {
           return res.status(503).json({ error: 'Database connection error. The service may be temporarily unavailable.' });
      }
      return res.status(500).json({ error: 'Failed to record vote. Please check server logs (ID: VOTES_API_POST_ERROR).' });
    }

  } else if (req.method === 'GET') {
    try {
      const counts = await kv.hgetall(key);
      return res.status(200).json({
        hodl: Number(counts?.hodl || 0),
        dump: Number(counts?.dump || 0),
      });
    } catch (error) {
      console.error('VOTES_API_GET_ERROR', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        query: req.query,
      });
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ETIMEDOUT'))) {
           return res.status(503).json({ error: 'Database connection error. The service may be temporarily unavailable.' });
      }
      return res.status(500).json({ error: 'Failed to retrieve votes. Please check server logs (ID: VOTES_API_GET_ERROR).' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}