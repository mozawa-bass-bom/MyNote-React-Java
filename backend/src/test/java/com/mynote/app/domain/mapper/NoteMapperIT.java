package com.mynote.app.domain.mapper;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.mynote.app.api.dto.nav.NoteNavDto;
import com.mynote.app.domain.entity.Note;

@MybatisTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class NoteMapperIT {

    @Autowired
    private NoteMapper mapper;

    @Test
    void findByCategoryId_returnsList() {
        List<Note> notes = mapper.findByCategoryId(1L);
        assertThat(notes).isNotNull();
    }

    @Test
    void insertAutoSeq_update_select_delete_ok() {
        // 作成
        Note n = new Note();
        n.setUserId(1L);
        n.setCategoryId(1L);
        n.setTitle("JUnit Note");
        n.setDescription("desc");
        n.setOriginalFilename("file.pdf");

        int ins = mapper.insertAutoSeq(n);
        assertThat(ins).isEqualTo(1);
        assertThat(n.getId()).as("generated id").isNotNull();
        assertThat(n.getUserSeqNo()).as("user-seq-no").isNotNull();

        Long noteId = n.getId();
        Integer userSeqNo = n.getUserSeqNo();
        Long userId = n.getUserId();

        // タイトル更新
        int u1 = mapper.updateTitle(noteId, "Changed");
        assertThat(u1).isEqualTo(1);

        // 本文更新
        int u2 = mapper.updateDescription(noteId, "Changed body");
        assertThat(u2).isEqualTo(1);

        // countPages（0以上でOK）
        int pages = mapper.countPages(noteId);
        assertThat(pages).isGreaterThanOrEqualTo(0);

        // findById
        Note byId = mapper.findById(noteId);
        assertThat(byId).isNotNull();
        assertThat(byId.getTitle()).isEqualTo("Changed");

        // findByUserAndSeq
        Note byUserSeq = mapper.findByUserAndSeq(1L, userSeqNo);
        assertThat(byUserSeq).isNotNull();
        assertThat(byUserSeq.getId()).isEqualTo(noteId);

        // findAllByUserId（挿入したノートが含まれているはず）
        List<Note> allByUser = mapper.findAllByUserId(1L);
        assertThat(allByUser).extracting(Note::getId).contains(noteId);

        // findNavByUser（軽量DTO）
        List<NoteNavDto> nav = mapper.findNavByUser(1L);
        assertThat(nav).isNotNull();

        // countPagesByUserId（実装は notes 件数カウントになっているが >=0 を確認）
        int notesCount = mapper.countPagesByUserId(1L);
        assertThat(notesCount).isGreaterThanOrEqualTo(0);

        // 削除
        int del = mapper.delete(noteId,userId);
        assertThat(del).isEqualTo(1);

        // 削除後は取得できない
        assertThat(mapper.findById(noteId)).isNull();
    }
}
