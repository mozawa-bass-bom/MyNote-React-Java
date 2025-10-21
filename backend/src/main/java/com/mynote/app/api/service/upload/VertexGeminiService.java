package com.mynote.app.api.service.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.GenerationConfig;          // ★ こちらを使う
import com.google.cloud.vertexai.api.Part;
import com.google.cloud.vertexai.api.Schema;
import com.google.cloud.vertexai.api.Type;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.mynote.app.api.dto.ai.AiIngestRequestDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class VertexGeminiService {

  private final VertexAI vertexAI;

  @Value("${gemini.model-id:gemini-2.5-flash}")
  private String defaultModelId;

  public AiIngestRequestDto generateIngestPayload(
      Long noteId,
      String ocrText,
      String tocPrompt,
      String pagePrompt,
      String modelId
  ) {
    final String modelName = (modelId == null || modelId.isBlank()) ? defaultModelId : modelId;

  
    String sysText = String.join("\n",
    	    "あなたはドキュメントの要約と目次・ページ別の要点抽出を行うアシスタントです。",
    	    "",
    	    "【厳守事項】",
    	    "- 出力は必ず純粋なJSONのみ（説明文やコードフェンスは禁止）。",
    	    "- すべての本文は Markdown とする（#見出し, 箇条書き, 強調 などを使用可）。",
    	    "- セクションタイトル（sections[].title）は12文字以内。句読点のみのタイトルは禁止。",
    	    "- ページ解説は用語解説中心で簡潔に。不要なら空文字可。前置き定型は禁止。内容が変わる場合は改行を入れる。",
    	    "",
    	    "【生成手順】",
    	    "1) 全ページOCR（`--- Page N ---`区切り）を読み、論理トピックで sections を作る。",
    	    "2) sections[].startPage/endPage は実在範囲、昇順、重複/過不足なし。",
    	    "3) pageDetails は存在ページ分を pageNumber 昇順で作る。",
    	    "",
    	    "【制約】",
    	    "- sections[].startPage<=endPage、存在範囲内。",
    	    "- pageDetails[].pageNumber は存在範囲内、昇順。",
    	    "- 冗長・推測は避け、事実ベースで簡潔に。",
    	    "",
    	    "【Markdown改行・レイアウト規約（厳守）】",
    	    "- 1行=1文（いわゆるセマンティック改行）。句点「。」「！」「？」の直後で改行する。",
    	    "- 段落（文のまとまり）の間には「空行1つ」を入れる（空行2連続は禁止）。",
    	    "- 見出しの前後には必ず空行1つ（例: 見出しの直後に本文が来るときも空行）。",
    	    "- 箇条書きは `- ` を使う（`*` や `・` は禁止）。各項目は1行=1文。小見出し→箇条書きの順。",
    	    "- 強調は **太字** のみ。下線/斜体/絵文字/HTMLタグ/`<br>` は禁止。",
    	    "- 表は使わない（改行と箇条書きで構造化）。",
    	    "- 改行を入れない長文（1行120文字超）は作らない。句点まで待てない場合は読点「、」で分割して改行してよい。"
    	);

    Content systemInstruction = Content.newBuilder()
        .setRole("system")
        .addParts(Part.newBuilder().setText(sysText))
        .build();

    // --- User prompt（Markdown一本化）
    String userText =
        "追加指示（目次方針）:\n" + nvl(tocPrompt) +
        "\n\n追加指示（ページ注釈方針）:\n" + nvl(pagePrompt) +
        "\n\n【注記】上記方針は必ず反映。本文はすべて Markdown。" +
        "\n\n=== OCR抽出テキスト（全ページ、`--- Page N ---`区切り） ===\n" + nvl(ocrText);

    Content userContent = Content.newBuilder()
        .setRole("user")
        .addParts(Part.newBuilder().setText(userText))
        .build();

    // --- JSON Schema（*Html → *Md に変更）
    Schema pageDetailSchema = Schema.newBuilder()
        .setType(Type.OBJECT)
        .putProperties("pageNumber", Schema.newBuilder().setType(Type.INTEGER).build())
        .putProperties("detailedExplanationMd", Schema.newBuilder().setType(Type.STRING).build()) // ★
        .addRequired("pageNumber").addRequired("detailedExplanationMd")
        .build();

    Schema sectionSchema = Schema.newBuilder()
        .setType(Type.OBJECT)
        .putProperties("title", Schema.newBuilder().setType(Type.STRING).build())
        .putProperties("startPage", Schema.newBuilder().setType(Type.INTEGER).build())
        .putProperties("endPage", Schema.newBuilder().setType(Type.INTEGER).build())
        .putProperties("contentSummaryMd", Schema.newBuilder().setType(Type.STRING).build()) // ★
        .addRequired("title").addRequired("startPage").addRequired("endPage")
        .build();

    Schema documentSummaryItemSchema = Schema.newBuilder()
        .setType(Type.OBJECT)
        .putProperties("overallSummaryMd", Schema.newBuilder().setType(Type.STRING).build()) // ★
        .addRequired("overallSummaryMd")
        .build();

    Schema responseSchema = Schema.newBuilder()
        .setType(Type.OBJECT)
        .putProperties("documentSummary", Schema.newBuilder().setType(Type.ARRAY).setItems(documentSummaryItemSchema).build())
        .putProperties("sections", Schema.newBuilder().setType(Type.ARRAY).setItems(sectionSchema).build())
        .putProperties("pageDetails", Schema.newBuilder().setType(Type.ARRAY).setItems(pageDetailSchema).build())
        .putProperties("model", Schema.newBuilder().setType(Type.STRING).build())
        .putProperties("promptToc", Schema.newBuilder().setType(Type.STRING).build())
        .putProperties("promptPage", Schema.newBuilder().setType(Type.STRING).build())
        .putProperties("rawJson", Schema.newBuilder().setType(Type.STRING).build())
        .addRequired("documentSummary").addRequired("sections").addRequired("pageDetails")
        .build();

    GenerationConfig genConfig = GenerationConfig.newBuilder()
        .setResponseMimeType("application/json")
        .setResponseSchema(responseSchema)
        .build();

    try {
      GenerativeModel model = new GenerativeModel(modelName, vertexAI)
          .withSystemInstruction(systemInstruction)
          .withGenerationConfig(genConfig);

      GenerateContentResponse resp = model.generateContent(userContent);

      String raw = "";
      if (resp.getCandidatesCount() > 0) {
        var cand = resp.getCandidates(0);
        if (cand.hasContent() && cand.getContent().getPartsCount() > 0) {
          raw = cand.getContent().getParts(0).getText();
        }
      }

      System.out.println("Generated AiIngestRequestDto: " + raw);
      ObjectMapper om = new ObjectMapper()
          .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

      AiIngestRequestDto dto = om.readValue(raw, AiIngestRequestDto.class);
      dto.setNoteId(noteId);
      dto.setModel(modelName);
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
