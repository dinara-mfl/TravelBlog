package org.example.backend.controller;

import org.example.backend.model.User;
import org.example.backend.repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepo.deleteAll();
    }

    @Test
    void register_savesUserWithHashedPassword() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "lena", "password": "secret123"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isCreated());

        User saved = userRepo.findByUsername("lena").orElseThrow();
        assertNotEquals("secret123", saved.passwordHash());
    }

    @Test
    void register_returnsConflict_whenUsernameIsTaken() throws Exception {
        userRepo.save(new User(null, "lena", "hash"));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "lena", "password": "secret123"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isConflict());
    }

    @Test
    void register_returnsBadRequest_whenPasswordIsTooShort() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "lena", "password": "short"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    void login_returnsToken_whenPasswordIsCorrect() throws Exception {
        userRepo.save(new User(null, "lena", passwordEncoder.encode("secret123")));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "lena", "password": "secret123"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.token").isNotEmpty())
                .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("lena"));
    }

    @Test
    void login_returnsUnauthorized_whenPasswordIsWrong() throws Exception {
        userRepo.save(new User(null, "lena", passwordEncoder.encode("secret123")));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "lena", "password": "wrong-password"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    @Test
    void login_returnsUnauthorized_whenUserDoesNotExist() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "nobody", "password": "secret123"}
                                """))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }
}