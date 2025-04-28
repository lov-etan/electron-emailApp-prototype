const { contextBridge, ipcRenderer } = require("electron");

// renderer 프로세스에서 사용할 API 노출
contextBridge.exposeInMainWorld("electronAPI", {
  // Gmail 인증 관련
  getAuthUrl: () => ipcRenderer.invoke("get-auth-url"),
  handleAuthCallback: (code) =>
    ipcRenderer.invoke("handle-auth-callback", code),

  // Gmail 데이터 가져오기 및 저장
  fetchEmails: (maxResults) => ipcRenderer.invoke("fetch-emails", maxResults),
  getEmails: (limit, offset) => ipcRenderer.invoke("get-emails", limit, offset),
  getEmailById: (id) => ipcRenderer.invoke("get-email-by-id", id),

  checkDatabase: () => ipcRenderer.invoke("check-database"),
});

// 인증 코드 수신 이벤트 추가
ipcRenderer.on("auth-code-received", (event, code) => {
  // window 객체에 이벤트 발생
  window.dispatchEvent(new CustomEvent("auth-code-received", { detail: code }));
});
