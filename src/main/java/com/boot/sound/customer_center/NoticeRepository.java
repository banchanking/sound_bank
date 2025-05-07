package com.boot.sound.customer_center;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 카테고리만
    List<Notice> findByCategory(String category);

    // 전체 검색
    List<Notice> findByTitleContainingIgnoreCase(String keyword);
  
      // 카테고리 + 검색
    List<Notice> findByCategoryAndTitleContainingIgnoreCase(String category, String keyword);
    
    // 공지사항 ID로 조회
    Notice findById(long id); 

    // 공지사항 수정
    Notice save(Notice notice); // save 메서드는 JpaRepository에서 제공됨


}
