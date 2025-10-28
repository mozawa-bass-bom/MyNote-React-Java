package com.mynote.app.api.service.contact;

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
	
	private static final Long GUEST_USER_ID = 999999L;
	
	private final ContactMapper contactMapper;
    /**
     * 問い合わせ情報を登録する。
     * * @param userId セッションから取得したユーザーID (null許容)
     * @param requestDto フォームからのリクエストデータ
     */
    @Transactional 
	public void createContact(Long userId, ContactRequestDto requestDto) { 

    	Long actualUserId = (userId != null) ? userId : GUEST_USER_ID;
        
		Contact contact = new Contact();

		contact.setUserId(actualUserId); 
		contact.setName(requestDto.getName());
		contact.setEmail(requestDto.getEmail());
		contact.setMessage(requestDto.getMessage());
		
        log.debug("Contact entity created: {}", contact);
        
        // DBに問い合わせ情報を保存
         contactMapper.insert(contact);
	}
}