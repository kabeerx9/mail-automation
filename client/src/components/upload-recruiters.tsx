import { useCallback, useEffect, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

interface RecruiterData {
  [key: string]: string;
}

export default function UploadRecruiters() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<RecruiterData[]>([]);
  const [fileStats, setFileStats] = useState<{
    totalRecruiters: number;
    columns: string[];
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-invalid-type') {
        toast.error('Please upload a CSV file only', {
          duration: 3000,
          icon: '📁'
        });
      } else if (error.code === 'too-many-files') {
        toast.error('Please upload only one file', {
          duration: 3000,
          icon: '📁'
        });
      }
      return;
    }

    if (acceptedFiles?.[0]) {
      setSelectedFile(acceptedFiles[0]);
      setParsedData([]);
      setFileStats(null);
      toast.success('File selected successfully', {
        duration: 2000,
        icon: '✅'
      });
    }
  }, []);

  useEffect(() => {
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          const data = results.data as RecruiterData[];
          setParsedData(data);
          setFileStats({
            totalRecruiters: data.length,
            columns: results.meta.fields || []
          });
        },
        error: (error) => {
          toast.error('Error parsing CSV file: ' + error.message);
          setSelectedFile(null);
          setParsedData([]);
          setFileStats(null);
        }
      });
    }
  }, [selectedFile]);

  const handleUpload = () => {
    if (!selectedFile || !parsedData.length) return;
    // TODO: Implement file upload logic
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upload Recruiters</h2>
        <p className="mt-2 text-gray-600">Upload your CSV file containing recruiter information</p>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center
          transition-all cursor-pointer
          ${isDragReject ? 'border-red-500 bg-red-50' :
            isDragActive ? 'border-blue-500 bg-blue-50' :
            'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className={`w-12 h-12 ${
                isDragReject ? 'text-red-500' :
                isDragActive ? 'text-blue-500' :
                'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="text-sm text-gray-600">
            {isDragReject ? (
              <p className="text-red-500 font-medium">Please upload a CSV file only!</p>
            ) : isDragActive ? (
              <p className="text-blue-500 font-medium">Drop your CSV file here</p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : 'Drag and drop your CSV file here'
                  }
                </p>
                <p className="text-gray-500">or click to browse</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-500">
              File size: {(selectedFile.size / 1024).toFixed(2)} KB
            </div>
          )}
        </div>
      </div>

      {fileStats && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">File Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-32">Total Recruiters:</span>
              <span className="font-medium text-gray-900">{fileStats.totalRecruiters}</span>
            </div>
            <div className="flex items-start text-sm">
              <span className="text-gray-500 w-32">Columns Found:</span>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {fileStats.columns.map((column) => (
                    <span
                      key={column}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {fileStats.totalRecruiters > 0 && (
              <div className="flex items-start text-sm mt-4">
                <span className="text-gray-500 w-32">Preview:</span>
                <div className="flex-1 overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {fileStats.columns.map((column) => (
                            <th
                              key={column}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedData.slice(0, 3).map((row, index) => (
                          <tr key={index}>
                            {fileStats.columns.map((column) => (
                              <td
                                key={column}
                                className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap"
                              >
                                {row[column] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !parsedData.length}
          className={`
            px-6 py-2.5 rounded-lg font-medium text-sm
            transition-all duration-200
            ${selectedFile && parsedData.length
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Upload Recruiters
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Supported format: CSV</p>
        <p className="mt-1">Maximum file size: 5MB</p>
      </div>
    </div>
  );
}
