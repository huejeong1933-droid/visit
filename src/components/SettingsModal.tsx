import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Link2, Trash2, RotateCcw, ExternalLink } from 'lucide-react';
import { testGasConnection } from '../services/sheetService.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (url: string) => void;
  onResetDemo: () => void;
  onOpenGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  onResetDemo,
  onOpenGuide,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setUrl(currentUrl);
    setTestResult(null);
  }, [currentUrl, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'URL을 먼저 입력해주세요.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGasConnection(url.trim());
      setTestResult(res);
    } catch {
      setTestResult({ success: false, message: '연결 확인 중 예기치 못한 에러가 발생했습니다.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveUrl(url.trim());
    onClose();
  };

  const handleDisconnect = () => {
    setUrl('');
    onSaveUrl('');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">구글 시트 연동 설정</h2>
              <p className="text-xs text-slate-500">배포된 Apps Script 웹 앱 URL을 등록합니다</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gas-url-input" className="block text-xs font-semibold text-slate-700">
                Google Apps Script 웹 앱 URL
              </label>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                URL 얻는 방법 안내 <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <textarea
              id="gas-url-input"
              rows={3}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              반드시 끝자리가 <code>/exec</code>로 끝나는 배포 URL이어야 합니다.
            </p>
          </div>

          {/* Test connection action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url.trim()}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>연결 테스트</span>
            </button>

            {currentUrl && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>연동 해제 (데모로 전환)</span>
              </button>
            )}
          </div>

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium">{testResult.message}</p>
                {!testResult.success && (
                  <p className="text-[11px] text-rose-700">
                    도움말: 구글 시트 배포 시 [액세스 권한: 모든 사용자]를 선택했는지, 코드가 정상적으로 저장되었는지 확인해주세요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Demo helper */}
          {!currentUrl && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">현재 상태: 체험 데모 모드</span>
                <button
                  type="button"
                  onClick={onResetDemo}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>샘플 글 초기화</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                URL을 등록하지 않아도 방명록의 모든 기능(글 작성, 하트, 검색, 정렬 등)을 브라우저 로컬 저장소를 통해 자유롭게 테스트해볼 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};
