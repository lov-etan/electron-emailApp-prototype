const http = require("http");
const url = require("url");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  initAuth,
  getAuthUrl,
  handleAuthCallback,
  getOAuth2Client,
} = require("./auth");
const { fetchEmails } = require("./gmail");
const {
  initDatabase,
  saveEmails,
  getEmails,
  getEmailById,
} = require("./database");

// 전역 변수로 mainWindow와 authServer 선언
let mainWindow;
let authServer;
let db;

// 메인 윈도우 생성 함수
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 메인 창 로드
  mainWindow.loadURL("http://localhost:3000"); // React 앱 URL

  // 개발 도구 열기 (개발 중에만 사용)
  mainWindow.webContents.openDevTools();
}

// 인증 서버 생성 함수
function createAuthServer() {
  return new Promise((resolve) => {
    authServer = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === "/" && parsedUrl.query.code) {
        // 인증 코드 추출
        const authCode = parsedUrl.query.code;

        // 브라우저에 성공 메시지 표시
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body>
              <h1>인증 성공!</h1>
              <p>이 창을 닫고 애플리케이션으로 돌아가세요.</p>
              <script>
                window.onload = function() {
                  // 5초 후 창 닫기
                  setTimeout(() => window.close(), 5000);
                };
              </script>
            </body>
          </html>
        `);

        // Electron 앱에 코드 전송
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("auth-code-received", authCode);
          console.log("Auth code sent to renderer:", authCode);
        } else {
          console.error("Main window not available");
        }

        // 서버 종료 (일회용)
        setTimeout(() => {
          if (authServer && authServer.listening) {
            authServer.close(() => {
              console.log("Auth server closed");
            });
          }
        }, 6000); // 5초 후 브라우저 닫힘 + 여유 1초
      } else {
        // 잘못된 요청
        res.writeHead(404);
        res.end();
      }
    });

    // 로컬 서버 실행 (임의의 포트에서)
    authServer.listen(0, "127.0.0.1", () => {
      const { port } = authServer.address();
      console.log(`Auth server is running on port ${port}`);
      resolve(port); // Promise로 포트 번호 반환
    });
  });
}

// 앱 초기화 완료 후
app.whenReady().then(() => {
  try {
    // 인증 초기화
    console.log("Initializing auth...");
    initAuth();

    // 데이터베이스 초기화
    console.log("Initializing database...");
    db = initDatabase();

    // 메인 윈도우 생성
    console.log("Creating main window...");
    createMainWindow();

    console.log("App initialization completed");
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC 이벤트 핸들러 등록
ipcMain.handle("get-auth-url", async () => {
  try {
    console.log("Generating auth URL...");
    // 인증 서버 생성 및 포트 번호 가져오기
    const port = await createAuthServer();
    console.log("Auth server created on port:", port);

    // 포트 번호를 전달하여 인증 URL 생성
    const url = await getAuthUrl(port);
    console.log("Auth URL generated successfully");
    return url;
  } catch (error) {
    console.error("Error getting auth URL:", error);
    throw error;
  }
});

ipcMain.handle("handle-auth-callback", async (event, code) => {
  try {
    console.log(
      "Handling auth callback with code:",
      code.substring(0, 10) + "..."
    );
    return await handleAuthCallback(code);
  } catch (error) {
    console.error("Error handling auth callback:", error);
    throw error;
  }
});

ipcMain.handle("fetch-emails", async (event, maxResults) => {
  try {
    console.log("Fetching emails, maxResults:", maxResults);

    // 이메일 가져오기
    const emails = await fetchEmails(maxResults || 100);
    console.log(`Successfully fetched ${emails.length} emails`);

    // 데이터베이스에 저장
    if (emails.length > 0) {
      console.log(`Saving ${emails.length} emails to database...`);
      const count = await saveEmails(emails);
      console.log(`Successfully saved ${count} emails to database`);
    } else {
      console.log("No emails to save");
    }

    return { success: true, count: emails.length, emails };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-emails", async (event, limit, offset) => {
  try {
    console.log(
      `Getting emails from database, limit: ${limit}, offset: ${offset}`
    );
    const emails = await getEmails(limit, offset);
    console.log(`Retrieved ${emails.length} emails from database`);
    return { success: true, emails };
  } catch (error) {
    console.error("Error getting emails:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-email-by-id", async (event, id) => {
  try {
    console.log(`Getting email by ID: ${id}`);
    const email = await getEmailById(id);
    if (email) {
      console.log(`Email found: ${email.id}`);
      return { success: true, email };
    } else {
      console.log(`Email not found: ${id}`);
      return { success: false, error: "Email not found" };
    }
  } catch (error) {
    console.error("Error getting email by ID:", error);
    return { success: false, error: error.message };
  }
});

// 데이터베이스 상태 확인 핸들러
ipcMain.handle("check-database", async () => {
  try {
    if (!db) {
      console.log("Database not initialized, initializing now...");
      db = initDatabase();
    }

    console.log("Checking database status...");

    // 이메일 개수 조회
    const countResult = db
      .prepare("SELECT COUNT(*) as count FROM emails")
      .get();
    const count = countResult ? countResult.count : 0;
    console.log(`Database contains ${count} emails`);

    // 샘플 이메일 조회
    const emailSample =
      count > 0 ? db.prepare("SELECT * FROM emails LIMIT 1").get() : null;

    return {
      success: true,
      count: count,
      sample: emailSample ? true : false,
      sampleData: emailSample
        ? {
            id: emailSample.id,
            subject: emailSample.subject,
            sender: emailSample.sender,
          }
        : null,
    };
  } catch (error) {
    console.error("Error checking database:", error);
    return { success: false, error: error.message };
  }
});
