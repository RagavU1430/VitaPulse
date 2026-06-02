package com.ragav.hospitalmanagement.service;

import com.ragav.hospitalmanagement.dto.DashboardStatsResponse;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import com.ragav.hospitalmanagement.repository.PatientRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorSlotRepository doctorSlotRepository;
    private final UserRepository userRepository;

    // Constructor injection
    public DashboardService(DoctorRepository doctorRepository,
                            PatientRepository patientRepository,
                            AppointmentRepository appointmentRepository,
                            DoctorSlotRepository doctorSlotRepository,
                            UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorSlotRepository = doctorSlotRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        long totalDoctors = doctorRepository.count();
        long totalPatients = userRepository.countByRole("PATIENT");
        long totalAppointments = appointmentRepository.count();
        long availableSlots = doctorSlotRepository.countByAvailable(true);

        return new DashboardStatsResponse(totalDoctors, totalPatients, totalAppointments, availableSlots);
    }
}
