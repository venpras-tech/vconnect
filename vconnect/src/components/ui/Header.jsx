import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-left">
                {location.pathname !== '/' && (
                    <button onClick={handleHomeClick} className="home-button">
                        Home
                    </button>
                )}
                <span style={{ marginLeft: location.pathname !== '/' ? '10px' : '0' }}>v1.0</span>
            </div>
            <div className="header-center">vconnect</div>
            <div className="header-right">{formatDate(dateTime)}</div>
        </header>
    );
};

export default Header;