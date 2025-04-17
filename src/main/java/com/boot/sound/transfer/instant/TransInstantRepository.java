package com.boot.sound.transfer.instant;

import org.springframework.data.jpa.repository.JpaRepository;

// 실시간 이체 테이블을 다루는 JPA 인터페이스
//기본적인 저장(save), 삭제(delete), 조회(findById) 기능 자동 제공됨
public interface TransInstantRepository extends JpaRepository<TransInstantDTO, Integer> {

}
