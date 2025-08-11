export const uploadFile = async (file: File): Promise<{ fileName: string; url: string; size: number }[]> => {
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

export const sendTextMessage = async (text: string): Promise<{ fileName: string; url: string; size: number }[]> => {
  try {
    const response = await fetch('http://172.16.21.121:8001/v1/genNotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caseDescription: text }),
    });
    
    if (!response.ok) {
      throw new Error(`发送失败: ${response.status}`);
    }
    
    const data = await response.json();
    return [data.data.evidences, data.data.notes]
  } catch (error) {
    console.error('文本消息发送错误:', error);
    throw error;
  }
}; 