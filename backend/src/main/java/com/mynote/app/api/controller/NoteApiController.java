package com.mynote.app.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.dto.note.NoteByUserSeqNoResponceDto;
import com.mynote.app.api.dto.note.NoteDescriptionUpdateDto;
import com.mynote.app.api.dto.note.NoteRequestDto;
import com.mynote.app.api.dto.note.NoteResponseDto;
import com.mynote.app.api.dto.note.PageExplanationEditRequestDto;
import com.mynote.app.api.dto.note.PageResponseDto;
import com.mynote.app.api.dto.note.TocExplanationEditRequestDto;
import com.mynote.app.api.dto.note.TocRenameRequestDto;
import com.mynote.app.api.dto.note.TocResponseDto;
import com.mynote.app.api.service.note.NoteIndexService;
import com.mynote.app.api.service.note.NotePageService;
import com.mynote.app.api.service.note.NoteService;
import com.mynote.app.api.service.upload.FirebaseStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Validated
@Slf4j
public class NoteApiController {

	private final NoteService noteService;
	private final NoteIndexService noteIndexService;
	private final NotePageService notePageService;
	private final FirebaseStorageService firebaseStorageService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponse<String>> createNote(
			@SessionAttribute("userId") Long userId,
			@RequestBody NoteRequestDto noteRequestDto) {
		log.info("[POST] createNote: userId={}", userId);

		Long noteId = noteService.createNote(userId, noteRequestDto);

		if (noteId == null) {
			log.warn("Note creation failed for userId={}", userId);
			return ResponseEntity.status(500).body(ApiResponse.failWithErrors("creation_failed", null));
		}

		log.info("Note created successfully for noteId={}", noteId);
		return ResponseEntity.status(201).body(ApiResponse.ok(noteId.toString(), "CREATED"));
	}

	// --- GET (全件取得) ---

	/** ユーザーに紐づいた全件取得 */
	@GetMapping("")
	public ResponseEntity<ApiResponse<List<NoteResponseDto>>> getAllNotes(
			@SessionAttribute("userId") Long userId) {
		log.info("[GET] getAllNotes: userId={}", userId);
		List<NoteResponseDto> notes = noteService.getAllNotes(userId);
		log.info("Notes retrieved: count={}", notes.size());
		return ResponseEntity.ok(ApiResponse.ok(notes));
	}

	/** ユーザーに紐づいた全目次を取得 (ノートIDでグループ化) */
	@GetMapping("/toc")
	public ResponseEntity<ApiResponse<Map<Long, List<TocResponseDto>>>> getAllNoteIndexMap(
			@SessionAttribute("userId") Long userId) {
		log.info("[GET] getAllNoteIndexMap: userId={}", userId);
		Map<Long, List<TocResponseDto>> tocMap = noteService.getAllNoteIndexMap(userId);
		log.info("TOCs retrieved: count={}", tocMap.size());
		return ResponseEntity.ok(ApiResponse.ok(tocMap));
	}

	/** ユーザーに紐づいた全ページを取得 (ノートIDでグループ化) */
	@GetMapping("/pages")
	public ResponseEntity<ApiResponse<Map<Long, List<PageResponseDto>>>> getAllNotePages(
			@SessionAttribute("userId") Long userId) {
		log.info("[GET] getAllNotePages: userId={}", userId);
		Map<Long, List<PageResponseDto>> pageMap = noteService.getAllNotePages(userId);
		log.info("Pages retrieved: count={}", pageMap.size());
		return ResponseEntity.ok(ApiResponse.ok(pageMap));
	}

	// --- GET (userSeqによる単ページ取得) ---
	@GetMapping("/{userSeqNo}")
	public ResponseEntity<ApiResponse<NoteByUserSeqNoResponceDto>> getNoteByUserSeqNo(
			@PathVariable Integer userSeqNo,
			@SessionAttribute("userId") Long userId) {
		log.info("[GET] getNoteByUserSeqNo: userId={}, userSeqNo={}", userId, userSeqNo);

		NoteByUserSeqNoResponceDto note = noteService.getNoteByUserSeqNo(userId, userSeqNo);
		if (note == null) {
			log.warn("Note not found or forbidden: userId={}, userSeqNo={}", userId, userSeqNo);
			return ResponseEntity.status(404).body(ApiResponse.failWithErrors("not_found_or_forbidden", null));
		}

		log.info("Note retrieved successfully: userSeqNo={}", userSeqNo);
		return ResponseEntity.ok(ApiResponse.ok(note));
	}
	
	// --- PATCH (更新) ---

	/** ノート概要更新 */
	@PatchMapping("/{userSeqNo}/description")
	public ResponseEntity<ApiResponse<Void>> updateDescription(@PathVariable Integer userSeqNo,
			@RequestBody NoteDescriptionUpdateDto req,
			@SessionAttribute("userId") Long userId,
			RedirectAttributes rb) {
		log.info("[PATCH] updateDescription: userId={}, userSeqNo={}", userId, userSeqNo);

		int updatedCount = noteService.updateDescription(userId, userSeqNo, req.getDescription());

		if (updatedCount == 0) {
			log.warn("Note not found or forbidden: userId={}, userSeqNo={}", userId, userSeqNo);
			return ResponseEntity.status(404).body(ApiResponse.failWithErrors("not_found_or_forbidden", null));
		}

		log.info("Note description updated successfully: userSeqNo={}", userSeqNo);
		return ResponseEntity.ok(ApiResponse.ok(null, "UPDATED"));
	}

