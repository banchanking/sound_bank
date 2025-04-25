package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.DepositProductDAO;
import com.boot.sound.deposit.dto.DepositProductDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 예금 상품 관련 비즈니스 로직을 처리하는 Service 클래스
 * - 예금 상품의 CRUD 작업을 수행
 * - 트랜잭션 관리를 위해 @Transactional 어노테이션 사용
 */
@Service
@Transactional
public class DepositProductService {
    private final DepositProductDAO depositProductDAO;

    /**
     * 생성자 주입을 통한 DAO 의존성 주입
     * @param depositProductDAO 예금 상품 DAO
     */
    public DepositProductService(DepositProductDAO depositProductDAO) {
        this.depositProductDAO = depositProductDAO;
    }

    /**
     * 모든 예금 상품 조회
     * @return 예금 상품 목록
     */
    public List<DepositProductDTO> getAllProducts() {
        return depositProductDAO.findAll();
    }

    /**
     * ID로 예금 상품 조회
     * @param id 조회할 상품 ID
     * @return 조회된 예금 상품
     */
    public DepositProductDTO getProductById(Long id) {
        return depositProductDAO.findById(id);
    }

    /**
     * 새로운 예금 상품 생성
     * @param product 생성할 예금 상품 정보
     */
    public void createProduct(DepositProductDTO product) {
        depositProductDAO.create(product);
    }

    /**
     * 기존 예금 상품 수정
     * @param product 수정할 예금 상품 정보
     */
    public void updateProduct(DepositProductDTO product) {
        depositProductDAO.update(product);
    }

    /**
     * 예금 상품 삭제
     * @param id 삭제할 상품 ID
     */
    public void deleteProduct(Long id) {
        depositProductDAO.delete(id);
    }
} 