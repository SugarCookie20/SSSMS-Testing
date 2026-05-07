package com.sssms.portal.shared.entity;
import com.sssms.portal.shared.entity.Subject;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
 }