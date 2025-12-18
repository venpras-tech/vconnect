import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/ui/Home.jsx';
import RestClient from './components/rest-client/RestClient.jsx';
import JSONUtil from './components/json-utils/JSONUtil.jsx';
import ActiveMQClient from './components/activemq-client/ActiveMQClient.jsx';
import NatsClient from './components/nats-client/NatsClient.jsx';
import Header from './components/ui/Header.jsx';
import Footer from './components/ui/Footer.jsx';
import './App.css';
import JsonBeautifier from './components/json-utils/JsonBeautifier';
import JsonStringify from './components/json-utils/JsonStringify';
import JsonToTable from './components/json-utils/JsonToTable';
import JsonParser from './components/json-utils/JsonParser';
import CodeEditor from './components/json-utils/CodeEditor';
import AsciiB64Converter from './components/json-utils/AsciiB64Converter';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rest-client" element={<RestClient />} />
            <Route path="/json-util" element={<JSONUtil />}>
              <Route path="beautifier" element={<JsonBeautifier />} />
              <Route path="parser" element={<JsonParser />} />
              <Route path="stringify" element={<JsonStringify />} />
              <Route path="to-table" element={<JsonToTable />} />
              <Route path="editor" element={<CodeEditor />} />
              <Route path="ascii-b64-converter" element={<AsciiB64Converter />} />
            </Route>
            <Route path="/activemq-client" element={<ActiveMQClient />} />
            <Route path="/nats-client" element={<NatsClient />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
