package com.pharmaxcess_server.pharmaxcess_server.service;

import java.util.HashSet;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import com.pharmaxcess_server.pharmaxcess_server.model.User;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.Set;
import java.util.List;

/**
 * Service for handling JWT token creation, parsing, and validation.
 * <p>
 * This service provides methods to generate a JWT token, retrieve authentication details from a token,
 * invalidate a token, and check whether a token is valid.
 * </p>
 */
@Service
public class JwtService {

    private final Set<String> invalidatedTokens = new HashSet<>();
    private static final String SECRET = System.getenv("JWT_SECRET");;
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    /**
     * Generates a JWT token for a user based on their email and role.
     *
     * @param email the email of the user
     * @param role the role of the user (e.g., ROLE_USER, ROLE_ADMIN)
     * @return the generated JWT token as a string
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
            .setSubject(email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
            .signWith(SECRET_KEY)
            .compact();
    }

    /**
     * Extracts authentication details from the provided JWT token.
     *
     * @param token the JWT token to extract details from
     * @return the {@link UsernamePasswordAuthenticationToken} containing the user's details and authorities
     */
    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        Claims claims = parseToken(token);

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));

        UserDetails userDetails = new User(email, role);

        return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
    }

    /**
     * Parses the JWT token to retrieve the claims.
     *
     * @param token the JWT token to parse
     * @return the parsed claims from the token
     */
    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
        .setSigningKey(SECRET_KEY)
        .build()
        .parseClaimsJws(token)
        .getBody();
    }

    /**
     * Invalidates the provided JWT token by adding it to a blacklist.
     *
     * @param token the JWT token to invalidate
     */
    public void invalidateToken(String token) {
        invalidatedTokens.add(token);
    }

    /**
     * Checks if the provided JWT token is valid.
     * A token is considered valid if it is correctly signed and not in the invalidated tokens set.
     *
     * @param token the JWT token to check
     * @return {@code true} if the token is valid, {@code false} otherwise
     */
    public boolean isTokenValid(String token) {
        try {
            JwtParser parser = Jwts.parserBuilder()
                    .setSigningKey(SECRET.getBytes())
                    .build();

            parser.parseClaimsJws(token);

            return !invalidatedTokens.contains(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
