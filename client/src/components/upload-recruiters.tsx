


export default function UploadRecruiters() {

  return (
    <div className="text-center p-8">
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800">No Recruiters Found</h2>
          <p className="text-yellow-600 mt-2">Please add recruiters by uploading a file</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {/* File upload logic will go here */}}
          >
            Upload Recruiters File
          </button>
        </div>
    </div>
  );
}
