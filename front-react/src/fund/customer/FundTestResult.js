import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // RefreshToken 모듈 추가

const FundTestResult = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 전달받은 투자성향 예측 결과
    const predictedIndex = location.state?.result;
    const predictedType = location.state?.risk_type;

    // AI 모델이 반환한 인덱스를 기반으로 성향을 매핑
    const investmentTypes = ["안정형", "보수형", "위험중립형", "적극형", "공격형"];
    const investmentType = investmentTypes[predictedIndex] || predictedType || "알 수 없음";

    // 로그인된 회원 ID (로컬 스토리지에서 가져옴)
    const customerId = localStorage.getItem("customerId");

    // 투자 성향을 서버로 전송하여 업데이트
    useEffect(() => {
        const updateRiskType = async () => {
          try {
            const payload = {
              customer_id: customerId,
              fund_risk_type: investmentType,
            };
        
              // 토큰 포함된 인스턴스로 요청 보내기
              await RefreshToken.post("http://localhost:8081/api/test-result/save", payload);
              console.log("✅ 투자 성향 등록 및 업데이트 성공");
            } catch (error) {
              console.error("❌ 투자 성향 등록 및 업데이트 중 오류 발생:", error);
            }
          };
        
          if (customerId && investmentType !== "알 수 없음") {
            updateRiskType();
          }
        }, [customerId, investmentType]);

        return (
          <div className={styles.fundtestresultcontainer}>
            <h1 className={styles.fundtestresulttitle}>투자성향 분석 결과</h1>
            <table className={styles.fundtestresulttable}>
              <tbody>
                <tr>
                  <td>
                    고객님의 투자성향은 <strong>{investmentType}</strong>입니다.
                  </td>
                </tr>
              </tbody>
            </table>
      
            <div className={styles.fundtestresultbuttons}>
              <button
                className={styles.fundtestresultbutton}
                onClick={() =>
                  navigate("/fundRecommend", {
                    state: {
                      result: predictedIndex,
                      risk_type: investmentType,
                    },
                  })
                }
              >
                나에게 맞는 <br />
                펀드 추천받기
              </button>
            </div>
          </div>
        );
      };
      
      export default FundTestResult;