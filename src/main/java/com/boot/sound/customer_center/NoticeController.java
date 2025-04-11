package com.boot.sound.customer_center;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notices")
@CrossOrigin(origins = "http://localhost:3000")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        List<Notice> notices = noticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Notice>> getNoticesByCategory(@PathVariable String category) {
        List<Notice> notices = noticeService.getNoticesByCategory(category);
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notice> getNoticeById(@PathVariable Long id) {
        Notice notice = noticeService.getNoticeById(id);
        return ResponseEntity.ok(notice);
    }

    @PostMapping
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice, @RequestHeader("Authorization") String auth) {
        if (!isAdminAuthenticated(auth)) {
            return ResponseEntity.status(403).build();
        }
        Notice createdNotice = noticeService.createNotice(notice);
        return ResponseEntity.ok(createdNotice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notice> updateNotice(@PathVariable Long id, @RequestBody Notice notice, @RequestHeader("Authorization") String auth) {
        if (!isAdminAuthenticated(auth)) {
            return ResponseEntity.status(403).build();
        }
        Notice updatedNotice = noticeService.updateNotice(id, notice);
        return ResponseEntity.ok(updatedNotice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id, @RequestHeader("Authorization") String auth) {
        if (!isAdminAuthenticated(auth)) {
            return ResponseEntity.status(403).build();
        }
        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdminAuthenticated(String auth) {
        if (auth == null || !auth.startsWith("Basic ")) {
            return false;
        }
        String credentials = auth.substring(6);
        String[] decoded = new String(java.util.Base64.getDecoder().decode(credentials)).split(":");
        if (decoded.length != 2) {
            return false;
        }
        String username = decoded[0];
        String password = decoded[1];
        return noticeService.authenticateAdmin(username, password);
    }
}