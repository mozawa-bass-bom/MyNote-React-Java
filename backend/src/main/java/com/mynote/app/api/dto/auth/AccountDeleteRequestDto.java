package com.mynote.app.api.dto.auth;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/** 退会時の確認用入力（任意だが二重送信防止や監査のためにメモを受け取る想定） */
@Data
public class AccountDeleteRequestDto implements Serializable {
    @NotBlank
    private String confirm; // "DELETE" のような固定文字列を要求する運用でもOK
    private String reason;
}
