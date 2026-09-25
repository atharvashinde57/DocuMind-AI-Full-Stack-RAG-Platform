package com.documind.repository;

import com.documind.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findByConversationConversationIdOrderByCreatedAtAsc(String conversationId);
}
