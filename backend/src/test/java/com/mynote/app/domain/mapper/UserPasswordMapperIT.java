package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.domain.entity.UserPassword;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserPasswordMapperIT {

    @Autowired
    private UserPasswordMapper mapper;

    @Test
    void insert_find_update_ok_idempotent() {
        // 既存ダミーデータが入っていても落ちないように "存在すれば更新 / なければ新規" で進める
        final Long userId = 1L;

        // 1) 事前取得
        UserPassword existing = mapper.findByUserId(userId);

        // 2) ない場合は insert、ある場合は一旦既知の値に update
        if (existing == null) {
            UserPassword up = new UserPassword();
            up.setUserId(userId);
            up.setPasswordHash("hash1");
            int ins = mapper.insert(up);
            assertThat(ins).isEqualTo(1);
        } else {
            UserPassword up = new UserPassword();
            up.setUserId(userId);
            up.setPasswordHash("hash1");
            int upd0 = mapper.update(up);
            assertThat(upd0).isEqualTo(1);
        }

        // 3) find で "hash1" を確認
        var found = mapper.findByUserId(userId);
        assertThat(found).isNotNull();
        assertThat(found.getPasswordHash()).isEqualTo("hash1");

        // 4) update → "hash2" を確認
        UserPassword up2 = new UserPassword();
        up2.setUserId(userId);
        up2.setPasswordHash("hash2");
        int upd = mapper.update(up2);
        assertThat(upd).isEqualTo(1);

        var updated = mapper.findByUserId(userId);
        assertThat(updated).isNotNull();
        assertThat(updated.getPasswordHash()).isEqualTo("hash2");
    }
}
