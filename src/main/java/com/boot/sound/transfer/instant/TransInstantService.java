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

	private final PasswordEncoder passwordEncoder;
    private final TransInstantRepository transRepo;        // 이체 저장용
    private final AccountRepository accountRepo;           // 잔액 변경용
    private final TransActionRepository taRepo;            // 거래내역 저장용
    private final CustomerRepository customerRepo;         // 고객 정보 조회용

    // 실시간 이체 처리 - 모든 작업은 하나의 트랜잭션 안에서 처리됨
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

        Date now = new Date(); // 현재 시간

        TransActionDTO out = new TransActionDTO();
        out.setAccount_number(dto.getOut_account_number());
        out.setTransaction_type("출금");
        out.setAmount(BigDecimal.valueOf(dto.getAmount()));
        out.setCurrency("KRW");
        out.setComment_out(dto.getMemo());
        out.setTransaction_date(now);
        taRepo.save(out);

        TransActionDTO in = new TransActionDTO();
        in.setAccount_number(dto.getIn_account_number());
        in.setTransaction_type("입금");
        in.setAmount(BigDecimal.valueOf(dto.getAmount()));
        in.setCurrency("KRW");
        in.setComment_in(dto.getMemo());
        in.setTransaction_date(now);
        taRepo.save(in);

        dto.setTransfer_type("실시간");
        dto.setTransfer_date(now);
        transRepo.save(dto);

        return "이체 완료";
    }
}
