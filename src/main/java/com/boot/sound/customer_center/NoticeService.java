package com.boot.sound.customer_center;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public List<Notice> getNoticesByCategory(String category) {
        return noticeRepository.findByCategory(category);
    }

    public Notice getNoticeById(Long id) {
        Optional<Notice> notice = noticeRepository.findById(id);
        // id로 찾은 공지사항이 없으면 null 반환 (혹은 다른 로직 처리)
        if (notice.isPresent()) {
            return notice.get();
        } else {
            return null; // 또는 적절한 처리 로직 (예: 반환값을 null로 두거나, 기본값 반환)
        }
    }

    public Notice createNotice(Notice notice) {
        LocalDateTime now = LocalDateTime.now();
        notice.setDate(now);
        notice.setCreatedAt(now);
        notice.setUpdatedAt(now);
        return noticeRepository.save(notice);
    }

    public Notice updateNotice(Long id, Notice noticeDetails) {
        Optional<Notice> optionalNotice = noticeRepository.findById(id);
        if (optionalNotice.isPresent()) {
            Notice notice = optionalNotice.get();
            notice.setTitle(noticeDetails.getTitle());
            notice.setContent(noticeDetails.getContent());
            notice.setCategory(noticeDetails.getCategory());
            notice.setUpdatedAt(LocalDateTime.now());

            // save() 필요 없음. @Transactional + Dirty Checking 자동 반영
            return notice;
        } else {
            return null; // 또는 null 반환 외에 다른 처리를 할 수 있음
        }
    }

    public void deleteNotice(Long id) {
        Optional<Notice> notice = noticeRepository.findById(id);
        if (notice.isPresent()) {
            noticeRepository.delete(notice.get());
        } else {
            // 삭제 시 해당 공지가 없을 때의 처리 로직 추가 가능
        }
    }
}
