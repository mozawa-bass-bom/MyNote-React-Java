package com.mynote.app.domain.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.mynote.app.domain.entity.UserSettings;

@Mapper
public interface UserSettingsMapper {

    /**
     * ユーザーIDで設定を1件取得
     */
    UserSettings findByUserId(@Param("userId") Long userId);

    /**
     * ユーザー設定を新規作成
     */
    void insertUserSettings(UserSettings userSettings);

    /**
     * ユーザー設定を更新する
     */
    void updateUserSettings(UserSettings userSettings);
}
