package com.boot.sound.customer_center;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    public List<Notice> getNotices(String category, String keyword) {
        boolean allCategory = "전체".equals(category);
        boolean hasKeyword = StringUtils.hasText(keyword);

        if (allCategory && !hasKeyword) {
            return noticeRepository.findAll();
        }
        if (allCategory) {
            return noticeRepository.findByTitleContainingIgnoreCase(keyword);
        }
        if (!hasKeyword) {
            return noticeRepository.findByCategory(category);
        }
        return noticeRepository.findByCategoryAndTitleContainingIgnoreCase(category, keyword);
    }

    // 1건 조회
    public Notice getNotice(long id){
        
        return noticeRepository.findById(id);                   
    }

    // 공지사항 수정
    public Notice updateNotice(long id, Notice notice) {
        Notice existingNotice = noticeRepository.findById(id);
        if (existingNotice != null) {
            existingNotice.setTitle(notice.getTitle());
            existingNotice.setContent(notice.getContent());
            existingNotice.setCategory(notice.getCategory());
            return noticeRepository.save(existingNotice);
        }
        return null; 
    }
    // 공지사항 삭제
    public void deleteNotice(long id) {
        
        noticeRepository.deleteById(id);
        
    }

    // 공지사항 생성
    public Notice createNotice(Notice notice) {
        return noticeRepository.save(notice);
    }
    
}
