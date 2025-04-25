package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.DepositProductDTO;
import com.boot.sound.deposit.service.DepositProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 예금 상품 관련 REST API를 제공하는 Controller 클래스
 * - 예금 상품의 CRUD 작업을 위한 엔드포인트를 제공
 * - 모든 응답은 ResponseEntity로 래핑하여 HTTP 상태 코드를 포함
 */
@RestController
@RequestMapping("/api/deposit/products")
public class DepositProductController {
    private final DepositProductService depositProductService;

    /**
     * 생성자 주입을 통한 Service 의존성 주입
     * @param depositProductService 예금 상품 Service
     */
    @Autowired
    public DepositProductController(DepositProductService depositProductService) {
        this.depositProductService = depositProductService;
    }

    /**
     * 모든 예금 상품 조회 API
     * @return 예금 상품 목록과 HTTP 200 OK 상태
     */
    @GetMapping
    public ResponseEntity<List<DepositProductDTO>> getAllProducts() {
        return ResponseEntity.ok(depositProductService.getAllProducts());
    }

    /**
     * ID로 예금 상품 조회 API
     * @param id 조회할 상품 ID
     * @return 조회된 예금 상품과 HTTP 200 OK 상태
     */
    @GetMapping("/{id}")
    public ResponseEntity<DepositProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(depositProductService.getProductById(id));
    }

    /**
     * 새로운 예금 상품 생성 API
     * @param product 생성할 예금 상품 정보
     * @return HTTP 200 OK 상태
     */
    @PostMapping
    public ResponseEntity<Void> createProduct(@RequestBody DepositProductDTO product) {
        depositProductService.createProduct(product);
        return ResponseEntity.ok().build();
    }

    /**
     * 기존 예금 상품 수정 API
     * @param id 수정할 상품 ID
     * @param product 수정할 예금 상품 정보
     * @return HTTP 200 OK 상태
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateProduct(@PathVariable Long id, @RequestBody DepositProductDTO product) {
        product.setProductId(id);
        depositProductService.updateProduct(product);
        return ResponseEntity.ok().build();
    }

    /**
     * 예금 상품 삭제 API
     * @param id 삭제할 상품 ID
     * @return HTTP 200 OK 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        depositProductService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
} 