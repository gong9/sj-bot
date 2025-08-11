import { Layout, Typography, theme } from 'antd';
import { useChat } from './hooks/useChat';
import { EmptyState, ChatMessages } from './components/ChatComponents';
import { InputArea } from './components/InputArea';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const {
    messages,
    loading,
    inputValue,
    setInputValue,
    messagesEndRef,
    handleTextMessage,
    handleFileUpload,
  } = useChat();

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
            height: 'calc(100vh - 112px)',
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
            minHeight: 0
          }}>
            {(() => {
              // console.log('当前消息数量:', messages.length, messages);
              return messages.length === 0;
            })() ? (
              <EmptyState />
            ) : (
              <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            )}
          </div>
          
          <InputArea
            loading={loading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onTextMessage={handleTextMessage}
            onFileUpload={handleFileUpload}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;
