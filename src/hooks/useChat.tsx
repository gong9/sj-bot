import { useState, useEffect, useRef } from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';
import type { ChatMessage } from '../types';
import { uploadFile, sendTextMessage } from '../services/api';
import { UploadedFileDisplay, DownloadFilesDisplay } from '../components/FileComponents';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTextMessage = async (text: string) => {
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    const userMessage: ChatMessage = {
      id: userMessageId,
      content: text,
      role: 'user'
    };

    const loadingMessage: ChatMessage = {
      id: assistantMessageId,
      content: (
        <div className="processing-indicator">
          <CloudUploadOutlined />
          正在处理您的消息，请稍候...
        </div>
      ),
      role: 'assistant',
      status: 'loading'
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setLoading(true);

    try {
      const resultFiles = await sendTextMessage(text);
      
      const responseMessage: ChatMessage = {
        id: assistantMessageId,
        content: <DownloadFilesDisplay files={resultFiles} />,
        role: 'assistant',
        status: 'success',
        downloadFiles: resultFiles
      };

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessageId ? responseMessage : msg)
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: assistantMessageId,
        content: '抱歉，处理消息时出现错误，请重试。',
        role: 'assistant',
        status: 'error'
      };

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessageId ? errorMessage : msg)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    const userMessage: ChatMessage = {
      id: userMessageId,
      content: <UploadedFileDisplay file={file} />,
      role: 'user',
      uploadedFile: file
    };

    const loadingMessage: ChatMessage = {
      id: assistantMessageId,
      content: (
        <div className="processing-indicator">
          <CloudUploadOutlined />
          正在处理您的文件，请稍候...
        </div>
      ),
      role: 'assistant',
      status: 'loading'
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage, loadingMessage];
      // console.log('添加新消息:', newMessages.length, newMessages);
      return newMessages;
    });
    setLoading(true);

    try {
      const resultFiles = await uploadFile(file);
      
      const successMessage: ChatMessage = {
        id: assistantMessageId,
        content: <DownloadFilesDisplay files={resultFiles} />,
        role: 'assistant',
        status: 'success',
        downloadFiles: resultFiles
      };

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessageId ? successMessage : msg)
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: assistantMessageId,
        content: '抱歉，处理文件时出现错误，请重试。',
        role: 'assistant',
        status: 'error'
      };

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessageId ? errorMessage : msg)
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    inputValue,
    setInputValue,
    messagesEndRef,
    handleTextMessage,
    handleFileUpload,
  };
}; 