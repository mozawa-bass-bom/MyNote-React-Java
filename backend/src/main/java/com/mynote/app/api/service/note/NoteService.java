package com.mynote.app.api.service.note;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.note.NoteByUserSeqNoResponceDto;
import com.mynote.app.api.dto.note.NoteRequestDto;
import com.mynote.app.api.dto.note.NoteResponseDto;
import com.mynote.app.api.dto.note.PageResponseDto;
import com.mynote.app.api.dto.note.TocResponseDto;
import com.mynote.app.domain.entity.Note;
import com.mynote.app.domain.entity.NoteIndex;
import com.mynote.app.domain.entity.NotePage;
import com.mynote.app.domain.mapper.NoteIndexMapper;
import com.mynote.app.domain.mapper.NoteMapper;
import com.mynote.app.domain.mapper.NotePageMapper;
import com.mynote.app.domain.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

	private final NoteMapper noteMapper;
	private final NotePageMapper notePageMapper;
	private final NoteIndexMapper noteIndexMapper;
	private final UserMapper userMapper;

	@Transactional(rollbackFor = Exception.class)
	public Long createNote(Long userId, NoteRequestDto dto) {
	  try {
	    log.info("Attempting to create note for userId={}", userId);

	    // 入力チェック（必要なら）
	    if (dto.getCategoryId() == null) {
	      throw new IllegalArgumentException("categoryId is required");
	    }

	    // 準備
	    Note note = new Note();
	    note.setUserId(userId);
	    note.setCategoryId(dto.getCategoryId());
	    note.setTitle(dto.getTitle());
	    note.setDescription(dto.getDescription());
	    note.setOriginalFilename(dto.getOriginalFilename());

	    // 挿入（userSeqNo は BEFORE selectKey で、id は useGeneratedKeys で入る想定）
	    noteMapper.insertAutoSeq(note);

	 
	    final Note saved = (note.getId() != null)
	        ? noteMapper.findById(note.getId())
	        : noteMapper.findByUserAndSeq(userId, note.getUserSeqNo());

	    if (saved == null) {
	      throw new IllegalStateException("Inserted row not found (userId=" + userId +
	          ", userSeqNo=" + note.getUserSeqNo() + ")");
	    }

	    log.info("Note created: id={}, userSeqNo={}, createdAt={}",
	        saved.getId(), saved.getUserSeqNo(), saved.getCreatedAt());

	    return saved.getId();

	  } catch (DataIntegrityViolationException e) {
	    log.warn("Note creation failed due to data integrity violation: userId={}", userId, e);
	    return null;
	  } catch (Exception e) {
	    log.error("Unexpected error during note creation: userId={}", userId, e);
	    return null;
	  }
	}

	public  NoteByUserSeqNoResponceDto getNoteByUserSeqNo(Long userId, Integer userSeqNo) {
		
		Note note = noteMapper.findByUserAndSeq(userId, userSeqNo);
		if (note == null) {
			return null;
		}
		List<NotePage> pages = notePageMapper.findByNoteId(note.getId());
		List<NoteIndex> indices = noteIndexMapper.findByNoteId(note.getId());
		
		System.out.println(note.getId());
		NoteResponseDto noteDto = toListResponseDto(note);
		List<PageResponseDto> page = pages.stream().map(this::toPageResponseDto).collect(Collectors.toList());
		List<TocResponseDto> toc = indices.stream().map(this::toTocResponseDto).collect(Collectors.toList());
		NoteByUserSeqNoResponceDto dto = new NoteByUserSeqNoResponceDto();
		dto.setNote(noteDto);
		dto.setPage(page);
		dto.setToc(toc);
		return dto;
	}

	/**
	 * ユーザーに紐づいた全てのノートを取得する。
	 *
	 * @param userId ユーザーID
	 * @return リスト表示用のノートDTOのリスト
	 */
	@Transactional(readOnly = true)
	public List<NoteResponseDto> getAllNotes(Long userId) {
		log.debug("Service: getAllNotes called for userId={}", userId);

		// MapperでユーザーIDから全てのNoteを取得
		List<Note> notes = noteMapper.findAllByUserId(userId);

		// EntityからDTOへの変換
		return notes.stream()
				.map(this::toListResponseDto)
				.collect(Collectors.toList());
	}

	/** Entity (Note) から List Response DTO への変換ヘルパーメソッド */
	private NoteResponseDto toListResponseDto(Note note) {
		NoteResponseDto dto = new NoteResponseDto();
		dto.setId(note.getId());
		dto.setUserId(note.getUserId());
		dto.setCategoryId(note.getCategoryId());
		dto.setUserSeqNo(note.getUserSeqNo());
		dto.setTitle(note.getTitle());
		dto.setDescription(note.getDescription());
		dto.setOriginalFilename(note.getOriginalFilename());
		dto.setCreatedAt(note.getCreatedAt());
		dto.setUpdatedAt(note.getUpdatedAt());
		return dto;
	}

	/**
	 * ユーザーに紐づいた全てのNoteIndexを取得し、ノートIDでグループ化する。
	 *
	 * @param userId ユーザーID
	 * @return ノートIDをキーとし、TocResponseDtoのリストを値とするMap
	 */
	@Transactional(readOnly = true)
	public Map<Long, List<TocResponseDto>> getAllNoteIndexMap(Long userId) {
		log.debug("Service: getAllNoteIndexMap called for userId={}", userId);

		// 1. ユーザーの全ノートを取得
		List<Note> notes = noteMapper.findAllByUserId(userId);

		// 2. 各ノートのNoteIndexリストを取得し、flatMapで結合・変換する
		List<TocResponseDto> allTocDtos = notes.stream()
				.flatMap(note -> {
					Long noteId = note.getId();

					// N+1問題の発生源
					List<NoteIndex> noteIndexList = noteIndexMapper.findByNoteId(noteId);

					// NoteIndexをTocResponseDtoに変換
					return noteIndexList.stream().map(this::toTocResponseDto);
				})
				.collect(Collectors.toList());

		// 3. ノートId (getNoteId) でグループ化してMapとして返す
		return allTocDtos.stream()
				.collect(Collectors.groupingBy(TocResponseDto::getNoteId));
	}

	/**
	 * Entity (NoteIndex) から Toc Response DTO への変換ヘルパーメソッド
	 */
	private TocResponseDto toTocResponseDto(NoteIndex noteIndex) {
		TocResponseDto dto = new TocResponseDto();

		dto.setId(noteIndex.getId());
		dto.setNoteId(noteIndex.getNoteId());
		dto.setIndexNumber(noteIndex.getIndexNumber());
		dto.setStartIndex(noteIndex.getStartIndex());
		dto.setEndIndex(noteIndex.getEndIndex());
		dto.setTitle(noteIndex.getTitle());
		dto.setBody(noteIndex.getBody());

		return dto;
	}

	/**
	 * ユーザーに紐づいた全てのNotePageを取得し、ノートIDでグループ化する。
	 *
	 * @param userId ユーザーID
	 * @return ノートIDをキーとし、PageResponseDtoのリストを値とするMap
	 */
	@Transactional(readOnly = true)
	public Map<Long, List<PageResponseDto>> getAllNotePages(Long userId) {
		log.debug("Service: getAllNotePages called for userId={}", userId);

		List<Note> notes = noteMapper.findAllByUserId(userId);

		List<PageResponseDto> allPageDtos = notes.stream()
				.flatMap(note -> {
					Long noteId = note.getId();

					// N+1問題の発生源
					List<NotePage> notePageList = notePageMapper.findByNoteId(noteId);

					// NotePageをPageResponseDtoに変換
					return notePageList.stream().map(this::toPageResponseDto);
				})
				.collect(Collectors.toList());

		// 3. ノートId (getNoteId) でグループ化してMapとして返す
		return allPageDtos.stream()
				.collect(Collectors.groupingBy(PageResponseDto::getNoteId));
	}

	/**
	 * Entity (NotePage) から Page Response DTO への変換ヘルパーメソッド
	 */
	private PageResponseDto toPageResponseDto(NotePage notePage) {
		PageResponseDto dto = new PageResponseDto();
		dto.setId(notePage.getId());
		dto.setNoteId(notePage.getNoteId());
		dto.setPageNumber(notePage.getPageNumber());
		dto.setFirebasePublicUrl(notePage.getFirebasePublicUrl());
		dto.setFirebaseAdminPath(notePage.getFirebaseAdminPath());
		dto.setExtractedText(notePage.getExtractedText());
		return dto;
	}

	/**
	 * ノート概要HTMLを更新する
	 *
	 * @param userId ユーザーID
	 * @param userSeqNo ユーザー連番
	 * @param description 新しい概要HTML
	 * @return 更新件数 (0: ノートが見つからない/権限がない, 1: 成功)
	 */
	@Transactional
	public int updateDescription(Long userId, Integer userSeqNo, String description) {
		log.debug("Service: updateDescription called for userId={}, userSeqNo={}", userId, userSeqNo);

		// 1. userIdとuserSeqNoを使ってノートを特定し、権限をチェック
		Note note = noteMapper.findByUserAndSeq(userId, userSeqNo);

		if (note == null) {
			log.warn("Note not found or forbidden during update: userId={}, userSeqNo={}", userId, userSeqNo);
			return 0; // ノートが見つからない、または権限がない
		}

		// 2. 取得したNote IDを使って更新を実行
		noteMapper.updateDescription(note.getId(), description);

		return 1;
	}

	/**
	 * 目次タイトルのリネームを実行する。
	 * 💡 tocIdからNoteの所有者をチェックするロジックを組み込みました。
	 *
	 * @param userId ユーザーID
	 * @param tocId 目次ID
	 * @param title 新しいタイトル
	 * @return 更新件数 (0: 権限なし/データなし, 1: 成功)
	 */
	@Transactional
	public int renameToc(Long userId, Long tocId, String title) {
		log.debug("Service: renameToc called for userId={}, tocId={}", userId, tocId);

		// 1. tocIdからNoteIdを取得 (MapperにfindNoteIdByIdがあることを仮定)
		Long noteId = noteIndexMapper.findNoteIdById(tocId);

		// 2. NoteIdとUserIdを使って所有権をチェック
		Note note = noteMapper.findById(noteId);
		if (note == null || !note.getUserId().equals(userId)) {
			log.warn("Access forbidden or Note not found: userId={}, noteId={}", userId, noteId);
			return 0;
		}

		// 3. 権限チェックOK、更新を実行
		noteIndexMapper.updateTitle(tocId, title);
		return 1;
	}


	@Value
	public static class DeletedNoteMeta {
		Long noteId;
		Long categoryId;
	}

	@Transactional
	public DeletedNoteMeta deleteNote(Long userId, Integer userSeqNo) {
		// まずユーザー別連番でノート特定（所有者ガード）
		var note = noteMapper.findByUserAndSeq(userId, userSeqNo);
		if (note == null) {
			return null; // Controller 側で 404 にする
		}

		Long noteId = note.getId();
		Long categoryId = note.getCategoryId();

		// FK に ON DELETE CASCADE を設定している前提
		// （設定していない場合は、先に note_indices / note_pages を手動削除）
		int rows = noteMapper.delete(userId, noteId);
		if (rows == 0) {
			// 同時更新などで消えてた等の稀ケース
			return null;
		}

		return new DeletedNoteMeta(noteId, categoryId);
	}

	@Transactional
	public int deleteAllNotesByUser(Long userId) {
		if (userId == null)
			throw new IllegalArgumentException("userId is required");
		// FK(CASCADE) 前提：notes を消せば note_pages / note_indexes 等も連鎖削除
		return userMapper.deleteUser(userId);

	}
}