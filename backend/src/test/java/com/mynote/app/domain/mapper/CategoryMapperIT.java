package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.api.dto.nav.CategoryNavDto;
import com.mynote.app.domain.entity.Category;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CategoryMapperIT {

  @Autowired
  private CategoryMapper mapper;

  private static final long USER_ID = 1L;

  @Test
  void smoke_queries_work() {
    // findByUserId
    assertThat(mapper.findByUserId(USER_ID)).isNotNull();

  
    List<CategoryNavDto> navs = mapper.selectNavByUserId(USER_ID);
    assertThat(navs).isNotNull();
    if (!navs.isEmpty()) {
      CategoryNavDto first = navs.get(0);
      assertThat(first.id()).isNotNull();
      assertThat(first.userId()).isEqualTo(USER_ID);
      assertThat(first.name()).isNotBlank();
      assertThat(first.noteCount()).isNotNull();
    }

    // count
    assertThat(mapper.countCategorysByUserId(USER_ID)).isGreaterThanOrEqualTo(0);
  }

  @Test
  void crud_insert_update_delete() {
    // INSERT
    Category c = new Category();
    c.setUserId(USER_ID);
    c.setName("JUnit Category");
    c.setPrompt1("p1");
    c.setPrompt2("p2");

    assertThat(mapper.insert(c)).isEqualTo(1);
    assertThat(c.getId()).isNotNull();

    // UPDATE
    assertThat(mapper.updateName(c.getId(), "Updated")).isEqualTo(1);
    assertThat(mapper.updatePrompts(c.getId(), "q1", "q2")).isEqualTo(1);

    // DELETE（所有者チェックあり）
    assertThat(mapper.deleteByCategoryIdAndUser(USER_ID, c.getId())).isEqualTo(1);
  }
}
