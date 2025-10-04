package com.mynote.app.filter;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

import com.mynote.app.util.TokenUtil;


public class AuthFilter extends OncePerRequestFilter {
	
	private static final String ADMIN_PATH_PREFIX = "/api/notes/admin/"; 
	
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
		// TokenUtil.verifyToken(request)がfalseの場合、トークンは不正
		if (!TokenUtil.verifyToken(request)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
			return;
		}

        // 3. 認可チェック（ロールに基づくアクセス制御）
        String userRole = TokenUtil.getRoleFromToken(request);
        String requestURI = request.getRequestURI();

        // 必須チェック: トークンは有効だがロール情報がない場合（トークン生成ミスなど）
        if (userRole == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            return;
        }

        // 管理者パスのチェック
        if (requestURI.startsWith(ADMIN_PATH_PREFIX)) {
            if (!"admin".equals(userRole)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                return;
            }
        }
        
		// 4. すべてOKなら通過
		filterChain.doFilter(request, response);
	}
}