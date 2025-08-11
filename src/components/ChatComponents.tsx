import React from 'react';
import { Bubble } from '@ant-design/x';
import { CloudUploadOutlined } from '@ant-design/icons';
import type { ChatMessagesProps } from '../types';

export const EmptyState: React.FC = () => (
  <div className="empty-state">
    <CloudUploadOutlined />
    <div>欢迎使用 RAG 智能文档处理系统</div>
    <div style={{ fontSize: 14, marginTop: 8, opacity: 0.6 }}>
      发送消息或上传文档，让AI为您智能分析处理
    </div>
  </div>
);

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messagesEndRef }) => (
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
); 