import React, { useState, useEffect } from "react";
import AuthSection from "./components/AuthSection";
import EmailList from "./components/EmailList";
import EmailToolbar from "./components/EmailToolbar";
import DatabaseStatus from "./components/DatabaseStatus";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authStatus, setAuthStatus] = useState(null);
  const [emails, setEmails] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [showDbStatus, setShowDbStatus] = useState(false);

  useEffect(() => {
    // 인증 코드 수신 이벤트 리스너
    const handleAuthCodeReceived = async (event) => {
      const code = event.detail;
      console.log("Auth code received:", code);
      setAuthCode(code);
      // 코드가 있으면 자동으로 제출
      if (code) {
        await handleSubmitAuthCode(code);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("auth-code-received", handleAuthCodeReceived);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("auth-code-received", handleAuthCodeReceived);
    };
  }, []);

  // Gmail 인증 URL 가져오기
  const handleGetAuthUrl = async () => {
    setIsLoading(true);
    setAuthStatus(null);

    try {
      // Electron API를 통해 인증 URL 요청
      console.log("Requesting auth URL from Electron...");
      const url = await window.electronAPI.getAuthUrl();
      console.log("Auth URL received:", url);
      setAuthUrl(url);

      // URL을 새 창에서 열기
      window.open(url, "_blank");
    } catch (error) {
      console.error("인증 URL 가져오기 실패:", error);
      setAuthStatus({
        success: false,
        message: "인증 URL을 가져오는데 실패했습니다: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 제출
  const handleSubmitAuthCode = async (codeParam) => {
    const codeToSubmit = codeParam || authCode;

    if (!codeToSubmit || !codeToSubmit.trim()) {
      setAuthStatus({
        success: false,
        message: "인증 코드를 입력해주세요.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting auth code...");
      // Electron API를 통해 인증 코드 제출
      const result = await window.electronAPI.handleAuthCallback(codeToSubmit);

      setAuthStatus({
        success: result.success,
        message: result.success
          ? "인증에 성공했습니다. 이메일을 가져오는 중..."
          : "인증에 실패했습니다: " + (result.error || "알 수 없는 오류"),
      });

      if (result.success) {
        // 인증 성공 시 이메일 가져오기
        await fetchEmails();
      }
    } catch (error) {
      console.error("인증 처리 실패:", error);
      setAuthStatus({
        success: false,
        message: "인증 처리 중 오류가 발생했습니다: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 가져오기 함수
  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching emails...");
      setAuthStatus({
        success: true,
        message: "이메일을 가져오는 중...",
      });

      const emailResult = await window.electronAPI.fetchEmails(3); // 메일 30개 수신
      console.log("Email fetch result:", emailResult);

      if (emailResult.success) {
        setEmails(emailResult.emails);
        setAuthStatus({
          success: true,
          message: `${emailResult.count}개의 이메일을 가져왔습니다.`,
        });

        // 성공적으로 이메일을 가져왔다면 데이터베이스 상태도 자동으로 확인
        await checkDatabase();
      } else {
        setAuthStatus({
          success: false,
          message:
            "이메일을 가져오는데 실패했습니다: " +
            (emailResult.error || "알 수 없는 오류"),
        });
      }
    } catch (error) {
      console.error("이메일 가져오기 실패:", error);
      setAuthStatus({
        success: false,
        message: "이메일 가져오기 중 오류가 발생했습니다: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터베이스 상태 확인
  const checkDatabase = async () => {
    try {
      console.log("Checking database status...");
      setIsLoading(true);

      const result = await window.electronAPI.checkDatabase();
      console.log("Database check result:", result);

      if (result.success) {
        setDbStatus({
          success: true,
          count: result.count,
          hasSample: result.sample,
          sampleData: result.sampleData,
        });
        setShowDbStatus(true);
      } else {
        setDbStatus({
          success: false,
          message: "데이터베이스 확인 실패: " + result.error,
        });
        setShowDbStatus(true);
      }
    } catch (error) {
      console.error("데이터베이스 확인 실패:", error);
      setDbStatus({
        success: false,
        message: "데이터베이스 확인 중 오류 발생: " + error.message,
      });
      setShowDbStatus(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 여부에 따라 화면 분기
  const isAuthenticated = authStatus && authStatus.success && emails.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {!isAuthenticated ? (
        // 인증되지 않은 경우 - 로그인 화면
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <AuthSection
              authUrl={authUrl}
              authCode={authCode}
              setAuthCode={setAuthCode}
              handleGetAuthUrl={handleGetAuthUrl}
              handleSubmitAuthCode={handleSubmitAuthCode}
              setAuthUrl={setAuthUrl}
              isLoading={isLoading}
              authStatus={authStatus}
            />
          </div>
        </div>
      ) : (
        // 인증된 경우 - 이메일 목록 화면
        <div className="flex flex-col h-screen">
          {/* 상단 헤더 */}
          <header className="bg-white shadow-sm py-3 px-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-800">
                  Gmail Electron
                </h1>
              </div>
              <div>
                <button
                  className="flex items-center text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md"
                  onClick={() => setAuthUrl("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col space-y-4">
                {/* 툴바 */}
                <EmailToolbar
                  onRefresh={fetchEmails}
                  onCheckDatabase={() => {
                    checkDatabase();
                    setShowDbStatus(true);
                  }}
                  isLoading={isLoading}
                />

                {/* 상태 메시지 표시 */}
                {authStatus && authStatus.success && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
                    {authStatus.message}
                  </div>
                )}

                {/* 데이터베이스 상태 */}
                {showDbStatus && <DatabaseStatus dbStatus={dbStatus} />}

                {/* 이메일 목록 */}
                <EmailList emails={emails} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
