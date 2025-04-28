const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

let db = null;

// 데이터베이스 초기화
function initDatabase() {
  //TODO[지우]: 나중에는 노트북 내 저장소에 저장할 예정
  //const dbPath = path.join(app.getPath("userData"), "emails.db");
  const dbPath = path.join(__dirname, "emails.db");
  console.log("Database path:", dbPath);

  db = new Database(dbPath);

  // 이메일 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      thread_id TEXT,
      subject TEXT,
      sender TEXT,
      recipient TEXT,
      date TEXT,
      body TEXT,
      snippet TEXT,
      internal_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 라벨 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_labels (
      email_id TEXT,
      label TEXT,
      PRIMARY KEY (email_id, label),
      FOREIGN KEY (email_id) REFERENCES emails(id)
    )
  `);

  return db;
}

// 이메일 저장
async function saveEmails(emails) {
  if (!db) {
    initDatabase();
  }

  console.log(`Preparing to save ${emails.length} emails to database`);

  try {
    // 트랜잭션 시작
    const insertEmail = db.prepare(`
      INSERT OR REPLACE INTO emails (
        id, thread_id, subject, sender, recipient,
        date, body, snippet, internal_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLabel = db.prepare(`
      INSERT OR REPLACE INTO email_labels (email_id, label)
      VALUES (?, ?)
    `);

    const transaction = db.transaction((emails) => {
      for (const email of emails) {
        try {
          insertEmail.run(
            email.id,
            email.threadId,
            email.subject,
            email.from,
            email.to,
            email.date,
            email.body,
            email.snippet,
            email.internalDate
          );

          // 라벨이 있으면 저장
          if (email.labelIds && Array.isArray(email.labelIds)) {
            for (const label of email.labelIds) {
              insertLabel.run(email.id, label);
            }
          }
        } catch (error) {
          console.error(`Error saving email ${email.id}:`, error);
          throw error;
        }
      }
    });

    // 트랜잭션 실행
    transaction(emails);
    console.log(`Successfully saved ${emails.length} emails to database`);
    return emails.length;
  } catch (error) {
    console.error("Error during database transaction:", error);
    throw error;
  }
}

// 이메일 조회
async function getEmails(limit = 100, offset = 0) {
  if (!db) {
    initDatabase();
  }

  const stmt = db.prepare(`
    SELECT 
      e.id, e.thread_id as threadId, e.subject, e.sender as from, 
      e.recipient as to, e.date, e.snippet, e.internal_date as internalDate,
      GROUP_CONCAT(el.label) as labels
    FROM emails e
    LEFT JOIN email_labels el ON e.id = el.email_id
    GROUP BY e.id
    ORDER BY e.internal_date DESC
    LIMIT ? OFFSET ?
  `);

  const emails = stmt.all(limit, offset);

  // labels 문자열을 배열로 변환
  return emails.map((email) => ({
    ...email,
    labels: email.labels ? email.labels.split(",") : [],
  }));
}

// 특정 이메일 조회
async function getEmailById(id) {
  if (!db) {
    initDatabase();
  }

  const stmt = db.prepare(`
    SELECT 
      e.id, e.thread_id as threadId, e.subject, e.sender as from, 
      e.recipient as to, e.date, e.body, e.snippet, 
      e.internal_date as internalDate,
      GROUP_CONCAT(el.label) as labels
    FROM emails e
    LEFT JOIN email_labels el ON e.id = el.email_id
    WHERE e.id = ?
    GROUP BY e.id
  `);

  const email = stmt.get(id);

  if (!email) {
    return null;
  }

  // labels 문자열을 배열로 변환
  return {
    ...email,
    labels: email.labels ? email.labels.split(",") : [],
  };
}

module.exports = {
  initDatabase,
  saveEmails,
  getEmails,
  getEmailById,
};
