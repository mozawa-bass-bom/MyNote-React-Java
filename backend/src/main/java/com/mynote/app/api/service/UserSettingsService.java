package com.mynote.app.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.domain.entity.UserSettings;
import com.mynote.app.domain.mapper.UserSettingsMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsMapper userSettingsMapper;

    /**
     * ユーザーIDによる設定の取得
     * 設定が存在しない場合は、デフォルト値(system)を持つエンティティを返す
     */
    public UserSettings getUserSettings(Long userId) {
        UserSettings settings = userSettingsMapper.findByUserId(userId);
        if (settings == null) {
            settings = new UserSettings();
            settings.setUserId(userId);
            settings.setTheme("system");
        }
        return settings;
    }

    /**
     * 設定の更新・保存 (Upsert)
     */
    @Transactional
    public void updateUserSettings(Long userId, String theme, String customBgColor, String customBorderColor, String customFontColor, String customInputBgColor) {
        UserSettings settings = userSettingsMapper.findByUserId(userId);
        if (settings == null) {
            settings = new UserSettings();
            settings.setUserId(userId);
            settings.setTheme(theme);
            settings.setCustomBgColor(customBgColor);
            settings.setCustomBorderColor(customBorderColor);
            settings.setCustomFontColor(customFontColor);
            settings.setCustomInputBgColor(customInputBgColor);
            userSettingsMapper.insertUserSettings(settings);
        } else {
            settings.setTheme(theme);
            settings.setCustomBgColor(customBgColor);
            settings.setCustomBorderColor(customBorderColor);
            settings.setCustomFontColor(customFontColor);
            settings.setCustomInputBgColor(customInputBgColor);
            userSettingsMapper.updateUserSettings(settings);
        }
    }
}
