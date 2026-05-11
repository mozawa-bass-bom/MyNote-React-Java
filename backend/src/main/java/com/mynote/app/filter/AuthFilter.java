package com.mynote.app.filter;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.mynote.app.util.TokenUtil;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {

	private static final String ADMIN_PATH_PREFIX = "/api/notes/admin/";

	private final TokenUtil tokenUtil;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getRequestURI();
		if (path.equals("/api/auth/deleteUser") || path.equals("/api/auth/logout")) {
			return false;
		}
		if (path.startsWith("/api/auth/")) {
			return true;
		}
		if (path.startsWith("/api/contacts")) {
			return true;
		}
		return false;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// 1. プリフライト・リクエストは無視
		if (request.getMethod().equals("OPTIONS")) {
			filterChain.doFilter(request, response);
			return;
		}

		// 2. トークンの有効性チェック（署名、期限）
		if (!tokenUtil.verifyToken(request)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
			return;
		}

        // 3. 認可チェックとユーザー情報の伝播
        String userRole = tokenUtil.getRoleFromToken(request);
        Long userId = tokenUtil.getUserIdFromToken(request);
        String userName = tokenUtil.getUserNameFromToken(request);
        String requestURI = request.getRequestURI();

        // 必須チェック: トークンは有効だが必要な情報がない場合（トークン生成ミスなど）
        if (userRole == null || userId == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            return;
        }

        // 4. 以降のControllerで使用できるようにHttpServletRequestの属性に格納
        request.setAttribute("userId", userId);
        request.setAttribute("userName", userName);
        request.setAttribute("role", userRole);

        // 管理者パスのチェック
        if (requestURI.startsWith(ADMIN_PATH_PREFIX)) {
            if (!"ADMIN".equals(userRole)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                return;
            }
        }

		// 4. すべてOKなら通過
		filterChain.doFilter(request, response);
	}
}