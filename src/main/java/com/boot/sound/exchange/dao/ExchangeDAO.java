package com.boot.sound.exchange.dao;

import java.sql.Date;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.boot.sound.exchange.dto.ExchangeTransactionDTO;
import com.boot.sound.exchange.dto.ExchangeWalletDTO;
import com.boot.sound.inquire.account.AccountDTO;
import com.boot.sound.inquire.transfer.TransActionDTO;

@Mapper
@Repository
public interface ExchangeDAO {

    // 고객 계좌 조회 (계좌번호 기준)
    public AccountDTO findAccountByNumber(@Param("account_number") String account_number);

    // 계좌 잔액 업데이트
    public int updateAccountBalance(AccountDTO dto);

    // 지갑 존재 여부 확인 (있으면 1, 없으면 0)
    public int findByCustomerAndCurrency(@Param("customer_id") String customer_id,
                                  @Param("currency_code") String currency_code);

    // 고객 계좌 조회    
    public AccountDTO findAccountById(String customer_id);

    // 지갑 생성
    public int insertWallet(ExchangeWalletDTO dto);

    // 지갑 잔액 업데이트
    public int updateWalletBalance(ExchangeWalletDTO dto);

    // 환전 내역 저장(지갑충전)
    public int chargeWallet(ExchangeTransactionDTO dto);

    // 환전한 거래 내역 조회
    public ExchangeTransactionDTO findTransById(@Param("customer_id") String customer_id);
    
    // 기존 지갑 잔액조회
    public ExchangeWalletDTO findWalletByCustomerAndCurrency(@Param("customer_id") String customer_id,
            @Param("currency_code") String currency_code);
            
    // 환전 내역전체 조회
    public List<ExchangeTransactionDTO> getListById(String customer_id);       
    
    // id별 지갑과 통화별 평균 매입 환율
    public List<ExchangeWalletDTO>findWalletsWithAvgRate(String customer_id);
    
    // 환전 신청목록 조회(100만이상)
    public List<ExchangeTransactionDTO> getExRequestListById(String customer_id);

    // DB 저장된 환율 조회
    public List<Map<String, Object>> getRateByDate(String base_date);

    // 환율 DB에 자동저장
    public int insertExchangeRate(Map<String, Object> rate);

    // 관리자 승인/거절 처리
    public int updateApprovalStatus(@Param("exchange_transaction_id") Long exchange_transaction_id,
            @Param("approval_status") String approval_status);

    // 환전 내역 거래번호로 조회
    public ExchangeTransactionDTO findTransByTransactionId(Long exchange_transaction_id);

    // 지갑목록 조회
    public List<ExchangeWalletDTO> findWalletList(String customer_id);
    
    // 지갑 비활성화
    public int deactivateWallet(Long wallet_id);
    
    // 출금기록 저장
    public int saveTransactionOut(TransActionDTO dto);
    
    //고객 이름 찾기
    public String getNameById(String customer_id);
    
    // 가장최근의환율이 있는 날짜 찾기
    public Date findLatestRateDate(@Param("currency_code") String currencyCode);

}

