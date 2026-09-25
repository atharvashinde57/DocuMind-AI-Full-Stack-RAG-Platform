package com.documind.service;

import com.documind.dto.ChatDTOs.ChatRequestDTO;
import com.documind.dto.ChatDTOs.ChatResponseDTO;
import com.documind.dto.DocumentDTOs.DocumentResponseDTO;
import com.documind.dto.DocumentDTOs.DocumentUploadResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceWebClient {

    private final WebClient aiServiceWebClient;

    @Autowired
    public AiServiceWebClient(WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }

    public DocumentUploadResponseDTO uploadDocument(MultipartFile file) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        ByteArrayResource contentsAsResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        builder.part("file", contentsAsResource, MediaType.MULTIPART_FORM_DATA);

        return aiServiceWebClient.post()
                .uri("/api/v1/documents/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(DocumentUploadResponseDTO.class)
                .block();
    }

    public List<DocumentResponseDTO> listDocuments() {
        return aiServiceWebClient.get()
                .uri("/api/v1/documents")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<DocumentResponseDTO>>() {})
                .block();
    }

    public Map<String, Object> deleteDocument(String docId) {
        return aiServiceWebClient.delete()
                .uri("/api/v1/documents/" + docId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    public ChatResponseDTO sendChatRequest(ChatRequestDTO chatRequest) {
        return aiServiceWebClient.post()
                .uri("/api/v1/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponseDTO.class)
                .block();
    }

    public Map<String, Object> getEvaluationMetrics() {
        return aiServiceWebClient.get()
                .uri("/api/v1/eval")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }
}
