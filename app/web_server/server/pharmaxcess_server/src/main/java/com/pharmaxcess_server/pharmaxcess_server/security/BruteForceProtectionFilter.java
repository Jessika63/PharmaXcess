package com.pharmaxcess_server.pharmaxcess_server.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.pharmaxcess_server.pharmaxcess_server.service.LoginAttemptService;

import java.io.IOException;

/**
 * Custom authentication filter that prevents brute-force login attempts.
 * This filter integrates with {@link LoginAttemptService} to:
 * <ul>
 *   <li>Block requests from IPs or users that exceed the maximum allowed failed attempts.</li>
 *   <li>Reset attempt counters after a successful authentication.</li>
 *   <li>Increment attempt counters on authentication failure.</li>
 * </ul>
 */
public class BruteForceProtectionFilter extends UsernamePasswordAuthenticationFilter {

    private final LoginAttemptService loginAttemptService;

    /**
     * Constructs a BruteForceProtectionFilter with the given login attempt service.
     *
     * @param loginAttemptService the service used to track and block brute-force attempts
     */
    public BruteForceProtectionFilter(LoginAttemptService loginAttemptService) {
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * Invoked when authentication fails.
     * Increments the failed attempt counter for the request's IP address.
     *
     * @param request  the HTTP request
     * @param response the HTTP response
     * @param failed   the authentication exception
     * @throws IOException      if an input or output error occurs
     * @throws ServletException if a servlet error occurs
     */
    @Override
    public void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                           org.springframework.security.core.AuthenticationException failed)
            throws IOException, ServletException {
        String ip = request.getRemoteAddr();
        loginAttemptService.loginFailed(ip);
        super.unsuccessfulAuthentication(request, response, failed);
    }

    /**
     * Invoked when authentication is successful.
     * Resets the failed attempt counter for the request's IP address.
     *
     * @param request     the HTTP request
     * @param response    the HTTP response
     * @param chain       the filter chain
     * @param authResult  the successful authentication result
     * @throws IOException      if an input or output error occurs
     * @throws ServletException if a servlet error occurs
     */
    @Override
    public void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                         FilterChain chain,
                                         org.springframework.security.core.Authentication authResult)
            throws IOException, ServletException {
        String ip = request.getRemoteAddr();
        loginAttemptService.loginSucceeded(ip);
        super.successfulAuthentication(request, response, chain, authResult);
    }

    /**
     * Attempts authentication, but first checks whether the IP address is currently blocked.
     *
     * @param request  the HTTP request
     * @param response the HTTP response
     * @return the authentication object if successful
     * @throws BadCredentialsException if the IP is blocked due to too many failed attempts
     */
    @Override
    public org.springframework.security.core.Authentication attemptAuthentication(HttpServletRequest request,
                                                                                   HttpServletResponse response) {
        String ip = request.getRemoteAddr();
        if (loginAttemptService.isBlocked(ip)) {
            throw new BadCredentialsException("Too many failed login attempts. Please try again later.");
        }
        return super.attemptAuthentication(request, response);
    }
}
