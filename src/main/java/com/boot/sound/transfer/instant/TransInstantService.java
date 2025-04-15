package com.boot.sound.transfer.instant;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.customer.CustomerRepository;
import com.boot.sound.inquire.account.AccountRepository;
import com.boot.sound.inquire.transfer.TransActionDTO;
import com.boot.sound.inquire.transfer.TransActionRepository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransInstantService {

    // 비밀번호 암호화 검증용
    private final PasswordEncoder passwordEncoder;
    private final TransInstantRepository transRepo;	// 이체정보 저장
    private final AccountRepository accountRepo;	// 잔액 증가/감소
    private final TransActionRepository taRepo;		// 거래내역 저장용
    private final CustomerRepository customerRepo;	// 고객정보 조회

    // 이체실행
    // 트랜젝션 적용
    @Transactional
    public String send(TransInstantDTO dto) {

        // 고객정보 조회
        Optional<CustomerDTO> optional = customerRepo.findById(dto.getCustomer_id());
        if (!optional.isPresent()) return "고객 정보 없음"; // 존재하지 않으면 종료

        CustomerDTO customer = optional.get();

        // 비밀번호 확인
        // passwordEncoder.matches > Spring Security에서 제공하는 비밀번호 비교 메서드
        if (!passwordEncoder.matches(dto.getPassword(), customer.getCustomer_password())) {
            return "비밀번호 오류";
        }

        // 이체금액 설정
        BigDecimal amount = BigDecimal.valueOf(dto.getAmount());

        // 출금계좌 잔액 차감
        int minus = accountRepo.minusBalance(dto.getOut_account_number(), amount);
        if (minus == 0) return "잔액 부족"; // 차감 실패 시 종료

        // 입금계좌 잔액 증가
        int plus = accountRepo.plusBalance(dto.getIn_account_number(), amount);
        if (plus == 0) return "입금 실패"; // 입금 실패 시 종료

        // 현재시간 저장 (이체 일시)
        Date now = new Date();

        // 거래내역 저장 - 출금
        TransActionDTO out = new TransActionDTO();
        
        out.setAccount_number(dto.getOut_account_number()); 
        out.setTransaction_type("출금");                     
        out.setAmount(amount);                               
        out.setCurrency("KRW");                             
        out.setComment(dto.getMemo());                       
        out.setAccount_type("출금계좌");                    
        out.setTransaction_date(now);                       
        out.setCustomer_name(customer.getCustomer_name());  
        
        taRepo.save(out);                                   

        // 거래내역 저장 - 입금
        TransActionDTO in = new TransActionDTO();
        
        in.setAccount_number(dto.getIn_account_number());    
        in.setTransaction_type("입금");                    
        in.setAmount(amount);                     
        in.setCurrency("KRW");
        in.setComment(dto.getMemo());
        in.setAccount_type("입금계좌");
        in.setTransaction_date(now);
        in.setCustomer_name(dto.getIn_name());            
        
        taRepo.save(in);

        // 이체 정보 저장
        dto.setTransfer_type("실시간");      // 이체 유형 설정
        dto.setTransfer_date(now);         // 이체 날짜 설정
        transRepo.save(dto);               // DB 저장

        return "이체 완료";
    }
}
