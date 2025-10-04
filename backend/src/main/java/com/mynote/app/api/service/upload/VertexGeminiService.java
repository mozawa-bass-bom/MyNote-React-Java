package com.mynote.app.api.service.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.Part;
import com.mynote.app.api.dto.ai.AiIngestRequestDto;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class VertexGeminiService {

  @Value("${gemini.project-id}")  private String projectId;
  @Value("${gemini.location}")    private String location;
  @Value("${gemini.model-id:gemini-2.5-flash}")
  private String defaultModelId;

  private Client newClient() {
    return Client.builder()
        .project(projectId)
        .location(location)
        .vertexAI(true)                                // Vertex AI 経由
        .httpOptions(HttpOptions.builder().apiVersion("v1").build())
        .build();
  }

  /**
   * OCRテキストに対し、追加指示を反映して JSON を生成 → DTO にパース。
   */
  public AiIngestRequestDto generateIngestPayload(
      Long noteId,
      String ocrText,
      String tocPrompt,
      String pagePrompt,
      String modelId
  ) {
    final String model = (modelId == null || modelId.isBlank()) ? defaultModelId : modelId;

    // ---- System instruction（役割・制約）
    // --- スタイル規約（System Instruction）---
    String systemInstructionText = String.join("\n",
    		  "あなたはドキュメントの要約と目次・ページ別の要点抽出を行うアシスタントです。",
    		  "【厳守事項】",
    		  "- 出力は必ず純粋なJSONのみ（説明文やコードフェンスは禁止）。",
    		  "- HTMLは安全な最小タグのみ: h2,h3,p,ul,ol,li,strong,em,hr。",
    		  "- セクションタイトル（sections[].title）は全角/半角を問わず12文字以内。超える場合は短くリライト。句読点だけのタイトルは禁止。",
    		  "- ページ解説は用語の解説を中心に、複雑な内容は簡潔に噛み砕く。不要なら無理に文章を作らず空文字を許容。"
    		  + "「このページの解説です」等の定型前置きは禁止。直ちに内容から始める。",
    		  "",
    		  "【生成手順（必須）】",
    		  "1) まず全ページのOCRテキスト（`--- Page N ---` 見出しで区切り）を読み、論理的なトピック単位で目次（sections）を作る。",
    		  "2) 各セクションの startPage / endPage を、そのトピックがまたぐ実在ページ範囲に正確に設定する（昇順・過不足なし・重複なし）。",
    		  "3) 次に pageDetails を、各ページごとに作成する（pageNumber 昇順、存在ページのみ）。",
    		  "",
    		  "【Markdown/HTMLの同一性】",
    		  "- pageDetails[].detailedExplanationMarkdown と detailedExplanationHtml は内容が**完全に一致**すること（表現形式が異なるだけ）。",
    		  "- まずMarkdownで構成したうえで、同内容のHTMLを生成せよ（文言差・省略・追加を禁止）。",
    		  "",
    		  "【制約】",
    		  "- sections[].startPage/endPage は存在範囲内、start<=end。",
    		  "- pageDetails[].pageNumber は存在範囲内、昇順。",
    		  "- 冗長な言い換えや推測は避け、事実ベースで簡潔に。"
    		);


    Content systemInstruction = Content.builder()
        .role("system")
        .parts(Part.fromText(systemInstructionText))
        .build(); // systemInstruction(Content) に渡す

    String userPrompt =
    	    "追加指示（目次方針）:\n" + nvl(tocPrompt) +
    	    "\n\n追加指示（ページ注釈方針）:\n" + nvl(pagePrompt) +
    	    "\n\n【注記】上記の方針は必ず反映してください。Markdown と HTML は**同一内容**にしてください。" +
    	    // ★ ページ区切り表記の整合性に関する注意
    	    "\n\n=== OCR抽出テキスト（全ページ、`--- Page N ---`で区切り） ===\n" + nvl(ocrText);

    Content userContent = Content.fromParts(Part.fromText(userPrompt));

    // ---- JSON Schema（Mapで定義し responseJsonSchema に渡す）
    
    // ImmutableMap.of の制限（最大5ペア）を超えるため、builderを使用する
    var propertiesBuilder = ImmutableMap.<String, Object>builder();
    
    propertiesBuilder.put("documentSummary", ImmutableMap.of(
      "type", "array",
      "items", ImmutableMap.of(
        "type", "object",
        "properties", ImmutableMap.of(
          "overallSummaryHtml", ImmutableMap.of("type", "string")
        ),
        "required", ImmutableList.of("overallSummaryHtml")
      )
    ));
    
    propertiesBuilder.put("sections", ImmutableMap.of(
      "type", "array",
      "minItems", 1, 
      "maxItems", 500,
      "items", ImmutableMap.of(
        "type", "object",
        "additionalProperties", false,
        "properties", ImmutableMap.of(
          "title", ImmutableMap.of("type", "string", "maxLength", 12),
          "startPage", ImmutableMap.of("type", "integer", "minimum", 1), 
          "endPage", ImmutableMap.of("type", "integer", "minimum", 1),   
          "contentSummaryHtml", ImmutableMap.of("type", "string", "maxLength", 4000)
        ),
        "required", ImmutableList.of("title","startPage","endPage")
      )
    ));
    
    propertiesBuilder.put("pageDetails", ImmutableMap.of(
      "type", "array",
      "minItems", 1, 
      "maxItems", 500,
      "items", ImmutableMap.of(
        "type", "object",
        "additionalProperties", false,
        "properties", ImmutableMap.of(
          "pageNumber", ImmutableMap.of("type", "integer", "minimum", 1), 
          // ★ 空文字許容のためminLength: 0を追加
          "detailedExplanationHtml", ImmutableMap.of("type", "string", "maxLength", 16000, "minLength", 0), 
          "detailedExplanationMarkdown", ImmutableMap.of("type", "string", "maxLength", 16000, "minLength", 0) // ★ 空文字許容のためminLength: 0を追加
        ),
        "required", ImmutableList.of("pageNumber","detailedExplanationHtml", "detailedExplanationMarkdown") 
      )
    ));
    
    // メタデータフィールドを追加（合計7キーのためBuilder必須）
    propertiesBuilder.put("model",      ImmutableMap.of("type", "string"));
    propertiesBuilder.put("promptToc",  ImmutableMap.of("type", "string"));
    propertiesBuilder.put("promptPage", ImmutableMap.of("type", "string"));
    propertiesBuilder.put("rawJson",    ImmutableMap.of("type", "string"));

    var propertiesMap = propertiesBuilder.build();
    
    // トップレベルのスキーマ定義（キーが複数あるためBuilder使用）
    var responseSchema = ImmutableMap.<String, Object>builder()
        .put("type", "object")
        .put("additionalProperties", false) // ★ トップレベルに additionalProperties: false を追加
        .put("properties", propertiesMap)
        .put("required", ImmutableList.of("documentSummary","sections","pageDetails"))
        .build();

    GenerateContentConfig config = GenerateContentConfig.builder()
        .systemInstruction(systemInstruction) // Content を渡す
        .responseMimeType("application/json")
        .responseJsonSchema(responseSchema)   // Map をそのまま渡せる
        .build();


    try (Client client = newClient()) {
      GenerateContentResponse resp =
          client.models.generateContent(model, userContent, config);
      String raw = resp.text();

      ObjectMapper om = new ObjectMapper()
          .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
      AiIngestRequestDto dto = om.readValue(raw, AiIngestRequestDto.class);
      dto.setNoteId(noteId);
      dto.setModel(model);
      dto.setPromptToc(tocPrompt);
      dto.setPromptPage(pagePrompt);
      dto.setRawJson(raw);
      return dto;
    } catch (Exception e) {
      log.error("Gemini call/parse failed", e);
      throw new RuntimeException("Gemini failed: " + e.getMessage(), e);
    }
  }

  private static String nvl(String s){ return s == null ? "" : s; }


}
