package com.boot.sound.fund.dto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
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
@Table(name = "fund_tbl")
public class FundDTO {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)  // 자동 증가
	@Column(name = "fund_id", nullable = false,  updatable = false)	//updatable=false : 한 번 저장된 후 수정할 수 없도록 제한
	private Long fund_id;          // 펀드 ID
	
	@Column(name = "fund_name", nullable = false, length = 255)
    private String fund_name;      // 펀드명
	
	@Column(name = "fund_company", nullable = false, length = 255)
    private String fund_company;   // 운용사명
	
	@Column(name = "fund_type", length = 100)
    private String fund_type;      // 펀드 유형 (주식형, 채권형 등)
	
	@Column(name = "fund_grade",  precision = 1)
    private Integer fund_grade;    // 펀드 등급 (1~5)
	
	@Column(name = "fund_fee_rate", precision = 5, scale = 2)
    private Double fund_fee_rate;   // 총보수 (%)
	
	@Column(name = "fund_upfront_fee", precision = 5, scale = 2)
    private Double fund_upfront_fee;// 선취 수수료 (%)
	
	@Column(name = "return_1m", precision = 6, scale = 3)
    private Double return_1m;      // 1개월 누적 수익률 (%)
	
	@Column(name = "return_3m", precision = 6, scale = 3)
    private Double return_3m;      // 3개월 누적 수익률 (%)
	
	@Column(name = "return_6m", precision = 6, scale = 3)
    private Double return_6m;      // 6개월 누적 수익률 (%)
	
	@Column(name = "return_12m", precision = 6, scale = 3)
    private Double return_12m;     // 12개월 누적 수익률 (%)
	
	@Column(name = "fund_risk_type", nullable = true)
    private String fund_risk_type;      // 펀드명

}


//CREATE TABLE `fund_tbl` (
//		  `fund_id` bigint(20) NOT NULL AUTO_INCREMENT,
//		  `FUND_NAME` varchar(255) NOT NULL,
//		  `FUND_COMPANY` varchar(255) NOT NULL,
//		  `FUND_TYPE` varchar(100) DEFAULT NULL,
//		  `FUND_GRADE` int(1) DEFAULT NULL,
//		  `FUND_FEE_RATE` decimal(5,2) DEFAULT NULL,
//		  `FUND_UPFRONT_FEE` decimal(5,2) DEFAULT NULL,
//		  `RETURN_1M` decimal(6,3) DEFAULT NULL,
//		  `RETURN_3M` decimal(6,3) DEFAULT NULL,
//		  `RETURN_6M` decimal(6,3) DEFAULT NULL,
//		  `RETURN_12M` decimal(6,3) DEFAULT NULL,
//		  `FUND_RISK_TYPE` varchar(50) DEFAULT NULL,
//		  PRIMARY KEY (`fund_id`),
//		  UNIQUE KEY `unique_fund_name` (`FUND_NAME`)
//		) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
