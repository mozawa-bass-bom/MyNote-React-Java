package com.mynote.app.util;

import java.security.Key;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TokenUtil {

    private static final long EXPIRATION_TIME_MS = 86400000; // 24時間 (ミリ秒)
    private static final String BEARER_PREFIX = "Bearer ";
    private static final SecureRandom RAND = new SecureRandom();

    @Value("${jwt.secret-key:#{null}}")
    private String secretKeyStr;

    private Key signingKey;

    @PostConstruct
    public void init() {
        if (secretKeyStr == null || secretKeyStr.isBlank()) {
            log.warn("jwt.secret-key が未設定です。ランダムキーで起動しますが、再起動でJWTが無効化されます。本番では必ず設定してください。");
            byte[] randomKey = new byte[32];
            RAND.nextBytes(randomKey);
            signingKey = Keys.hmacShaKeyFor(randomKey);
        } else {
            signingKey = Keys.hmacShaKeyFor(secretKeyStr.getBytes());
        }
    }

    /**
     * ユーザー情報（ユーザー名、ロール）を元にJWTを生成します。
     */
    public String generateToken(Long userId, String userName, String role) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_TIME_MS);

        return Jwts.builder()
                .setSubject(userName)        // ユーザー名
                .claim("userId", userId)     // ユーザーID
                .claim("role", role)         // ロール情報
                .setIssuedAt(now)            // 発行日時
                .setExpiration(expiration)   // 有効期限
                .signWith(signingKey)        // 署名
                .compact();
    }

    /**
     * リクエストヘッダーからJWTを取得し、その有効性を検証します。
     * @return トークンが有効であればtrue、無効（期限切れ、不正な署名など）であればfalse
     */
    public boolean verifyToken(HttpServletRequest request) {
        return getClaimsFromToken(request).isPresent();
    }

    /**
     * トークンが有効な場合、そのペイロード（Claims）からロール情報を取得します。
     * @return ユーザーのロール ("USER" or "ADMIN")、またはトークンが無効な場合はnull
     */
    public String getRoleFromToken(HttpServletRequest request) {
        return getClaimsFromToken(request)
                .map(claims -> claims.get("role", String.class))
                .orElse(null);
    }
    
    /**
     * トークンが有効な場合、そのペイロード（Claims）からユーザーIDを取得します。
     */
    public Long getUserIdFromToken(HttpServletRequest request) {
        return getClaimsFromToken(request)
                .map(claims -> claims.get("userId", Long.class))
                .orElse(null);
    }

    /**
     * トークンが有効な場合、そのペイロード（Claims）からユーザー名を取得します。
     */
    public String getUserNameFromToken(HttpServletRequest request) {
        return getClaimsFromToken(request)
                .map(Claims::getSubject)
                .orElse(null);
    }

    /**
     * リクエストからトークンを抽出・検証し、Claims（ペイロード）を取得します。
     */
    private Optional<Claims> getClaimsFromToken(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null) {
            return Optional.empty();
        }

        try {
            // トークンの署名検証と有効期限チェックを同時に行う
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);

            return Optional.of(claimsJws.getBody());
        } catch (JwtException e) {
            // トークンが不正（期限切れ、不正な署名、形式エラーなど）
            log.warn("JWT検証エラー: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Authorizationヘッダーからトークン文字列（"Bearer "以降）を抽出します。
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }

//
//    ========================================================
//    	パスワードリセット用トークン発行(SHA-256ハッシュ化)
//    ========================================================
    public static String newResetToken() {
        byte[] b = new byte[32]; // 256-bit
        RAND.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    public static String sha256Hex(String s) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(d.length * 2);
            for (byte x : d) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}