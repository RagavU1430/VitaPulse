package com.ragav.hospitalmanagement.ai;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class GeminiController {

    private final GeminiService geminiService;

    // Constructor injection
    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // POST /ai/chat - Interact with Gemini AI assistant
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        Map<String, String> response = new HashMap<>();

        if (userMessage == null || userMessage.trim().isEmpty()) {
            response.put("reply", "Message cannot be empty.");
            return ResponseEntity.badRequest().body(response);
        }

        String reply = geminiService.getChatResponse(userMessage);
        response.put("reply", reply);
        return ResponseEntity.ok(response);
    }

    // GET /ai/test - Health check connection to Gemini API
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        boolean connected = geminiService.testConnection();
        Map<String, String> response = new HashMap<>();

        if (connected) {
            response.put("message", "Gemini API Connected");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Gemini API Connection Failed");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
