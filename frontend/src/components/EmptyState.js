import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) => {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={40} />
        </div>
      )}
      <div className="empty-state-content">
        {title && <h3 className="empty-state-title">{title}</h3>}
        {description && <p className="empty-state-description">{description}</p>}
        {action && actionLabel && (
          <button className="btn btn-primary" onClick={action}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
