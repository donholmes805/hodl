export interface Coin {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: string;
}

export interface UsdQuote {
    price: number;
    volume_24h: number;
    volume_24h_change_24h: number;
    market_cap: number;
    market_cap_change_24h: number;
    percent_change_15m: number;
    percent_change_30m: number;
    percent_change_1h: number;
    percent_change_6h: number;
    percent_change_12h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_1y: number;
    ath_price: number;
    ath_date: string;
    percent_from_price_ath: number;
}

export interface Quote {
    USD: UsdQuote;
}

export interface VoteStats {
  hodl: number;
  dump: number;
}

export interface CoinDetail extends Coin {
    description: string;
    logo: string; // URL to logo
    tags: { id: string; name:string; }[];
    whitepaper: { link: string };
    links: {
        website: string[];
    };
    quotes?: Quote;
    voteStats?: VoteStats;
    highlightedUntil?: number;
}

export interface GeminiAnalysis {
  bullCase: string;
  bearCase: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  paidTier: boolean;
  has2FA: boolean;
  isAdmin?: boolean;
  pass_DUMMY_DO_NOT_USE_IN_PROD?: string;
}

export interface HodlDumpDecision {
  coin: CoinDetail;
  decision: 'HODL' | 'DUMP';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}