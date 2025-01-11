import React from 'react';

const Button = ({ action, text, icon, color }) => {
    if (!visible) return null;

    return (
        <button
            onClick={action}
            style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: color,
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onMouseEnter={(e) => {
                e.target.textContent = text + " " + icon;
            }}
            onMouseLeave={(e) => {
                e.target.textContent = text;
            }}
        >
            {text}
        </button>
    );
};

export default Button;