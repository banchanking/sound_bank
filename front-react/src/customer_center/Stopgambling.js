import React, { useState } from "react";
import styles from "../Css/customer_center/StopGambling.module.css";

const Stopgambling = () => {
  const [site, setSite] = useState("");
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ site, account, description, file });
    alert("제보가 접수되었습니다.");
  };

  return (
    <div className={styles["report-wrap"]}>
      <h2 className={styles["report-page-title"]}>청소년을 지키기 위한 첫걸음: 불법도박 제재 신고</h2>
      <div className={styles["report-container"]}>
        <p className={styles["report-desc"]}>
          도박 환경 위실 제한과 도박 사이트에 중요을 위해 하응하는 <span className={styles["highlight"]}>Sound_Bank 제재</span>
        </p>
        <p className={styles["report-desc"]}>불법대처진단 바로 신고해주세요.</p>

        <p className={styles["report-note"]}>
          여러분의 작은 관심과 실천이 큰 변화를 만들 수 있습니다.
        </p>
        <p className={styles["report-note"]}>
          * 신고해 주신 분의 정보는 철저히 보호되니 안심하고 신고 해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <label className={styles["report-label"]}>신고할 불법도박 사이트 *</label>
          <input
            type="text"
            placeholder="도메인명/웹주소, URL 을 입력해주세요."
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className={styles["report-input"]}
            required
          />

          <label className={styles["report-label"]}>신고 대상 계좌번호 *</label>
          <input
            type="text"
            placeholder="ex) 1000-0000-0000"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={styles["report-input"]}
            required
          />
          <p className={styles["report-subtext"]}>
            불법도박 사이트에서 이용되고 있는 Sound_Bank 계좌번호를 입력해주세요.
          </p>

          <label className={styles["report-label"]}>신고 내용 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles["report-textarea"]}
            required
          ></textarea>

          <p className={styles["report-subtext"]}>
            가입, 이용 불법 도박 사이트에서 Sound_Bank 계좌를 첨부하세요.
          </p>

          <label className={styles["report-label"]}>첨부파일 *</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className={styles["report-input-file"]}
            required
          />
          <p className={styles["report-subtext"]}>
            Sound_Bank 계좌가 노출된 불법 도박 사이트 화면 캡쳐 이미지를 첨부해주세요.
          </p>

          <button type="submit" className={styles["report-button"]}>
            불법도박제재 제보하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default Stopgambling;