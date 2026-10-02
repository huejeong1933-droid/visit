/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { GuestbookForm } from './components/GuestbookForm.tsx';
import { EntryList } from './components/EntryList.tsx';
import { GuideModal } from './components/GuideModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { Toast, ToastProps } from './components/Toast.tsx';
import {
  fetchEntries,
  postEntry,
  getStoredApiUrl,
  setStoredApiUrl,
  resetDemoEntries,
} from './services/sheetService.ts';
import { GuestbookEntry } from './types.ts';
import { BookOpen, Sparkles, Database, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => getStoredApiUrl());

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch entries
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchEntries();
      setEntries(result.entries);
      setIsLive(result.isLive);
      if (isRefresh) {
        addToast('success', '방명록 목록을 성공적으로 갱신했습니다.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '데이터를 가져오지 못했습니다.';
      addToast('error', msg, '연결 실패');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [apiUrl, loadData]);

  // Form submission
  const handleSubmit = async (data: { name: string; message: string; emoji: string }) => {
    setIsSubmitting(true);
    try {
      const result = await postEntry(data);
      // 낙관적 or 즉시 리스트 상단 반영
      setEntries((prev) => [result.entry, ...prev.filter((e) => e.id !== result.entry.id)]);
      setIsLive(result.isLive);

      addToast(
        'success',
        result.isLive
          ? '구글 스프레드시트에 응원이 안전하게 저장되었습니다! ✨'
          : '데모 모드에 응원이 등록되었습니다! (시트 연동 시 실제 시트에 저장됩니다)',
        '등록 완료'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '글 등록 중 오류가 발생했습니다.';
      addToast('error', msg, '등록 실패');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUrl = (newUrl: string) => {
    setStoredApiUrl(newUrl);
    setApiUrl(newUrl);
    if (newUrl) {
      addToast('success', '웹 앱 API URL이 저장되었습니다. 데이터를 불러옵니다.', '연동 설정 완료');
    } else {
      addToast('info', '연동이 해제되어 체험 데모 모드로 전환되었습니다.');
    }
  };

  const handleResetDemo = () => {
    const defaultData = resetDemoEntries();
    setEntries(defaultData);
    addToast('info', '데모 샘플 글이 초기화되었습니다.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        isLive={isLive}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        totalCount={entries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Sheets Database Guestbook</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              서로에게 건네는 따뜻한 응원의 한마디
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              별도의 백엔드 데이터베이스 없이, 우리에게 친숙한 <strong>구글 스프레드시트</strong>를
              실시간 JSON API로 연결하여 운영되는 초간단 감성 방명록입니다.
            </p>

            {/* Quick Helper CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>3분 연동 가이드 및 코드 보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!isLive && (
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>내 스프레드시트 연동하기</span>
                </button>
              )}
            </div>
          </div>

          {/* Connection status notification pill/notice if in demo mode */}
          {!isLive && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:px-8 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  <strong>현재 체험 데모 모드입니다:</strong> 글을 등록해보실 수 있으며, 구글 시트 URL을 연동하면 실제 본인의 스프레드시트에 즉시 기록됩니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="font-medium underline hover:text-amber-950 whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                연동 URL 등록하기 &rarr;
              </button>
            </div>
          )}
        </section>

        {/* Guestbook Form */}
        <section>
          <GuestbookForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isLive={isLive}
          />
        </section>

        {/* Entries List & Grid */}
        <section>
          <EntryList
            entries={entries}
            isLoading={isLoading}
            onRefresh={() => loadData(true)}
            isRefreshing={isRefreshing}
            isLive={isLive}
          />
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 시트방명록 (SheetGuestbook) · Google Apps Script & React</p>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Apps Script 코드
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              연동 설정
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={removeToast} />
          </div>
        ))}
      </div>

      {/* Modals */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={handleSaveUrl}
        onResetDemo={handleResetDemo}
        onOpenGuide={() => {
          setIsSettingsOpen(false);
          setIsGuideOpen(true);
        }}
      />
    </div>
  );
}
