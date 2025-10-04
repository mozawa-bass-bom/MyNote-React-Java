package com.mynote.app.util;

import java.text.BreakIterator;
import java.util.Locale;
import java.util.regex.Pattern;

public final class TextFormatUtils {
    private TextFormatUtils() {}

    // ---------- Markdown -> Plain ----------
    private static final Pattern CODE_BLOCK = Pattern.compile("(?s)```.*?```");
    private static final Pattern IMG_MD      = Pattern.compile("!\\[[^\\]]*\\]\\([^\\)]+\\)");
    private static final Pattern LINK_MD     = Pattern.compile("\\[([^\\]]+)\\]\\([^\\)]+\\)");
    private static final Pattern INLINE_CODE = Pattern.compile("`([^`]*)`");
    private static final Pattern HEADINGS    = Pattern.compile("(?m)^#{1,6}\\s*");
    private static final Pattern QUOTES      = Pattern.compile("(?m)^>\\s?");
    private static final Pattern UL_BULLETS  = Pattern.compile("(?m)^\\s*[-*+]\\s+");
    private static final Pattern OL_BULLETS  = Pattern.compile("(?m)^\\s*\\d+\\.\\s+");
    private static final Pattern MULTI_WS    = Pattern.compile("[ \\t\\x0B\\f\\r]+");

    /** Markdownをざっくりプレーンテキスト化（軽量・依存なし） */
    public static String markdownToPlain(String md) {
        if (md == null) return null;
        String s = md;
        s = CODE_BLOCK.matcher(s).replaceAll(" ");
        s = IMG_MD.matcher(s).replaceAll(" ");
        s = LINK_MD.matcher(s).replaceAll("$1");
        s = INLINE_CODE.matcher(s).replaceAll("$1");
        s = HEADINGS.matcher(s).replaceAll("");
        s = QUOTES.matcher(s).replaceAll("");
        s = UL_BULLETS.matcher(s).replaceAll("");
        s = OL_BULLETS.matcher(s).replaceAll("");
        s = s.replace('|', ' ');
        s = MULTI_WS.matcher(s).replaceAll(" ").trim();
        return s.isEmpty() ? null : s;
    }

    // ---------- HTML -> Plain ----------
    private static final Pattern TAGS            = Pattern.compile("(?s)<[^>]*>");
    private static final Pattern SCRIPT_STYLE    = Pattern.compile("(?s)<(script|style)[^>]*>.*?</\\1>");

    /** HTMLをざっくりプレーンテキスト化（軽量・依存なし） */
    public static String htmlToPlain(String html) {
        if (html == null) return null;
        String s = html;
        s = SCRIPT_STYLE.matcher(s).replaceAll(" ");
        s = TAGS.matcher(s).replaceAll(" ");
        s = s.replace('\u00A0', ' ');
        s = MULTI_WS.matcher(s).replaceAll(" ").trim();
        return s.isEmpty() ? null : s;
    }

    // ※ jsoup を使う高品質版に差し替えたい場合（依存追加後）：
    // public static String htmlToPlain(String html) {
    //     if (html == null) return null;
    //     return Jsoup.parse(html).text().trim();
    // }

    // ---------- Plain -> Markdown ----------
    /** プレーンを安全にMarkdownへ（特殊記号をエスケープ、改行保持） */
    public static String plainToMarkdown(String text) {
        if (text == null) return null;
        if (text.isBlank()) return "";
        String[] lines = text.replace("\r\n", "\n").split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String line = escapeMarkdown(lines[i]);
            // 先頭の箇条書き風（・/•/-）はMarkdown箇条書きに寄せる簡易処理
            if (line.matches("^\\s*[・•]\\s+.*")) {
                line = "- " + line.replaceFirst("^\\s*[・•]\\s+", "");
            }
            sb.append(line);
            if (i < lines.length - 1) sb.append('\n');
        }
        return sb.toString();
    }

    /** Markdown特殊記号のエスケープ */
    public static String escapeMarkdown(String s) {
        if (s == null) return null;
        // バックスラッシュは最初に
        s = s.replace("\\", "\\\\");
        // 単体記号のエスケープ
        String[] tokens = {"`","*","_","{","}","[","]","(",")","#","+","-","!","|",">"};
        for (String t : tokens) s = s.replace(t, "\\" + t);
        return s;
    }

    // ---------- 共通ユーティリティ ----------
    /** コードポイントで安全にトリム（多バイト・絵文字に強い） */
    public static String safeTruncateByCodePoints(String s, int maxCodePoints) {
        if (s == null) return null;
        if (maxCodePoints < 0) return s;
        int len = s.codePointCount(0, s.length());
        if (len <= maxCodePoints) return s;
        int endIdx = s.offsetByCodePoints(0, maxCodePoints);
        return s.substring(0, endIdx);
    }

    /** 文末で丸めたい時に（例: 120字で切って文の区切りへ） */
    public static String trimToSentenceBoundary(String s, int minChars, Locale locale) {
        if (s == null) return null;
        if (s.length() <= minChars) return s;
        BreakIterator bi = BreakIterator.getSentenceInstance(locale == null ? Locale.JAPANESE : locale);
        bi.setText(s);
        int end = bi.following(minChars);
        return (end == BreakIterator.DONE) ? s : s.substring(0, end).trim();
    }

    /** 空白・制御の正規化 */
    public static String normalizeSpaces(String s) {
        if (s == null) return null;
        return s.replace('\u00A0', ' ')
                .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .trim();
    }
}
