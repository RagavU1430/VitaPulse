package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.dto.DashboardStatsResponse;
import com.ragav.hospitalmanagement.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    // Constructor injection
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // GET /dashboard/counts - Retrieve dashboard statistics
    @GetMapping("/counts")
    public DashboardStatsResponse getDashboardCounts() {
        return dashboardService.getDashboardStats();
    }
}
