import { useState, useEffect } from 'react';
import axios from 'axios';
import NatsConnection from './NatsConnection.jsx';
import Collections from '../rest-client/Collections.jsx';
import NatsTabs from './NatsTabs.jsx';
import './NatsClient.css';

const NatsClient = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      collectionId: null,
      name: 'Untitled Request',
      connection: { url: '', subject: '', payload: '' },
      response: '',
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const response = await axios.get('/api/folders/tree/NATS');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch tree:', error);
    }
  };

  const handleNewTab = () => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: null,
      name: `Untitled Request ${tabs.length + 1}`,
      connection: { url: '', subject: '', payload: '' },
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
      const res = await fetch('/api/nats/publish', {
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
  
    const isExisting = items.some(item => item.id === activeTab.collectionId);
    let name = activeTab.name;
  
    if (!isExisting) {
      const newName = prompt('Enter a name for this request:', activeTab.name);
      if (!newName) return;
      name = newName;
    }
  
    const requestData = {
      name,
      payload: JSON.stringify(activeTab.connection),
      request_type: 'NATS',
      folder_id: activeTab.parentId,
    };
  
    const promise = isExisting
      ? axios.put(`/api/nats/requests/${activeTab.collectionId}`, requestData)
      : axios.post('/api/nats/requests', requestData);
  
    promise.then(response => {
      const savedRequest = response.data;
      const newCollectionId = savedRequest.id;
      setTabs(tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, name, collectionId: newCollectionId, isDirty: false }
          : tab
      ));
      fetchTree();
    }).catch(error => {
      console.error('Failed to save request:', error);
    });
  };

  const handleLoadRequest = (request) => {
    const { id, name, payload, parentId } = request;
    const connection = JSON.parse(payload);
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: id,
      name,
      connection,
      response: '',
      isDirty: false,
      parentId,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleDeleteItem = async (itemId) => {
    const [type, id] = itemId.split('-');
    const url = type === 'stack' ? `/api/folders/${id}` : `/api/nats/requests/${id}`;
    try {
      await axios.delete(url);
      fetchTree();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  const handleDuplicateItem = (itemId) => {
    const [type, id] = itemId.split('-');
    if (type === 'request') {
      axios.post(`/api/nats/requests/${id}/duplicate`)
        .then(fetchTree)
        .catch(err => console.error('Failed to duplicate request', err));
    }
  };

  const handleRenameItem = async (itemId) => {
    const [type, id] = itemId.split('-');
    const itemToRename = items.find(item => item.id === id);
    const newName = prompt('Enter a new name:', itemToRename.name);
    if (newName) {
      const url = type === 'stack' ? `/api/folders/${id}` : `/api/nats/requests/${id}`;
      try {
        await axios.put(url, { name: newName });
        fetchTree();
      } catch (error) {
        console.error(`Failed to rename ${type}:`, error);
      }
    }
  };

  const handleShareItem = (itemId) => {
    const itemToShare = items.find((item) => item.id === itemId);
    if (itemToShare) {
      const shareableData = JSON.stringify(itemToShare, null, 2);
      navigator.clipboard.writeText(shareableData).then(() => {
        alert('Item data copied to clipboard!');
      }, () => {
        alert('Failed to copy item data.');
      });
    }
  };

  const handleAddStack = async (parentId = null) => {
    const newName = prompt('Enter a name for the new stack:');
    if (newName) {
      try {
        await axios.post('/api/folders', { name: newName, type: 'NATS', parentId });
        fetchTree();
      } catch (error) {
        console.error('Failed to create stack:', error);
      }
    }
  };

  const handleAddRequestToStack = (parentId) => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: null,
      name: 'Untitled Request',
      connection: { url: '', subject: '', payload: '' },
      response: '',
      isDirty: false,
      parentId: parentId,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const [type, id] = active.id.split('-');
    const newParentId = over.id.startsWith('folder-') ? over.id : null;
  
    const url = type === 'stack'
      ? `/api/folders/${id}/move`
      : `/api/nats/requests/${id}/move`;

    axios.put(url, { parentId: newParentId })
      .then(fetchTree)
      .catch(err => console.error(`Failed to move ${type}`, err));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
  };

  return (
    <div className="nats-client-container">
      <div className="left-panel-nats">
        <Collections
          items={items}
          onLoadRequest={handleLoadRequest}
          onSaveRequest={handleSaveRequest}
          isSaveDisabled={!activeTab?.isDirty}
          onNewRequest={handleNewTab}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateItem}
          onRenameItem={handleRenameItem}
          onShareItem={handleShareItem}
          onAddStack={handleAddStack}
          onAddRequestToStack={handleAddRequestToStack}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
        />
      </div>
      <div className="right-panel-nats">
        <NatsTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />
        {activeTab && (
          <NatsConnection
            key={activeTab.id}
            url={activeTab.connection.url}
            subject={activeTab.connection.subject}
            payload={activeTab.connection.payload}
            onUrlChange={(url) =>
              updateActiveTabData({
                connection: { ...activeTab.connection, url },
              })
            }
            onSubjectChange={(subject) =>
              updateActiveTabData({
                connection: { ...activeTab.connection, subject },
              })
            }
            onPayloadChange={(payload) =>
              updateActiveTabData({
                connection: { ...activeTab.connection, payload },
              })
            }
            onPublish={handlePublish}
            response={activeTab.response}
          />
        )}
      </div>
    </div>
  );
};

export default NatsClient;

