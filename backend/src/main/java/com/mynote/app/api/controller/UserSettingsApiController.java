package com.mynote.app.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.service.UserSettingsService;
import com.mynote.app.domain.entity.User;
import com.mynote.app.domain.entity.UserSettings;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-settings")
@RequiredArgsConstructor
public class UserSettingsApiController {

    private final UserSettingsService userSettingsService;

    @GetMapping("/theme")
    public ResponseEntity<ApiResponse<ThemeResponse>> getTheme(HttpServletRequest request) {
        Long userId;
        try {
            Object userIdObj = request.getAttribute("userId");
            if (userIdObj == null) {
                return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
            }
            if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            } else if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else {
                userId = Long.valueOf(userIdObj.toString());
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }

        UserSettings settings = userSettingsService.getUserSettings(userId);
        return ResponseEntity.ok(ApiResponse.ok(new ThemeResponse(
            settings.getTheme(),
            settings.getCustomBgColor(),
            settings.getCustomBorderColor(),
            settings.getCustomFontColor(),
            settings.getCustomInputBgColor()
        )));
    }

    @PutMapping("/theme")
    public ResponseEntity<ApiResponse<Void>> updateTheme(
            @RequestBody ThemeUpdateRequest updateRequest,
            HttpServletRequest request) {
        
        Long userId;
        try {
            Object userIdObj = request.getAttribute("userId");
            if (userIdObj == null) {
                return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
            }
            if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            } else if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else {
                userId = Long.valueOf(userIdObj.toString());
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }

        String theme = updateRequest.getTheme();
        if (theme == null || theme.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Theme is required"));
        }

        userSettingsService.updateUserSettings(userId, theme,
            updateRequest.getCustomBgColor(),
            updateRequest.getCustomBorderColor(),
            updateRequest.getCustomFontColor(),
            updateRequest.getCustomInputBgColor());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @Data
    public static class ThemeUpdateRequest {
        private String theme;
        private String customBgColor;
        private String customBorderColor;
        private String customFontColor;
        private String customInputBgColor;
    }

    @Data
    public static class ThemeResponse {
        private final String theme;
        private final String customBgColor;
        private final String customBorderColor;
        private final String customFontColor;
        private final String customInputBgColor;
        
        public ThemeResponse(String theme, String customBgColor, String customBorderColor, String customFontColor, String customInputBgColor) {
            this.theme = theme;
            this.customBgColor = customBgColor;
            this.customBorderColor = customBorderColor;
            this.customFontColor = customFontColor;
            this.customInputBgColor = customInputBgColor;
        }
    }
}
