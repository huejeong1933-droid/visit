export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  emoji: string;
  timestamp: string;
  likes?: number;
}

export interface GasApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  id?: string;
}

export type SortOrder = 'newest' | 'oldest';
