package com.mynote.app.api.service.note;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.note.NoteIndexRequestDto;
import com.mynote.app.domain.entity.NoteIndex;
import com.mynote.app.domain.mapper.NoteIndexMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 💡 ロギングを追加

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteIndexService {

    private final NoteIndexMapper noteIndexMapper;

    @Transactional(readOnly = true)
    public List<NoteIndex> findByNoteId(Long noteId) {
        return noteIndexMapper.findByNoteId(noteId);
    }

    /**
     * 新しい目次インデックスを作成する。
     * @param requestDto 目次情報を含むDTO
     * @return 成功した場合 true
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createNoteIndex(NoteIndexRequestDto requestDto) { // 💡 引数をDTOに変更
        try {
            log.info("Attempting to create NoteIndex for noteId={}", requestDto.getNoteId());
            
            // DTOからEntityへ詰め替え
            NoteIndex noteIndex = new NoteIndex();
            noteIndex.setNoteId(requestDto.getNoteId());
            noteIndex.setIndexNumber(requestDto.getIndexNumber());
            noteIndex.setStartIndex(requestDto.getStartIndex());
            noteIndex.setEndIndex(requestDto.getEndIndex());
            noteIndex.setTitle(requestDto.getTitle());
            noteIndex.setBody(requestDto.getBody());

            noteIndexMapper.insert(noteIndex);
            
            log.info("NoteIndex created successfully with ID: {}", noteIndex.getId());
            return true;
            
        } catch (DataIntegrityViolationException e) {
            log.warn("NoteIndex creation failed due to data integrity violation: noteId={}", requestDto.getNoteId(), e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred during NoteIndex creation: noteId={}", requestDto.getNoteId(), e);
            return false;
        }
	}

    /**
     * 目次のタイトルを更新する。
     * @param indexId 更新対象の目次ID (PK)
     * @param title 新しいタイトル
     * @return 更新が成功した場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean updateTitle(Long indexId, String title) { // 💡 戻り値を boolean に変更
        try {
            log.info("Attempting to update title for indexId={}", indexId);
            
            noteIndexMapper.updateTitle(indexId, title);
            
            log.info("Title updated successfully for indexId={}", indexId);
            return true;
            
        } catch (Exception e) {
            log.error("An unexpected error occurred during title update: indexId={}", indexId, e);
            return false;
        }
	}

    /**
     * 目次の本文（body）を更新する。
     * @param indexId 更新対象の目次ID (PK)
     * @param body 新しい本文
     * @return 更新が成功した場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean updateBody(Long indexId, String body) { // 💡 戻り値を boolean に変更
        try {
            log.info("Attempting to update body for indexId={}", indexId);
            
            noteIndexMapper.updateBody(indexId, body);
            
            log.info("Body updated successfully for indexId={}", indexId);
            return true;
            
        } catch (Exception e) {
            log.error("An unexpected error occurred during body update: indexId={}", indexId, e);
            return false;
        }
	}

    /**
     * 指定した目次インデックスを削除する。
     * @param indexId 削除対象の目次ID
     * @return 削除が成功した場合 true
     */
	@Transactional(rollbackFor = Exception.class)
	public boolean deleteNoteIndex(Long indexId) { // 💡 戻り値を boolean に変更
        try {
            log.warn("Attempting to delete NoteIndex with ID: {}", indexId);
            noteIndexMapper.delete(indexId);
            
            log.info("NoteIndex deleted successfully: indexId={}", indexId);
            return true;

        } catch (Exception e) {
            log.error("An unexpected error occurred during NoteIndex deletion: indexId={}", indexId, e);
            return false;
        }
	} 
}