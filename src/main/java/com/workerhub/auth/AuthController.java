package com.workerhub.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthRepository authRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> register(@RequestBody AuthUser user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Attempting to register user with email: {}", user.getEmail());
            
            // Check if email already exists
            if (authRepository.findByEmail(user.getEmail()).isPresent()) {
                log.warn("Registration failed: Email already exists: {}", user.getEmail());
                response.put("success", false);
                response.put("message", "Email already registered");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Hash password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Save user
            log.info("Saving new user with email: {}", user.getEmail());
            AuthUser savedUser = authRepository.save(user);
            
            response.put("success", true);
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "email", savedUser.getEmail(),
                "name", savedUser.getName(),
                "type", savedUser.getType()
            ));
            
            log.info("Successfully registered user: {}", savedUser.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email: " + user.getEmail(), e);
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthUser loginRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Login attempt for email: {}", loginRequest.getEmail());
            
            // Find user by email
            var userOpt = authRepository.findByEmail(loginRequest.getEmail());
            
            if (userOpt.isEmpty()) {
                log.warn("Login failed: User not found: {}", loginRequest.getEmail());
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
                log.warn("Login failed: Invalid password for user: {}", loginRequest.getEmail());
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
            
            AuthUser user = userOpt.get();
            
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "type", user.getType()
            ));
            
            log.info("Successful login for user: {}", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: " + loginRequest.getEmail(), e);
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
