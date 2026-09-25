package com.documind.dto;

import java.util.List;

public class ChatDTOs {

    public static class ChatRequestDTO {
        private String question;
        private String conversationId;
        private List<String> docIds;
        private String promptType;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getConversationId() { return conversationId; }
        public void setConversationId(String conversationId) { this.conversationId = conversationId; }
        public List<String> getDocIds() { return docIds; }
        public void setDocIds(List<String> docIds) { this.docIds = docIds; }
        public String getPromptType() { return promptType; }
        public void setPromptType(String promptType) { this.promptType = promptType; }
    }

    public static class SourceDTO {
        private String document;
        private Integer page;
        private String chunkId;
        private String snippet;

        public String getDocument() { return document; }
        public void setDocument(String document) { this.document = document; }
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public String getChunkId() { return chunkId; }
        public void setChunkId(String chunkId) { this.chunkId = chunkId; }
        public String getSnippet() { return snippet; }
        public void setSnippet(String snippet) { this.snippet = snippet; }
    }

    public static class ChunkDetailDTO {
        private String chunkId;
        private String docId;
        private String filename;
        private Integer page;
        private String content;
        private Double similarityScore;

        public String getChunkId() { return chunkId; }
        public void setChunkId(String chunkId) { this.chunkId = chunkId; }
        public String getDocId() { return docId; }
        public void setDocId(String docId) { this.docId = docId; }
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Double getSimilarityScore() { return similarityScore; }
        public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    }

    public static class RAGDebugDTO {
        private String query;
        private String embeddingModel;
        private Integer topK;
        private List<ChunkDetailDTO> retrievedChunks;
        private String promptContext;
        private Double responseTimeMs;

        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public String getEmbeddingModel() { return embeddingModel; }
        public void setEmbeddingModel(String embeddingModel) { this.embeddingModel = embeddingModel; }
        public Integer getTopK() { return topK; }
        public void setTopK(Integer topK) { this.topK = topK; }
        public List<ChunkDetailDTO> getRetrievedChunks() { return retrievedChunks; }
        public void setRetrievedChunks(List<ChunkDetailDTO> retrievedChunks) { this.retrievedChunks = retrievedChunks; }
        public String getPromptContext() { return promptContext; }
        public void setPromptContext(String promptContext) { this.promptContext = promptContext; }
        public Double getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(Double responseTimeMs) { this.responseTimeMs = responseTimeMs; }
    }

    public static class ChatResponseDTO {
        private String answer;
        private Double confidence;
        private String promptType;
        private List<SourceDTO> sources;
        private Integer retrievedChunksCount;
        private RAGDebugDTO debugInfo;

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public String getPromptType() { return promptType; }
        public void setPromptType(String promptType) { this.promptType = promptType; }
        public List<SourceDTO> getSources() { return sources; }
        public void setSources(List<SourceDTO> sources) { this.sources = sources; }
        public Integer getRetrievedChunksCount() { return retrievedChunksCount; }
        public void setRetrievedChunksCount(Integer retrievedChunksCount) { this.retrievedChunksCount = retrievedChunksCount; }
        public RAGDebugDTO getDebugInfo() { return debugInfo; }
        public void setDebugInfo(RAGDebugDTO debugInfo) { this.debugInfo = debugInfo; }
    }
}
