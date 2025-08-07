import React, { useState } from 'react';
import { Layout, Typography, theme, message, Upload, Button, Empty } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
import { UploadOutlined, DownloadOutlined, FileTextOutlined, CloudUploadOutlined } from '@ant-design/icons';
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

  // 模拟API调用
  const simulateProcessing = async (file: File): Promise<{ name: string; url: string; size: number }[]> => {
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // 模拟返回处理结果文件
    const resultFiles = [
      {
        name: `processed_${file.name}`,
        url: URL.createObjectURL(new Blob(['这是处理后的文件内容\n经过RAG系统处理的结果'], { type: 'text/plain' })),
        size: Math.floor(Math.random() * 50000) + 10000
      },
      {
        name: `analysis_report.txt`,
        url: URL.createObjectURL(new Blob(['文档分析报告\n\n1. 内容摘要\n2. 关键信息提取\n3. 相关性分析'], { type: 'text/plain' })),
        size: Math.floor(Math.random() * 30000) + 5000
      }
    ];
    
    return resultFiles;
  };

  const handleFileUpload = async (file: File) => {
    console.log('开始处理文件:', file.name, file.size); // 调试信息
    if (!file) return;

    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: userMessageId,
      content: <UploadedFileDisplay file={file} />,
      role: 'user',
      uploadedFile: file
    };

    // 添加加载中的助手消息
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
      // 模拟处理文件
      const resultFiles = await simulateProcessing(file);
      
      // 更新助手消息为成功状态
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
      
      message.success('文件处理完成！');
    } catch (error) {
      // 更新助手消息为错误状态
      const errorMessage: ChatMessage = {
        id: assistantMessageId,
        content: '抱歉，处理文件时出现错误，请重试。',
        role: 'assistant',
        status: 'error'
      };

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessageId ? errorMessage : msg)
      );
      
      message.error('文件处理失败！');
    } finally {
      setLoading(false);
    }
  };

  const onRequest = async (info: any) => {
    const { message: inputMessage } = info;
    
    if (inputMessage?.trim()) {
      message.warning('请上传文件进行处理');
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
          市监局智能体
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
            minHeight: 'calc(100vh - 112px)',
            borderRadius: borderRadiusLG,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            padding: '16px',
            overflowY: 'auto'
          }}>
            {(() => {
              console.log('当前消息数量:', messages.length, messages);
              return messages.length === 0;
            })() ? (
              <div className="empty-state">
                <CloudUploadOutlined />
                <div>欢迎使用 RAG 智能文档处理系统</div>
                <div style={{ fontSize: 14, marginTop: 8, opacity: 0.6 }}>
                  上传文档，让AI为您智能分析处理
                </div>
              </div>
            ) : (
              <div style={{ 
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
                      marginBottom: '12px'
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
                placeholder="请上传文件进行处理..."
                onSubmit={onRequest}
                loading={loading}
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
                console.log('Before upload:', file); // 调试信息
                handleFileUpload(file);
                return false; // 阻止自动上传
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
            支持上传 .txt, .pdf, .doc, .docx, .md 格式文件，文件大小不超过 10MB
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
