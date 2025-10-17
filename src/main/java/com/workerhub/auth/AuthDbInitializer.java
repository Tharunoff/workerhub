package com.workerhub.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class AuthDbInitializer {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void init() {
        try {
            // Create the LOGIN table if it doesn't exist
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `login` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT,
                    `email` VARCHAR(255) NOT NULL,
                    `password` VARCHAR(255) NOT NULL,
                    `type` VARCHAR(50) NOT NULL,
                    `name` VARCHAR(255) NOT NULL,
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `uk_email` (`email`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """);
        } catch (Exception e) {
            System.err.println("Error creating login table: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
