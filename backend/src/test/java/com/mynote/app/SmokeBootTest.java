package com.mynote.app;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SmokeBootTest {

    @Autowired
    DataSource dataSource;

    @Test
    void contextLoads_andDataSourceConnects() throws Exception {
        assertThat(dataSource).isNotNull();
        try (var c = dataSource.getConnection()) {
            assertThat(c.isValid(2)).isTrue();
        }
    }
}
