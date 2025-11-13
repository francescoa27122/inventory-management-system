import React from 'react';

const LoadingButton = ({ 
  loading, 
  children, 
  disabled, 
  className = '', 
  type = 'button',
  onClick,
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`btn ${className} ${loading ? 'btn-loading' : ''}`}
      disabled={loading || disabled}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="spinner"></span>}
      <span className={loading ? 'btn-content' : ''}>{children}</span>
    </button>
  );
};

export default LoadingButton;
