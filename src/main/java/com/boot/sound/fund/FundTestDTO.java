package com.boot.sound.fund;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data				//@Getter + @Setter
@AllArgsConstructor	// 매개변수 생성자
@NoArgsConstructor	// 디폴트 생성자
@Entity				// ORM(table의 컬럼과 object의 멤버변수를 매핑)
@Builder			// 매개변수 생성자에 순서없이 값을 입력해서 세팅해도 마지막에 build()를 통해 빌더를 작동시킨다. 같은 타입의 다른변수의 값을 서로 바꿔넣는 것을 방지한다. 
@ToString
@Table(name = "FUND_TEST_TBL")
public class FundTestDTO {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)  // 자동 증가
	@Column(name = "fund_test_id", nullable = false)
    private Long fund_test_id;       // 투자 성향 ID
	
	@Column(name = "customer_id", length = 20, nullable = false)
    private String customer_id;      // 고객 ID
	
	@Column(name = "fund_test_date", nullable = false)
    private Date fund_test_date;     // 테스트 응시 날짜
	
	@Column(name = "fund_risk_type", length = 50, nullable = false)
    private String fund_risk_type;   // 투자 성향 유형 (예: 안정형, 적극형)

	@PrePersist
    protected void onCreate() {
        this.fund_test_date = new Date(); // 기본값 설정
    }

}


// CREATE TABLE FUND_TEST_TBL (
//     FUND_TEST_ID NUMBER(10) PRIMARY KEY, -- 투자 성향 ID
//     CUSTOMER_ID VARCHAR2(20) NOT NULL, -- 고객 ID
//     FUND_TEST_DATE DATE DEFAULT SYSDATE, -- 테스트 응시 날짜
//     FUND_RISK_TYPE VARCHAR2(50) NOT NULL, -- 투자 성향 유형 (예: 안정형, 적극형)
// );