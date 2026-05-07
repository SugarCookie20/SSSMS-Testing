package com.sssms.portal.features.fees;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeReminderRepository extends JpaRepository<FeeReminder, Long> {
    List<FeeReminder> findByActiveTrueOrderByCreatedAtDesc();
}

