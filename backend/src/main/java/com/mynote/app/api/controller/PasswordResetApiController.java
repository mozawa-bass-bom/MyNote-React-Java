// src/main/java/com/mynote/app/api/controller/PasswordResetApiController.java
package com.mynote.app.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.service.auth.PasswordResetService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth/password-reset")
@RequiredArgsConstructor
public class PasswordResetApiController {

    private final PasswordResetService service;

    public record RequestDto(String email) {}
    public record CompleteDto(String token, String newPassword) {}

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Void>> request(@RequestBody RequestDto req,
                                                     @RequestHeader(value="User-Agent", required=false) String ua,
                                                     @RequestHeader(value="X-Forwarded-For", required=false) String xff,
                                                     @RequestParam(defaultValue="https://app.example.com") String appBaseUrl) {
        String ip = (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : null;
        service.requestReset(req.email(), ip, ua, appBaseUrl);
        // 常にOKを返す（存在漏洩防止）
        return ResponseEntity.ok(ApiResponse.ok(null, "EMAIL_SENT_IF_EXISTS"));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verify(@RequestParam String token) {
        return ResponseEntity.ok(ApiResponse.ok(service.verifyToken(token)));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<Void>> complete(@RequestBody CompleteDto req) {
        boolean ok = service.completeReset(req.token(), req.newPassword());
        if (!ok) return ResponseEntity.badRequest().body(ApiResponse.failWithErrors("INVALID_OR_EXPIRED_TOKEN", null));
        return ResponseEntity.ok(ApiResponse.ok(null, "PASSWORD_UPDATED"));
    }
}
