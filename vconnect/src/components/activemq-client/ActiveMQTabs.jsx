import React from 'react';
import './ActiveMQTabs.css';

const ActiveMQTabs = ({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-list">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
            <button className="close-tab-button" onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <button className="new-tab-button" onClick={onNewTab}>+</button>
    </div>
  );
};

export default ActiveMQTabs;