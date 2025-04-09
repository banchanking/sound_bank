package com.boot.sound.deposit;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface DepositDAO {

	// 예금 리스트
	public List<DepositDTO> depositList();
	
	
}
