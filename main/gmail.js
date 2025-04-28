const { google } = require("googleapis");
const { getOAuth2Client } = require("./auth");

// 이메일 가져오기
async function fetchEmails(maxResults = 100) {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  try {
    console.log("Calling Gmail API to list messages...");
    // 이메일 목록 가져오기
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: maxResults,
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} messages`);

    if (messages.length === 0) {
      console.log("No messages found in the Gmail account");
      return [];
    }

    // 각 이메일의 상세 정보 가져오기
    const emails = await Promise.all(
      messages.map(async (message) => {
        const emailData = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        return processEmail(emailData.data);
      })
    );

    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

// 이메일 데이터 처리
function processEmail(emailData) {
  const headers = emailData.payload.headers;

  // 헤더에서 필요한 정보 추출
  const subject =
    headers.find((header) => header.name === "Subject")?.value || "(제목 없음)";
  const from = headers.find((header) => header.name === "From")?.value || "";
  const to = headers.find((header) => header.name === "To")?.value || "";
  const date = headers.find((header) => header.name === "Date")?.value || "";

  // 본문 추출 (간단한 방식, 복잡한 이메일의 경우 보완 필요)
  let body = "";
  if (emailData.payload.parts && emailData.payload.parts.length > 0) {
    // 멀티파트 이메일
    const textPart = emailData.payload.parts.find(
      (part) => part.mimeType === "text/plain" || part.mimeType === "text/html"
    );

    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  } else if (emailData.payload.body && emailData.payload.body.data) {
    // 단일 파트 이메일
    body = Buffer.from(emailData.payload.body.data, "base64").toString("utf-8");
  }

  return {
    id: emailData.id,
    threadId: emailData.threadId,
    labelIds: emailData.labelIds,
    snippet: emailData.snippet,
    subject,
    from,
    to,
    date,
    body,
    internalDate: emailData.internalDate,
  };
}

module.exports = {
  fetchEmails,
};
