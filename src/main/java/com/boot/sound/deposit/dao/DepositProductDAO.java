package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.DepositProductDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 예금/적금 상품 관련 데이터베이스 접근을 담당하는 DAO 인터페이스
 * 
 * @author 홍길동
 * @since 2024.03
 */
@Mapper
public interface DepositProductDAO {
    /**
     * 모든 예금/적금 상품 목록을 조회합니다.
     * 
     * @return 상품 목록
     */
    List<DepositProductDTO> findAll();
    
    /**
     * ID에 해당하는 상품 상세 정보를 조회합니다.
     * 
     * @param id 상품 ID
     * @return 상품 정보
     */
    DepositProductDTO findById(Long id);
    
    /**
     * 새로운 상품을 생성합니다.
     * 
     * @param product 생성할 상품 정보
     */
    void create(DepositProductDTO product);
    
    /**
     * 기존 상품 정보를 수정합니다.
     * 
     * @param product 수정할 상품 정보
     */
    void update(DepositProductDTO product);
    
    /**
     * ID에 해당하는 상품을 삭제합니다.
     * 
     * @param id 삭제할 상품 ID
     */
    void delete(Long id);
} 