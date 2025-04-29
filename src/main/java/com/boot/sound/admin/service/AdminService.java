package com.boot.sound.admin.service;

import java.nio.CharBuffer;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.admin.dao.AdminDAO;
import com.boot.sound.admin.dto.AdminDTO;
import com.boot.sound.admin.dto.AdminRequestDTO;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AdminService {

    private final AdminDAO dao;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public AdminDTO login(AdminRequestDTO request) {
        String customerId = request.getCustomerId();
        String password = request.getPassword();

        // 1. 암호화된 비밀번호 조회
        String encodedPassword = dao.findPassword(customerId);
        if (encodedPassword == null) {
            throw new RuntimeException("존재하지 않는 관리자 ID입니다.");
        }

        // 2. 입력한 비밀번호와 일치하는지 확인
        if (!encoder.matches(CharBuffer.wrap(password), encodedPassword)) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 관리자 정보 조회
        AdminDTO admin = dao.login(customerId);

        // 4. 관리자 role 확인
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("관리자 권한이 없습니다.");
        }

        return admin;
    }
    
    @Transactional
    public void saveAdminRefreshToken(String customerId, String refresh_token) {
    	dao.saveAdminRefreshToken(customerId, refresh_token);
    }
    
    @Transactional
    public Boolean insert(AdminDTO dto) {
    	String password = dto.getPassword();
    	dto.setPassword(encoder.encode(password));
    	return dao.insert(dto);
    }
    
    @Transactional
    public List<AdminDTO> adminList() {
    	return dao.adminList();
    }
    
    @Transactional
    public Boolean update(AdminDTO dto) {
    	String password = dto.getPassword();
    	dto.setPassword(encoder.encode(password));
    	return dao.update(dto);
    }
    
    @Transactional
    public Boolean delete(AdminDTO dto) {
    	return dao.delete(dto);
    }
    
    @Transactional
    public Boolean logout(String customerId) {
    	return dao.logout(customerId);
    }
}
