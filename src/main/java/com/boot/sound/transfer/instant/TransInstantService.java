package com.boot.sound.transfer.instant;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.customer.CustomerRepository;
import com.boot.sound.inquire.account.AccountRepository;
import com.boot.sound.inquire.transfer.TransActionDTO;
import com.boot.sound.inquire.transfer.TransActionRepository;
import com.boot.sound.transfer.transLimit.TransLimitDAO;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransInstantService {

    private final PasswordEncoder passwordEncoder;
    private final TransInstantRepository transRepo;
    private final AccountRepository accountRepo;
    private final TransActionRepository taRepo;
    private final CustomerRepository customerRepo;

    @Autowired
    private TransLimitDAO dao;

    // 고객 하루 이체총금액 (모든계좌)
    public BigDecimal getTodayTransferTotal(String customerId) {
        List<String> accounts = accountRepo.findAccountNumbersByCustomerId(customerId);
        if (accounts == null || accounts.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return taRepo.getTotalTransferredToday(accounts);
    }

    // 한도 검사
    public void checkTransferLimit(String customerId, int requestedAmount) {
        BigDecimal todayTotal = getTodayTransferTotal(customerId);
        int approvedLimit = dao.selectLatestApprovedLimit(customerId);

        BigDecimal totalAfter = todayTotal.add(BigDecimal.valueOf(requestedAmount));
        if (totalAfter.compareTo(BigDecimal.valueOf(approvedLimit)) > 0) {
            throw new IllegalArgumentException("이체한도를 초과했습니다.");
        }
    }

    // 실시간 이체 실행
    @Transactional
    public String send(TransInstantDTO dto) {

        Optional<CustomerDTO> optional = customerRepo.findById(dto.getCustomer_id());
        if (!optional.isPresent()) return "고객 정보 없음";

        CustomerDTO customer = optional.get();

        if (!passwordEncoder.matches(dto.getPassword(), customer.getCustomer_password())) {
            return "비밀번호 오류";
        }

        BigDecimal amount = BigDecimal.valueOf(dto.getAmount());

        // 한도 검사
        try {
            checkTransferLimit(dto.getCustomer_id(), dto.getAmount());
        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
        
        // 출금진행
        int minus = accountRepo.minusBalance(dto.getOut_account_number(), amount);
        if (minus == 0) return "잔액 부족";
        
        // 입금진행
        int plus = accountRepo.plusBalance(dto.getIn_account_number(), amount);
        if (plus == 0) return "입금 실패";

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
        dto.setTransfer_type("실시간");
        dto.setTransfer_date(now);
        transRepo.save(dto);

        return "이체 완료";
    }
}
