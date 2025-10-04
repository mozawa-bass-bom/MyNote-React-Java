package com.mynote.app.api.service.contact;

// 💡 static importを追加
import static java.time.LocalDateTime.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.contact.ContactRequestDto;
import com.mynote.app.domain.entity.Contact;
import com.mynote.app.domain.mapper.ContactMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor 
@Slf4j
@Service
public class ContactService {

	private final ContactMapper contactMapper;
    /**
     * 問い合わせ情報を登録する。
     * * @param userId セッションから取得したユーザーID
     * @param requestDto フォームからのリクエストデータ
     */
    @Transactional 
	public void createContact(Long userId, ContactRequestDto requestDto) {
        log.info("Creating contact for user ID: {}", userId);
        
		Contact contact = new Contact();
		contact.setUserId(userId);
		contact.setName(requestDto.getName());
		contact.setEmail(requestDto.getEmail());
		contact.setMessage(requestDto.getMessage());
		contact.setCreatedAt(now()); 
		
        log.debug("Contact entity created: {}", contact);
        
        // DBに問い合わせ情報を保存
         contactMapper.insert(contact);
	}
}