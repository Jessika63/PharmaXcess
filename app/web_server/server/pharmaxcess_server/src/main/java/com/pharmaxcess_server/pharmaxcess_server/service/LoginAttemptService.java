package com.pharmaxcess_server.pharmaxcess_server.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Service responsible for tracking login attempts and preventing brute-force attacks.
 * This service stores failed login attempts in memory and blocks users/IPs temporarily
 * after exceeding a maximum number of failed attempts.
 *
 * Default configuration:
 * <ul>
 *   <li>Maximum failed attempts: 5</li>
 *   <li>Lock duration: 15 seconds</li>
 * </ul>
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;         // Maximum allowed failed attempts
    private static final long LOCK_TIME_MS = 15_000;  // Lock time in milliseconds (15s)

    private final ConcurrentHashMap<String, AttemptInfo> attemptsCache = new ConcurrentHashMap<>();

    /**
     * Clears the failed attempts for a given key (IP or username) after a successful login.
     *
     * @param key the identifier for tracking attempts (e.g., IP address or username)
     */
    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }

    /**
     * Records a failed login attempt for the given key (IP or username).
     *
     * @param key the identifier for tracking attempts (e.g., IP address or username)
     */
    public void loginFailed(String key) {
        AttemptInfo info = attemptsCache.getOrDefault(key, new AttemptInfo(0, System.currentTimeMillis()));
        info.count++;
        info.lastAttemptTime = System.currentTimeMillis();
        attemptsCache.put(key, info);
    }

    /**
     * Checks whether the given key (IP or username) is currently blocked due to too many failed attempts.
     *
     * @param key the identifier for tracking attempts (e.g., IP address or username)
     * @return {@code true} if blocked, {@code false} otherwise
     */
    public boolean isBlocked(String key) {
        AttemptInfo info = attemptsCache.get(key);
        if (info == null) return false;

        if (info.count >= MAX_ATTEMPT) {
            long elapsed = System.currentTimeMillis() - info.lastAttemptTime;
            if (elapsed < LOCK_TIME_MS) {
                return true; // still locked
            } else {
                attemptsCache.remove(key); // unlock after lock time expires
            }
        }
        return false;
    }

    /**
     * Internal class to store the number of failed attempts and the timestamp of the last attempt.
     */
    private static class AttemptInfo {
        int count;
        long lastAttemptTime;

        AttemptInfo(int count, long lastAttemptTime) {
            this.count = count;
            this.lastAttemptTime = lastAttemptTime;
        }
    }
}
