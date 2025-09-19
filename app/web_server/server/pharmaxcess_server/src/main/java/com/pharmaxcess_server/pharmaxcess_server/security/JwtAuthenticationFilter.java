package com.pharmaxcess_server.pharmaxcess_server.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.pharmaxcess_server.pharmaxcess_server.service.JwtService;
import org.springframework.stereotype.Component;

/**
 * Filter for JWT authentication.
 * <p>
 * This filter intercepts incoming HTTP requests to extract and validate a JWT token from the
 * "Authorization" header. If the token is valid, it sets the authentication context.
 * </p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    /**
     * Constructs a new {@code JwtAuthenticationFilter} with the specified {@link JwtService}.
     *
     * @param jwtService the service responsible for handling JWT operations
     */
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Filters incoming requests to check for a valid JWT token.
     * <p>
     * If a valid token is found in the "Authorization" header, the authentication context is updated.
     * </p>
     *
     * @param request     the HTTP request
     * @param response    the HTTP response
     * @param filterChain the filter chain to continue request processing
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws java.io.IOException, jakarta.servlet.ServletException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.isTokenValid(token)) {
                SecurityContextHolder.getContext().setAuthentication(jwtService.getAuthentication(token));
            }
        }
        filterChain.doFilter(request, response);
    }
}
