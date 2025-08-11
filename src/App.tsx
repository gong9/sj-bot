import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, theme, message, Upload, Button } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
import { UploadOutlined, DownloadOutlined, FileTextOutlined, CloudUploadOutlined, SendOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

interface ChatMessage {
  id: string;
  content: React.ReactNode;
  role: 'user' | 'assistant';
  status?: 'loading' | 'success' | 'error';
  uploadedFile?: File;
  downloadFiles?: { name: string; url: string; size: number }[];
}

interface UploadedFileDisplayProps {
  file: File;
}

const UploadedFileDisplay: React.FC<UploadedFileDisplayProps> = ({ file }) => (
  <div className="uploaded-file fade-in-up">
    <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
    <span>{file.name}</span>
    <span style={{ color: '#666', marginLeft: 8 }}>
      ({(file.size / 1024).toFixed(1)} KB)
    </span>
  </div>
);

interface DownloadFilesDisplayProps {
  files: { name: string; url: string; size: number }[];
}

const DownloadFilesDisplay: React.FC<DownloadFilesDisplayProps> = ({ files }) => (
  <div className="download-files fade-in-up">
    <div style={{ marginBottom: 8, fontWeight: 500 }}>处理完成，请下载结果文件：</div>
    {files.map((file, index) => (
      <div key={index} className="download-file-item">
        <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
        <span>{file.name}</span>
        <span style={{ color: '#666', marginLeft: 8 }}>
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
        <a
          href={file.url}
          download={file.name}
          style={{ marginLeft: 12 }}
          onClick={(e) => {
            e.preventDefault();
            // 模拟文件下载
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.click();
            message.success(`开始下载 ${file.name}`);
          }}
        >
          <DownloadOutlined /> 下载
        </a>
      </div>
    ))}
  </div>
);

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const uploadFile = async (file: File): Promise<{ name: string; url: string; size: number }[]> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data || [];
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  };

  const sendTextMessage = async (text: string): Promise<{ name: string; url: string; size: number }[]> => {
    try {
      const response = await fetch('http://localhost:3001/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });
      
      if (!response.ok) {
        throw new Error(`发送失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('文本消息发送错误:', error);
      throw error;
    }
  };

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
      
      // message.error('消息处理失败！');
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
      console.log('添加新消息:', newMessages.length, newMessages);
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
      
      // message.success('文件处理完成！');
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
      
      // message.error('文件处理失败！');
    } finally {
      setLoading(false);
    }
  };

  const onRequest = async (info: any) => {
    const { message: inputMessage } = info;
    
    if (inputMessage?.trim()) {
      await handleTextMessage(inputMessage.trim());
      setInputValue(''); // 清空输入框状态
    }
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      handleTextMessage(inputValue.trim());
      setInputValue(''); // 清空输入框
    }
  };

  const handleUploadChange = (info: any) => {
    console.log('Upload change event:', info); // 调试信息
  };

  return (
    <Layout className="chat-container" style={{ height: '100vh' }}>
      <Header className="app-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: colorBgContainer,
        borderBottom: '1px solid #d9d9d9',
        padding: '0 24px'
      }}>
        <Title level={3} style={{ margin: 0 }}>
          蓝盾智擎-市场监管智能大脑
        </Title>
      </Header>
      
      <Content style={{ 
        padding: '24px',
        background: '#f5f5f5'
      }}>
        <div
          className="chat-content"
          style={{
            background: colorBgContainer,
            height: 'calc(100vh - 112px)', // 使用固定高度而不是 minHeight
            borderRadius: borderRadiusLG,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="messages-container" style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            padding: '16px',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0 // 关键：允许 flex 子元素缩小
          }}>
            {(() => {
              console.log('当前消息数量:', messages.length, messages);
              return messages.length === 0;
            })() ? (
              <div className="empty-state">
                <CloudUploadOutlined />
                <div>欢迎使用 RAG 智能文档处理系统</div>
                <div style={{ fontSize: 14, marginTop: 8, opacity: 0.6 }}>
                  发送消息或上传文档，让AI为您智能分析处理
                </div>
              </div>
            ) : (
              <div className="chat-messages" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                flex: 1
              }}>
                {messages.map((msg, index) => (
                  <div 
                    key={msg.id} 
                    className="message-slide-in"
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '11px'
                    }}
                  >
                    <Bubble
                      content={msg.content}
                      avatar={
                        msg.role === 'user' 
                          ? { 
                              style: { background: '#1890ff' },
                              children: '用户'
                            }
                          : { 
                              style: { background: '#52c41a' },
                              children: 'AI'
                            }
                      }
                      placement={msg.role === 'user' ? 'end' : 'start'}
                      loading={msg.status === 'loading'}
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        maxWidth: '80%',
                        width: 'auto'
                      }}
                    />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="input-area" style={{ 
            borderTop: '1px solid #d9d9d9',
            padding: '16px',
            background: '#fafafa',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <Sender
                placeholder="输入消息或上传文件进行处理..."
                onSubmit={onRequest}
                loading={loading}
                value={inputValue}
                onChange={(value) => setInputValue(value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                    e.preventDefault();
                    handleTextMessage(inputValue.trim());
                    setInputValue('');
                  }
                }}
                actions={
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSendClick}
                    title="发送 (Enter)"
                    loading={loading}
                    disabled={!inputValue.trim()}
                  ></Button>
                }
                style={{
                  background: '#fff',
                  borderRadius: 8
                }}
              />
            </div>
            
            <Upload
              accept=".txt,.pdf,.doc,.docx,.md"
              multiple={false}
              maxCount={1}
              showUploadList={false}
              onChange={handleUploadChange}
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false; 
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={loading}
                type="primary"
                size="large"
                className="fade-in-up"
              >
                上传文件
              </Button>
            </Upload>
          </div>
          
          <div style={{ 
            padding: '0 16px 16px',
            fontSize: 12, 
            color: '#666',
            textAlign: 'center',
            background: '#fafafa'
          }}>
            支持文本对话和上传 .txt, .pdf, .doc, .docx, .md 格式文件
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
