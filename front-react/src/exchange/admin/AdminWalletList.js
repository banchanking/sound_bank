import React, { useState, useEffect } from 'react';

const AdminWalletList = () => {
    const [wallets, setWallets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredWallets, setFilteredWallets] = useState([]);

    useEffect(() => {
        // Fetch wallet data (replace with actual API call)
        const fetchWallets = async () => {
            const data = [
                { id: 1, name: 'Wallet A', balance: 100 },
                { id: 2, name: 'Wallet B', balance: 200 },
                { id: 3, name: 'Wallet C', balance: 300 },
            ];
            setWallets(data);
        };

        fetchWallets();
    }, []);

    useEffect(() => {
        const results = wallets.filter(wallet =>
            wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredWallets(results);
    }, [searchTerm, wallets]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div>
            <h1>Admin Wallet List</h1>
            <input
                type="text"
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWallets.map(wallet => (
                        <tr key={wallet.id}>
                            <td>{wallet.id}</td>
                            <td>{wallet.name}</td>
                            <td>{wallet.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminWalletList;