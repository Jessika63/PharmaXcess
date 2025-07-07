package com.pharmaxcess_server.pharmaxcess_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

/**
 * The main entry point for the Pharmaxcess server application.
 * This class is responsible for launching the Spring Boot application.
 * It excludes the automatic security configuration provided by Spring Boot's {@link SecurityAutoConfiguration},
 */
@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
public class PharmaxcessServerApplication {

    /**
     * The main method that launches the Spring Boot application.
     *
     * @param args command-line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(PharmaxcessServerApplication.class, args);
    }
}