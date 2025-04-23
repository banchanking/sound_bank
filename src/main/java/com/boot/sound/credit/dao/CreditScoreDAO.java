package com.boot.sound.credit.dao;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

@Mapper
public interface CreditScoreDAO {
		
		int getLateCount3Months(String customerId);
	    Long getTotalLoanAmount(String customerId);
	    Long getTotalLoanBalance(String customerId);
	    Long getTotalAssets(String customerId);
	    double getCompletedTermRatio(String customerId);
	    void saveCreditScore(@Param("customerId") String customerId, @Param("creditScore") double creditScore);

	}
