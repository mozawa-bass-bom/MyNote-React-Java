// src/main/java/com/mynote/app/api/service/auth/LoggingMailService.java
package com.mynote.app.api.service.auth;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "log", matchIfMissing = true)
public class LoggingMailService implements MailService {
  @Override
  public void sendPasswordResetMail(String to, String userName, String resetUrl) {
    log.info("[DEV-ONLY] sendPasswordResetMail => to={}, userName={}, url={}", to, userName, resetUrl);
  }
}

