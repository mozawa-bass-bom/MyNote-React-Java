package com.mynote.app.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.dto.admin.AdminUserResponseDto;
import com.mynote.app.api.dto.admin.ContactResponseDto;
import com.mynote.app.api.dto.admin.RoleUpdateRequestDto;
import com.mynote.app.api.service.admin.AdminService;
import com.mynote.app.api.service.note.NoteService;
import com.mynote.app.api.service.upload.FirebaseStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notes/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminApiController {

    private final AdminService adminService;
    private final NoteService noteService;
    private final FirebaseStorageService firebaseStorageService;
    // --- 問い合わせ管理エンドポイント ---

	/** 問い合わせ一覧取得エンドポイント (GET /api/notes/admin/contacts) */
    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ContactResponseDto>>> getAllContacts() {
        log.info("[ADMIN] GET /contacts: Get all contacts list.");
        List<ContactResponseDto> contacts = adminService.getAllContacts();
        return ResponseEntity.ok(ApiResponse.ok(contacts));
    }

    // --- ユーザー管理エンドポイント ---

	/** ユーザー一覧取得エンドポイント (GET /api/notes/admin/users) */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponseDto>>> getAllUsers() {
        log.info("[ADMIN] GET /users: Get all users list.");
        List<AdminUserResponseDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }
	/** 選択ユーザー全削除 */
    @DeleteMapping("/userDelete/{userId}")
    public ResponseEntity<Void> deleteAllNotesByTargetUser(@PathVariable Long userId) {
        // ここはAdmin権限チェックを入れる（Filter or AOP など）
        noteService.deleteAllNotesByUser(userId);
        try {
            firebaseStorageService.deleteUserAssetsAsync(userId);
        } catch (Exception e) {
            log.warn("Admin storage cleanup enqueue failed: userId={}, err={}", userId, e.toString());
        }
        return ResponseEntity.noContent().build();
    }
    
    /** 💡 権限付与・更新用エンドポイント (PATCH /api/notes/admin/users/{userId}/role) */
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
        @PathVariable Long userId,
        @RequestBody RoleUpdateRequestDto req
    ) {
        log.warn("[ADMIN] PATCH /users/{}/role: Attempting to set role to {}", userId, req.getRole());
        
        int updatedCount = adminService.updateUserRole(userId, req.getRole());
        
        if (updatedCount == 0) {
            log.warn("[ADMIN] User role update failed or user not found: userId={}", userId);
            return ResponseEntity.status(404).body(ApiResponse.failWithErrors("user_not_found", null));
        }
        
        log.info("[ADMIN] User role updated successfully: userId={}, newRole={}", userId, req.getRole());
        return ResponseEntity.ok(ApiResponse.ok(null, "UPDATED"));
    }
}