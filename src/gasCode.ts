export const APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * 구글 스프레드시트 방명록 / 게시판 JSON Web API (Apps Script)
 * ====================================================================
 * 
 * [초보자 사용법 (3분 완성)]
 * 1. 구글 스프레드시트 새로 만들기 (제목 아무거나 설정)
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 코드를 전체 복사하여 붙여넣기 후 저장 (Ctrl+S / Cmd+S)
 * 4. 오른쪽 위 파란색 [배포] 버튼 클릭 > [새 배포] 선택
 * 5. 톱니바퀴 아이콘 클릭 > [웹 앱] 선택
 *    - 설명: 방명록 API
 *    - 다음 사용자로 실행: [나] (본인 구글 계정)
 *    - 액세스 권한이 있는 사용자: [모든 사용자(Anyone)] ⭐️ (필수! 누구나 작성 가능하게 설정)
 * 6. [배포] 클릭 후 생성된 "웹 앱 URL (https://script.google.com/macros/s/.../exec)"을 복사하여
 *    방명록 웹앱의 [구글 시트 연동 설정]에 붙여넣으면 완료!
 */

// 시트 첫 행 헤더 자동 초기화 함수
function ensureSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "작성일시", "이름", "응원메시지", "이모지"]);
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f1f5f9");
    headerRange.setFontColor("#1e293b");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 300);
    sheet.setColumnWidth(5, 70);
  }
}

// 1. 방명록 목록 불러오기 (GET 요청 처리)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    ensureSheetHeaders(sheet);
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return jsonResponse({ status: "success", data: [] });
    }
    
    // 헤더 제외 전체 데이터 읽기 (ID, 일시, 이름, 메시지, 이모지)
    var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var entries = [];
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      // 빈 행 건너뛰기
      if (!row[2] && !row[3]) continue;
      
      entries.push({
        id: row[0] ? String(row[0]) : "row-" + (i + 2),
        timestamp: row[1] ? String(row[1]) : "",
        name: row[2] ? String(row[2]) : "익명",
        message: row[3] ? String(row[3]) : "",
        emoji: row[4] ? String(row[4]) : "🍀"
      });
    }
    
    // 최신 글이 위에 오도록 역순 정렬
    entries.reverse();
    
    return jsonResponse({ status: "success", data: entries, total: entries.length });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

// 2. 새 방명록 글 등록하기 (POST 요청 처리)
function doPost(e) {
  // 동시 작성 충돌 방지를 위한 잠금 획득 (최대 10초 대기)
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    ensureSheetHeaders(sheet);
    
    var payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }
    
    var now = new Date();
    var id = "msg_" + Utilities.formatDate(now, "Asia/Seoul", "yyyyMMdd_HHmmss") + "_" + Math.floor(Math.random() * 1000);
    var timestamp = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var name = (payload.name || "익명").toString().trim();
    var message = (payload.message || "").toString().trim();
    var emoji = (payload.emoji || "🍀").toString().trim();
    
    if (!message) {
      return jsonResponse({ status: "error", message: "응원 메시지를 입력해주세요." });
    }
    
    // 시트에 새 행 추가
    sheet.appendRow([id, timestamp, name, message, emoji]);
    
    var createdEntry = {
      id: id,
      timestamp: timestamp,
      name: name,
      message: message,
      emoji: emoji
    };
    
    return jsonResponse({ status: "success", data: createdEntry, message: "성공적으로 등록되었습니다." });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// JSON 응답 생성 헬퍼
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
