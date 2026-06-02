package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.entity.Appointment;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorSlotRepository doctorSlotRepository;

    public ReportController(UserRepository userRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            DoctorSlotRepository doctorSlotRepository) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorSlotRepository = doctorSlotRepository;
    }

    // GET /reports/summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long totalPatients = userRepository.countByRole("PATIENT");
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long availableSlots = doctorSlotRepository.countByAvailable(true);
        
        long completedAppointments = appointmentRepository.countByStatus("COMPLETED");
        long cancelledAppointments = appointmentRepository.countByStatus("CANCELLED");
        long bookedAppointments = appointmentRepository.countByStatus("BOOKED");

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPatients", totalPatients);
        summary.put("totalDoctors", totalDoctors);
        summary.put("totalAppointments", totalAppointments);
        summary.put("availableSlots", availableSlots);
        summary.put("completedAppointments", completedAppointments);
        summary.put("cancelledAppointments", cancelledAppointments);
        summary.put("bookedAppointments", bookedAppointments);

        return ResponseEntity.ok(summary);
    }

    // GET /reports/top-doctors
    @GetMapping("/top-doctors")
    public ResponseEntity<List<Map<String, Object>>> getTopDoctors() {
        List<Appointment> allAppointments = appointmentRepository.findAll();
        var allDoctors = doctorRepository.findAll();
        
        Map<Long, Long> doctorCounts = allAppointments.stream()
                .filter(a -> a.getDoctorId() != null)
                .collect(Collectors.groupingBy(Appointment::getDoctorId, Collectors.counting()));

        List<Map<String, Object>> topDoctors = allDoctors.stream()
                .map(doc -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("doctorId", doc.getId());
                    map.put("doctorName", doc.getName());
                    map.put("specialization", doc.getSpecialization());
                    map.put("appointmentCount", doctorCounts.getOrDefault(doc.getId(), 0L));
                    return map;
                })
                .sorted((m1, m2) -> Long.compare((Long) m2.get("appointmentCount"), (Long) m1.get("appointmentCount")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(topDoctors);
    }

    // GET /reports/monthly-trend
    @GetMapping("/monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrend() {
        List<Appointment> allAppointments = appointmentRepository.findAll();

        Map<YearMonth, Long> trendMap = allAppointments.stream()
                .filter(a -> a.getAppointmentDate() != null)
                .collect(Collectors.groupingBy(
                        a -> YearMonth.from(a.getAppointmentDate()),
                        Collectors.counting()
                ));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

        List<Map<String, Object>> monthlyTrend = trendMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", entry.getKey().format(formatter));
                    map.put("appointmentCount", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(monthlyTrend);
    }
}
