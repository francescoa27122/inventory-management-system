import React, { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger' // 'danger' or 'success'
  });

  const showConfirm = ({ title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        show: true,
        title,
        message,
        onConfirm: () => {
          resolve(true);
          onConfirm?.();
          hideConfirm();
        },
        confirmText,
        cancelText,
        type
      });
    });
  };

  const hideConfirm = () => {
    setConfirmState(prev => ({ ...prev, show: false }));
  };

  const ConfirmDialog = () => {
    if (!confirmState.show) return null;

    return (
      <div className="confirm-modal-overlay" onClick={hideConfirm}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <h3>{confirmState.title}</h3>
          <p>{confirmState.message}</p>
          <div className="confirm-modal-actions">
            <button className="btn-cancel" onClick={hideConfirm}>
              {confirmState.cancelText}
            </button>
            <button 
              className={`btn-confirm ${confirmState.type}`}
              onClick={confirmState.onConfirm}
            >
              {confirmState.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { showConfirm, ConfirmDialog };
};
