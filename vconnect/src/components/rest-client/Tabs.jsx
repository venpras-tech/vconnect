import React from 'react';
import './Tabs.css';

const Tabs = ({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span>{tab.name}</span>
            <button className="close-tab-btn" onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <button className="new-tab-btn" onClick={onNewTab}>
        +
      </button>
    </div>
  );
};

export default Tabs;