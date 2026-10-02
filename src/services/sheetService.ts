import { GuestbookEntry, GasApiResponse } from '../types.ts';

const STORAGE_KEY_API_URL = 'sheet_guestbook_gas_url';
const STORAGE_KEY_DEMO_ENTRIES = 'sheet_guestbook_demo_entries';
const STORAGE_KEY_LIKES = 'sheet_guestbook_liked_ids';

const INITIAL_DEMO_ENTRIES: GuestbookEntry[] = [
  {
    id: 'demo-1',
    name: '민우',
    message: '오늘 하루도 수고 많으셨어요! 작은 발걸음이 모여 큰 꿈을 만듭니다. 언제나 응원해요 💪✨',
    emoji: '🔥',
    timestamp: '2026-10-01 19:40:12',
    likes: 8,
  },
  {
    id: 'demo-2',
    name: '초록별',
    message: '새로운 도전을 시작하는 모든 분들 파이팅! 행복 가득한 일만 생기길 바라요 🍀',
    emoji: '🍀',
    timestamp: '2026-10-01 17:15:30',
    likes: 12,
  },
  {
    id: 'demo-3',
    name: '코딩하는 고양이',
    message: '구글 스프레드시트로 이렇게 편리한 방명록을 만들 수 있다니 정말 신기하네요! 최고입니다 👍',
    emoji: '💻',
    timestamp: '2026-10-01 14:02:18',
    likes: 5,
  },
  {
    id: 'demo-4',
    name: '다정한 봄',
    message: '지치고 힘들 땐 따뜻한 차 한 잔 마시며 쉬어가세요. 당신은 소중한 사람입니다 ☕️🌸',
    emoji: '🌸',
    timestamp: '2026-10-01 10:20:00',
    likes: 14,
  },
];

export function getStoredApiUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_URL) || '';
}

export function setStoredApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
  }
}

export function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKES);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function toggleLike(id: string): boolean {
  const current = getLikedIds();
  const isLiked = current.has(id);
  if (isLiked) {
    current.delete(id);
  } else {
    current.add(id);
  }
  localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(Array.from(current)));
  return !isLiked;
}

export function getDemoEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEMO_ENTRIES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  localStorage.setItem(STORAGE_KEY_DEMO_ENTRIES, JSON.stringify(INITIAL_DEMO_ENTRIES));
  return INITIAL_DEMO_ENTRIES;
}

export function saveDemoEntries(entries: GuestbookEntry[]): void {
  localStorage.setItem(STORAGE_KEY_DEMO_ENTRIES, JSON.stringify(entries));
}

export function resetDemoEntries(): GuestbookEntry[] {
  localStorage.setItem(STORAGE_KEY_DEMO_ENTRIES, JSON.stringify(INITIAL_DEMO_ENTRIES));
  return INITIAL_DEMO_ENTRIES;
}

/**
 * 구글 앱스 스크립트 웹앱 API 유효성 검사 및 테스트
 */
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; count?: number }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { success: false, message: 'URL을 입력해주세요.' };
  }
  if (!trimmed.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: '올바른 구글 앱스 스크립트 웹앱 URL 형식이 아닙니다. (https://script.google.com/macros/s/.../exec)',
    };
  }

  try {
    // GET 테스트
    const response = await fetch(trimmed, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok && response.type !== 'opaque') {
      return {
        success: false,
        message: `HTTP 상태 오류: ${response.status} ${response.statusText}`,
      };
    }

    const json = (await response.json()) as GasApiResponse<GuestbookEntry[]>;

    if (json.status === 'success') {
      const count = Array.isArray(json.data) ? json.data.length : 0;
      return {
        success: true,
        message: `연결 성공! 구글 시트에서 ${count}개의 방명록 데이터를 정상적으로 확인했습니다.`,
        count,
      };
    } else {
      return {
        success: false,
        message: json.message || 'Apps Script에서 에러가 반환되었습니다. 코드를 확인해주세요.',
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      return {
        success: false,
        message: '연결 실패: 웹앱 배포 시 [액세스 권한: 모든 사용자(Anyone)]으로 설정했는지 확인해주세요.',
      };
    }
    return {
      success: false,
      message: `연결 테스트 중 오류 발생: ${errorMsg}`,
    };
  }
}

/**
 * 방명록 목록 불러오기
 */
export async function fetchEntries(): Promise<{ entries: GuestbookEntry[]; isLive: boolean }> {
  const apiUrl = getStoredApiUrl();

  // 연동된 URL이 없으면 데모 데이터 반환
  if (!apiUrl) {
    const demo = getDemoEntries();
    return { entries: demo, isLive: false };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`서버 응답 오류 (상태코드: ${res.status})`);
    }

    const json = (await res.json()) as GasApiResponse<GuestbookEntry[]>;

    if (json.status === 'success' && Array.isArray(json.data)) {
      return { entries: json.data, isLive: true };
    } else {
      throw new Error(json.message || '데이터 형식 오류');
    }
  } catch (error) {
    console.error('Failed to fetch from Google Sheets API:', error);
    throw error;
  }
}

/**
 * 새 방명록 글 등록하기
 */
export async function postEntry(entryData: {
  name: string;
  message: string;
  emoji: string;
}): Promise<{ entry: GuestbookEntry; isLive: boolean }> {
  const apiUrl = getStoredApiUrl();

  // 연동된 URL이 없을 경우 데모 로컬스토리지에 저장
  if (!apiUrl) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newEntry: GuestbookEntry = {
      id: `demo-${Date.now()}`,
      name: entryData.name.trim() || '익명',
      message: entryData.message.trim(),
      emoji: entryData.emoji || '🍀',
      timestamp,
      likes: 0,
    };

    const current = getDemoEntries();
    const updated = [newEntry, ...current];
    saveDemoEntries(updated);

    // 약간의 현실감 있는 네트워크 딜레이(350ms) 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 350));

    return { entry: newEntry, isLive: false };
  }

  // 실시간 구글 시트로 POST 요청
  try {
    // Google Apps Script는 text/plain으로 보내면 CORS 사전 요청(preflight) 없이 redirect를 따라가며 본문을 전달할 수 있습니다.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        name: entryData.name.trim() || '익명',
        message: entryData.message.trim(),
        emoji: entryData.emoji || '🍀',
      }),
      redirect: 'follow',
    });

    let resultData: GuestbookEntry | null = null;
    try {
      const json = (await response.json()) as GasApiResponse<GuestbookEntry>;
      if (json.status === 'success' && json.data) {
        resultData = json.data;
      }
    } catch {
      // JSON 파싱 실패시 (구글 보안 리디렉션 이슈 등으로 결과가 text일 때)
    }

    if (!resultData) {
      // 안전한 fallback 객체 생성
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      resultData = {
        id: `entry-${Date.now()}`,
        name: entryData.name.trim() || '익명',
        message: entryData.message.trim(),
        emoji: entryData.emoji || '🍀',
        timestamp,
      };
    }

    return { entry: resultData, isLive: true };
  } catch (error) {
    console.error('Error posting to Google Sheets:', error);
    throw new Error('구글 시트 저장 중 네트워크 오류가 발생했습니다. Apps Script 배포 설정을 확인해주세요.');
  }
}
