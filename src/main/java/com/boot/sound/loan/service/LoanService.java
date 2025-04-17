package com.boot.sound.loan.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.inquire.account.AccountService;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.loan.dao.LoanDAO;
import com.boot.sound.loan.dto.LoanApplyWithTermsDTO;
import com.boot.sound.loan.dto.LoanConsentDTO;
import com.boot.sound.loan.dto.LoanCustomerDTO;
import com.boot.sound.loan.dto.LoanDTO;
import com.boot.sound.loan.dto.LoanInterestPaymentDTO;
import com.boot.sound.loan.dto.LoanLatePaymentDTO;
import com.boot.sound.loan.dto.LoanStatusDTO;
import com.boot.sound.loan.dto.LoanTermDTO;
import com.boot.sound.loan.dto.LoanTermsAgreeDTO;
import com.boot.sound.loan.dto.LoanWithTermsDTO;
import com.boot.sound.loan.dto.PrepaymentDTO;
import com.boot.sound.loan.dto.PrepaymentEntity;
import com.boot.sound.loan.repo.LoanStatusRepository;
import com.boot.sound.loan.scheduler.LoanOverdueScheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class LoanService {

	@Autowired
	private LoanDAO dao;
	private final LoanStatusRepository repo;
	private final LoanAccountService loanAccountService;
	private final AccountService accountService; 
	
	// 대출 상품 리스트
	@Transactional(readOnly=true)
	public List<LoanDTO> loanList() {
		System.out.println("서비스 - loanList");
		return dao.loanList();
	}
	
	// 대출 상품 등록
	@Transactional
	public int loanInsert(LoanWithTermsDTO dto) {
		System.out.println("서비스 - loanInsert");
		LoanDTO loanDTO = new LoanDTO();
		loanDTO.setLoan_name(dto.getLoan_name());
		loanDTO.setLoan_min_amount(dto.getLoan_min_amount());
		loanDTO.setLoan_max_amount(dto.getLoan_max_amount());
		loanDTO.setInterest_rate(dto.getInterest_rate());
		loanDTO.setLoan_term(dto.getLoan_term());
		loanDTO.setLoan_info(dto.getLoan_info());
		loanDTO.setLoan_type(dto.getLoan_type());
		
		dao.loanInsert(loanDTO);
		int loanId = loanDTO.getLoan_id();
		 
		LoanTermDTO loanTermDTO = new LoanTermDTO();
		loanTermDTO.setLoan_id(loanId);
		loanTermDTO.setTerm_title(dto.getTerm_title());
		loanTermDTO.setTerm_content(dto.getTerm_content());
		return dao.loanTermInsert(loanTermDTO);
	}
	
	// 대출 상품 수정
	@Transactional
	public int loanUpdate(int loan_id, LoanDTO dto) {
		System.out.println("서비스 - loanUpdate");
		//dto.setLoan_id(loan_id);
		return dao.loanUpdate(dto);
	}
	
	// 대출 상품 삭제
	@Transactional
	public String loanDelete(int loan_id) {
		System.out.println("서비스 - loanDelete");
		dao.loanDelete(loan_id);
		return "ok";
	}
	
	
	// 대출 상품 상세
	@Transactional
	public LoanDTO loanDetail(int loan_id) {
		System.out.println("서비스 - loanDetail");
		return dao.loanDetail(loan_id);
	}
	
	// 전체 대출 상품 갯수
	@Transactional
	public int loanCnt() {
		System.out.println("서비스 - loanCnt()");
		return dao.loanCnt();
	}
	
	// 대출유형 검색 리스트
	@Transactional
	public List<LoanDTO> loanTypeSearch(String loan_type) {
		System.out.println("서비스 - loanTypeSearch()");
		return dao.loanTypeSearch(loan_type);
	}
	
	// 대출 유형 상품별 갯수
	@Transactional
	public int loanTypeCnt(String loan_type) {
		System.out.println("서비스 - loanTypeCnt()");
		return dao.loanTypeCnt(loan_type);
	}
	
	// 대출 이름검색 리스트
	@Transactional
	public List<LoanDTO> loanNameSearch(String loan_name){
		System.out.println("서비스 - loanNameSearch()");
		return dao.loanNameSearch(loan_name);
	}
	
	// 대출 이름 검색 결과 갯수
	@Transactional
	public int loanNameCnt(String loan_name){
		System.out.println("서비스 - loanNameSearch()");
		return dao.loanNameCnt(loan_name);
	}
	
	// 대출실행 필수동의내역 저장
	@Transactional
	public int consentInsert(LoanConsentDTO dto) {
		System.out.println("서비스 - consentInsert()");
		return dao.consentInsert(dto);
	}
	
	// 대출신청 고객정보
	@Transactional
	public LoanCustomerDTO loanCustomer(String customerId, String loan_id) {
		System.out.println("서비스 - loanCustomer()");
		System.out.println(dao.loanCustomer(customerId, loan_id));
		return dao.loanCustomer(customerId, loan_id);
	}
	
	// 대출신청 정보 저장
	@Transactional
	public int loanApply(LoanApplyWithTermsDTO dto) {
		System.out.println("서비스 - loanApply()");
		
		dao.loanApply(dto);
		return dao.insertTermsAgree(dto);
	}
	
	// 대출 현황 리스트
	@Transactional
	public List<LoanStatusDTO>loanStatus(){
		System.out.println("서비스 - loanStatus()");
		return dao.loanStatus();
	}
	
	// 대출 상태 변경 및 변경정보 문자 송신
	public boolean loanStatusUpdate(int loan_status_no, String loan_progress) {
		System.out.println("서비스 - loanStatusUpdate()");
		return dao.loanStatusUpdate(loan_status_no, loan_progress);
	}
	
	// 문자 발송을 위한 고객정보 조회
	public CustomerDTO selecCustomer(String customerId) {
		System.out.println("서비스 - selecCustomer()");
		return dao.selecCustomer(customerId);
	}
	public LoanStatusDTO selectLoanByNo(int loan_status_no) {
		System.out.println("서비스 - selectLoanByNo()");
	    return repo.findById(loan_status_no).orElse(null);
	}

	public void saveLoan(LoanStatusDTO loan) {
		System.out.println("서비스 - saveLoan()");
		repo.save(loan);
	}
	
	public String selectCustomerName(String customerId) {
		System.out.println("서비스 - selectCustomerName()");
		return dao.selectCustomerName(customerId);
		
	}
	
	public int insertInterestPayment(LoanInterestPaymentDTO dto) {
		System.out.println("서비스 - insertInterestPayment()");
		return dao.insertInterestPayment(dto);
	}
	
	 public void processOverduePayments() {
	        List<LoanInterestPaymentDTO> overdueList = dao.findOverduePayments();
	        System.out.println("서비스 - processOverduePayments()");
	        if (overdueList.isEmpty()) {
	            System.out.println("🔍 연체 대상 이자 납부 내역이 없습니다.");
	            return;
	        }

	        for (LoanInterestPaymentDTO payment : overdueList) {
	            int unpaidAmount = payment.getRepaymentAmount();
	            int overdueInterest = (int) (unpaidAmount * 0.02); // 2% 연체이자 예시
	            
	            LoanLatePaymentDTO lateDTO = new LoanLatePaymentDTO();
	            lateDTO.setLoanId(payment.getLoanId());
	            lateDTO.setCustomerId(payment.getCustomerId());
	            lateDTO.setUnpaidAmount(unpaidAmount);
	            lateDTO.setRepaymentStatus("연체");
	            lateDTO.setOverdueInterest(overdueInterest);
	            String loanProgress = "연체";
	            dao.updateRepaymentStatus(payment.getInterestPaymentNo(), loanProgress);
	            dao.insertLatePayment(lateDTO);
	            log.info("🚨 연체 등록 - 고객: {}, 대출ID: {}, 금액: {}, 연체이자: {}",
	                    payment.getCustomerId(), payment.getLoanId(), unpaidAmount, overdueInterest);
	        }
	    }
	
	 public List<LoanLatePaymentDTO> getLatePayments() {
		    return dao.getLatePayments();
		}

		public String getAccountNumberByLoanId(int loanId, String customerId) {
		    return dao.getAccountNumber(loanId, customerId);
		}

		public String getCustomerName(String customerId) {
		    return dao.selectCustomerName(customerId);
		}
		
		@Transactional
		public void markInterestPaymentAsPaid(int interestPaymentNo) {
		    dao.updateRepaymentStatus(interestPaymentNo, "납부완료");
		}

		@Transactional
		public void markLatePaymentAsPaid(LoanLatePaymentDTO latePayment) {
		    // 연체 상태를 '납부완료'로 업데이트 
		    dao.updateLatePaymentStatusToPaid(
		        latePayment.getLoanId(),
		        latePayment.getCustomerId(),
		        "납부완료"
		    );
		}

		@Transactional
		public void updateInterestPaymentStatusToPaid(LoanLatePaymentDTO latePayment) {
			dao.updateInterestPaymentStatus(
		        latePayment.getLoanId(),
		        latePayment.getCustomerId(),
		        "납부완료"
		    );
		}

		@Transactional
		public void reduceLoanRemainingTerm(int loanId) {
			dao.reduceLoanRemainingTerm(loanId);
		}
		@Transactional
		public List<LoanInterestPaymentDTO> getMissedPaymentsToRetry() {
		    return dao.getMissedPayments();
		}
		
		// 고객 대출 가입 현황
		@Transactional
		public List<LoanStatusDTO>myLoanStatus(String customerId){
			return dao.myLoanStatus(customerId);
		}
		
		// 대출상품 약관 조회
		@Transactional
		public LoanTermDTO selectLoanTerm(int loan_id) {
			return dao.selectLoanTerm(loan_id);
		}
		
		
		
		
		// 가입 상품 중도상환 처리
		@Transactional
		public int calculatePrepaymentPenalty(PrepaymentDTO dto) {
			LoanStatusDTO status = new LoanStatusDTO();
			
			 // 1. 필요한 값 추출
		    int loanTermMonths = status.getLoanTerm(); // 총 대출기간 (개월 수)
		    BigDecimal repaymentAmount = dto.getBalance(); // 상환금액
		    BigDecimal rawPenaltyRate = dto.getPrepayment_penalty(); // 수수료율 (예: 1.4)
		    LocalDate loanStartDate = dto.getLoanDate().toLocalDate(); // 실행일
		    LocalDate now = LocalDate.now();
		    BigDecimal penalty;
		    // 2. 대출 실행일로부터 3년 초과 시 수수료 면제
		    long daysSinceLoan = ChronoUnit.DAYS.between(loanStartDate, now);
		    if (daysSinceLoan > 1095) {
		    		 penalty = BigDecimal.ZERO; // 수수료는 없음
		    }

		    // 3. 대출 종료일 계산 (대출 시작일 + 대출 개월 수)
		    LocalDate loanEndDate = loanStartDate.plusMonths(loanTermMonths);
		    long totalLoanDays = ChronoUnit.DAYS.between(loanStartDate, loanEndDate);

		    // 4. 남은 일수 계산
		    long remainingDays = ChronoUnit.DAYS.between(now, loanEndDate);
		    if (remainingDays < 0) {
		        remainingDays = 0;
		    }

		    // 5. 수수료 계산식: 원금 × (수수료율 / 100) × (잔여일수 / 전체기간일수)
		    BigDecimal penaltyRate = rawPenaltyRate.divide(BigDecimal.valueOf(100), 5, RoundingMode.HALF_UP);
		    BigDecimal dayRatio ;
		    if (totalLoanDays <= 0) {
		        dayRatio = BigDecimal.ZERO; // 수수료 계산에 영향 없도록
		    } else {
		        dayRatio = BigDecimal.valueOf(remainingDays)
		            .divide(BigDecimal.valueOf(totalLoanDays), 5, RoundingMode.HALF_UP);
		    }

		     penalty = repaymentAmount
		            .multiply(penaltyRate)
		            .multiply(dayRatio)
		            .setScale(2, RoundingMode.HALF_UP);

		    System.out.println("▶ 중도상환 수수료 계산 완료: " + penalty + "원");
		    
		    BigDecimal totalAmount = repaymentAmount.add(penalty);
		    
		    // 대출 상세 정보 조회
		    status = dao.selectLoanStatusDetail(dto.getLoanStatusNo());
		    
		    String accountNumber = status.getAccountNumber();

		    // 계좌 출금
		    accountService.withdraw(accountNumber, totalAmount);

		    // 거래내역 저장
		    String customerName = dao.selectCustomerName(status.getCustomerId());
		    loanAccountService.saveLoanTransaction(
		    		accountNumber,
			        "출금",
			        totalAmount,
			        "KRW",
			        "중도상환 원금 및 수수료 납부",
			        customerName,
			        "입출금"
		    );

		    // 중도상환 내역 저장
		    PrepaymentEntity entity = new PrepaymentEntity();
		    entity.setLoanStatusNo(dto.getLoanStatusNo()); // 대출번호
		    entity.setCustomerId(status.getCustomerId());     // 고객ID
		    entity.setRepaymentAmount(dto.getBalance());   // 상환금액(원금)
		    entity.setPenaltyAmount(penalty);              // 수수료
		    entity.setTotalDeductedAmount(totalAmount);    // 총 출금액
		    entity.setRepaymentDate(Date.valueOf(LocalDate.now())); // 상환일
		    entity.setAccountNumber(accountNumber);        // 출금 계좌
		    dao.insertPrepayment(entity);

		    // 대출 상태 변경
		    status.setLoanStatusNo(dto.getLoanStatusNo());
		    status.setBalance(BigDecimal.ZERO);
		    status.setRemainingTerm(0);
		    status.setLoanProgress("중도상환");
		    dao.updateLoanStatus(status);
			return 1;
		}

	
}
