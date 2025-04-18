package com.boot.sound.exchange.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface AdminExchangeDAO {
	
	 // 단일 수수료 업데이트
    public int updateFeeRate(Map<String, Object> rateInfo);
	
}
