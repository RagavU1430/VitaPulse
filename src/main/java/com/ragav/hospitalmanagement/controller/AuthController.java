package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.dto.LoginRequest;
import com.ragav.hospitalmanagement.dto.RegisterRequest;
import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.repository.UserRepository;
import com.ragav.hospitalmanagement.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    // Constructor injection
    public AuthController(UserRepository userRepository, JwtUtil jwtUtil, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // POST /auth/register - Register a new user
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        if ("PATIENT".equals(savedUser.getRole()) && (savedUser.getPatientCode() == null || savedUser.getPatientCode().isEmpty())) {
            savedUser.setPatientCode(String.format("PT%06d", savedUser.getId()));
            savedUser = userRepository.save(savedUser);
        }
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // POST /auth/login - Authenticate user and return JWT
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()
                || !passwordEncoder.matches(request.getPassword(), userOptional.get().getPassword())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        User user = userOptional.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("id", String.valueOf(user.getId()));
        response.put("name", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}