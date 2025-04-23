package com.boot.sound.exchange.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface AdminExchangeDAO {
	
	 // 단일 수수료 업데이트
    public int updateFeeRate(Map<String, Object> rateInfo);
	
    // 지갑 목록 조회
   public List<Map<String, Object>> findAllWallets();

   // 고객 ID 목록 조회
   public List<Map<String, Object>> findAllCustomerIds();

   // 특정 고객 ID의 지갑 목록 조회
   public List<Map<String, Object>> findWalletsByCustomerId(@Param("customer_id") String customer_id);

   // 지갑 상태 일괄 업데이트
   public int updateWalletStatus(Map<String, Object> wallet);
}
