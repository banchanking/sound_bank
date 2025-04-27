package com.boot.sound.customer_center;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notice_tbl")
@Getter
@Setter
@NoArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id; // 공지사항 ID

    @Column(name = "title", nullable = false)
    private String title; // 제목

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content; // 내용

    @Column(name = "date")
    private LocalDateTime date; // 공지사항 날짜

    @Column(name = "created_at", updatable = false) 
    private LocalDateTime createdAt; // 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    @Column(name = "category")
    private String category; // 카테고리 (예: 공지, 이벤트 등)

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.date = now; // 날짜는 공지사항 작성 시 자동으로 설정
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(); // 수정 시 updatedAt이 갱신
    }
}
