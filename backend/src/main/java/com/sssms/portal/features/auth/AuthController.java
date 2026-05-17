package com.sssms.portal.features.auth;

import com.sssms.portal.features.auth.dto.AuthenticationRequest;
import com.sssms.portal.features.auth.dto.RegisterRequest;
import com.sssms.portal.features.auth.dto.ChangePasswordRequest;
import com.sssms.portal.shared.enums.Role;
import com.sssms.portal.features.faculty.FacultyRepository;
import com.sssms.portal.features.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final AuthService service;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request, HttpServletRequest httpRequest) {

        Authentication authentication = service.authenticateSession(request);

        // 2. Set the authentication in the Spring Security Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Create a new Session and save the context
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        httpRequest.setAttribute("LOGGED_IN_EMAIL", request.getEmail());
        httpRequest.setAttribute("LOGGED_IN_ROLE", authentication.getAuthorities().iterator().next().getAuthority());

        // Spring Boot will automatically append the Set-Cookie: JSESSIONID header
        return ResponseEntity.ok("Session Login successful.");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Destroy the session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("You've been signed out and your session was destroyed!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Fetch User Base Data
        var userOptional = userRepository.findByEmail(userDetails.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, String> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("role", "ROLE_" + user.getRole().name());
            if (user.getProfilePhoto() != null) {
                response.put("profilePhoto", user.getProfilePhoto());
            }

            String realName = user.getEmail();

            if (user.getRole() == Role.FACULTY) {
                realName = facultyRepository.findById(user.getUserId())
                        .map(f -> f.getFirstName() + " " + f.getLastName())
                        .orElse("Faculty Member");
            } else if (user.getRole() == Role.STUDENT) {
                var studentOpt = studentRepository.findById(user.getUserId());
                realName = studentOpt.map(s -> s.getFirstName() + " " + s.getLastName()).orElse("Student");
                studentOpt.ifPresent(s -> {
                    if (s.getAcademicYear() != null) {
                        response.put("currentYear", s.getAcademicYear().name());
                    }
                });
            } else if (user.getRole() == Role.ADMIN) {
                realName = "Administrator";
            }

            response.put("name", realName);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("User not found");
        }
    }
}