import React, { useState } from 'react';
import './NatsResponse.css';

const NatsResponse = ({ response }) => {
  const [activeTab, setActiveTab] = useState('raw');

  if (!response) {
    return (
      <div className="nats-response-container">
        <h2>Response</h2>
        <p>No response yet. Publish a message to see the response here.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'raw':
        return response;
      case 'json':
        try {
          const parsedJson = JSON.parse(response);
          return JSON.stringify(parsedJson, null, 2);
        } catch (error) {
          return 'Error parsing JSON: ' + error.message;
        }
      case 'base64':
        try {
          return atob(response);
        } catch (error) {
          return 'Error decoding Base64: ' + error.message;
        }
      default:
        return response;
    }
  };

  return (
    <div className="nats-response-container">
      <div className="response-tabs">
        <button onClick={() => setActiveTab('raw')} className={activeTab === 'raw' ? 'active' : ''}>
          Raw
        </button>
        <button onClick={() => setActiveTab('json')} className={activeTab === 'json' ? 'active' : ''}>
          JSON
        </button>
        <button onClick={() => setActiveTab('base64')} className={activeTab === 'base64' ? 'active' : ''}>
          Base64 Decoded
        </button>
      </div>
      <div className="response-body">
        <pre>{renderContent()}</pre>
      </div>
    </div>
  );
};

export default NatsResponse;