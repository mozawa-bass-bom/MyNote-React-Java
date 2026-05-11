package com.mynote.app.api.service.note;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.note.NotePageRequestDto; // 💡 DTOをインポート
import com.mynote.app.domain.entity.NotePage;
import com.mynote.app.domain.mapper.NotePageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 💡 ロギングを追加

@Service
@RequiredArgsConstructor
@Slf4j 
public class NotePageService {

    private final NotePageMapper notePageMapper;
    private final com.mynote.app.domain.mapper.NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public List<NotePage> findByNoteId(Long noteId) {
        return notePageMapper.findByNoteId(noteId);
    }
    
    /**
     * 新しいページデータを作成する。
     * @param requestDto ページ情報を含むDTO
     * @return 成功した場合 true
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createNotePage(NotePageRequestDto requestDto) { // 💡 引数をDTOに変更
        try {
            log.info("Attempting to create NotePage for noteId={}", requestDto.getNoteId());
            
            // DTOからEntityへ詰め替え
            NotePage notePage = new NotePage();
            notePage.setNoteId(requestDto.getNoteId());
            notePage.setPageNumber(requestDto.getPageNumber());
            notePage.setFirebasePublicUrl(requestDto.getFirebasePublicUrl());
            notePage.setFirebaseAdminPath(requestDto.getFirebaseAdminPath());
            notePage.setExtractedText(requestDto.getExtractedText());

            notePageMapper.insert(notePage);
            
            log.info("NotePage created successfully with ID: {}", notePage.getId());
            return true;
            
        } catch (DataIntegrityViolationException e) {
            log.warn("NotePage creation failed due to data integrity violation: noteId={}", requestDto.getNoteId(), e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred during NotePage creation: noteId={}", requestDto.getNoteId(), e);
            return false;
        }
	}

    /**
     * ページのOCRテキストを更新する。
     * @param pageId 更新対象のページID
     * @param extractedText 新しいテキスト
     * @return 更新件数が1件の場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean updateExtractedText(Long pageId, String extractedText) { // 💡 戻り値を boolean に変更
        try {
            log.info("Attempting to update extracted text for pageId={}", pageId);
            
            // NotePageMapperのupdateExtractedTextは更新件数を返すとして、Service側でチェックする設計も可能ですが、
            notePageMapper.updateExtractedText(pageId, extractedText);
            
            log.info("Extracted text updated successfully for pageId={}", pageId);
            return true;
            
        } catch (Exception e) {
            log.error("An unexpected error occurred during extracted text update: pageId={}", pageId, e);
            return false;
        }
	}

    /**
     * ページのOCRテキストを更新する。（所有権チェック付き）
     * @param userId ユーザーID
     * @param pageId 更新対象のページID
     * @param extractedText 新しいテキスト
     * @return 更新件数が1件の場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean updateExtractedTextWithOwnerCheck(Long userId, Long pageId, String extractedText) {
        log.debug("Service: updateExtractedTextWithOwnerCheck called for userId={}, pageId={}", userId, pageId);

        // 1. pageIdからNoteIdを取得
        long noteId = notePageMapper.findNoteIdById(pageId);

        // 2. NoteIdとUserIdを使って所有権をチェック
        com.mynote.app.domain.entity.Note note = noteMapper.findById(noteId);
        if (note == null || !note.getUserId().equals(userId)) {
            log.warn("Access forbidden or Note not found: userId={}, noteId={}", userId, noteId);
            return false;
        }

        // 3. 権限チェックOK、更新を実行
        return updateExtractedText(pageId, extractedText);
	}


    /**
     * 指定したページを削除する。
     * @param pageId 削除対象のページID
     * @return 削除が成功した場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean deleteNotePage(Long pageId) { 
        try {
            log.warn("Attempting to delete NotePage with ID: {}", pageId);
            notePageMapper.delete(pageId);
            
            log.info("NotePage deleted successfully: pageId={}", pageId);
            return true;

        } catch (Exception e) {
            log.error("An unexpected error occurred during NotePage deletion: pageId={}", pageId, e);
            return false;
        }
	} 
}