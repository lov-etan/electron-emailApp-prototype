import React from "react";

function AuthSection({
  authUrl,
  authCode,
  setAuthCode,
  handleGetAuthUrl,
  handleSubmitAuthCode,
  setAuthUrl,
  isLoading,
  authStatus,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Gmail Electron App
      </h1>

      {!authUrl ? (
        // 초기 화면 - 인증 시작 버튼
        <>
          <p className="text-gray-600 mb-4">
            Gmail Electron 애플리케이션에 오신 것을 환영합니다. 이 앱을 사용하여
            Gmail 계정의 이메일을 로컬 데이터베이스에 저장할 수 있습니다.
          </p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition disabled:opacity-50"
            onClick={handleGetAuthUrl}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                처리 중...
              </div>
            ) : (
              "Gmail 계정 연결하기"
            )}
          </button>
        </>
      ) : (
        // 인증 코드 입력 화면
        <>
          <p className="text-gray-600 mb-4">
            Google 인증 페이지가 새 창에서 열렸습니다.{" "}
            <strong className="text-blue-600">
              권한을 허용한 후 표시되는 인증 코드를 복사하여
            </strong>{" "}
            아래에 붙여넣으세요.
          </p>
          <div className="mb-4">
            <label
              htmlFor="authCode"
              className="block text-gray-700 font-medium mb-2"
            >
              인증 코드
            </label>
            <input
              type="text"
              id="authCode"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="인증 코드를 붙여넣으세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition disabled:opacity-50"
            onClick={() => handleSubmitAuthCode()}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                처리 중...
              </div>
            ) : (
              "인증 코드 제출"
            )}
          </button>
          <button
            className="w-full mt-2 text-blue-600 hover:text-blue-800 transition"
            onClick={() => setAuthUrl("")}
            disabled={isLoading}
          >
            처음으로 돌아가기
          </button>
        </>
      )}

      {/* 상태 메시지 표시 */}
      {authStatus && (
        <div
          className={`mt-4 p-3 rounded-md ${
            authStatus.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {authStatus.message}
        </div>
      )}
    </div>
  );
}

export default AuthSection;
