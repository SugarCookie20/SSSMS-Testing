package com.sssms.portal.shared.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String department;

    @Enumerated(EnumType.STRING)
    private AcademicYear academicYear;

    private Integer semester = 1;

    @PrePersist
    public void prePersist() {
        if (this.semester == null) {
            this.semester = 1;
        }
    }
}