package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.domain.entity.NoteIndex;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class NoteIndexMapperIT {

    @Autowired
    private NoteIndexMapper mapper;

    @Test
    void findByNoteId_returnsList() {
        List<NoteIndex> toc = mapper.findByNoteId(1L);
        assertThat(toc).isNotNull();
    }

    @Test
    void insert_update_delete_ok() {
        NoteIndex idx = new NoteIndex();
        idx.setNoteId(1L);
        idx.setIndexNumber(999);
        idx.setStartIndex(0);
        idx.setEndIndex(10);
        idx.setTitle("toc");
        idx.setBody("body");

        int ins = mapper.insert(idx);
        assertThat(ins).isEqualTo(1);
        assertThat(idx.getId()).isNotNull();

        int u1 = mapper.updateTitle(idx.getId(), "toc2");
        assertThat(u1).isEqualTo(1);

        int u2 = mapper.updateBody(idx.getId(), "body2");
        assertThat(u2).isEqualTo(1);

        int del = mapper.delete(idx.getId());
        assertThat(del).isEqualTo(1);
    }
}
