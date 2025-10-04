package com.mynote.app.api.service.auth;

public interface MailService {
	void sendPasswordResetMail(String to, String userName, String resetUrl);

	default void sendSimple(String to, String subject, String body) {
		// 必要なら実装。SMTP 実装側で上書きされる想定
		throw new UnsupportedOperationException("Not implemented");
	}
}
