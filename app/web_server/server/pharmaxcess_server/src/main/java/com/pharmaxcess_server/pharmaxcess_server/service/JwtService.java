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

@Service
public class JwtService {

    private final Set<String> invalidatedTokens = new HashSet<>();
    private static final String SECRET = System.getenv("JWT_SECRET");;
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String email, String role) {
        return Jwts.builder()
            .setSubject(email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
            .signWith(SECRET_KEY)
            .compact();
    }

    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        Claims claims = parseToken(token);

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));

        UserDetails userDetails = new User(email, role);

        return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
        .setSigningKey(SECRET_KEY)
        .build()
        .parseClaimsJws(token)
        .getBody();
    }

    public void invalidateToken(String token) {
        invalidatedTokens.add(token);
    }

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
