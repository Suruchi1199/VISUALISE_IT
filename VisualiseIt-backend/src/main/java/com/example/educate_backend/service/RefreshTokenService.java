package com.example.educate_backend.service;

import com.example.educate_backend.Repository.RefreshTokenRepository;
import com.example.educate_backend.exception.AuthenticationException;
import com.example.educate_backend.model.RefreshToken;
import com.example.educate_backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public RefreshToken create(User user) {
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        return refreshTokenRepository.save(rt);
    }

    @Transactional
    public RefreshToken verifyAndRotate(String tokenValue) {
        RefreshToken old = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (old.getExpiryDate().isBefore(Instant.now())) {
            throw new AuthenticationException("Refresh token expired. Please log in again");
        }

        User user = old.getUser();
        refreshTokenRepository.delete(old);
        return create(user);
    }

    @Transactional
    public void delete(String tokenValue) {
        refreshTokenRepository.findByToken(tokenValue).ifPresent(refreshTokenRepository::delete);
    }
}