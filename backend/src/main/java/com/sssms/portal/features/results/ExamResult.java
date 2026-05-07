package com.sssms.portal.features.results;
import com.sssms.portal.features.student.Student;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exam_results")
public class ExamResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private Integer semester; // 1 to 10
    private Double sgpa; // Semester GPA
    private Double cgpa; // Cumulative GPA up to this semester
    private String status; // PASS/FAIL
    private LocalDate resultDate;
    private String examSession; // e.g., "Semester 1 - 2024"
}