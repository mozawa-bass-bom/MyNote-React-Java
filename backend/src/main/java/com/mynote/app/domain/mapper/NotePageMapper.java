package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.domain.entity.NotePage;

/**
 * note_pages テーブル用 Mapper。
 * ノートを構成する各ページ（PDF1ページごと）の情報を扱う。
 */
@Mapper
public interface NotePageMapper {

    /**
     * ページを新規登録する。
     * <p>アップロード処理（F03-1-1）で PDF を分割した後、
     * Firebase Storage に保存したファイルの URL/Path、OCRテキストなどを登録する。</p>
     *
     * @param p 登録対象のページエンティティ
     * @return 登録件数（通常は 1）
     */
    int insert(NotePage p);

    /**
     * 抽出テキスト（OCR結果など）を更新する。
     * <p>再OCR や AI によるテキスト置換処理を行った際に使用。</p>
     *
     * @param id ページID
     * @param extractedText 新しい抽出テキスト
     * @return 更新件数（通常は 1）
     */
    int updateExtractedText(@Param("id") Long id,
                            @Param("extractedText") String extractedText);

    /**
     * ページを削除する。
     * <p>再アップロードや管理画面から個別ページを消すときに使用。</p>
     *
     * @param id ページID
     * @return 削除件数（通常は 1）
     */
    int delete(@Param("id") Long id);

    /**
     * 指定ノートに紐づくすべてのページを取得する。
     * <p>ノート詳細画面（G03-3）のページ一覧表示用。
     * page_number 昇順で返却する。</p>
     *
     * @param noteId ノートID
     * @return ページリスト（空リストになる可能性あり）
     */
    List<NotePage> findByNoteId(@Param("noteId") Long noteId);
    
    long findNoteIdById(@Param("id") Long pageId);
}
