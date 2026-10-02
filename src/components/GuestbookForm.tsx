import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Smile } from 'lucide-react';

interface GuestbookFormProps {
  onSubmit: (data: { name: string; message: string; emoji: string }) => Promise<void>;
  isSubmitting: boolean;
  isLive: boolean;
}

const EMOJI_OPTIONS = [
  { emoji: '🍀', label: '행운' },
  { emoji: '🔥', label: '열정' },
  { emoji: '🌸', label: '따스함' },
  { emoji: '💖', label: '사랑' },
  { emoji: '🎉', label: '축하' },
  { emoji: '🚀', label: '성장' },
  { emoji: '☕️', label: '휴식' },
  { emoji: '⭐', label: '빛남' },
];

export const GuestbookForm: React.FC<GuestbookFormProps> = ({
  onSubmit,
  isSubmitting,
  isLive,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍀');
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_MESSAGE_LENGTH = 200;
  const MAX_NAME_LENGTH = 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      setErrorMsg('응원의 한마디를 입력해주세요.');
      return;
    }

    setErrorMsg('');
    try {
      await onSubmit({
        name: name.trim() || '익명',
        message: trimmedMsg,
        emoji: selectedEmoji,
      });

      // 등록 성공 시 폼 초기화
      setMessage('');
    } catch {
      // 에러 처리는 상위 onSubmit에서 토스트로 전파
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">따뜻한 응원 한마디 남기기</h2>
            <p className="text-xs text-slate-500">
              {isLive ? '구글 스프레드시트에 실시간으로 기록됩니다' : '시트 연동 전에는 브라우저에 임시 저장됩니다'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 입력 및 이모지 선택 */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <label htmlFor="guestbook-name" className="block text-xs font-medium text-slate-700 mb-1">
              작성자 이름 / 닉네임
            </label>
            <input
              id="guestbook-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder="예: 초록별, 여행자 (비워두면 익명)"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-slate-500" />
              <span>오늘의 응원 무드 이모지</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(item.emoji)}
                    disabled={isSubmitting}
                    title={item.label}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500 ring-offset-1 scale-105 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 메시지 입력 영역 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="guestbook-message" className="block text-xs font-medium text-slate-700">
              응원 메시지
            </label>
            <span
              className={`text-xs tabular-nums ${
                message.length >= MAX_MESSAGE_LENGTH ? 'text-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              {message.length} / {MAX_MESSAGE_LENGTH}자
            </span>
          </div>

          <textarea
            id="guestbook-message"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="따뜻한 응원이나 축하의 메시지를 남겨주세요. (Ctrl+Enter로 즉시 등록 가능)"
            disabled={isSubmitting}
            className={`w-full p-3.5 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-50 ${
              errorMsg ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
            }`}
          />

          {errorMsg && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errorMsg}</p>
          )}
        </div>

        {/* 하단 안내 및 등록 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-400 hidden sm:block">
            팁: <kbd className="px-1.5 py-0.5 text-[11px] bg-slate-100 border border-slate-300 rounded font-mono">⌘/Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-[11px] bg-slate-100 border border-slate-300 rounded font-mono">Enter</kbd>로 빠르게 작성할 수 있습니다.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>시트에 저장하는 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>응원 등록하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
