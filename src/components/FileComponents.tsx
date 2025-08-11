import React from 'react';
import { message } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadedFileDisplayProps, DownloadFilesDisplayProps } from '../types';

export const UploadedFileDisplay: React.FC<UploadedFileDisplayProps> = ({ file }) => (
  <div className="uploaded-file fade-in-up">
    <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
    <span>{file.name}</span>
    <span style={{ color: '#666', marginLeft: 8 }}>
      ({(file.size / 1024).toFixed(1)} KB)
    </span>
  </div>
);

export const DownloadFilesDisplay: React.FC<DownloadFilesDisplayProps> = ({ files }) => (
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