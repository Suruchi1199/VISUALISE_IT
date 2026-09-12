package com.example.educate_backend.config;

import com.example.educate_backend.security.JwtAuthenticationEntryPoint;
import com.example.educate_backend.security.JwtAuthenticationFilter;
import com.example.educate_backend.security.CustomUserDetailsService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security Configuration.
 * Configures JWT-based authentication, CSRF protection, and role-based access control.
 */
@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    /**
     * Create and configure PasswordEncoder bean.
     * Uses BCrypt for password encoding.
     * @return BCryptPasswordEncoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Create DaoAuthenticationProvider bean.
     * Configures authentication provider with UserDetailsService and PasswordEncoder.
     * @return DaoAuthenticationProvider bean
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Create AuthenticationManager bean.
     * @param authConfig the authentication configuration
     * @return AuthenticationManager bean
     * @throws Exception if authentication configuration fails
      */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Create JWT Authentication Filter bean.
     * @return JwtAuthenticationFilter bean
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    
    @Bean
public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(
        List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:8000")
    );

    configuration.setAllowedMethods(
        List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
    );

    configuration.setAllowedHeaders(
        List.of("*")
    );

    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}


    /**
     * Configure security filter chain.
     * - Permit public endpoints (/api/auth/**)
     * - Secure all other endpoints
     * - Disable CSRF
     * - Use stateless session management
     * - Add JWT filter before authentication filter
     * @param http the HttpSecurity to modify
     * @return SecurityFilterChain bean
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS with custom configuration
                // Disable CSRF for stateless API
                .csrf(csrf -> csrf.disable())

                // Set exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )

                // Use stateless session management (no session cookies)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authorization configuration
                .authorizeHttpRequests( authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Allow anonymous access to chapter sections so frontend can render content without login
                        .requestMatchers("/api/chapters/*/sections").permitAll()

                        // Allow public access to convenience endpoints under /api/public/**
                        .requestMatchers("/api/public/**").permitAll()

                        // Health check endpoint
                        .requestMatchers("/actuator/health").permitAll()

                        // Swagger/API documentation (if needed)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Set authentication provider
                .authenticationProvider(authenticationProvider())

                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
