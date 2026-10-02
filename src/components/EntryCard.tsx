import React, { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { GuestbookEntry } from '../types.ts';
import { toggleLike, getLikedIds } from '../services/sheetService.ts';

interface EntryCardProps {
  entry: GuestbookEntry;
  onLikeChange?: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  const [isLiked, setIsLiked] = useState(() => getLikedIds().has(entry.id));
  const [likeCount, setLikeCount] = useState(entry.likes || 0);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    const nextState = toggleLike(entry.id);
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${entry.message}" - ${entry.name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formatTimestamp = (raw: string) => {
    if (!raw) return '';
    try {
      // 만약 yyyy-MM-dd HH:mm:ss 형태이면
      const parts = raw.split(' ');
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1].slice(0, 5)}`;
      }
      return raw;
    } catch {
      return raw;
    }
  };

  return (
    <article className="group relative bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header: Emoji + Name + Date (Zero-pill discipline) */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl bg-slate-100/90 text-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
              role="img"
              aria-label="emoji"
            >
              {entry.emoji || '🍀'}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                {entry.name || '익명'}
              </h3>
              {/* Clean unboxed metadata */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-normal">
                <span>{formatTimestamp(entry.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Quick copy message action */}
          <button
            type="button"
            onClick={handleCopy}
            title="메시지 복사"
            className="text-slate-300 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="메시지 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message body */}
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {entry.message}
        </p>
      </div>

      {/* Footer / Interaction */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-300 truncate max-w-[140px]">
          #{entry.id.replace('msg_', '').slice(-8)}
        </span>

        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
            isLiked
              ? 'text-rose-600 bg-rose-50 font-medium'
              : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'
          }`}
          aria-label="좋아요"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="tabular-nums">{likeCount > 0 ? likeCount : '응원'}</span>
        </button>
      </div>
    </article>
  );
};
