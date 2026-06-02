package com.ragav.hospitalmanagement.repository;

import com.ragav.hospitalmanagement.entity.DoctorSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, Long> {
    List<DoctorSlot> findByDoctorId(Long doctorId);
    List<DoctorSlot> findByDoctorIdAndAvailable(Long doctorId, Boolean available);
    List<DoctorSlot> findByAvailable(Boolean available);
    Optional<DoctorSlot> findByDoctorIdAndSlotDateAndSlotTime(Long doctorId, LocalDate slotDate, LocalTime slotTime);
    long countByAvailable(Boolean available);
    Optional<DoctorSlot> findBySlotDateAndSlotTime(LocalDate slotDate, LocalTime slotTime);
}



