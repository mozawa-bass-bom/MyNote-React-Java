package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.domain.entity.User;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserMapperIT {

    @Autowired
    private UserMapper mapper;

    @Test
    void findAllUsers_returnsList() {
        List<User> users = mapper.findAllUsers();
        assertThat(users).isNotNull();
    }

    @Test
    void findById_returnsUserOrNull() {
        User u = mapper.findById(1L);
        if (u != null) {
            assertThat(u.getId()).isEqualTo(1L);
        }
    }

    @Test
    void insert_find_updateRole_delete_ok() {
        String suffix = String.valueOf(System.nanoTime());
        String userName = "junit_user_" + suffix;
        String email    = "junit+" + suffix + "@example.com";

        // INSERT
        User u = new User();
        u.setUserName(userName);
        u.setEmail(email);
        u.setRole("USER");
        // スキーマに応じて必須なら設定してください（例）
        // u.setPasswordHash("$2a$10$dummyhash..................");

        mapper.insertUser(u);
        assertThat(u.getId()).as("自動採番IDが付与される").isNotNull();

        // findByEmail
        User byEmail = mapper.findByEmail(email);
        assertThat(byEmail).isNotNull();
        assertThat(byEmail.getId()).isEqualTo(u.getId());

        // findLoginUserByUserName（ログイン用ビューDTOが返る想定）
        var loginView = mapper.findLoginUserByUserName(userName);
        assertThat(loginView).isNotNull();
        assertThat(loginView.getUserName()).isEqualTo(userName);

        // existsByUserName
        boolean exists = mapper.existsByUserName(userName);
        assertThat(exists).isTrue();

        // updateRole
        int updated = mapper.updateRole(u.getId(), "ADMIN");
        assertThat(updated).isEqualTo(1);

        // DELETE
        int deleted = mapper.deleteUser(u.getId());
        assertThat(deleted).isEqualTo(1);

        // 削除後は存在しない
        assertThat(mapper.findById(u.getId())).isNull();
        assertThat(mapper.existsByUserName(userName)).isFalse();
    }

    @Test
    void existsByUserName_falseForRandom() {
        String nonExist = "no_such_user_" + System.nanoTime();
        boolean exists = mapper.existsByUserName(nonExist);
        assertThat(exists).isFalse();
    }
}
