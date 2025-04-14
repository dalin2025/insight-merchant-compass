
import React from 'react';
import { FileIcon } from 'lucide-react';

export interface UploadedFile {
  name: string;
  size: number;
  date: Date;
}

interface FileHistoryDisplayProps {
  files: UploadedFile[];
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const FileHistoryDisplay: React.FC<FileHistoryDisplayProps> = ({ files }) => {
  if (files.length === 0) return (
    <div className="text-sm text-gray-500 mt-4">
      No files uploaded yet
    </div>
  );
  
  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium">Recently Uploaded Files:</h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border text-sm">
            <FileIcon className="h-4 w-4 text-gray-500" />
            <div className="flex-1 truncate">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {file.date.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileHistoryDisplay;
