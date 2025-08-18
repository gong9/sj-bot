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
        <span>{file.fileName}</span>
        <span style={{ color: '#666', marginLeft: 8 }}>
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
        <a
          href={'http://211.90.218.31:8081/v1/downloadFile/'+file.url}
          download={file.fileName}
          style={{ marginLeft: 12 }}
          onClick={(e) => {
            e.preventDefault();
           
            const link = document.createElement('a');
            link.href = 'http://211.90.218.31:8081/v1/downloadFile/'+file.url;
            link.download = file.fileName;
            link.click();
            message.success(`开始下载 ${file.fileName}`);
          }}
        >
          <DownloadOutlined /> 下载
        </a>
      </div>
    ))}
  </div>
); 