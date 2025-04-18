import React, { useState } from 'react';

const AdminWalletStatus = () => {
    const [walletStatus, setWalletStatus] = useState('ACTIVATE');

    const toggleWalletStatus = () => {
        setWalletStatus((prevStatus) =>
            prevStatus === 'ACTIVATE' ? 'DEACTIVATE' : 'ACTIVATE'
        );
    };

    return (
        <div>
            <h2>Admin Wallet Status</h2>
            <p>Current Wallet Status: {walletStatus}</p>
            <button onClick={toggleWalletStatus}>
                {walletStatus === 'ACTIVATE' ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    );
};

export default AdminWalletStatus;