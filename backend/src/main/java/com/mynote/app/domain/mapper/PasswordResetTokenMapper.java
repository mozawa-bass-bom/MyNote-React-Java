package com.mynote.app.domain.mapper;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.domain.entity.PasswordResetToken;

@Mapper
public interface PasswordResetTokenMapper {
	int insert(PasswordResetToken t);

	PasswordResetToken findActiveByHash(@Param("tokenHash") String tokenHash, @Param("now") LocalDateTime now);

	int markUsed(@Param("id") Long id, @Param("usedAt") LocalDateTime usedAt);

	int invalidateActiveByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

	int deleteExpired(@Param("now") LocalDateTime now);
}
