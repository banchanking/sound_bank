package com.boot.sound.customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.boot.sound.inquire.account.AccountDAO;
import com.boot.sound.inquire.account.AccountDTO;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.jwt.dto.SignUpDTO;
import com.boot.sound.jwt.exception.AppException;
import com.boot.sound.jwt.mappers.CustomerMapper;
import com.boot.sound.transfer.transLimit.ApprovalDTO;
import com.boot.sound.transfer.transLimit.TransLimitDAO;
import com.boot.sound.transfer.transLimit.TransLimitDTO;

import lombok.RequiredArgsConstructor;
import com.boot.sound.jwt.config.EncryptionUtils; // 암호화 유틸 불러오기
import java.math.BigDecimal;
import java.nio.CharBuffer;
import java.sql.Timestamp;
import java.util.Random;

@RequiredArgsConstructor
@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder encoder;

    @Autowired
    private AccountDAO accountDAO;
    @Autowired
    private TransLimitDAO transLimitDAO;

    public boolean checkId(String customer_id) {
        return customerRepository.existsById(customer_id);
    }

    // 계좌개설
    public CustomerDTO registerCustomer(SignUpDTO signUp) {

        // 계좌번호 랜덤생성
        Random random = new Random();
        String part1 = "174";
        String part2 = String.format("%06d", random.nextInt(1000000));
        String part3 = String.format("%04d", random.nextInt(100000));

        String accountNumber = part1 + "-" + part2 + "-" + part3;
        signUp.setCustomer_account_number(accountNumber);

        // 고객정보 저장
        CustomerDTO dto = new CustomerDTO();

        dto.setCustomerId(signUp.getCustomer_id());
        dto.setCustomerName(signUp.getCustomer_name());
        dto.setCustomer_address(signUp.getCustomer_address());
        dto.setCustomer_email(signUp.getCustomer_email());
        dto.setCustomer_job(signUp.getCustomer_job());
        dto.setCustomer_account_number(accountNumber);
        
        dto.setCustomer_risk_type(signUp.getCustomer_risk_type());
        dto.setCustomer_token(signUp.getCustomer_token());
        dto.setCustomer_password(encoder.encode(CharBuffer.wrap(signUp.getCustomer_password())));
        
        // 주민등록번호에서 앞 6자리(생년월일) 추출 → "YYMMDD" 형식
        String front = signUp.getCustomer_resident_number().substring(0, 6); // 예: 910105 → 1991년 01월 05일

        // 주민등록번호의 7번째 자리(성별 + 세기 구분 코드) 추출
        String centuryCode = signUp.getCustomer_resident_number().substring(7, 8); // 예: "1", "2", "3", "4"

        // 세기 구분 코드에 따라 "19" 또는 "20" 접두어 설정
        String birthYearPrefix;

        switch (centuryCode) {
            case "1": case "2":     // 1900년대 출생자 (남:1, 여:2)
                birthYearPrefix = "19";
                break;
            case "3": case "4":     // 2000년대 출생자 (남:3, 여:4)
                birthYearPrefix = "20";
                break;
            default:
                // 그 외는 유효하지 않은 코드로 간주
                throw new IllegalArgumentException("유효하지 않은 주민번호입니다.");
        }

        // 최종 생년월일 조합: 연도 접두어 + YYMMDD → "YYYYMMDD"
        String fullBirth = birthYearPrefix + front; // 예: "19910105"

        // 형식 변경: "YYYY-MM-DD"로 변환
        String formatted = fullBirth.substring(0, 4) + "-" + fullBirth.substring(4, 6) + "-" + fullBirth.substring(6, 8);

        // CustomerDTO에 세팅
        dto.setCustomer_birthday(formatted); // 예: "1991-01-05"

        
        // 주민번호 암호화
        dto.setCustomer_resident_number(EncryptionUtils.encrypt(signUp.getCustomer_resident_number()));
        // 핸드폰 암호화
        dto.setCustomerPhoneNumber(EncryptionUtils.encrypt(signUp.getCustomer_phone_number()));
        // BCrypt로 암호화
        dto.setAccount_pwd(encoder.encode(signUp.getAccount_pwd()));
        
        CustomerDTO saveCustomer = customerRepository.save(dto);

        // 계좌 저장
        AccountDTO account = new AccountDTO();
        
        account.setAccount_number(accountNumber);
        account.setCustomer_id(dto.getCustomerId());
        account.setAccount_type("입출금");
        account.setAccount_pwd(dto.getAccount_pwd());
        account.setBalance(BigDecimal.ZERO);
        account.setInterest_rate(BigDecimal.ZERO);
        account.setYield_rate(BigDecimal.ZERO);
        account.setCurrency_type("KRW");
        account.setAccount_name("기본 입출금 계좌");
        account.setOpen_date(new java.util.Date());

        accountDAO.insertAccount(account);

        // 이체 한도 요청 (transfer_tbl)
        TransLimitDTO limit = new TransLimitDTO();
        limit.setCustomer_id(dto.getCustomerId());
        limit.setOut_account_number(accountNumber);
        limit.setTransfer_type("한도");
        limit.setRequested_limit(100000000); // 1억원
        limit.setReason("회원가입 기본한도 1억원설정");
        limit.setRequest_date(new Timestamp(System.currentTimeMillis()));

        transLimitDAO.joinInsertLimit(limit); 
        transLimitDAO.updateTransferStatusApproval(limit.getTransfer_id(), "승인");
        
        // 승인 정보 저장 (approval_tbl)
        ApprovalDTO approval = new ApprovalDTO();
        approval.setTransfer_id(limit.getTransfer_id());
        approval.setApproval_type("한도");
        approval.setApproval_limit(limit.getRequested_limit());
        approval.setStatus("승인");
        approval.setReject_reason(null);
        approval.setApproval_date(new Timestamp(System.currentTimeMillis()));

        transLimitDAO.insertApproval(approval);

        return saveCustomer;
    }

// =====================================================================================

    // 로그인
    public CustomerDTO login(CredentialsDTO dto) {
        System.out.println("<<< CustomerService - login() >>>");

        CustomerDTO user = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new AppException("UnKnown user", HttpStatus.NOT_FOUND));

        if (encoder.matches(CharBuffer.wrap(dto.getCustomer_password()), user.getCustomer_password())) {
            return user;
        }

        throw new AppException("Invalid password", HttpStatus.BAD_REQUEST);
    }

    // 사용자 토큰 검증
    public CustomerDTO findById(String customerId) {
        System.out.println("<<< UserService - findById() >>>");

        CustomerDTO user = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException("Unknown customer", HttpStatus.NOT_FOUND));
        return customerMapper.toCustomerDTO(user);
    }
}