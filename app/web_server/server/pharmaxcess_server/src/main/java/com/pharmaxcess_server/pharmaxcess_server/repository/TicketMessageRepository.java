package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Integer> {
    @Query(value = "SELECT * FROM ticket_message m WHERE m.ticket_id = :ticketId", nativeQuery = true)
    List<TicketMessage> findByTicketId(Integer ticketId);
}
