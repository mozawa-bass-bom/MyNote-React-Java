package com.mynote.app.api.service.upload;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.mynote.app.api.dto.ai.AiIngestRequestDto;
import com.mynote.app.api.dto.ai.AiPageDetailDto;
import com.mynote.app.api.dto.ai.AiSectionDto;
import com.mynote.app.api.dto.note.NoteIndexRequestDto;
import com.mynote.app.api.dto.note.NotePageRequestDto;
import com.mynote.app.api.dto.note.NoteRequestDto;
import com.mynote.app.api.service.note.NoteIndexService;
import com.mynote.app.api.service.note.NotePageService;
import com.mynote.app.api.service.note.NoteService;
import com.mynote.app.api.service.upload.ProcessStatusEvent.Code;
import com.mynote.app.api.service.upload.ProcessStatusEvent.Mode;
import com.mynote.app.domain.entity.Note;
import com.mynote.app.domain.entity.NoteIndex;
import com.mynote.app.domain.entity.NotePage;
import com.mynote.app.domain.mapper.NoteIndexMapper; // 既存依存は現状維持
import com.mynote.app.domain.mapper.NoteMapper; // 既存依存は現状維持
import com.mynote.app.domain.mapper.NotePageMapper; // 既存依存は現状維持

import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadFacadeService {

	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

	// Mapper直参照は現状維持（Service未整備箇所あり）
	private final NoteMapper noteMapper;
	private final NotePageMapper notePageMapper;
	private final NoteIndexMapper noteIndexMapper;

	private final NoteService noteService;
	private final NotePageService notePageService;
	private final NoteIndexService noteIndexService;

	private final VisionOcrService visionOcrService;
	private final VertexGeminiService vertexGeminiService;
	private final PdfPageIngestService pdfPageIngestService;

	// =========================
	// SSE Emitter 管理
	// =========================
	public SseEmitter addEmitter(Long userId) {
		SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);
		emitters.put(userId, emitter);
		try {
			emitter.send(SseEmitter.event().name("connect").data("Connection established"));
		} catch (IOException e) {
			emitters.remove(userId);
		}
		emitter.onCompletion(() -> emitters.remove(userId));
		emitter.onTimeout(() -> {
			emitter.complete();
			emitters.remove(userId);
		});
		return emitter;
	}

	private void notifyClient(Long userId, ProcessStatusEvent event) {
		SseEmitter emitter = emitters.get(userId);
		if (emitter == null)
			return;
		try {
			emitter.send(SseEmitter.event()
					.name(event.code().name()) // ← enum名で送る
					.data(event, MediaType.APPLICATION_JSON));
			if (event.finished() || event.code() == Code.ERROR) { //終端判定
				emitter.complete();
				emitters.remove(userId);
			}
		} catch (IOException e) {
			emitter.completeWithError(e);
			emitters.remove(userId);
		}
	}

	// =========================
	// 非同期処理（Mode対応）
	// =========================
	@Async
	public void processPdfAsync(
			Long userId,
			Long categoryId,
			String title,
			MultipartFile file,
			String tocPrompt,
			String pagePrompt,
			Mode mode) {

		Long noteId = null;

		try {

			// 1) noteID発行（DB登録は後回し）
			String originalFilename = file.getOriginalFilename();
			noteId = saveInitialNote(userId, categoryId, title, originalFilename);
			/**
			 * 2) PDF → 画像 → GCS
			 *    （画像をFirebaseに保存しURL/gsUriを発行。埋め込みテキストも各ページに格納。DB未保存）
			 *
			 * Result {
			 *   Long noteId; // null（DB保存前）
			 *   List<PageData> pages;
			 * }
			 *
			 * PageData {
			 *   int pageNumber;      // 何ページ目か
			 *   String publicUrl;    // 公開用の画像URL
			 *   String gsUri;        // Firebase管理用の gs:// パス
			 *   String embeddedText; // 埋め込みテキスト（SIMPLE＝必要、FULL＝ null）
			 * }
			 */
			boolean includeEmbedded = (mode == Mode.SIMPLE);
			List<PageData> pages = pdfPageIngestService.ingest(file, 300,userId, categoryId, noteId, includeEmbedded);
			Result result = new Result(null, pages);

			saveNotePages(noteId, pages);

			// 3) 進捗: アップロード完了
			notifyClient(userId, ProcessStatusEvent.uploadDone(noteId, mode));

			// 4) モード分岐：テキスト抽出元をここで決定
			if (includeEmbedded) {
				String text = joinEmbeddedText(result.getPages());

				if (text == null || text.isBlank()) {
					// フォールバック：in-memory の gsUri で直接OCR
					String ocrText = runOcrFromPages(result.getPages());
					notifyClient(userId, ProcessStatusEvent.ocrDone(noteId, mode));
					runAiFromOcr(noteId, ocrText, tocPrompt, pagePrompt);
				} else {
					notifyClient(userId, ProcessStatusEvent.ocrSkipped(noteId, mode));
					runAiFromOcr(noteId, text, tocPrompt, pagePrompt);
				}

				notifyClient(userId, ProcessStatusEvent.aiDone(noteId, mode));
				notifyClient(userId, ProcessStatusEvent.complete(noteId, mode));
				return;
			}

			// Mode.FULL：必ずOCR（これも in-memory から）
			String ocrText = runOcrFromPages(result.getPages());
			notifyClient(userId, ProcessStatusEvent.ocrDone(noteId, mode));
			runAiFromOcr(noteId, ocrText, tocPrompt, pagePrompt);
			notifyClient(userId, ProcessStatusEvent.aiDone(noteId, mode));
			notifyClient(userId, ProcessStatusEvent.complete(noteId, mode));

		} catch (Exception e) {
			log.error("Async PDF processing failed for userId={} : {}", userId, e.getMessage(), e);
			String msg = "処理中にエラーが発生しました: " + e.getMessage();
			notifyClient(userId, ProcessStatusEvent.error(noteId, msg, mode)); // ← errorシグネチャ統一
		}
	}

	// =========================
	// 1.5) 初期DB登録
	// =========================
	@Transactional
	public Long saveInitialNote(Long userId, Long categoryId, String title, String originalFilename) {
		NoteRequestDto noteRequestDto = new NoteRequestDto();
		noteRequestDto.setCategoryId(categoryId);
		noteRequestDto.setTitle(title);
		noteRequestDto.setDescription("AI解析待ち");
		noteRequestDto.setOriginalFilename(originalFilename);
		Long noteId = noteService.createNote(userId, noteRequestDto);
		if (noteId == null)
			throw new RuntimeException("Note creation failed during initial saving.");

		return noteId;
	}

	@Transactional
	public void saveNotePages(Long noteId, List<PageData> pages) {

		for (PageData pd : pages) {
			NotePageRequestDto pageRequestDto = new NotePageRequestDto();
			pageRequestDto.setNoteId(noteId);
			pageRequestDto.setPageNumber(pd.getPageNumber());
			pageRequestDto.setFirebasePublicUrl(pd.getPublicUrl());
			pageRequestDto.setFirebaseAdminPath(pd.getGsUri());
			pageRequestDto.setExtractedText(pd.getEmbeddedText());
			boolean success = notePageService.createNotePage(pageRequestDto);
			if (!success)
				throw new RuntimeException("NotePage creation failed for page " + pd.getPageNumber() + ".");
		}
	}

	// =========================
	// OCR実行（in-memoryのgsUri群から）
	// =========================
	@Transactional(readOnly = true)
	private String runOcrFromPages(List<PageData> pages) {
		if (pages == null || pages.isEmpty())
			return "";
		List<String> gsUris = pages.stream()
				.sorted(java.util.Comparator.comparingInt(PageData::getPageNumber))
				.map(PageData::getGsUri)
				.filter(s -> s != null && !s.isBlank())
				.toList();
		if (gsUris.isEmpty())
			return "";
		long t0 = System.currentTimeMillis();
		String ocr = visionOcrService.ocrTextFromGsUris(gsUris); // 出力は "--- Page N ---" 形式
		log.info("[AI] OCR done in-memory pages={} ocrLen={} ({}ms)",
				gsUris.size(), (ocr == null ? 0 : ocr.length()), System.currentTimeMillis() - t0);
		return (ocr == null) ? "" : ocr.trim();
	}

	// =========================
	// 3) AI実行→DB反映
	// =========================
	@Transactional
	public AiIngestRequestDto runAiFromOcr(Long noteId, String ocrText, String tocPrompt, String pagePrompt) {
		if (noteId == null)
			throw new IllegalArgumentException("noteId is required");
		if (ocrText == null || ocrText.isBlank())
			throw new IllegalArgumentException("ocrText is empty");

		long t0 = System.currentTimeMillis();
		log.info("[AI] Gemini start noteId={}", noteId);
		AiIngestRequestDto dto = vertexGeminiService.generateIngestPayload(
				noteId, ocrText, tocPrompt, pagePrompt, null /* modelId inside service */);
		applyAiResult(dto);
		log.info("[AI] Apply done noteId={} ({}ms)", noteId, (System.currentTimeMillis() - t0));
		return dto;
	}

	// =========================
	// 4) AI結果のDB反映
	// =========================

	@Transactional
	public void applyAiResult(AiIngestRequestDto req) {
		if (req == null || req.getNoteId() == null)
			throw new IllegalArgumentException("noteId is required.");
		final Long noteId = req.getNoteId();

		Note note = noteMapper.findById(noteId);
		if (note == null)
			throw new IllegalArgumentException("Note not found: id=" + noteId);

		// 1) 文書要約 → notes.description
		if (req.getDocumentSummary() != null && !req.getDocumentSummary().isEmpty()) {
			String summaryHtml = req.getDocumentSummary().stream()
					.map(ds -> trimToNull(ds == null ? null : ds.getOverallSummaryHtml()))
					.filter(s -> s != null && !s.isBlank())
					.collect(Collectors.joining("<hr/>"));
			if (!summaryHtml.isBlank()) {
				noteMapper.updateDescription(noteId, summaryHtml);
			}
		}

		// 2) 目次 → 差し替え
		if (req.getSections() != null) {
			var existing = noteIndexMapper.findByNoteId(noteId);
			for (NoteIndex idx : existing)
				noteIndexMapper.delete(idx.getId());

			int idxNo = 1;
			for (AiSectionDto s : req.getSections()) {
				if (s == null)
					continue;

				String title = nullToEmpty(s.getTitle());
				if (title.codePointCount(0, title.length()) > 12) {
					title = title.substring(0, title.offsetByCodePoints(0, 12));
				}

				NoteIndexRequestDto indexDto = new NoteIndexRequestDto();
				indexDto.setNoteId(noteId);
				indexDto.setIndexNumber(idxNo++);
				indexDto.setStartIndex(s.getStartPage());
				indexDto.setEndIndex(s.getEndPage());
				indexDto.setTitle(title);
				indexDto.setBody(nullToEmpty(s.getContentSummaryHtml()));
				noteIndexService.createNoteIndex(indexDto);
			}
		}

		// 3) ページ本文 → note_pages.extracted_text
		if (req.getPageDetails() != null && !req.getPageDetails().isEmpty()) {
			List<NotePage> pages = notePageMapper.findByNoteId(noteId);
			Map<Integer, Long> pageNoToId = pages.stream()
					.sorted(Comparator.comparing(NotePage::getPageNumber))
					.collect(Collectors.toMap(
							NotePage::getPageNumber,
							NotePage::getId,
							(a, b) -> a,
							TreeMap::new));

			for (AiPageDetailDto pd : req.getPageDetails()) {
				if (pd == null)
					continue;
				Integer pageNo = pd.getPageNumber();
				if (pageNo == null)
					continue;

				Long pageId = pageNoToId.get(pageNo);
				if (pageId == null) {
					log.warn("skip pageDetail: no page row for noteId={}, pageNo={}", noteId, pageNo);
					continue;
				}

				// 優先順位：Markdown → HTML → legacy
				String text = trimToNull(pd.getDetailedExplanationMarkdown());

				if (text == null)
					continue;

				notePageService.updateExtractedText(pageId, text);
			}
		}

		// 4) メタはログのみ
		if (req.getModel() != null || req.getPromptToc() != null || req.getPromptPage() != null) {
			log.info("AI meta: model={}, tocPrompt.len={}, pagePrompt.len={}",
					req.getModel(), len(req.getPromptToc()), len(req.getPromptPage()));
		}
		if (req.getRawJson() != null)
			log.debug("AI rawJson size: {}", req.getRawJson().length());
		log.info("applyAiResult finished. noteId={}", noteId);
	}

	// ===== utils =====

	private static String joinEmbeddedText(List<PageData> pages) {
		if (pages == null || pages.isEmpty())
			return "";

		return pages.stream()
				.sorted(java.util.Comparator.comparingInt(PageData::getPageNumber))
				.map(p -> {
					String text = (p.getEmbeddedText() == null || p.getEmbeddedText().isBlank())
							? "(no text)"
							: p.getEmbeddedText().trim();
					return "--- Page " + p.getPageNumber() + " ---\n" + text;
				})
				.collect(java.util.stream.Collectors.joining("\n\n"));
	}

	private static int len(String s) {
		return s == null ? 0 : s.length();
	}

	private static String nullToEmpty(String s) {
		return s == null ? "" : s;
	}

	private static String trimToNull(String s) {
		if (s == null)
			return null;
		String t = s.trim();
		return t.isEmpty() ? null : t;
	}

	@Value
	public static class PageData {
		int pageNumber;
		String publicUrl;
		String gsUri;
		String embeddedText;
	}

	@Value
	public static class Result {
		Long noteId;
		List<PageData> pages;
	}
}
