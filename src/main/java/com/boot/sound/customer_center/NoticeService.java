package com.boot.sound.customer_center;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private AdminRepository adminRepository;

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public List<Notice> getNoticesByCategory(String category) {
        return noticeRepository.findByCategory(category);
    }

    public Notice getNoticeById(Long id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
    }

    public Notice createNotice(Notice notice) {
        notice.setDate(LocalDateTime.now());
        notice.setCreatedAt(LocalDateTime.now());
        notice.setUpdatedAt(LocalDateTime.now());
        return noticeRepository.save(notice);
    }

    @Transactional
    public Notice updateNotice(Long id, Notice noticeDetails) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        notice.setTitle(noticeDetails.getTitle());
        notice.setContent(noticeDetails.getContent());
        notice.setCategory(noticeDetails.getCategory());
        notice.setUpdatedAt(LocalDateTime.now());
        return noticeRepository.save(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        noticeRepository.delete(notice);
    }

    public boolean authenticateAdmin(String username, String password) {
        Optional<Admin> admin = adminRepository.findByUsername(username);
        return admin.isPresent() && admin.get().getPassword().equals(password);
    }
}