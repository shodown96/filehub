import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { fileService } from '../services/fileService';
import { getAxiosError } from '../utils';

export const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: fileService.uploadFile,
    onSuccess: () => {
      // Invalidate and refetch files query
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSelectedFile(null);
      setCustomName("")
      // onUploadSuccess();
    },
    onError: (error) => {
      console.error('Upload error:', error);
      const message = getAxiosError(error, "Failed to upload file. Please try again.")
      setError(message)
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setError(null);
      await uploadMutation.mutateAsync({ customName, selectedFile });
    } catch (err) {
      // Error handling is done in onError callback
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <CloudArrowUpIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (optional)
          </label>
          <input
            placeholder="Enter custom name of file"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  value={selectedFile ? undefined : ""}
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Any file up to 10MB</p>
          </div>
        </div>
        {selectedFile ? (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name}
          </div>
        ) : null}
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        ) : null}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!selectedFile || uploadMutation.isPending
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
        >
          {uploadMutation.isPending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </button>
      </div>
    </div>
  );
}; 