package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;
@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ContactMapperIT {

  @Autowired
  private ContactMapper mapper;

  @Test
  void findAdminContacts_mapsToDto() {
    var list = mapper.findAdminContacts();
    assertThat(list).isNotNull();
    if (!list.isEmpty()) {
      var first = list.get(0);
      assertThat(first.getId()).isNotNull();
      assertThat(first.getCreatedAt()).isNotNull();
      // LEFT JOIN なので user がいない行もあり得る点は許容
    }
  }

  @Test
  void countContacts_nonNegative() {
    assertThat(mapper.countContacts()).isGreaterThanOrEqualTo(0L);
  }
}