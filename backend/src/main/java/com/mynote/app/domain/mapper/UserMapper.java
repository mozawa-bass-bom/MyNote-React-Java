package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.api.dto.admin.UserCountDto;
import com.mynote.app.api.dto.auth.LoginUser;
import com.mynote.app.domain.entity.User;

@Mapper
public interface UserMapper {

    /**
     * email でユーザーを1件取得（パスワード再発行等で使用）
     */
    User findByEmail(@Param("email") String email);

    /**
     * 全ユーザー取得（管理画面用）
     */
    List<User> findAllUsers();

    /**
     * ログイン用：userName から認証に必要な情報を取得
     */
    LoginUser findLoginUserByUserName(@Param("userName") String userName);

    /**
     * ID でユーザーを1件取得
     */
    User findById(@Param("id") Long id);

    /**
     * ユーザー新規作成（id は自動採番）
     */
    void insertUser(User u);

    /**
     * ユーザー削除（外部キーの ON DELETE CASCADE 前提）
     * @return 削除件数（0 or 1）
     */
    int deleteUser(@Param("id") Long id);

    /**
     * 権限を更新（例: USER -> ADMIN）
     * @return 更新件数（0 or 1）
     */
    int updateRole(@Param("userId") Long userId, @Param("role") String role);

    /**
     * user_name の重複存在チェック
     */
    boolean existsByUserName(@Param("userName") String userName);

    /**
     * 集計取得：ユーザー毎のカテゴリ数・ノート数・問い合わせ数などを一括で返す
     * （UserCountDto のフィールド名に SQL のエイリアスを合わせること）
     */
    List<UserCountDto> countUserAggregates();
}
