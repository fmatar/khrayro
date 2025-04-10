import WebSocket from 'ws';

// Define the MessageType enum and ChatMessage interface matching the Quarkus server
enum MessageType {
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  CHAT_MESSAGE = 'CHAT_MESSAGE'
}

interface ChatMessage {
  type: MessageType;
  from: string;
  message: string | null;
}

// Configuration
const BOT_USERNAME = 'bot';
const WEBSOCKET_URL = `ws://localhost:8080/chat/${BOT_USERNAME}`;

// Initialize the WebSocket client
const ws = new WebSocket(WEBSOCKET_URL);

// Handle connection open
ws.on('open', () => {
  console.log(`Chatbot connected as ${BOT_USERNAME}`);
});

// Handle incoming messages
ws.on('message', (data: WebSocket.Data) => {
  const message: ChatMessage = JSON.parse(data.toString());
  console.log(`Received: ${message.type} from ${message.from}${message.message ? `: ${message.message}` : ''}`);

  // Process the message
  handleMessage(message);
});

// Handle connection close
ws.on('close', () => {
  console.log('Chatbot disconnected from the server');
  // Optional: Implement reconnection logic here
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Function to send a message
function sendMessage(text: string) {
  const chatMessage: ChatMessage = {
    type: MessageType.CHAT_MESSAGE,
    from: BOT_USERNAME,
    message: text
  };
  ws.send(JSON.stringify(chatMessage));
  console.log(`Sent: ${text}`);
}

// Function to handle incoming messages and generate responses
function handleMessage(message: ChatMessage) {
  // Ignore messages from the bot itself to prevent infinite loops
  if (message.from === BOT_USERNAME) return;

  switch (message.type) {
    case MessageType.USER_JOINED:
      sendMessage(`Welcome, ${message.from}! How can I assist you today?`);
      break;

    case MessageType.USER_LEFT:
      console.log(`${message.from} has left the chat`);
      break;

    case MessageType.CHAT_MESSAGE:
      if (message.message) {
        // Simple response logic: echo the message with a bot prefix
        const response = `Hello ${message.from}, you said: "${message.message}"`;
        sendMessage(response);
      }
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

// Keep the process running
process.on('SIGINT', () => {
  ws.close();
  console.log('Chatbot shutting down');
  process.exit(0);
});
