import React from 'react';
// import logo from './logo.svg';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
// import { Chat } from './components/chat/Chat';
import SignIn from './components/SignIn/SignIn';
import socketClient from 'socket.io-client';
// import './chat.css';
const SERVER = 'http://localhost:3000';
const CHANNELS_URL = SERVER + '/tests/getChannels';
export class App extends React.Component {
  state = {
    channels: null,
    socket: null,
    channel: null,
  };
  socket;
  componentDidMount() {
    this.loadChannels();
    this.configureSocket();
  }

  configureSocket = () => {
    var socket = socketClient(SERVER, {
      withCredentials: false,
      reconnectionAttempts: 10,
      timeout: 10000,
      //   transports: ['websocket', 'polling']
    });

    socket.on('connection', () => {
      if (this.state.channel) {
        this.handleChannelSelect(this.state.channel.id);
      }
    });

    socket.on('destroyedDevices', (data) => {
      console.log('destroy event');
      console.log(data);
    });
    socket.on('channel', (channel) => {
      let channels = this.state.channels;
      channels.forEach((c) => {
        if (c.id === channel.id) {
          c.participants = channel.participants;
        }
      });
      this.setState({ channels });
    });
    socket.on('message', (message) => {
      let channels = this.state.channels;
      channels.forEach((c) => {
        if (c.id === message.channel_id) {
          if (!c.messages) {
            c.messages = [message];
          } else {
            c.messages.push(message);
          }
        }
      });
      this.setState({ channels });
    });
    this.socket = socket;
  };

  loadChannels = async () => {
    try {
      fetch(CHANNELS_URL).then(async (response) => {
        let data = await response.json();
        this.setState({ channels: data.channels });
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleChannelSelect = (id) => {
    let channel = this.state.channels.find((c) => {
      return c.id === id;
    });
    this.setState({ channel });
    this.socket.emit('channel-join', id, (ack) => {});
  };

  handleSendMessage = (channel_id, text) => {
    this.socket.emit('send-message', { channel_id, text, senderName: this.socket.id, id: Date.now() });
  };

  render() {
    //   return (
    //     <div className='chat-app'>
    //       <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} />
    //       <MessagesPanel onSendMessage={this.handleSendMessage} channel={this.state.channel} />
    //     </div>
    //   );
    return (
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          {/* <Route path='chat' element={<Chat />} /> */}
          <Route path='sign-in' element={<SignIn socket={this.socket} />} />
        </Routes>
      </Router>
    );
  }
}

// export default function App() {

//   return (
//     <Router>
//       <Routes>
//         <Route path='/' element={<Home />} />
//         <Route path='chat' element={<Chat />} />
//         <Route path='sign-in' element={<SignIn deviceId= />} />
//       </Routes>
//     </Router>
//   );
// }
