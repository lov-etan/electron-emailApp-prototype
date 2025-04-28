import React from "react";

function DatabaseStatus({ dbStatus }) {
  if (!dbStatus) return null;

  return (
    <div
      className={`mb-4 bg-white border rounded-lg shadow-sm overflow-hidden ${
        dbStatus.success ? "border-blue-200" : "border-red-200"
      }`}
    >
      <div
        className={`px-4 py-3 border-b ${
          dbStatus.success
            ? "bg-blue-50 border-blue-100"
            : "bg-red-50 border-red-100"
        }`}
      >
        <h3 className="font-semibold text-gray-800">데이터베이스 상태</h3>
      </div>

      <div className="p-4">
        {dbStatus.success ? (
          <>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <p className="text-gray-700">
                저장된 이메일:{" "}
                <span className="font-medium">{dbStatus.count}개</span>
              </p>
            </div>

            {dbStatus.sampleData && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  샘플 이메일:
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm">
                    <span className="text-gray-500">제목:</span>{" "}
                    {dbStatus.sampleData.subject}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">보낸이:</span>{" "}
                    {dbStatus.sampleData.sender}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <p className="text-red-700">{dbStatus.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatabaseStatus;
