import React, { createContext, useContext, useState } from 'react';
import type { WorkflowFile } from '../types';

interface WorkflowContextType {
  activeFile: WorkflowFile | null;
  setActiveFile: (file: WorkflowFile | null) => void;
  clearActiveFile: () => void;
  handoffToTool: (blob: Blob, name: string, fromTool: string, pageCount?: number) => void;
}

const WorkflowContext = createContext<WorkflowContextType>({
  activeFile: null,
  setActiveFile: () => {},
  clearActiveFile: () => {},
  handoffToTool: () => {},
});

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFile, setActiveFile] = useState<WorkflowFile | null>(null);

  const clearActiveFile = () => setActiveFile(null);

  const handoffToTool = (blob: Blob, name: string, fromTool: string, pageCount?: number) => {
    setActiveFile({
      blob,
      name,
      size: blob.size,
      pageCount,
      fromTool,
      timestamp: Date.now(),
    });
  };

  return (
    <WorkflowContext.Provider value={{ activeFile, setActiveFile, clearActiveFile, handoffToTool }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(WorkflowContext);
