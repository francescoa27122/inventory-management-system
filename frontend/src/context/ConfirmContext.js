import React, { createContext, useContext, useState, useCallback } from 'react';
import './ConfirmDialog.css';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const handleOverlayClick = () => {
    if (confirmState.onCancel) {
      confirmState.onCancel();
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState.isOpen && (
        <div className="confirm-overlay" onClick={handleOverlayClick}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-content">
              <p>{confirmState.message}</p>
            </div>
            <div className="confirm-actions">
              <button 
                className="confirm-btn confirm-btn-cancel"
                onClick={confirmState.onCancel}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn confirm-btn-confirm"
                onClick={confirmState.onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
