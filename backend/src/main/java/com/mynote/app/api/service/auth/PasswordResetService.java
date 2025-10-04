// src/main/java/com/mynote/app/api/service/auth/PasswordResetService.java
package com.mynote.app.api.service.auth;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.domain.entity.PasswordResetToken;
import com.mynote.app.domain.entity.UserPassword;
import com.mynote.app.domain.mapper.PasswordResetTokenMapper;
import com.mynote.app.domain.mapper.UserMapper;
import com.mynote.app.domain.mapper.UserPasswordMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserMapper userMapper;
    private final UserPasswordMapper userPasswordMapper;
    private final PasswordResetTokenMapper tokenMapper;
    private final MailService mailService; // メール送信用（実装は任意）

    private static final SecureRandom RNG = new SecureRandom();

    @Transactional
    public void requestReset(String email, String requestIp, String ua, String appBaseUrl) {
        var user = userMapper.findByEmail(email);
        // ユーザーがいない場合でも処理時間を合わせて "OK" を返す
        if (user == null) {
            sleepRandom(); // タイミング攻撃対策のダミー遅延（任意）
            return;
        }

        // 既存アクティブトークンを無効化（任意）
        tokenMapper.invalidateActiveByUser(user.getId(), LocalDateTime.now());

        // トークン生成（生）とハッシュ保存
        String rawToken = generateToken();
        String hash = sha256Hex(rawToken);

        var now = LocalDateTime.now();
        var t = new PasswordResetToken();
        t.setUserId(user.getId());
        t.setTokenHash(hash);
        t.setIssuedAt(now);
        t.setExpiresAt(now.plusMinutes(30));
        t.setRequestIp(requestIp);
        t.setUserAgent(ua);
        tokenMapper.insert(t);

        // メール送信（生トークンをURLに付ける）
        String resetUrl = appBaseUrl + "/reset-password?token=" + rawToken;
        mailService.sendPasswordResetMail(user.getEmail(), user.getUserName(), resetUrl);
    }

    @Transactional(readOnly = true)
    public boolean verifyToken(String rawToken) {
        var token = tokenMapper.findActiveByHash(sha256Hex(rawToken), LocalDateTime.now());
        return token != null;
    }

    @Transactional
    public boolean completeReset(String rawToken, String newPassword) {
        var token = tokenMapper.findActiveByHash(sha256Hex(rawToken), LocalDateTime.now());
        if (token == null) return false;

        // パスワード更新（AuthService と同じ BCrypt を使用）
        UserPassword upPass = new UserPassword();
        upPass.setUserId(token.getUserId());
        String hash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        upPass.setPasswordHash(hash);      
        userPasswordMapper.update(upPass);

        // トークン消費
        tokenMapper.markUsed(token.getId(), LocalDateTime.now());

        // セッション/リフレッシュトークンの無効化があるならここで
        // sessionService.invalidateAllSessions(token.getUserId());

        return true;
    }

    /* ===== helpers ===== */

    private static String generateToken() {
        byte[] buf = new byte[32];
        RNG.nextBytes(buf);
        // URLセーフなBase64（=,+,/を避ける）
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    private static String sha256Hex(String s) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(d.length * 2);
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private static void sleepRandom() {
        try { Thread.sleep(80 + RNG.nextInt(80)); } catch (InterruptedException ignored) {}
    }
}
