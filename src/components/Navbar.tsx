import React from 'react';
import { Settings, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  onOpenSettings,
  onOpenGuide,
  onRefresh,
  isRefreshing,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              S
            </span>
            <span className="truncate">시트방명록</span>
          </a>

          {/* Quiet status metadata */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pl-2 border-l border-slate-200">
            <span className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-400'}`} />
            <span>{isLive ? '구글 스프레드시트 실시간 연동' : '체험 데모 모드'}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium text-slate-700">{totalCount}개의 응원</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>연동 가이드</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>새로고침</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="연동 가이드 보기"
            aria-label="연동 가이드"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="새로고침"
            aria-label="새로고침"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm ${
              isLive
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isLive ? '시트 연동 설정' : '구글 시트 연결하기'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
