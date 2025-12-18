import React from 'react';
import CodeEditor from '../json-utils/CodeEditor';
import NatsResponse from './NatsResponse';
import './NatsConnection.css';

const NatsConnection = ({
  url,
  subject,
  payload,
  onUrlChange,
  onSubjectChange,
  onPayloadChange,
  onPublish,
  response,
}) => {
  return (
    <div className="nats-connection-container">
      <div className="connection-header">
        <input
          type="text"
          className="nats-input"
          placeholder="NATS Connection URL"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        <button className="publish-button" onClick={onPublish}>
          Publish
        </button>
      </div>
      <input
        type="text"
        className="nats-input"
        placeholder="Subject"
        value={subject}
        onChange={(e) => onSubjectChange(e.target.value)}
      />
      <div className="payload-editor">
        <label>Payload</label>
        <CodeEditor value={payload} onChange={onPayloadChange} />
      </div>
      <NatsResponse response={response} />
    </div>
  );
};

export default NatsConnection;