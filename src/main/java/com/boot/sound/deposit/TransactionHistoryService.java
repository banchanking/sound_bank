package com.boot.sound.deposit;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionHistoryService {
    
    @Autowired
    private TransactionHistoryMapper mapper;
    
    public List<TransactionHistoryDTO> getTransactionHistory(Map<String, Object> params) {
        return mapper.getTransactionHistory(params);
    }
} 