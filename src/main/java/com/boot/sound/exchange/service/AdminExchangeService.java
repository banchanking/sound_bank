package com.boot.sound.exchange.service;

import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.sound.exchange.dao.AdminExchangeDAO;

@Service
public class AdminExchangeService {
	
	@Autowired
	private AdminExchangeDAO dao;
		
    // 수수료 반복 업데이트 처리
    @Transactional
    public int updateFeeRates(List<Map<String, Object>> feeRateList) {
    	
    	
    	
        int updatedCount = 0;
        for (Map<String, Object> rate : feeRateList) {
            updatedCount += dao.updateFeeRate(rate);
        }
        return updatedCount;
    }

	
}
