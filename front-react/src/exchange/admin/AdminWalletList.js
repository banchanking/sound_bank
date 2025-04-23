import React, { useState, useEffect } from 'react';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/exchange/AdminWalletList.module.css";

const AdminWalletList = () => {
    const [customers, setCustomers] = useState([]);
    const [selected_customer_id, setSelected_customer_id] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [customer_search, setCustomer_search] = useState("");

    useEffect(() => {
        RefreshToken.get("http://localhost:8081/api/admin/wallets/customers")
            .then(res => setCustomers(res.data))
            .catch(err => console.error("고객 목록 로딩 실패", err));
    }, []);

    const handle_customer_click = (customer_id) => {
        setSelected_customer_id(customer_id);
        RefreshToken.get(`http://localhost:8081/api/admin/wallets/${customer_id}`)
            .then(res => setWallets(res.data.map(w => ({ ...w, ORIGINAL_STATUS: w.STATUS }))))
            .catch(err => console.error("지갑 상세 로딩 실패", err));
    };

    const handle_status_change = (index, newStatus) => {
        const updated = [...wallets];
        updated[index].STATUS = newStatus;
        setWallets(updated);
    };

    const handle_save = () => {
        const updated = wallets.filter(w => w.STATUS !== w.ORIGINAL_STATUS);
        const payload = updated.length === 1 ? updated[0] : updated;

        RefreshToken.put("http://localhost:8081/api/admin/wallets/update", payload)
            .then(() => alert("상태가 성공적으로 저장되었습니다."))
            .catch(err => alert("저장 실패: " + err));
    };

    const format_date = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    return (
        <div className={styles.container}>
            <h2>고객 목록</h2>
            <input
                type="text"
                placeholder="고객 ID 검색..."
                value={customer_search}
                onChange={(e) => setCustomer_search(e.target.value)}
                style={{ marginBottom: '1rem', padding: '5px', width: '200px' }}
            />
            <div className={styles.customerListWrapper}>
                {customers.filter(c => c.customer_id.toLowerCase().includes(customer_search.toLowerCase())).length > 0 ? (
                    customers.filter(c => c.customer_id.toLowerCase().includes(customer_search.toLowerCase())).map((c, idx) => (
                        <button
                            key={idx}
                            onClick={() => handle_customer_click(c.customer_id)}
                            className={styles.customerButton}
                        >
                            {c.customer_id}
                        </button>
                    ))
                ) : (
                    <p style={{ marginTop: '1rem', color: '#888' }}>검색 결과가 없습니다.</p>
                )}
            </div>

            {selected_customer_id && (
                <>
                    <h3>지갑 상세 - 고객 ID: {selected_customer_id}</h3>
                    <table className={styles.walletTable}>
                        <thead>
                            <tr>
                                <th>통화</th>
                                <th>잔액</th>
                                <th>마지막거래일</th>
                                <th>상태</th>
                                <th>변경</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.map((wallet, idx) => (
                                <tr key={idx}>
                                    <td><input type="text" value={wallet.CURRENCY_CODE} readOnly className={styles.readOnlyInput} /></td>
                                    <td><input type="text" value={wallet.BALANCE} readOnly className={styles.readOnlyInput} /></td>
                                    <td><input type="text" value={format_date(wallet.UPDATED_AT)} readOnly className={styles.readOnlyInput} /></td>
                                    <td>{wallet.STATUS}</td>
                                    <td>
                                        <select
                                            value={wallet.STATUS}
                                            onChange={(e) => handle_status_change(idx, e.target.value)}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="DEACTIVATE">DEACTIVATE</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handle_save} className={styles.saveButton}>
                        상태 저장
                    </button>
                </>
            )}
        </div>
    );
};

export default AdminWalletList;
