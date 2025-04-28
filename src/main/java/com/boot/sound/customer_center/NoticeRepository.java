package com.boot.sound.customer_center;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 카테고리별로 공지사항을 조회하는 메서드
    List<Notice> findByCategory(String category);

    // 추가적으로 필요한 메서드를 작성할 수 있습니다. 예를 들어:
    // List<Notice> findByTitleContaining(String keyword); // 제목에 키워드가 포함된 공지사항 조회
}
