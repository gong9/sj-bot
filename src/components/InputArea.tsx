import React from 'react';
import { Upload, Button } from 'antd';
import { Sender } from '@ant-design/x';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import type { InputAreaProps } from '../types';

export const InputArea: React.FC<InputAreaProps> = ({
  loading,
  inputValue,
  setInputValue,
  onTextMessage,
  onFileUpload
}) => {
  const handleSendClick = () => {
    if (inputValue.trim()) {
      onTextMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const onRequest = async (info: any) => {
    const { message: inputMessage } = info;
    
    if (inputMessage?.trim()) {
      await onTextMessage(inputMessage.trim());
      setInputValue('');
    }
  };

  const handleUploadChange = (info: any) => {
    console.log('Upload change event:', info);
  };

  return (
    <>
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
                onTextMessage(inputValue.trim());
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
            onFileUpload(file);
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
    </>
  );
}; 