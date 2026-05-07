package com.sssms.portal.features.attendance;
import com.sssms.portal.features.timetable.SubjectAllocation;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "allocation_id", nullable = false)
    private SubjectAllocation allocation;

    @Column(nullable = false)
    private LocalDate date;

}