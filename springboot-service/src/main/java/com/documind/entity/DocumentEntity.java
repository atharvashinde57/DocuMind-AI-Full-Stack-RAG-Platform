package com.documind.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    private String docId;

    @Column(nullable = false)
    private String filename;

    private String fileType;

    private Long sizeBytes;

    private Integer chunkCount;

    private String status;

    private String uploadDate;

    private LocalDateTime createdAt = LocalDateTime.now();

    public DocumentEntity() {}

    public DocumentEntity(String docId, String filename, String fileType, Long sizeBytes, Integer chunkCount, String status, String uploadDate) {
        this.docId = docId;
        this.filename = filename;
        this.fileType = fileType;
        this.sizeBytes = sizeBytes;
        this.chunkCount = chunkCount;
        this.status = status;
        this.uploadDate = uploadDate;
    }

    public String getDocId() { return docId; }
    public void setDocId(String docId) { this.docId = docId; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

    public Integer getChunkCount() { return chunkCount; }
    public void setChunkCount(Integer chunkCount) { this.chunkCount = chunkCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUploadDate() { return uploadDate; }
    public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
