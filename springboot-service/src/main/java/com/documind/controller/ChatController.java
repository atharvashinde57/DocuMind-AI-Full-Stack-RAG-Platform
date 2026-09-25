package com.documind.controller;

import com.documind.dto.ChatDTOs.ChatRequestDTO;
import com.documind.dto.ChatDTOs.ChatResponseDTO;
import com.documind.entity.ConversationEntity;
import com.documind.entity.MessageEntity;
import com.documind.repository.ConversationRepository;
import com.documind.repository.MessageRepository;
import com.documind.service.AiServiceWebClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiServiceWebClient aiService;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Autowired
    public ChatController(AiServiceWebClient aiService,
                          ConversationRepository conversationRepository,
                          MessageRepository messageRepository) {
        this.aiService = aiService;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendChatRequest(@RequestBody ChatRequestDTO request) {
        try {
            String convId = request.getConversationId();
            if (convId == null || convId.isEmpty() || convId.equals("default")) {
                convId = UUID.randomUUID().toString();
                request.setConversationId(convId);
            }

            // Ensure conversation entity exists
            final String finalConvId = convId;
            ConversationEntity conversation = conversationRepository.findById(finalConvId)
                    .orElseGet(() -> {
                        String title = request.getQuestion().length() > 30 ? 
                                request.getQuestion().substring(0, 30) + "..." : request.getQuestion();
                        return conversationRepository.save(new ConversationEntity(finalConvId, title));
                    });

            // Save user message
            messageRepository.save(new MessageEntity(conversation, "user", request.getQuestion(), null, null));

            // Call FastAPI AI Service
            ChatResponseDTO response = aiService.sendChatRequest(request);

            // Save assistant message
            String sourcesJson = (response.getSources() != null) ? response.getSources().toString() : null;
            messageRepository.save(new MessageEntity(conversation, "assistant", response.getAnswer(), sourcesJson, response.getConfidence()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Chat execution failed: " + e.getMessage()));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationEntity>> getConversations() {
        return ResponseEntity.ok(conversationRepository.findAll());
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageEntity>> getMessages(@PathVariable("id") String id) {
        return ResponseEntity.ok(messageRepository.findByConversationConversationIdOrderByCreatedAtAsc(id));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<?> deleteConversation(@PathVariable("id") String id) {
        conversationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully."));
    }
}
