package com.sssms.portal.features.attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByAllocationId(Long allocationId);
}
