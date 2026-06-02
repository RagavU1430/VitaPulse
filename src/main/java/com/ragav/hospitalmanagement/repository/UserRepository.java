package com.ragav.hospitalmanagement.repository;

import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.dto.PatientProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<PatientProjection> findByRole(String role);

    @Query("SELECT u.id as id, u.name as name, u.email as email, u.role as role, u.patientCode as patientCode FROM User u WHERE u.role = 'PATIENT' AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<PatientProjection> searchPatients(@Param("keyword") String keyword);

    long countByRole(String role);
}

