package com.pharmaxcess_server.pharmaxcess_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
public class PharmaxcessServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(PharmaxcessServerApplication.class, args);
	}
}
