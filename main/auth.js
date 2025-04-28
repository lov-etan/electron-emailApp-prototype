const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const ElectronStore = require("electron-store");
const store = new ElectronStore();

// Google API 사용을 위한 OAuth 2.0 클라이언트 설정
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let REDIRECT_URI = "http://127.0.0.1"; // 기본 값
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

let oAuth2Client = null;

// OAuth2 클라이언트 초기화
function initAuth() {
  oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // 저장된 토큰이 있으면 로드
  const token = store.get("gmail-token");
  if (token) {
    oAuth2Client.setCredentials(token);
    console.log("Loaded existing token from store");
  } else {
    console.log("No existing token found");
  }

  return oAuth2Client;
}

// 인증 URL 생성
async function getAuthUrl(port) {
  if (!oAuth2Client) {
    initAuth();
  }

  // 포트가 제공되면 REDIRECT_URI 업데이트
  if (port) {
    REDIRECT_URI = `http://127.0.0.1:${port}`;
  }

  console.log("Using REDIRECT_URI:", REDIRECT_URI);

  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    redirect_uri: REDIRECT_URI, // 명시적으로 리다이렉트 URI 지정
    prompt: "consent", // 항상 동의 화면 표시 (refresh_token을 얻기 위함)
  });
}

// 인증 코드로 토큰 얻기
async function handleAuthCallback(code) {
  if (!oAuth2Client) {
    initAuth();
  }

  try {
    console.log(
      "Attempting to exchange code for token with redirectUri:",
      REDIRECT_URI
    );
    console.log("Code:", code);

    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: REDIRECT_URI,
    });

    console.log(
      "Token exchange successful. Token:",
      JSON.stringify(tokens, null, 2)
    );
    oAuth2Client.setCredentials(tokens);

    // 토큰 저장
    store.set("gmail-token", tokens);
    console.log("Token saved to store");

    return { success: true };
  } catch (error) {
    console.error("Error during authentication:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// OAuth 클라이언트 가져오기
function getOAuth2Client() {
  if (!oAuth2Client) {
    initAuth();
  }

  // 토큰이 없거나 만료되었는지 확인
  const token = store.get("gmail-token");
  if (!token) {
    throw new Error(
      "No authentication token found. Please authenticate first."
    );
  }

  console.log(
    "Using token for API request:",
    JSON.stringify(
      {
        access_token: token.access_token ? "exists" : "missing",
        refresh_token: token.refresh_token ? "exists" : "missing",
        expiry_date: token.expiry_date,
        token_type: token.token_type,
      },
      null,
      2
    )
  );

  return oAuth2Client;
}

module.exports = {
  initAuth,
  getAuthUrl,
  handleAuthCallback,
  getOAuth2Client,
};
