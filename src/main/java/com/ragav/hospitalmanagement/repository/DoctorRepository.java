package com.ragav.hospitalmanagement.repository;

import com.ragav.hospitalmanagement.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByNameContainingIgnoreCase(String name);
    Optional<Doctor> findByEmail(String email);
}
