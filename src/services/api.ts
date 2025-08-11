export const uploadFile = async (file: File): Promise<{ name: string; url: string; size: number }[]> => {
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

export const sendTextMessage = async (text: string): Promise<{ name: string; url: string; size: number }[]> => {
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