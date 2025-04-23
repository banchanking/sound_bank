import React from "react";
import styles from "../../Css/fund/MyFund.module.css";

const MyFund = ({ message, onConfirm, onCancel }) => {
  return (
    <div className={styles.fundmodalBackdrop}>
      <div className={styles.fundmodal}>
        <p>{message}</p>
        <div className={styles.fundbuttonGroup}>
          <button onClick={onConfirm}>로그인하기</button>
          <button onClick={onCancel}>메인으로</button>
        </div>
      </div>
    </div>
  );
};

export default MyFund;
