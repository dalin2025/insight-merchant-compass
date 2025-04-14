
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { UploadedFile } from './FileHistoryDisplay';

interface SavedFileInfoProps {
  file: UploadedFile | null;
  dataSaved: boolean;
  preserveData?: boolean;
}

const SavedFileInfo: React.FC<SavedFileInfoProps> = ({ file, dataSaved, preserveData = false }) => {
  if (!file || (!dataSaved && !preserveData)) return null;
  
  return (
    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-green-500" />
      <div className="flex-1">
        <div className="text-sm font-medium text-green-700">Data saved successfully</div>
        <div className="text-xs text-green-600">
          File: {file.name} • {file.size < 1024 ? file.size + ' bytes' : 
                 file.size < 1048576 ? (file.size / 1024).toFixed(1) + ' KB' : 
                 (file.size / 1048576).toFixed(1) + ' MB'} • Saved on {file.date.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SavedFileInfo;
