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

//생략된 import 및 어노테이션 동일

@Service
@RequiredArgsConstructor
public class TransInstantService {

	private final PasswordEncoder passwordEncoder;
 private final TransInstantRepository transRepo;
 private final AccountRepository accountRepo;
 private final TransActionRepository taRepo;
 private final CustomerRepository customerRepo;

 @Transactional
 public String send(TransInstantDTO dto) {
     Optional<CustomerDTO> optional = customerRepo.findById(dto.getCustomer_id());
     if (!optional.isPresent()) return "고객 정보 없음";

     CustomerDTO customer = optional.get();
		if (!passwordEncoder.matches(dto.getPassword(), customer.getCustomer_password())) {
			return "비밀번호 오류";
		}
		
     BigDecimal amount = BigDecimal.valueOf(dto.getAmount());
     int minus = accountRepo.minusBalance(dto.getOut_account_number(), amount);
     if (minus == 0) return "잔액 부족";

     int plus = accountRepo.plusBalance(dto.getIn_account_number(), amount);
     if (plus == 0) return "입금 실패";

     Date now = new Date();

     // 출금 거래내역 저장
     TransActionDTO out = new TransActionDTO();
     out.setAccount_number(dto.getOut_account_number());
     out.setTransaction_type("출금");
     out.setAmount(amount);
     out.setCurrency("KRW");
     out.setComment(dto.getMemo()); // memo 하나만 사용
     out.setAccount_type("출금계좌");
     out.setTransaction_date(now);
     out.setCustomer_name(customer.getCustomer_name());
     taRepo.save(out);

     // 입금 거래내역 저장
     TransActionDTO in = new TransActionDTO();
     in.setAccount_number(dto.getIn_account_number());
     in.setTransaction_type("입금");
     in.setAmount(amount);
     in.setCurrency("KRW");
     in.setComment(dto.getMemo()); // memo 하나만 사용
     in.setAccount_type("입금계좌");
     in.setTransaction_date(now);
     in.setCustomer_name(dto.getIn_name());
     taRepo.save(in);

     dto.setTransfer_type("실시간");
     dto.setTransfer_date(now);
     transRepo.save(dto);

     return "이체 완료";
 }
}
