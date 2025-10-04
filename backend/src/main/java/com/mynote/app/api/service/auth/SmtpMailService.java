// src/main/java/com/mynote/app/api/service/auth/SmtpMailService.java
package com.mynote.app.api.service.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(JavaMailSender.class)                 // ← 残すと安全
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "smtp")
public class SmtpMailService implements MailService {

  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@mynote.example}")    
  private String from;

  @Value("${password.reset.expire-minutes:5}")
  private int expireMinutes;

  @Override
  public void sendPasswordResetMail(String to, String userName, String resetUrl) {
    String subject = "[MyNote] パスワード再設定のご案内";
    String body = """
        %s 様

        パスワード再設定のリクエストを受け付けました。
        下記URLから再設定を行ってください。（有効期限：%d分）

        %s

        ※このメールに心当たりがない場合は破棄してください。
        """.formatted(userName == null ? "" : userName, expireMinutes, resetUrl);

    var msg = new SimpleMailMessage();
    msg.setFrom(from);
    msg.setTo(to);
    msg.setSubject(subject);
    msg.setText(body);
    mailSender.send(msg);

    log.info("Password reset mail sent to {}", to);
  }
}
