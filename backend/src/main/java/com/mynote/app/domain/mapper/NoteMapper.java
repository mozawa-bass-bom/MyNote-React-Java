package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.api.dto.nav.NoteNavDto;
import com.mynote.app.domain.entity.Note;

/**
 * Note テーブル用 Mapper。
 * - A案では「カテゴリ＋直下ノート」は SSR 初期描画で投入（ヘッダー/一覧）
 * - 詳細は G03-3 で別取得
 * - URLは「ユーザー別連番（userSeqNo）」で参照するため、該当メソッドを追加
 */
@Mapper
public interface NoteMapper {

    // =============================
    // INSERT
    // =============================

    /**
     * XML内で userSeqNo を採番してから登録する版（selectKey + FOR UPDATE）。
     * 同一Tx内での直列化が前提。分離レベルによっては UNIQUE 衝突が起き得るため、
     * 上位サービス層で DuplicateKey リトライ方針を推奨。
     */
    int insertAutoSeq(Note n);

    // =============================
    // UPDATE / DELETE
    // =============================

    int updateTitle(@Param("id") Long id, @Param("title") String title);

    int updateDescription(@Param("id") Long id, @Param("description") String desc);

    int delete(@Param("id") Long id , @Param("userId") Long userId);

    // =============================
    // SELECT（一 覧 / 詳 細）
    // =============================

    /**
     * 指定カテゴリのノート一覧（軽量）。
     */
    List<Note> findByCategoryId(@Param("categoryId") Long categoryId);
    

    /**
     * ユーザーIDから全件取得。
     */
    List<Note> findAllByUserId(@Param("userId") Long userId);
    /**
	 * ナビ用に軽量化したノート一覧を取得。
	 */
    List<NoteNavDto> findNavByUser(@Param("userId") Long userId);

    /** グローバルIDで1件取得（従来互換） */
    Note findById(@Param("id") Long id);
    
    /** ユーザーIDから Google Storage の URI 一覧を取得（削除用） */
    List<String> selectGsUrisByUserId(@Param("userId") Long userId);
    /**
     * ユーザー別連番で1件取得（/notes/{no} 用）。
     * 使用箇所: ノート詳細表示 G03-3 の初期表示。
     */
    Note findByUserAndSeq(@Param("userId") Long userId, @Param("userSeqNo") Integer userSeqNo);

    /** ノートに紐づくページ数カウント（軽量用途） */
    int countPages(@Param("noteId") Long noteId);
    

    /** ユーザー毎ページ数カウント */
    int countPagesByUserId(@Param("userId") Long userId);


}