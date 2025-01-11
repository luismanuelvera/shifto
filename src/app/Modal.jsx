import React from 'react';

const Modal = ({ visible, message, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
      }}>
        <p>{message}</p>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            margin: '10px',
            cursor: 'pointer',
            backgroundColor: '#F94144',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Cancelar
        </button>
        {onConfirm && (
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              margin: '10px',
              cursor: 'pointer',
              backgroundColor: '#90BE6D',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;