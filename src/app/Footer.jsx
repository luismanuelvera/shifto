// src/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            width: '100%',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#161a1d',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '14px',
        }}>
            <p>
                <a
                    href="https://opensource.org/licenses/MIT"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}
                >
                    MIT License
                </a>
                <a
                    href="https://github.com/luismanuelvera/shifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}
                >
                    Project GitHub
                </a>
                <a
                    href="https://github.com/luismanuelvera"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'none' }}
                >
                    My Repos
                </a>
            </p>
        </footer>
    );
};

export default Footer;
