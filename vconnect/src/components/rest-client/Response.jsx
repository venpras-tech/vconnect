import React, { useState } from 'react';
import './Response.css';

const Response = ({ response }) => {
  const [isPretty, setIsPretty] = useState(false);

  if (!response) {
    return (
      <div className="response-container">
        <h2>Response</h2>
        <p>No response yet. Send a request to see the response here.</p>
      </div>
    );
  }

  const { status, data, headers } = response;
  const size = headers['content-length'] || 0;
  const time = response.headers['request-duration'] || 'N/A';

  const formatResponse = () => {
    try {
      if (isPretty) {
        return JSON.stringify(data, null, 2);
      }
      return JSON.stringify(data);
    } catch (error) {
      return 'Error parsing JSON response.';
    }
  };

  return (
    <div className="response-container">
      <h2>Response</h2>
      <div className="response-details">
        <span>Status: {status}</span>
        <span>Time: {time} ms</span>
        <span>Size: {size} B</span>
      </div>
      <div className="response-actions">
        <button onClick={() => setIsPretty(false)} className={!isPretty ? 'active' : ''}>
          Raw
        </button>
        <button onClick={() => setIsPretty(true)} className={isPretty ? 'active' : ''}>
          Pretty
        </button>
      </div>
      <div className="response-body">
        <pre>{formatResponse()}</pre>
      </div>
    </div>
  );
};

export default Response;