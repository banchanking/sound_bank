package com.boot.sound.loan.dao;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.loan.dto.LateInterestDTO;
import com.boot.sound.loan.dto.LoanApplyWithTermsDTO;
import com.boot.sound.loan.dto.LoanConsentDTO;
import com.boot.sound.loan.dto.LoanCustomerDTO;
import com.boot.sound.loan.dto.LoanDTO;
import com.boot.sound.loan.dto.LoanInterestPaymentDTO;
import com.boot.sound.loan.dto.LoanLatePaymentDTO;
import com.boot.sound.loan.dto.LoanStatusDTO;
import com.boot.sound.loan.dto.LoanTermDTO;
import com.boot.sound.loan.dto.LoanTermsAgreeDTO;
import com.boot.sound.loan.dto.PrepaymentEntity;

@Mapper
@Repository
public interface LoanDAO  {

	// 대출 상품 리스트
	public List<LoanDTO> loanList();
	
	// 대출 상품 등록
	public int loanInsert(LoanDTO dto);
	
	// 상품 약관 등록
	public int loanTermInsert(LoanTermDTO dto);
	
	// 대출 상품 수정
	public int loanUpdate(LoanDTO dto);
	
	// 대출 상품 삭제
	public int loanDelete(int loan_id);
	
	// 대출 상품 조회
	public LoanDTO loanDetail(int loan_id);
	
	// 전체 대출 상품 갯수
	public int loanCnt();
	
	
	// 대출유형 맞춤 검사
	public List<LoanDTO> loanTypeSearch(String loan_type);
	
	// 대출유형 상품별 갯수
	public int loanTypeCnt(String loan_type);
	
	// 대출이름검색
	public List<LoanDTO> loanNameSearch(String loan_name);
	
	// 대출이름 검색 결과 카운트
	public int loanNameCnt(String loan_name);
	
	// 대출실행 필수동의내역 저장
	public int consentInsert(LoanConsentDTO dto);
	
	// 대출 신청 고객정보
	public LoanCustomerDTO loanCustomer(String customerId, String loan_id);
	
	// 대출 신청정보 저장
	public int loanApply(LoanApplyWithTermsDTO dto);
	
	// 대출 현황 리스트
	public List<LoanStatusDTO>loanStatus();
	
	// 대출 상태 변경
	public boolean loanStatusUpdate(@Param("loan_status_no") int loan_status_no, 
            @Param("loan_progress") String loan_progress);
	
	// 문자 발송을 위한 고객 정보 조회
	public CustomerDTO selecCustomer(String customerId);
	
	// 거래내역 저장을 위한 고객 이름 조회
	public String selectCustomerName(String customerId);
	
	// 거래내역 저장
	public int insertTransaction(
	    @Param("accountNumber") String accountNumber,
	    @Param("transactionType") String transactionType,
	    @Param("amount") BigDecimal amount,
	    @Param("currency") String currency,
	    @Param("comment") String comment,
	    @Param("customerName") String customerName,
	    @Param("accountType") String accountType
	);
	
	// 이자 납부 내역 저장
	public int insertInterestPayment(LoanInterestPaymentDTO dto);
	
	 // 연체 대상 이자 납부 내역 조회
	public List<LoanInterestPaymentDTO> findOverduePayments();

    // 납부상태변경
	public int updateRepaymentStatus(@Param("interestPaymentNo") int interestPaymentNo,
            							@Param("repaymentStatus") String repaymentStatus);

	// 연체 정보 등록
	public void insertLatePayment(LoanLatePaymentDTO dto);
	
	 // 연체된 납부 내역 조회
	public List<LoanLatePaymentDTO> getLatePayments();

    // 대출번호로 계좌번호 조회
	public String getAccountNumber(@Param("loanId") int loanId,
            @Param("customerId") String customerId);

    // 고객 이름 조회
	public String getCustomerName(@Param("customerId") String customerId);

    // 연체 내역 상태를 납부완료로 업데이트
	public int updateLatePaymentStatusToPaid(@Param("latePaymentNo") int latePaymentNo,
                                       @Param("repaymentStatus") String repaymentStatus);

    // 이자 납부 테이블 상태를 납부완료로 업데이트
	public int updateInterestPaymentStatus(@Param("interestPaymentNo") int interestPaymentNo,
                                     @Param("repaymentStatus") String repaymentStatus);

    // loan_status_tbl의 remaining_term 감소
	public int reduceLoanRemainingTerm(@Param("loanId") int loanId);
	
	// 납부내역중 미납 내역 목록 조회
	public List<LoanInterestPaymentDTO> getMissedPayments();
	
	// 고객 대출 가입 현황
	public List<LoanStatusDTO>myLoanStatus(String customerId);
	
	// 대출약관 조회
	public LoanTermDTO selectLoanTerm(int loan_id);
	
	// 상품약관 동의내역 저장
	public int insertTermsAgree(LoanApplyWithTermsDTO dto);
	
	// 중도상환수수료 계산을 위한 대출 실행일 조회
	public java.sql.Date selectLoanDate(int loanStatusNo);
	
	//  중도상환 처리 결과를 위한 대출 상세정보 조회
	public LoanStatusDTO selectLoanStatusDetail(int loanStatusNo);
	
	// 중도 상환 내역 저장
	public void insertPrepayment(PrepaymentEntity entity);
	
	// 대출상태 변경
	public void updateLoanStatus(LoanStatusDTO dto);
	
	// 고객 대출이자 납입내역 ( 추후 관리자 페이지에서 사용 예정 )
	public List<LoanInterestPaymentDTO> myInterestList(String customerId);
	
	// 대출이자 납입내역에 표시할 대출상품명 조회
	public String selectLoanName(int loanId);
	
	// 고객 연체이력 조회
	public List<LateInterestDTO>getLateInterestList(String customerId);
	
	// 관리자페이지 대출이자 납부 전체 목록
	public List<LoanInterestPaymentDTO>adminLoanInterestList();
	
	// 관리자페이지 연체이력 전체 목록
	public List<LateInterestDTO>adminLoanLateInterestList();
 	
}
