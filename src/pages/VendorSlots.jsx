import React from 'react';

const VendorSlots = () => {
  return (
    <div className="vendor-slots">
      <div className="container">
        <header className="slots-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.navigate('/vendor/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h1>Manage Slots</h1>
        </header>

        <div className="slots-content">
          <p>Vendor Slots page - coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default VendorSlots;
