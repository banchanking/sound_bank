package com.boot.sound.customer_center;

import com.boot.sound.jwt.config.UserAuthProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;
    private final UserAuthProvider userAuthProvider;

    @Autowired
    public NoticeController(NoticeService noticeService, UserAuthProvider userAuthProvider) {
        this.noticeService = noticeService;
        this.userAuthProvider = userAuthProvider;
    }

    // 1. 공지사항 등록 (Create)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Notice createNotice(@RequestBody Notice notice, @RequestHeader("Authorization") String token) {
        userAuthProvider.validationToken(token.substring(7)); // JWT 토큰 검증
        return noticeService.createNotice(notice);
    }

    // 2. 모든 공지사항 조회 (Read)
    @GetMapping
    public List<Notice> getAllNotices(@RequestHeader("Authorization") String token) {
        userAuthProvider.validationToken(token.substring(7)); // JWT 토큰 검증
        return noticeService.getAllNotices();
    }

    // 3. 특정 공지사항 조회 (Read)
    @GetMapping("/{id}")
    public Notice getNoticeById(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        userAuthProvider.validationToken(token.substring(7)); // JWT 토큰 검증
        return noticeService.getNoticeById(id);
    }

    // 4. 공지사항 수정 (Update)
    @PutMapping("/{id}")
    public Notice updateNotice(@PathVariable Long id, @RequestBody Notice notice, @RequestHeader("Authorization") String token) {
        userAuthProvider.validationToken(token.substring(7)); // JWT 토큰 검증
        return noticeService.updateNotice(id, notice);
    }

    // 5. 공지사항 삭제 (Delete)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotice(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        userAuthProvider.validationToken(token.substring(7)); // JWT 토큰 검증
        noticeService.deleteNotice(id);
    }
}
