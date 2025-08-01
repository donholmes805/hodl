
import { Coin, CoinDetail, Quote } from '../types';

const API_BASE_URL = 'https://api.coinpaprika.com/v1';

export async function getActiveCoins(limit: number = 50): Promise<Coin[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/coins`);
    if (!response.ok) {
      throw new Error(`CoinPaprika API Error: ${response.statusText}`);
    }
    const coins: Coin[] = await response.json();
    // Filter for active coins that are not new, and take a slice.
    return coins.filter(c => c.is_active && c.type === 'coin').slice(0, limit);
  } catch (error) {
    console.error("Error fetching active coins:", error);
    throw error;
  }
}

export async function getCoinDetails(coinId: string): Promise<CoinDetail> {
  try {
    const [detailResponse, tickerResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/coins/${coinId}`),
      fetch(`${API_BASE_URL}/tickers/${coinId}`)
    ]);

    if (!detailResponse.ok) {
      throw new Error(`CoinPaprika API Error for ${coinId} details: ${detailResponse.statusText}`);
    }
     if (!tickerResponse.ok) {
      // Don't fail if ticker fails, just return without it
      console.warn(`Could not fetch ticker for ${coinId}`);
      return await detailResponse.json();
    }
    
    const detail: CoinDetail = await detailResponse.json();
    const ticker: Quote = await tickerResponse.json();
    
    // Combine the results
    detail.quotes = ticker;

    return detail;
  } catch (error) {
    console.error(`Error fetching coin details for ${coinId}:`, error);
    throw error;
  }
}