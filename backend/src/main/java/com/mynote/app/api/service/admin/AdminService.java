package com.mynote.app.api.service.admin;

import java.util.List;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.admin.AdminUserResponseDto;
import com.mynote.app.api.dto.admin.ContactResponseDto;
import com.mynote.app.api.dto.admin.UserCountDto;
import com.mynote.app.domain.mapper.ContactMapper;
import com.mynote.app.domain.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserMapper userMapper;
    private final ContactMapper contactMapper;
    
    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> getAllUsers() {
        var users = userMapper.findAllUsers();

        // 集計を一括で取得 → userId をキーにマップ化
        var aggMap = userMapper.countUserAggregates().stream()
            .collect(java.util.stream.Collectors.toMap(
                UserCountDto::userId,
               Function.identity()
            ));

        return users.stream().map(u -> {
            var dto = new AdminUserResponseDto();
            dto.setId(u.getId());
            dto.setUserName(u.getUserName());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setCreatedAt(u.getCreatedAt());

            var agg = aggMap.get(u.getId());
            dto.setCountNotes(agg == null ? 0L : agg.noteCount());
            dto.setCountCategories(agg == null ? 0L : agg.categoryCount());

            return dto;
        }).toList();
    }

    @Transactional
    public int deleteUser(Long userId) {
        return userMapper.deleteUser(userId);
    }


    @Transactional(readOnly = true)
    public List<ContactResponseDto> getAllContacts() {
        log.debug("Service: getAllContacts for Admin called.");
        return contactMapper.findAdminContacts();
    }

    @Transactional
    public int updateUserRole(Long userId, String newRole) {
        return userMapper.updateRole(userId, newRole);
    }



}