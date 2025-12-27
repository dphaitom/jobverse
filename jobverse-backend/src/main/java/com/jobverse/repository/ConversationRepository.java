package com.jobverse.repository;

import com.jobverse.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    // Find conversation without job context
    Optional<Conversation> findByCompanyIdAndCandidateIdAndJobIsNull(Long companyId, Long candidateId);
    
    // Find conversation with job context
    Optional<Conversation> findByCompanyIdAndCandidateIdAndJobId(Long companyId, Long candidateId, Long jobId);
    
    // Get all conversations for a candidate
    @Query("SELECT c FROM Conversation c WHERE c.candidate.id = :candidateId ORDER BY c.lastMessageAt DESC NULLS LAST")
    Page<Conversation> findByCandidateIdOrderByLastMessageAtDesc(Long candidateId, Pageable pageable);
    
    // Get all conversations for a company
    @Query("SELECT c FROM Conversation c WHERE c.company.id = :companyId ORDER BY c.lastMessageAt DESC NULLS LAST")
    Page<Conversation> findByCompanyIdOrderByLastMessageAtDesc(Long companyId, Pageable pageable);
    
    // Check if conversation belongs to candidate
    boolean existsByIdAndCandidateId(Long id, Long candidateId);
    
    // Check if conversation belongs to company
    boolean existsByIdAndCompanyId(Long id, Long companyId);
}
