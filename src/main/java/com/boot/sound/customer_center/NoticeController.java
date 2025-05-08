package com.boot.sound.customer_center;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/notices")
@CrossOrigin
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    // 1) 카테고리별·검색어 옵션 목록 조회
    @GetMapping("/category")
    public List<Notice> getByCategory(@RequestParam String category, @RequestParam(required = false) String search) {
        System.out.println("category = " + category);

        return noticeService.getNotices(category, search);
    }

    // 2) 공지 상세 조회
    @GetMapping("/{id}")
    public Notice getOne(@PathVariable Long id) {

        System.out.println("controller id = " + id);

        return noticeService.getNotice(id);
    }

    // 3) 공지 생성
    @PostMapping
    public Notice create(@RequestBody Notice notice) {
        return noticeService.createNotice(notice);
    }

    // 4) 공지 수정
    @PutMapping("/edit/{id}")
    public Notice update(
            @PathVariable Long id,
            @RequestBody Notice notice
    ) {
        notice.setId(id);
        return noticeService.updateNotice(id, notice);
    }

    // 5) 공지 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        System.out.println("controller id = " + id);
        noticeService.deleteNotice(id);
        System.out.println("controller id = " + id + " 삭제 완료");
    }
}
