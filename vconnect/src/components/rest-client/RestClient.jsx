import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Request from './Request.jsx';
import Response from './Response.jsx';
import RequestTabs from './RequestTabs.jsx';
import Collections from './Collections.jsx';
import ResizablePanels from './ResizablePanels.jsx';
import Tabs from './Tabs.jsx';
import Modal from '../common/Modal.jsx';
import Actions from './Actions.jsx';
import './RestClient.css';

const RestClient = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      collectionId: null,
      name: 'Untitled Request',
      request: {
        method: 'GET',
        url: '',
        params: [{ id: 1, key: '', value: '', enabled: true }],
        headers: [{ id: 1, key: '', value: '', enabled: true }],
        body: '',
      },
      response: null,
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    inputLabel: '',
    initialValue: '',
    onSubmit: () => {},
  });

  const [isSending, setIsSending] = useState(false);
  const [controller, setController] = useState(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const response = await axios.get('/api/folders/tree/REST');
      response.data.map(e=>e.id=e.strid);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch tree:', error);
    }
  };


  const handleAddStack = (parentId) => {
    setModalConfig({
      title: 'Create New Stack',
      inputLabel: 'Stack Name:',
      initialValue: '',
      onSubmit: async (newName) => {
        if (newName) {
          // const parentFolderId = parentId ? parseInt((parentId+'').replace('folder-', '')) : null;
          try {
            await axios.post('/api/folders', {
              name: newName,
              type: 'REST',
              parent_id: parentId ? parentId : null,
            });
            fetchTree();
          } catch (error) {
            console.error('Failed to create stack:', error);
          }
        }
      },
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (type,id) => {
    if (type === 'folder') {
      try {
        await axios.delete(`/api/folders/${id}`);
        fetchTree();
      } catch (error) {
        console.error('Failed to delete stack:', error);
      }
    } else {
      try {
        await axios.delete(`/api/rest/requests/${id}`);
        fetchTree();
      } catch (error) {
        console.error('Failed to delete request:', error);
      }
    }
  };

  const handleRenameItem = (itemId) => {
    const [type, id] = itemId.split('-');
    const itemToRename = items.find(item => item.id === itemId);
    setModalConfig({
      title: 'Rename Item',
      inputLabel: 'New Name:',
      initialValue: itemToRename.name,
      onSubmit: async (newName) => {
        if (newName) {
          if (type === 'stack') {
            try {
              await axios.put(`/api/folders/${id}`, { name: newName });
              fetchTree();
            } catch (error) {
              console.error('Failed to rename stack:', error);
            }
          } else {
            try {
              await axios.put(`/api/rest/requests/${id}`, { name: newName });
              fetchTree();
            } catch (error) {
              console.error('Failed to rename request:', error);
            }
          }
        }
      },
    });
    setIsModalOpen(true);
  };

  const handleAddRequestToStack = (parentId) => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: null,
      name: 'Untitled Request',
      request: {
        method: 'GET',
        url: '',
        params: [{ id: 1, key: '', value: '', enabled: true }],
        headers: [{ id: 1, key: '', value: '', enabled: true }],
        body: '',
      },
      response: null,
      isDirty: false,
      parentId: parentId,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeItem = items.find(item => item.id === active.id);
      const overItem = items.find(item => item.id === over.id);

      let newParentId = overItem && overItem.type === 'stack' ? overItem.id : (overItem ? overItem.parentId : null);

      if (over.id === 'unstacked') {
        newParentId = null;
      }

      const [type, id] = activeItem.id.split('-');
      const parentFolderId = newParentId ? newParentId.replace('folder-', '') : null;

      if (type === 'stack') {
        axios.put(`/api/folders/${id}`, { parent: { id: parentFolderId } })
          .then(fetchTree)
          .catch(err => console.error('Failed to move stack', err));
      } else {
        axios.put(`/api/requests/${id}`, { folder: { id: parentFolderId } })
          .then(fetchTree)
          .catch(err => console.error('Failed to move request', err));
      }
    }
  };

  const handleNewTab = () => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      collectionId: null,
      name: `Untitled Request ${tabs.length + 1}`,
      request: {
        method: 'GET',
        url: '',
        params: [{ id: 1, key: '', value: '', enabled: true }],
        headers: [{ id: 1, key: '', value: '', enabled: true }],
        body: '',
      },
      response: null,
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
        tab.id === activeTabId ? { ...tab, ...data } : tab
      )
    );
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleRequestChange = (updatedData) => {
    updateActiveTabData({
      request: { ...activeTab.request, ...updatedData },
      isDirty: true,
    });
  };

  const handleSend = async (request) => {
    const { method, url, params, headers, body } = request;
    const newController = new AbortController();
    setController(newController);
    setIsSending(true);

    try {
      const filteredParams = params.filter((p) => p.key && p.enabled);
      const filteredHeaders = headers.filter((h) => h.key && h.enabled);
      
      const config = {
        method: 'POST',
        url: '/api/rest/send',
        data: {
          method,
          url,
          params: Object.fromEntries(filteredParams.map((p) => [p.key, p.value])),
          headers: Object.fromEntries(filteredHeaders.map((h) => [h.key, h.value])),
          payload: body ? JSON.parse(body) : undefined,
        },
        signal: newController.signal,
      };

      const startTime = Date.now();
      const result = await axios(config);
      const endTime = Date.now();
      const duration = endTime - startTime;

      updateActiveTabData({
        response: {
          ...result,
          headers: {
            ...result.headers,
            'request-duration': duration,
          },
        },
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        updateActiveTabData({ response: error.response || null });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (controller) {
      controller.abort();
      setIsSending(false);
    }
  };
  const handleSaveRequest = () => {
    if (activeTab.collectionId && !activeTab.isDirty) {
      return;
    }

    const isExisting = items.some(item => item.id === activeTab.collectionId && item.type === 'request');
    let name = activeTab.name;

    if (!isExisting) {
      setModalConfig({
        title: 'Save Request',
        inputLabel: 'Request Name:',
        initialValue: activeTab.name,
        onSubmit: (newName) => {
          if (newName) {
            saveRequest(newName, isExisting);
          }
        },
      });
      setIsModalOpen(true);
    } else {
      saveRequest(name, isExisting);
    }
  };

  const saveRequest = (name, isExisting) => {

    const requestData = {
      name,
      method: activeTab.request.method,
      url: activeTab.request.url,
      params: activeTab.request.params,
      headers: activeTab.request.headers,
      body: JSON.stringify(activeTab.request.body),
      request_type: 'REST',
      message_type: 'CREATE_REQUEST',
      message_id:"12345",
      folder_id: activeTab.parentId ? (activeTab.parentId+'').replace('folder-', '') : null
    };

    const promise = isExisting
      ? axios.put(`/api/rest/requests/${activeTab.collectionId.replace('request-', '')}`, { ...requestData, name })
      : axios.post('/api/rest/requests', requestData);

    promise.then(response => {
      const savedRequest = response.data.body;
      const newCollectionId = `request-${savedRequest.id}`;
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
    const existingTab = tabs.find(tab => tab.collectionId === request.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const requestToLoad = items.find((item) => item.id === request.id);
    if (requestToLoad) {
      const payload = JSON.parse(requestToLoad.payload);
      const newTabId = Date.now();
      const newTab = {
        id: newTabId,
        collectionId: requestToLoad.id,
        name: requestToLoad.name,
        request: {
          method: requestToLoad.method,
          url: payload.url || '',
          params: (payload.params || [{ id: 1, key: '', value: '', enabled: true }]).map(p => ({ ...p, enabled: p.enabled ?? true })),
          headers: (payload.headers || [{ id: 1, key: '', value: '', enabled: true }]).map(h => ({ ...h, enabled: h.enabled ?? true })),
          body: payload.body || '',
        },
        response: null,
        isDirty: false,
        parentId: requestToLoad.parentId
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTabId);
    }
  };

  const handleDeleteRequest = (id) => {
    handleDeleteItem(id);
  };

  const handleDuplicateRequest = (id) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const [type, originalId] = id.split('-');
      if (type === 'request') {
        const newRequest = {
          ...itemToDuplicate,
          name: `${itemToDuplicate.name} (copy)`,
        };
        delete newRequest.id;
        axios.post('/api/rest/requests', {
          ...newRequest,
          folder: itemToDuplicate.parentId ? { id: itemToDuplicate.parentId.replace('folder-', '') } : null
        })
          .then(fetchTree)
          .catch(err => console.error('Failed to duplicate request', err));
      }
    }
  };

  const handleRenameRequest = (id) => {
    handleRenameItem(id);
  };

  const handleShareRequest = (id) => {
    const itemToShare = items.find((item) => item.id === id);
    if (itemToShare) {
      const shareableData = JSON.stringify(itemToShare, null, 2);
      navigator.clipboard.writeText(shareableData).then(() => {
        alert('Item data copied to clipboard!');
      }, () => {
        alert('Failed to copy item data.');
      });
    }
  };

  const handleRunRequest = (item) => {
    handleLoadRequest(item);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
  };

  return (
    <div className="rest-client-container">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(value) => {
          modalConfig.onSubmit(value);
          setIsModalOpen(false);
        }}
        title={modalConfig.title}
        inputLabel={modalConfig.inputLabel}
        initialValue={modalConfig.initialValue}
      />
      <div className="left-panel">
        <Collections
          items={items}
          onLoadRequest={handleLoadRequest}
          onSaveRequest={handleSaveRequest}
          isSaveDisabled={!activeTab?.isDirty}
          onNewRequest={handleNewTab}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateRequest}
          onRenameItem={handleRenameItem}
          onShareItem={handleShareRequest}
          onRunRequest={handleRunRequest}
          onAddStack={handleAddStack}
          onAddRequestToStack={handleAddRequestToStack}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
        />
      </div>
      <div className="right-panel">
        <Tabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />
        {activeTab && (
          <div className="rest-client-main-content">
            <ResizablePanels
              topPanel={
                <React.Fragment key={activeTab.id}>
                  <div className='top-panel-req'>
                    <Request
                      method={activeTab.request.method}
                      url={activeTab.request.url}
                      onMethodChange={(method) => handleRequestChange({ method })}
                      onUrlChange={(url) => handleRequestChange({ url })}
                      actions={
                      <Actions isSending={isSending} onSend={()=>handleSend(activeTab.request)} onCancel={handleCancel}/>
                      }
                    />
                  </div>
                  <div className='top-panel-pay'>
                    <RequestTabs
                      params={activeTab.request.params}
                      headers={activeTab.request.headers}
                      body={activeTab.request.body}
                      onParamsChange={(params) => handleRequestChange({ params })}
                      onHeadersChange={(headers) =>
                        handleRequestChange({ headers })
                      }
                      onBodyChange={(body) => handleRequestChange({ body })}
                    />
                  </div>
                </React.Fragment>
              }
              bottomPanel={<Response response={activeTab.response} />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RestClient;
