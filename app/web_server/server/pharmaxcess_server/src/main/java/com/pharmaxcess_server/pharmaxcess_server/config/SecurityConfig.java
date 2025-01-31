package com.pharmaxcess_server.pharmaxcess_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.pharmaxcess_server.pharmaxcess_server.security.JwtAuthenticationFilter;

/**
 * Security configuration class for setting up JWT-based authentication and authorization in the application.
 * This configuration disables CSRF protection, defines request authorization rules, and adds a custom JWT filter for user authentication.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructs a SecurityConfig instance.
     *
     * @param jwtAuthenticationFilter the custom JWT authentication filter
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Configures the security filter chain for the application.
     * Disables CSRF protection, permits requests to authentication endpoints, and ensures all other requests require authentication.
     *
     * @param http the {@link HttpSecurity} object for configuring HTTP security settings
     * @return the configured {@link SecurityFilterChain} object
     * @throws Exception if there is an error during configuration
     */
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/*").permitAll()
                .anyRequest().authenticated()
            ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Defines a {@link PasswordEncoder} bean using BCrypt for password hashing.
     *
     * @return a {@link PasswordEncoder} instance using BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * (Optional) Configures an {@link AuthenticationManager} bean.
     * This method is currently commented out, but it can be enabled to allow for custom authentication configurations.
     *
     * @param config the {@link AuthenticationConfiguration} object for creating the authentication manager
     * @return the configured {@link AuthenticationManager}
     * @throws Exception if there is an error during the creation of the authentication manager
     */
    //@Bean
    //public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    //    return config.getAuthenticationManager();
    //}
}