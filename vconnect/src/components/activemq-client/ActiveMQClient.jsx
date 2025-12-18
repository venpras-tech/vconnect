import React, { useState, useEffect } from 'react';
import ActiveMQConnection from './ActiveMQConnection.jsx';
import Collections from '../rest-client/Collections.jsx';
import ActiveMQTabs from './ActiveMQTabs.jsx';
import './ActiveMQClient.css';

const ActiveMQClient = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      collectionId: null,
      name: 'Untitled Request',
      connection: {
        host: '',
        queue: '',
        message: '',
        username: '',
        password: '',
      },
      response: '',
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const savedCollections = localStorage.getItem('activeMQCollections');
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
  }, []);

  const handleNewTab = () => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: null,
      name: `Untitled Request ${tabs.length + 1}`,
      connection: {
        host: '',
        queue: '',
        message: '',
        username: '',
        password: '',
      },
      response: '',
      isDirty: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleCloseTab = (tabId) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);

    if (updatedTabs.length === 0) {
      handleNewTab();
      return;
    }

    if (tabId === activeTabId) {
      const newActiveTabIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(updatedTabs[newActiveTabIndex].id);
    }
    setTabs(updatedTabs);
  };

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
  };

  const updateActiveTabData = (data) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...data, isDirty: true } : tab
      )
    );
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handlePublish = async () => {
    try {
      const res = await fetch('/api/activemq/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeTab.connection),
      });
      const result = await res.text();
      updateActiveTabData({ response: result });
    } catch (err) {
      updateActiveTabData({ response: `Error: ${err.message}` });
    }
  };

  const handleSaveRequest = () => {
    if (activeTab.collectionId && !activeTab.isDirty) {
      return;
    }

    const isExisting = collections.some(req => req.id === activeTab.collectionId);
    let name = activeTab.name;

    if (!isExisting) {
      const newName = prompt('Enter a name for this request:', activeTab.name);
      if (!newName) return;
      name = newName;
    }

    let updatedCollections;
    let newCollectionId = activeTab.collectionId;

    if (isExisting) {
      updatedCollections = collections.map((req) =>
        req.id === activeTab.collectionId
          ? { ...req, ...activeTab.connection }
          : req
      );
    } else {
      const newCollectionItem = {
        id: Date.now(),
        name,
        ...activeTab.connection,
      };
      updatedCollections = [...collections, newCollectionItem];
      newCollectionId = newCollectionItem.id;
    }

    setCollections(updatedCollections);
    localStorage.setItem('activeMQCollections', JSON.stringify(updatedCollections));
    
    setTabs(tabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, name, collectionId: newCollectionId, isDirty: false }
        : tab
    ));
  };

  const handleLoadRequest = (id) => {
    const requestToLoad = collections.find((req) => req.id === id);
    if (requestToLoad) {
      const newTabId = Date.now();
      const newTab = {
        id: newTabId,
        collectionId: requestToLoad.id,
        name: requestToLoad.name,
        connection: {
          host: requestToLoad.host,
          queue: requestToLoad.queue,
          message: requestToLoad.message,
          username: requestToLoad.username,
          password: requestToLoad.password,
        },
        response: '',
        isDirty: false,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTabId);
    }
  };

  const handleDeleteRequest = (id) => {
    const updatedCollections = collections.filter((req) => req.id !== id);
    setCollections(updatedCollections);
    localStorage.setItem('activeMQCollections', JSON.stringify(updatedCollections));
  };

  const handleDuplicateRequest = (id) => {
    const requestToDuplicate = collections.find((req) => req.id === id);
    if (requestToDuplicate) {
      const newCollectionItem = {
        ...requestToDuplicate,
        id: Date.now(),
        name: `${requestToDuplicate.name} (copy)`,
      };
      const updatedCollections = [...collections, newCollectionItem];
      setCollections(updatedCollections);
      localStorage.setItem('activeMQCollections', JSON.stringify(updatedCollections));
    }
  };

  const handleRenameRequest = (id) => {
    const requestToRename = collections.find((req) => req.id === id);
    if (requestToRename) {
      const newName = prompt('Enter a new name:', requestToRename.name);
      if (newName) {
        const updatedCollections = collections.map((req) =>
          req.id === id ? { ...req, name: newName } : req
        );
        setCollections(updatedCollections);
        localStorage.setItem('activeMQCollections', JSON.stringify(updatedCollections));
        
        const tabToUpdate = tabs.find(tab => tab.collectionId === id);
        if (tabToUpdate) {
            setTabs(tabs.map(tab => tab.collectionId === id ? { ...tab, name: newName } : tab));
        }
      }
    }
  };

  const handleShareRequest = (id) => {
    const requestToShare = collections.find((req) => req.id === id);
    if (requestToShare) {
      const shareableData = JSON.stringify(requestToShare, null, 2);
      navigator.clipboard.writeText(shareableData).then(() => {
        alert('Request data copied to clipboard!');
      }, () => {
        alert('Failed to copy request data.');
      });
    }
  };

  return (
    <div className="activemq-client-container">
      <div className="left-panel-activemq">
        <Collections
          items={collections}
          onLoadRequest={handleLoadRequest}
          onSaveRequest={handleSaveRequest}
          isSaveDisabled={!activeTab?.isDirty}
          onNewRequest={handleNewTab}
          onDeleteItem={handleDeleteRequest}
          onDuplicateItem={handleDuplicateRequest}
          onRenameItem={handleRenameRequest}
          onShareItem={handleShareRequest}
        />
      </div>
      <div className="right-panel-activemq">
        <ActiveMQTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />
        {activeTab && (
          <ActiveMQConnection
            key={activeTab.id}
            {...activeTab.connection}
            onHostChange={(host) => updateActiveTabData({ connection: { ...activeTab.connection, host } })}
            onQueueChange={(queue) => updateActiveTabData({ connection: { ...activeTab.connection, queue } })}
            onMessageChange={(message) => updateActiveTabData({ connection: { ...activeTab.connection, message } })}
            onUsernameChange={(username) => updateActiveTabData({ connection: { ...activeTab.connection, username } })}
            onPasswordChange={(password) => updateActiveTabData({ connection: { ...activeTab.connection, password } })}
            onSend={handlePublish}
            response={activeTab.response}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveMQClient;