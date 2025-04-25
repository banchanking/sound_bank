package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.SavingsProductDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 적금 상품 관련 데이터 접근을 위한 DAO 인터페이스
 * - MyBatis를 사용하여 SAVINGS_PRODUCT_TBL 테이블과의 상호작용을 정의
 * - 각 메서드는 SavingsProductMapper.xml의 쿼리와 매핑됨
 */
@Mapper
@Repository
public interface SavingsProductDAO {
    /**
     * 모든 적금 상품 조회
     * @return 적금 상품 목록
     */
    List<SavingsProductDTO> findAllSavingsProducts();

    /**
     * ID로 적금 상품 조회
     * @param productId 조회할 상품 ID
     * @return 조회된 적금 상품
     */
    SavingsProductDTO findSavingsProductById(@Param("productId") int productId);

    /**
     * 새로운 적금 상품 생성
     * @param product 생성할 적금 상품 정보
     */
    void createSavingsProduct(SavingsProductDTO product);

    /**
     * 기존 적금 상품 수정
     * @param product 수정할 적금 상품 정보
     */
    void updateSavingsProduct(SavingsProductDTO product);

    /**
     * 적금 상품 삭제
     * @param productId 삭제할 상품 ID
     */
    void deleteSavingsProduct(@Param("productId") int productId);

    /**
     * 상품 타입으로 적금 상품 조회
     * @param productType 조회할 상품 타입
     * @return 해당 타입의 적금 상품 목록
     */
    List<SavingsProductDTO> findSavingsProductsByType(@Param("productType") String productType);
} 