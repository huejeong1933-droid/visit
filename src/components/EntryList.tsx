import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { GuestbookEntry, SortOrder } from '../types.ts';
import { EntryCard } from './EntryCard.tsx';

interface EntryListProps {
  entries: GuestbookEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLive: boolean;
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  isLoading,
  onRefresh,
  isRefreshing,
  isLive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmojiFilter, setSelectedEmojiFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Filter & Sort
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.message.toLowerCase().includes(query)
      );
    }

    if (selectedEmojiFilter !== 'all') {
      result = result.filter((e) => e.emoji === selectedEmojiFilter);
    }

    if (sortOrder === 'oldest') {
      result.reverse();
    }

    return result;
  }, [entries, searchTerm, selectedEmojiFilter, sortOrder]);

  // Unique emojis in current entries
  const availableEmojis = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.emoji) set.add(e.emoji);
    });
    return Array.from(set);
  }, [entries]);

  return (
    <section className="space-y-4">
      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름이나 응원 메시지 검색..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-start">
          {/* Emoji Filter tabs */}
          {availableEmojis.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setSelectedEmojiFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedEmojiFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              {availableEmojis.slice(0, 5).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmojiFilter(emoji)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedEmojiFilter === emoji
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="정렬 순서 변경"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'newest' ? '최신순' : '과거순'}</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            title="새로고침"
            aria-label="방명록 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Count & Status banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <span>등록된 응원글</span>
          <span className="font-semibold text-slate-800 tabular-nums">{filteredEntries.length}개</span>
          {searchTerm && <span>(검색 결과)</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>{isLive ? '구글 스프레드시트와 실시간 동기화 중' : '로컬 데모 데이터'}</span>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {searchTerm ? '검색된 응원글이 없습니다' : '아직 등록된 응원글이 없습니다'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm
              ? '다른 키워드로 검색해보시거나 필터를 초기화해보세요.'
              : '첫 번째 응원의 메시지를 가장 먼저 남겨보세요! ✨'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedEmojiFilter('all');
              }}
              className="px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              검색 필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
};
