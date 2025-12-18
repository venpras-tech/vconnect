import React, { useState } from 'react';
import KeyValuePair from './KeyValuePair';
import CodeEditor from '../json-utils/CodeEditor';
import './RequestTabs.css';

const RequestTabs = ({
  params,
  headers,
  body,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
}) => {
  const [activeTab, setActiveTab] = useState('params');

  const addPair = (type) => {
    const newPair = { id: Date.now(), key: '', value: '', enabled: true };
    if (type === 'params') {
      onParamsChange([...params, newPair]);
    } else {
      onHeadersChange([...headers, newPair]);
    }
  };

  const removePair = (type, id) => {
    if (type === 'params') {
      onParamsChange(params.filter((p) => p.id !== id));
    } else {
      onHeadersChange(headers.filter((h) => h.id !== id));
    }
  };

  const handlePairChange = (type, updatedPair) => {
    if (type === 'params') {
      onParamsChange(
        params.map((p) => (p.id === updatedPair.id ? updatedPair : p))
      );
    } else {
      onHeadersChange(
        headers.map((h) => (h.id === updatedPair.id ? updatedPair : h))
      );
    }
  };

  return (
    <div className="payload-tabs-container">
      <div className="payload-tabs">
        <div
          className={`payload-tab ${activeTab === 'params' ? 'active' : ''}`}
          onClick={() => setActiveTab('params')}
        >
          Query Params
        </div>
        <div
          className={`payload-tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </div>
        <div
          className={`payload-tab ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
        >
          Body
        </div>
      </div>
      <div className="payload-tab-content">
        {activeTab === 'params' && (
          <div>
            {params.map((param) => (
              <KeyValuePair
                key={param.id}
                pair={param}
                onPairChange={(p) => handlePairChange('params', p)}
                onRemovePair={() => removePair('params', param.id)}
              />
            ))}
            <button onClick={() => addPair('params')}>Add Param</button>
          </div>
        )}
        {activeTab === 'headers' && (
          <div>
            {headers.map((header) => (
              <KeyValuePair
                key={header.id}
                pair={header}
                onPairChange={(h) => handlePairChange('headers', h)}
                onRemovePair={() => removePair('headers', header.id)}
              />
            ))}
            <button onClick={() => addPair('headers')}>Add Header</button>
          </div>
        )}
        {activeTab === 'body' && (
          <div className="body-editor-container">
              <CodeEditor value={body} onChange={onBodyChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTabs;