package com.boot.sound.transfer.transAuto;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TransAutoDAO {

    // 자동이체 등록
    public void insertAutoTransfer(TransAutoDTO dto);
 
    // 출금계좌 비밀번호 확인
    public String getPasswordByAccount(String account_number);
    
    // 자동이체 목록
    public List<TransAutoDTO> getAutoList(@Param("id") String customer_id); 

    // 자동이체 수정
    public void updateAutoTransfer(TransAutoDTO dto);
    
    // 자동이체 삭제
    public void deleteAutoTransfer(String transfer_id);

    // ---------------------- 자동이체 실행 부분 -----------------------------    

    // 요일 자동이체 조회
    public List<TransAutoDTO> getDayModeTransfers(
        @Param("day") int day, @Param("time") String time
    );

    // 매월 지정일 자동이체 조회
    public List<TransAutoDTO> getMonthlyTransfers(
        @Param("date") int date, @Param("time") String time
    );

    // 출금계좌 잔액 조회
    public int getBalance(@Param("acc") String account_number);

    // 이체실행 > 잔액 업데이트 (입금/출금)
    public void updateBalance(
        @Param("acc") String account_number, @Param("amount") int amount
    );

    // 출금내역 저장
    void saveTransactionOut(TransAutoDTO dto);

    // 입금내역 저장
    void saveTransactionIn(TransAutoDTO dto);
}
