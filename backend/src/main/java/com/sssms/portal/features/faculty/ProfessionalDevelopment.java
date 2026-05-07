package com.sssms.portal.features.faculty;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "professional_development")
public class ProfessionalDevelopment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PDType type;

    private String organization;
    private LocalDate startDate;
    private LocalDate endDate;
    private String certificateUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private String addedBy; // email of who added it

    public enum PDType {
        WORKSHOP,
        QIP,
        FDP,
        CONFERENCE,
        SEMINAR,
        CERTIFICATION,
        OTHER
    }
}

