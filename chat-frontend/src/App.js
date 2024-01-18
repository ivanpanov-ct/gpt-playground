import logo from './logo.svg';
import './App.css';
import ChatWindow from './chat-window/chat-window';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
        “The limits of my language means the limits of my world.” ― Ludwig Wittgenstein
        </p>
        <ChatWindow/>
      </header>
    </div>
  );
}

export default App;
