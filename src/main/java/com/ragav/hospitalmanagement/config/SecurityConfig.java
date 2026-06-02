package com.ragav.hospitalmanagement.config;

import com.ragav.hospitalmanagement.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Constructor injection
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/h2-console/**").permitAll()
                        // Dashboard - all authenticated users
                        .requestMatchers("/dashboard/**").authenticated()
                        // Doctors - GET open to all authenticated, POST/PUT/DELETE admin only
                        .requestMatchers(HttpMethod.GET, "/doctors/me", "/doctors/me/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/doctors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/doctors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/doctors/**").hasRole("ADMIN")
                        // Appointments
                        .requestMatchers("/appointments/book").hasRole("PATIENT")
                        .requestMatchers("/appointments/cancel/**").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers("/appointments/complete/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers("/appointments/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/patients").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/patients/search").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/patients/*/details").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/patients/*/appointments").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/patients/*/stats").hasRole("ADMIN")
                        .requestMatchers("/patients/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.POST, "/slots").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/slots", "/slots/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/doctor-slots", "/api/doctor-slots/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT")
                        .requestMatchers("/reports/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