	/** 目次タイトルのリネーム */
	@PatchMapping("/toc/{tocId}/rename")
	public ResponseEntity<ApiResponse<Void>> renameToc(@PathVariable Long tocId,
			@RequestBody TocRenameRequestDto req,
			@SessionAttribute("userId") Long userId) {
		log.info("[PATCH] renameToc: userId={}, tocId={}", userId, tocId);

		// Service層でtocIdとuserIdを元に権限チェックと更新を実行
		int updatedCount = noteService.renameToc(userId, tocId, req.getTitle());

		if (updatedCount == 0) {
			log.warn("TOC not found or forbidden: userId={}, tocId={}", userId, tocId);
			return ResponseEntity.status(404).body(ApiResponse.failWithErrors("not_found_or_forbidden", null));
		}

		log.info("TOC title renamed successfully: tocId={}", tocId);
		return ResponseEntity.ok(ApiResponse.ok(null, "UPDATED"));
	}
	
	/** 目次説明文のリネーム */
	@PatchMapping("/toc/{tocId}/rebody")
	public ResponseEntity<ApiResponse<Void>> rebodyToc(@PathVariable Long tocId,
			@RequestBody TocExplanationEditRequestDto req,
			@SessionAttribute("userId") Long userId) {
		log.info("[PATCH] renameToc: userId={}, tocId={}", userId, tocId);

		// Service層でtocIdとuserIdを元に権限チェックと更新を実行
		boolean updatedCount = noteIndexService.updateBody(tocId, req.getBody());

		if (!updatedCount) {
			log.warn("TOC not found or forbidden: userId={}, tocId={}", userId, tocId);
			return ResponseEntity.status(404).body(ApiResponse.failWithErrors("not_found_or_forbidden", null));
		}

		log.info("TOC title renamed successfully: tocId={}", tocId);
		return ResponseEntity.ok(ApiResponse.ok(null, "UPDATED"));
	}

	/** ページテキストの保存 */
	@PatchMapping("/pages/{pageId}/text")
	public ResponseEntity<ApiResponse<Void>> updatePageText(@PathVariable Long pageId,
			@RequestBody PageExplanationEditRequestDto req,
			@SessionAttribute("userId") Long userId) {
		log.info("[PATCH] updatePageText: userId={}, pageId={}", userId, pageId);

		// Service層でpageIdとuserIdを元に権限チェックと更新を実行
		boolean updatedCount = notePageService.updateExtractedText( pageId, req.getExtractedText());

		if (!updatedCount) {
			log.warn("Page not found or forbidden: userId={}, pageId={}", userId, pageId);
			return ResponseEntity.status(404).body(ApiResponse.failWithErrors("not_found_or_forbidden", null));
		}

		log.info("Page text updated successfully: pageId={}", pageId);
		return ResponseEntity.ok(ApiResponse.ok(null, "UPDATED"));
	}



	@DeleteMapping("/{userSeqNo}")
	public ResponseEntity<Void> deleteNote(
			@PathVariable Integer userSeqNo,
			@SessionAttribute("userId") Long userId) {
		log.info("[DELETE] deleteNote: userId={}, userSeqNo={}", userId, userSeqNo);

		try {
			// 1) 所有者ガード付きでDB削除（CASCADEはDB側に任せる）
			var meta = noteService.deleteNote(userId, userSeqNo);
			if (meta == null) {
				log.warn("Note not found or forbidden: userId={}, userSeqNo={}", userId, userSeqNo);
				return ResponseEntity.notFound().build();
			}

			// 2) 画像などはベストエフォート非同期削除
			try {
				firebaseStorageService.deleteNoteAssetsAsync(
						userId, meta.getCategoryId(), meta.getNoteId());
			} catch (Exception cleanupEx) {
				// 非同期呼び出しで例外が出ても本文は返さずログのみ
				log.warn("Enqueue storage cleanup failed: userId={}, categoryId={}, noteId={}, err={}",
						userId, meta.getCategoryId(), meta.getNoteId(), cleanupEx.toString());
			}

			log.info("Note deleted: userId={}, userSeqNo={}, noteId={}", userId, userSeqNo, meta.getNoteId());
			return ResponseEntity.noContent().build(); // 204

		} catch (IllegalArgumentException e) {
			// サービス層からのパラメータ不正など
			log.warn("Bad request on deleteNote: {}", e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			// 想定外
			log.error("Delete note failed: userId={}, userSeqNo={}", userId, userSeqNo, e);
			return ResponseEntity.status(500).build();
		}
	}

	// --- DELETE: ログインユーザーのノート資産を全削除 ---
	@DeleteMapping("/userdelate")
	public ResponseEntity<Void> deleteAllUserNotes(
			@SessionAttribute("userId") Long userId) {
		log.info("[DELETE] deleteAllUserNotes: userId={}", userId);

		try {
			// 1) DB削除（notes を userId で削除。FK で子テーブルはCASCADE前提）
			int deleted = noteService.deleteAllNotesByUser(userId);
			log.info("DB deleted notes count={}, userId={}", deleted, userId);

			// 2) Firebase Storage のユーザー配下をベストエフォートで非同期削除
			try {
				firebaseStorageService.deleteUserAssetsAsync(userId);
			} catch (Exception cleanupEx) {
				log.warn("Enqueue storage cleanup failed: userId={}, err={}",
						userId, cleanupEx.toString());
			}

			return ResponseEntity.noContent().build(); // 204
		} catch (IllegalArgumentException e) {
			log.warn("Bad request on deleteAllUserNotes: {}", e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			log.error("deleteAllUserNotes failed: userId={}", userId, e);
			return ResponseEntity.status(500).build();
		}
	}

}