package com.boot.sound.deposit;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TransactionHistoryMapper {
    int insertTransaction(Map<String, Object> params);
    // 거래내역 조회
    List<TransactionHistoryDTO> getTransactionHistory(Map<String, Object> params);
} 