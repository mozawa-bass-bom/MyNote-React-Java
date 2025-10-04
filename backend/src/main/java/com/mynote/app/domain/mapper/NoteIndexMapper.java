package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.domain.entity.NoteIndex;

/**
 * note_index テーブル用 Mapper。
 * 目次（TOC: Table of Contents）のタイトルや本文の編集などに利用する。
 */
@Mapper
public interface NoteIndexMapper {

    /**
     * 目次を新規登録する。
     * <p>useGeneratedKeys により挿入後、引数 idx の id フィールドに採番結果が格納される。</p>
     *
     * @param idx 登録対象の目次エンティティ
     * @return 登録件数（通常は 1）
     */
    int insert(NoteIndex idx);

    /**
     * 目次タイトルのみを更新する。
     *
     * @param id 更新対象の目次ID
     * @param title 新しいタイトル
     * @return 更新件数（該当IDが存在すれば 1、なければ 0）
     */
    int updateTitle(@Param("id") Long id, @Param("title") String title);

    /**
     * 目次本文（解説など）を更新する。
     *
     * @param id 更新対象の目次ID
     * @param body 新しい本文
     * @return 更新件数（通常は 1）
     */
    int updateBody(@Param("id") Long id, @Param("body") String body);

    /**
     * 目次を削除する。
     *
     * @param id 削除対象の目次ID
     * @return 削除件数（通常は 1）
     */
    int delete(@Param("id") Long id);

    /**
     * 指定ノートに紐づくすべての目次を取得する。
     * <p>index_number の昇順で並べ替えて返却する。</p>
     *
     * @param noteId ノートID
     * @return 目次リスト（空リストになる可能性あり）
     */
    List<NoteIndex> findByNoteId(@Param("noteId") Long noteId);
    
   long findNoteIdById(@Param("id") Long tocId);
}
