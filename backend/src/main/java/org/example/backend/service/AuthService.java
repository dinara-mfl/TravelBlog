package org.example.backend.service;

import org.example.backend.dto.RegisterRequest;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {
        String username = request.username().trim();
        if (userRepo.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dieser Benutzername ist bereits vergeben.");
        }
        userRepo.save(new User(null, username, passwordEncoder.encode(request.password())));
    }
}