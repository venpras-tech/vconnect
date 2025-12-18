import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Link to="/rest-client" className="grid-item">
        <div>RestClient</div>
      </Link>
      <Link to="/json-util" className="grid-item">
        <div>JSONUtil</div>
      </Link>
      <Link to="/activemq-client" className="grid-item">
        <div>ActiveMQClient</div>
      </Link>
      <Link to="/nats-client" className="grid-item">
        <div>NatsClient</div>
      </Link>
    </div>
  );
};

export default Home;