package org.example.backend.service;

import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.LoginResponse;
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
    private final JwtService jwtService;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void register(RegisterRequest request) {
        String username = request.username().trim();
        if (userRepo.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dieser Benutzername ist bereits vergeben.");
        }
        userRepo.save(new User(null, username, passwordEncoder.encode(request.password())));
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepo.findByUsername(request.username().trim())
                .filter(found -> passwordEncoder.matches(request.password(), found.passwordHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Benutzername oder Passwort ist falsch."));
        return new LoginResponse(jwtService.createToken(user.id()), user.username());
    }
}