package com.documind.controller;

import com.documind.dto.DocumentDTOs.DocumentResponseDTO;
import com.documind.dto.DocumentDTOs.DocumentUploadResponseDTO;
import com.documind.entity.DocumentEntity;
import com.documind.repository.DocumentRepository;
import com.documind.service.AiServiceWebClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final AiServiceWebClient aiService;
    private final DocumentRepository documentRepository;

    @Autowired
    public DocumentController(AiServiceWebClient aiService, DocumentRepository documentRepository) {
        this.aiService = aiService;
        this.documentRepository = documentRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            DocumentUploadResponseDTO response = aiService.uploadDocument(file);
            if (response != null && response.getDocument() != null) {
                DocumentResponseDTO doc = response.getDocument();
                DocumentEntity entity = new DocumentEntity(
                        doc.getDocId(),
                        doc.getFilename(),
                        doc.getFileType(),
                        doc.getSizeBytes(),
                        doc.getChunkCount(),
                        doc.getStatus(),
                        doc.getUploadDate()
                );
                documentRepository.save(entity);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Document upload failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> listDocuments() {
        try {
            List<DocumentResponseDTO> docs = aiService.listDocuments();
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            // Fallback to local DB list if AI service is offline
            List<DocumentEntity> entities = documentRepository.findAll();
            List<DocumentResponseDTO> fallback = entities.stream().map(e1 -> {
                DocumentResponseDTO dto = new DocumentResponseDTO();
                dto.setDocId(e1.getDocId());
                dto.setFilename(e1.getFilename());
                dto.setFileType(e1.getFileType());
                dto.setSizeBytes(e1.getSizeBytes());
                dto.setChunkCount(e1.getChunkCount());
                dto.setStatus(e1.getStatus());
                dto.setUploadDate(e1.getUploadDate());
                return dto;
            }).toList();
            return ResponseEntity.ok(fallback);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable("id") String id) {
        try {
            Map<String, Object> result = aiService.deleteDocument(id);
            documentRepository.deleteById(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            documentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted from database."));
        }
    }
}
