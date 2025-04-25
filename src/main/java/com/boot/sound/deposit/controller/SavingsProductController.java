package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.SavingsProductDTO;
import com.boot.sound.deposit.service.SavingsProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 적금 상품 관련 REST API를 제공하는 Controller 클래스
 * - 적금 상품의 CRUD 작업을 위한 엔드포인트를 제공
 * - 모든 응답은 ResponseEntity로 래핑하여 HTTP 상태 코드를 포함
 */
@RestController
@RequestMapping("/api/savings/products")
public class SavingsProductController {

    @Autowired
    private SavingsProductService savingsProductService;

    /**
     * 모든 적금 상품 조회 API
     * @return 적금 상품 목록과 HTTP 200 OK 상태
     */
    @GetMapping
    public ResponseEntity<List<SavingsProductDTO>> getAllSavingsProducts() {
        return ResponseEntity.ok(savingsProductService.getAllSavingsProducts());
    }

    /**
     * ID로 적금 상품 조회 API
     * @param productId 조회할 상품 ID
     * @return 조회된 적금 상품과 HTTP 200 OK 상태
     */
    @GetMapping("/{productId}")
    public ResponseEntity<SavingsProductDTO> getSavingsProductById(@PathVariable int productId) {
        return ResponseEntity.ok(savingsProductService.getSavingsProductById(productId));
    }

    /**
     * 새로운 적금 상품 생성 API
     * @param product 생성할 적금 상품 정보
     * @return HTTP 200 OK 상태
     */
    @PostMapping
    public ResponseEntity<Void> createSavingsProduct(@RequestBody SavingsProductDTO product) {
        savingsProductService.createSavingsProduct(product);
        return ResponseEntity.ok().build();
    }

    /**
     * 기존 적금 상품 수정 API
     * @param productId 수정할 상품 ID
     * @param product 수정할 적금 상품 정보
     * @return HTTP 200 OK 상태
     */
    @PutMapping("/{productId}")
    public ResponseEntity<Void> updateSavingsProduct(@PathVariable int productId, @RequestBody SavingsProductDTO product) {
        product.setProductId(productId);
        savingsProductService.updateSavingsProduct(product);
        return ResponseEntity.ok().build();
    }

    /**
     * 적금 상품 삭제 API
     * @param productId 삭제할 상품 ID
     * @return HTTP 200 OK 상태
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteSavingsProduct(@PathVariable int productId) {
        savingsProductService.deleteSavingsProduct(productId);
        return ResponseEntity.ok().build();
    }

    /**
     * 상품 타입으로 적금 상품 조회 API
     * @param productType 조회할 상품 타입
     * @return 해당 타입의 적금 상품 목록과 HTTP 200 OK 상태
     */
    @GetMapping("/type/{productType}")
    public ResponseEntity<List<SavingsProductDTO>> getSavingsProductsByType(@PathVariable String productType) {
        return ResponseEntity.ok(savingsProductService.getSavingsProductsByType(productType));
    }
} 