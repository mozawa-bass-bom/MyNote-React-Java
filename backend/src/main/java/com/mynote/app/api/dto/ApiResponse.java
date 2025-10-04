package com.mynote.app.api.dto;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private boolean success = true;
    private T data;
    private String message;
    private String code;                       // 機械判別用コード
    private Map<String, String> errors;        // field -> messageKey
    private Map<String, Object> meta;          // 任意メタ
    private OffsetDateTime timestamp = OffsetDateTime.now();

    /* ========= Factory (Success) ========= */

    /** 引数なしOK（Voidデータ）— ok(null) の曖昧さ回避 */
    public static ApiResponse<Void> ok() {
        return new ApiResponse<>();
    }

    /** データのみ */
    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setData(data);
        return r;
    }

    /** データ＋メッセージ */
    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setData(data);
        r.setMessage(message);
        return r;
    }

    /** データ＋メッセージ＋コード */
    public static <T> ApiResponse<T> ok(T data, String message, String code) {
        ApiResponse<T> r = ok(data, message);
        r.setCode(code);
        return r;
    }

    /** メッセージのみ（データ不要） */
    public static ApiResponse<Void> okMessage(String message) {
        ApiResponse<Void> r = new ApiResponse<>();
        r.setMessage(message);
        return r;
    }

    /** メッセージ＋コード（データ不要） */
    public static ApiResponse<Void> okMessage(String message, String code) {
        ApiResponse<Void> r = okMessage(message);
        r.setCode(code);
        return r;
    }

    /** フラグ群（data に Map を詰める） */
    public static ApiResponse<Map<String, Object>> okFlags(Map<String, Object> flags) {
        ApiResponse<Map<String, Object>> r = new ApiResponse<>();
        r.setData(flags);
        return r;
    }

    /** 単一フラグ */
    public static ApiResponse<Map<String, Object>> okFlag(String key, boolean value) {
        Map<String, Object> flags = new HashMap<>();
        flags.put(key, value);
        return okFlags(flags);
    }

    /* ========= Factory (Failure) ========= */

    /** 失敗（メッセージのみ） */
    public static <T> ApiResponse<T> fail(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(false);
        r.setMessage(message);
        return r;
    }

    /** 失敗（メッセージ＋コード）— ★名前で分離 */
    public static <T> ApiResponse<T> failWithCode(String message, String code) {
        ApiResponse<T> r = fail(message);
        r.setCode(code);
        return r;
    }

    /** 失敗（メッセージ＋エラー詳細）— ★名前で分離 */
    public static <T> ApiResponse<T> failWithErrors(String message, Map<String, String> errors) {
        ApiResponse<T> r = fail(message);
        r.setErrors(errors);
        return r;
    }



    /* ========= Fluent helpers ========= */

    public ApiResponse<T> withMessage(String msg) {
        this.message = msg; return this;
    }

    public ApiResponse<T> withCode(String code) {
        this.code = code; return this;
    }

    public ApiResponse<T> withData(T data) {
        this.data = data; return this;
    }

    public ApiResponse<T> withMeta(String key, Object value) {
        if (this.meta == null) this.meta = new HashMap<>();
        this.meta.put(key, value);
        return this;
    }

    /** エラーを1件追加（fail系で使う） */
    public ApiResponse<T> addError(String field, String messageKey) {
        if (this.errors == null) this.errors = new HashMap<>();
        this.errors.put(field, messageKey);
        return this;
    }

    /** success を明示的に切り替え（レアケース用） */
    public ApiResponse<T> withSuccess(boolean success) {
        this.success = success; return this;
    }
}
