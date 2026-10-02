import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Code2, ShieldAlert, Sparkles, Download } from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../gasCode.ts';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Code.gs';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">초보자용 구글 시트 연동 가이드</h2>
              <p className="text-xs text-slate-500">3분 만에 무료로 나만의 스프레드시트 데이터베이스를 구축하세요</p>
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">구글 스프레드시트 생성</h3>
              <p className="text-slate-600">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  sheets.new <ExternalLink className="w-3.5 h-3.5" />
                </a>
                로 이동하여 새 스프레드시트를 만듭니다. (열 제목은 스크립트가 첫 등록 시 자동으로 채워주므로 비워두셔도 됩니다.)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">Apps Script 편집기 열기</h3>
              <p className="text-slate-600">
                시트 상단 메뉴에서 <strong>[확장 프로그램]</strong> &gt; <strong>[Apps Script]</strong>를 클릭합니다.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">제공된 스크립트 코드 붙여넣기</h3>
                  <p className="text-xs text-slate-500">기존에 적힌 기본 내용을 지우고 아래 코드를 그대로 붙여넣은 뒤 저장(Ctrl+S)합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>파일 다운로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all shadow-xs ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>원클릭 코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200">
                <div className="px-4 py-2 bg-slate-900/90 text-xs font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center">
                  <span>Code.gs (Apps Script)</span>
                  <span>doGet / doPost API</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed text-slate-300">
                  <code>{APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              4
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">웹 앱으로 배포하기</h3>
              <p className="text-slate-600">
                우측 상단 파란색 <strong>[배포]</strong> 버튼 &gt; <strong>[새 배포]</strong>를 클릭합니다.
              </p>
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>배포 설정 시 가장 중요한 필수 체크포인트:</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1 list-disc pl-5">
                  <li><strong>유형 선택:</strong> 왼쪽 톱니바퀴 클릭 후 <strong>웹 앱(Web App)</strong> 선택</li>
                  <li><strong>다음 사용자로 실행:</strong> <strong>나 (Me)</strong> 선택</li>
                  <li>
                    <strong>액세스 권한이 있는 사용자:</strong> 반드시 <strong>모든 사용자 (Anyone)</strong> 선택!
                    <br />
                    <span className="text-amber-700 text-[11px]">(구글 로그인 없이 누구나 방명록 글을 읽고 등록할 수 있게 해줍니다)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              5
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">웹 앱 URL 등록하기</h3>
              <p className="text-slate-600">
                배포 완료 후 나타나는 <strong>웹 앱 URL (https://script.google.com/macros/s/.../exec)</strong>을 복사하여
                아래 버튼을 눌러 연동 설정에 붙여넣기만 하면 끝입니다!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="px-5 py-2 text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>웹 앱 URL 등록하러 가기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
