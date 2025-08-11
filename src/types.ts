import React from 'react';

export interface ChatMessage {
  id: string;
  content: React.ReactNode;
  role: 'user' | 'assistant';
  status?: 'loading' | 'success' | 'error';
  uploadedFile?: File;
  downloadFiles?: { name: string; url: string; size: number }[];
}

export interface UploadedFileDisplayProps {
  file: File;
}

export interface DownloadFilesDisplayProps {
  files: { name: string; url: string; size: number }[];
}

export interface InputAreaProps {
  loading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onTextMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
} 