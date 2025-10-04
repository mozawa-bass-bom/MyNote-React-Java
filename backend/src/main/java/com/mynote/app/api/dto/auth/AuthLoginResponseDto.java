package com.mynote.app.api.dto.auth;
import com.mynote.app.api.dto.nav.NavTreeDto;

public record AuthLoginResponseDto(
    String userName,
    String userId,
    String token,
    NavTreeDto nav
) {}