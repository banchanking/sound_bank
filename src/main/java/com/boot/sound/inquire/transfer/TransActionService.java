package com.boot.sound.inquire.transfer; // 이 클래스가 속한 패키지 (폴더 구조)

// 필요한 라이브러리 import
import org.springframework.stereotype.Service;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service 
public class TransActionService {

    private final TransActionRepository TransActionRepository;

    public TransActionService(TransActionRepository transactionRepository) {
        this.TransActionRepository = transactionRepository;
    }

    // 거래내역 조회 메서드
    public List<TransActionDTO> getTransactions(String account_number, Date start_date, Date end_date, String transaction_type) {

        // 종료 날짜를 "그 날의 마지막 시간"까지 설정 (23:59:59)
        // → 그래야 하루 전체 거래내역이 정확히 조회됨
        Calendar cal = Calendar.getInstance(); // 현재 시간 기반 캘린더 객체 생성
        cal.setTime(end_date); // end_date 날짜로 설정
        cal.set(Calendar.HOUR_OF_DAY, 23); // 시: 23시
        cal.set(Calendar.MINUTE, 59); // 분: 59분
        cal.set(Calendar.SECOND, 59); // 초: 59초
        cal.set(Calendar.MILLISECOND, 999); // 밀리초: 최대값
        end_date = cal.getTime(); // 수정된 날짜를 다시 end_date에 저장

        List<TransActionDTO> result; // 최종 결과를 담을 리스트

        // 거래 유형이 "전체"일 경우: 입금/출금 구분 없이 모두 조회
        if (transaction_type.equals("전체")) {
            result = TransActionRepository.findByAccountAndDate(account_number, start_date, end_date);
        } else {
            // 입금 또는 출금만 조회
            result = TransActionRepository.findByAccountDateAndType(account_number, start_date, end_date, transaction_type);
        }

        // Entity 객체를 DTO 객체로 변환하여 반환
        return result.stream().map(t -> {
            TransActionDTO dto = new TransActionDTO(); // DTO 객체 생성

            // Entity로부터 값들을 DTO에 하나씩 세팅
            dto.setTransaction_id(t.getTransaction_id());
            dto.setAccount_number(t.getAccount_number());
            dto.setTransaction_type(t.getTransaction_type());
            dto.setAmount(t.getAmount());
            dto.setCurrency(t.getCurrency());
            dto.setComment_out(t.getComment_out());
            dto.setComment_in(t.getComment_in());
            dto.setTransaction_date(t.getTransaction_date());
            
            return dto; // 가공된 DTO 반환
        }).collect(Collectors.toList()); // DTO 리스트로 모아서 최종 결과 리턴
    }
}
