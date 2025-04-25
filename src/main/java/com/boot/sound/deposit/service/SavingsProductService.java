package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.SavingsProductDAO;
import com.boot.sound.deposit.dto.SavingsProductDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 적금 상품 관련 비즈니스 로직을 처리하는 Service 클래스
 * - 적금 상품의 CRUD 작업을 수행
 * - 트랜잭션 관리를 위해 @Transactional 어노테이션 사용
 */
@Service
@Transactional
public class SavingsProductService {

    @Autowired
    private SavingsProductDAO savingsProductDAO;

    /**
     * 모든 적금 상품 조회
     * @return 적금 상품 목록
     */
    public List<SavingsProductDTO> getAllSavingsProducts() {
        return savingsProductDAO.findAllSavingsProducts();
    }

    /**
     * ID로 적금 상품 조회
     * @param productId 조회할 상품 ID
     * @return 조회된 적금 상품
     */
    public SavingsProductDTO getSavingsProductById(int productId) {
        return savingsProductDAO.findSavingsProductById(productId);
    }

    /**
     * 새로운 적금 상품 생성
     * @param product 생성할 적금 상품 정보
     */
    public void createSavingsProduct(SavingsProductDTO product) {
        savingsProductDAO.createSavingsProduct(product);
    }

    /**
     * 기존 적금 상품 수정
     * @param product 수정할 적금 상품 정보
     */
    public void updateSavingsProduct(SavingsProductDTO product) {
        savingsProductDAO.updateSavingsProduct(product);
    }

    /**
     * 적금 상품 삭제
     * @param productId 삭제할 상품 ID
     */
    public void deleteSavingsProduct(int productId) {
        savingsProductDAO.deleteSavingsProduct(productId);
    }

    /**
     * 상품 타입으로 적금 상품 조회
     * @param productType 조회할 상품 타입
     * @return 해당 타입의 적금 상품 목록
     */
    public List<SavingsProductDTO> getSavingsProductsByType(String productType) {
        return savingsProductDAO.findSavingsProductsByType(productType);
    }
} 