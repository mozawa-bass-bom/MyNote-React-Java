package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.domain.entity.NotePage;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class NotePageMapperIT {

    @Autowired
    private NotePageMapper mapper;

    @Test
    void findByNoteId_returnsList() {
        List<NotePage> pages = mapper.findByNoteId(1L);
        assertThat(pages).isNotNull();
    }

    @Test
    void insert_update_delete_ok() {
        NotePage p = new NotePage();
        p.setNoteId(1L);
        p.setPageNumber(999);
        p.setFirebasePublicUrl("https://example.com/p.png");
        p.setFirebaseAdminPath("/bucket/p.png");
        p.setExtractedText("text");

        int ins = mapper.insert(p);
        assertThat(ins).isEqualTo(1);
        assertThat(p.getId()).isNotNull();

        int u1 = mapper.updateExtractedText(p.getId(), "text2");
        assertThat(u1).isEqualTo(1);


        int del = mapper.delete(p.getId());
        assertThat(del).isEqualTo(1);
    }
}
