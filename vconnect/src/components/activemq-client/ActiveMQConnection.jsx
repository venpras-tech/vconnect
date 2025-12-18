import React from 'react';
import CodeEditor from '../json-utils/CodeEditor';
import './ActiveMQConnection.css';

const ActiveMQConnection = ({
  host,
  queue,
  message,
  username,
  password,
  onHostChange,
  onQueueChange,
  onMessageChange,
  onUsernameChange,
  onPasswordChange,
  onSend,
  response,
}) => {
  return (
    <div className="activemq-connection-container">
      <div className="connection-header">
        <input
          type="text"
          className="activemq-input"
          placeholder="ActiveMQ Host URL"
          value={host}
          onChange={(e) => onHostChange(e.target.value)}
        />
        <button className="send-button-activemq" onClick={onSend}>
          Send
        </button>
      </div>
      <div className="auth-inputs">
        <input
          type="text"
          className="activemq-input"
          placeholder="Username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />
        <input
          type="password"
          className="activemq-input"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>
      <input
        type="text"
        className="activemq-input"
        placeholder="Queue"
        value={queue}
        onChange={(e) => onQueueChange(e.target.value)}
      />
      <div className="message-editor">
        <label>Message</label>
        <CodeEditor
          value={message}
          onChange={onMessageChange}
          language="json"
          theme="light"
        />
      </div>
      <div className="response-section">
        <label>Response</label>
        <CodeEditor
          value={response}
          readOnly={true}
          language="json"
          theme="light"
        />
      </div>
    </div>
  );
};

export default ActiveMQConnection;