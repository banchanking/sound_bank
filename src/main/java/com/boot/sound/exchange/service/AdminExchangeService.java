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

    // 전체 지갑 목록 조회
    public List<Map<String, Object>> findAllWallets() {

        System.out.println("service - findAllWallets");

        return dao.findAllWallets();
    }

    // 고객 ID 목록 조회
    public List<Map<String, Object>> findAllCustomerIds() {

        System.out.println("service - findAllCustomerIds");

        return dao.findAllCustomerIds();
    }

    // 특정 고객 ID의 지갑 목록 조회
    public List<Map<String, Object>> findWalletsByCustomerId(String customer_id) {

        System.out.println("service - findWalletsByCustomerId");

        return dao.findWalletsByCustomerId(customer_id);
    }

    // 지갑 상태 단건 수정
    @Transactional
    public int updateWalletStatus(Map<String, Object> wallet) {
        
        System.out.println("service - updateWalletStatus");
        
        return dao.updateWalletStatus(wallet);
    }
}
