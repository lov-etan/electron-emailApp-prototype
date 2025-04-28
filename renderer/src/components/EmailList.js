import React, { useState } from "react";

function EmailList({ emails }) {
  const [selectedEmail, setSelectedEmail] = useState(null);

  if (!emails || emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">이메일이 없습니다.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const toggleEmailSelection = (emailId) => {
    if (selectedEmail === emailId) {
      setSelectedEmail(null);
    } else {
      setSelectedEmail(emailId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 이메일 목록 헤더 */}
      <div className="bg-gray-100 px-4 py-3 border-b flex items-center">
        <div className="flex-shrink-0 pr-2">
          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <button className="text-gray-500 hover:bg-gray-200 p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="text-gray-500 hover:bg-gray-200 p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">{emails.length}개의 이메일</div>
      </div>

      {/* 이메일 목록 */}
      <div className="divide-y divide-gray-200">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedEmail === email.id ? "bg-blue-50" : ""
            }`}
            onClick={() => toggleEmailSelection(email.id)}
          >
            <div className="flex-shrink-0 pr-3 pt-1">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                checked={selectedEmail === email.id}
                onChange={() => {}}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      selectedEmail === email.id || !email.read
                        ? "text-gray-900 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {email.from && email.from.includes("<")
                      ? email.from.split("<")[0].trim()
                      : email.from}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      selectedEmail === email.id || !email.read
                        ? "text-gray-900 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {email.subject || "(제목 없음)"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {email.snippet}
                  </p>
                </div>

                <div className="ml-2 flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {email.date ? formatDate(email.date) : "날짜 없음"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmailList;
