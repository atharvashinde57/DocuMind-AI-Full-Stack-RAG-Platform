package com.documind.dto;

public class DocumentDTOs {

    public static class DocumentResponseDTO {
        private String docId;
        private String filename;
        private String fileType;
        private String uploadDate;
        private Long sizeBytes;
        private Integer chunkCount;
        private String status;

        public String getDocId() { return docId; }
        public void setDocId(String docId) { this.docId = docId; }
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }
        public String getUploadDate() { return uploadDate; }
        public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
        public Long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }
        public Integer getChunkCount() { return chunkCount; }
        public void setChunkCount(Integer chunkCount) { this.chunkCount = chunkCount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DocumentUploadResponseDTO {
        private String message;
        private DocumentResponseDTO document;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public DocumentResponseDTO getDocument() { return document; }
        public void setDocument(DocumentResponseDTO document) { this.document = document; }
    }
}
