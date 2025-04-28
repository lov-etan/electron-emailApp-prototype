import React from "react";

function EmailToolbar({ onRefresh, onCheckDatabase, isLoading }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-4">
      <div className="px-4 py-2 flex items-center">
        <h2 className="text-lg font-medium text-gray-800 mr-4">받은편지함</h2>

        <div className="flex space-x-2 ml-auto">
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center"
            onClick={onRefresh}
            disabled={isLoading}
            title="이메일 다시 가져오기"
          >
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
            {isLoading && <span className="ml-1 text-sm">새로고침 중...</span>}
          </button>

          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={onCheckDatabase}
            disabled={isLoading}
            title="데이터베이스 상태 확인"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 00-8 8c0 3.038 1.68 5.694 4.17 7.068 1.122.618 2.4.932 3.83.932s2.708-.314 3.83-.932C16.32 15.694 18 13.038 18 10a8 8 0 00-8-8zm5 9a1 1 0 01-2 0V7a1 1 0 012 0v4zm-8 0a1 1 0 01-2 0V7a1 1 0 012 0v4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailToolbar;
