//package com.mynote.app.util;
//
//import java.text.BreakIterator;
//import java.util.Locale;
//import java.util.regex.Pattern;
//
///**
// * テキスト整形ユーティリティ（表の '|' は壊さない方針／trim しない）
// */
//public final class TextFormatUtils {
//    private TextFormatUtils() {}
//
//    // ---------- Markdown -> Plain ----------
//    private static final Pattern CODE_BLOCK   = Pattern.compile("(?s)```.*?```");                 // ```...```
//    private static final Pattern IMG_MD       = Pattern.compile("!\\[[^\\]]*\\]\\([^\\)]+\\)");   // ![alt](url)
//    private static final Pattern LINK_MD      = Pattern.compile("\\[([^\\]]+)\\]\\([^\\)]+\\)");  // [label](url)
//    private static final Pattern INLINE_CODE  = Pattern.compile("`([^`]*)`");                     // `code`
//    private static final Pattern HEADINGS     = Pattern.compile("(?m)^#{1,6}\\s*");               // #, ##, ...
//    private static final Pattern QUOTES       = Pattern.compile("(?m)^>\\s?");                    // >
//    private static final Pattern UL_BULLETS   = Pattern.compile("(?m)^\\s*[-*+]\\s+");            // -,*,+
//    private static final Pattern OL_BULLETS   = Pattern.compile("(?m)^\\s*\\d+\\.\\s+");          // 1.
//    // 強調・打消し（エスケープ済みは除外）
//    private static final Pattern BOLD_MD      = Pattern.compile("(?s)(?<!\\\\)(\\*\\*|__)(.+?)(?<!\\\\)\\1");
//    private static final Pattern STRIKE_MD    = Pattern.compile("(?s)(?<!\\\\)~~(.+?)(?<!\\\\)~~");
//    private static final Pattern ITALIC_AST   = Pattern.compile("(?s)(?<!\\\\)\\*(?!\\s)(.+?)(?<!\\s)(?<!\\\\)\\*");
//    private static final Pattern ITALIC_US    = Pattern.compile("(?s)(?<!\\\\)_(?!\\s)(.+?)(?<!\\s)(?<!\\\\)_");
//
//    // 改行は保持（\n を含めない）
//    private static final Pattern MULTI_WS     = Pattern.compile("[ \\t\\x0B\\f\\r]+");
//    private static final Pattern MANY_BLANK   = Pattern.compile("\n{3,}");
//
//    /** Markdown→プレーン（表'|'は保持／改行保持／空白畳み込み／trimしない） */
//    public static String markdownToPlain(String md) {
//        if (md == null) return null;
//        String s = md;
//        s = CODE_BLOCK.matcher(s).replaceAll(" ");
//        s = IMG_MD.matcher(s).replaceAll(" ");
//        s = LINK_MD.matcher(s).replaceAll("$1");    // [text](url) → text
//        s = INLINE_CODE.matcher(s).replaceAll("$1");
//        s = HEADINGS.matcher(s).replaceAll("");
//        s = QUOTES.matcher(s).replaceAll("");
//        s = UL_BULLETS.matcher(s).replaceAll("");
//        s = OL_BULLETS.matcher(s).replaceAll("");
//
//        // 強調・打消しのマーカーだけ剥がす（中身は残す）
//        s = BOLD_MD.matcher(s).replaceAll("$2");   // **text** / __text__ → text
//        s = STRIKE_MD.matcher(s).replaceAll("$1"); // ~~text~~ → text
//        // 斜体は最後に（太字の内側などを先に処理済みのため）
//        s = ITALIC_AST.matcher(s).replaceAll("$1"); // *text* → text
//        s = ITALIC_US.matcher(s).replaceAll("$1");  // _text_ → text
//
//        // '|' は残す（表を壊さない）
//        s = MULTI_WS.matcher(s).replaceAll(" ");
//        s = MANY_BLANK.matcher(s).replaceAll("\n\n"); // 連続空行は2行まで
//        return s; // 先頭・末尾はそのまま
//    }
//
//    // ---------- HTML -> Plain ----------
//    private static final Pattern TAGS          = Pattern.compile("(?s)<[^>]*>");
//    private static final Pattern SCRIPT_STYLE  = Pattern.compile("(?s)<(script|style)[^>]*>.*?</\\1>");
//
//    /** HTML→プレーン（trimしない） */
//    public static String htmlToPlain(String html) {
//        if (html == null) return null;
//        String s = html;
//        s = SCRIPT_STYLE.matcher(s).replaceAll(" ");
//        s = TAGS.matcher(s).replaceAll(" ");
//        s = s.replace('\u00A0', ' ');
//        s = MULTI_WS.matcher(s).replaceAll(" ");
//        return s; // trimしない
//    }
//
//    // ---------- Plain -> Markdown ----------
//    /** プレーン→Markdown（表記号 '|' はエスケープしない＝表を維持） */
//    public static String plainToMarkdown(String text) {
//        if (text == null) return null;
//        String[] lines = text.replace("\r\n", "\n").split("\n", -1);
//        StringBuilder sb = new StringBuilder();
//        for (int i = 0; i < lines.length; i++) {
//            String line = escapeMarkdown(lines[i]); // 必要最小のエスケープ
//            // 先頭の「・」「•」を Markdown の箇条書きに寄せる
//            if (line.matches("^\\s*[・•]\\s+.*")) {
//                line = "- " + line.replaceFirst("^\\s*[・•]\\s+", "");
//            }
//            sb.append(line);
//            if (i < lines.length - 1) sb.append('\n');
//        }
//        return sb.toString();
//    }
//
//    /** Markdown特殊記号のエスケープ（表の '|' は除外／trimしない） */
//    public static String escapeMarkdown(String s) {
//        if (s == null) return null;
//        s = s.replace("\\", "\\\\");
//        // 表を壊さないため '|' はエスケープから除外
//        String[] tokens = {"`","*","_","{","}","[","]","(",")","#","+","-","!","<",">"};
//        for (String t : tokens) s = s.replace(t, "\\" + t);
//        return s;
//    }
//
//    // ---------- 共通ユーティリティ（すべてtrimしない） ----------
//    public static String safeTruncateByCodePoints(String s, int maxCodePoints) {
//        if (s == null) return null;
//        if (maxCodePoints < 0) return s;
//        int len = s.codePointCount(0, s.length());
//        if (len <= maxCodePoints) return s;
//        int endIdx = s.offsetByCodePoints(0, maxCodePoints);
//        return s.substring(0, endIdx);
//    }
//
//    public static String trimToSentenceBoundary(String s, int minChars, Locale locale) {
//        if (s == null) return null;
//        if (s.length() <= minChars) return s;
//        BreakIterator bi = BreakIterator.getSentenceInstance(locale == null ? Locale.JAPANESE : locale);
//        bi.setText(s);
//        int end = bi.following(minChars);
//        return (end == BreakIterator.DONE) ? s : s.substring(0, end); // 最後のtrim削除
//    }
//
//    public static String normalizeSpaces(String s) {
//        if (s == null) return null;
//        return s.replace('\u00A0', ' ')
//                .replaceAll("[ \\t\\x0B\\f\\r]+", " ");
//        // 末尾スペースも保持
//    }
//}
