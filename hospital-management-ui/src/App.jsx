import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import BookAppointment from "./pages/BookAppointment";
import AppointmentManagement from "./pages/AppointmentManagement";
import MyAppointments from "./pages/MyAppointments";
import DoctorSlots from "./pages/DoctorSlots";
import Reports from "./pages/Reports";
import Feedback from "./pages/Feedback";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/DashboardLayout";

function AuthenticatedPage({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated routes — wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<AuthenticatedPage><Dashboard /></AuthenticatedPage>} />
        <Route path="/doctors" element={<AuthenticatedPage><Doctors /></AuthenticatedPage>} />
        <Route path="/doctors/:id" element={<AuthenticatedPage><DoctorProfile /></AuthenticatedPage>} />
        <Route path="/patients" element={<AuthenticatedPage><Patients /></AuthenticatedPage>} />
        <Route path="/patients/:id" element={<AuthenticatedPage><PatientDetails /></AuthenticatedPage>} />
        <Route path="/book-appointment" element={<AuthenticatedPage><BookAppointment /></AuthenticatedPage>} />
        <Route path="/appointments" element={<AuthenticatedPage><AppointmentManagement /></AuthenticatedPage>} />
        <Route path="/my-appointments" element={<AuthenticatedPage><MyAppointments /></AuthenticatedPage>} />
        <Route path="/doctor-slots" element={<AuthenticatedPage><DoctorSlots /></AuthenticatedPage>} />
        <Route path="/reports" element={<AuthenticatedPage><Reports /></AuthenticatedPage>} />
        <Route path="/feedback" element={<AuthenticatedPage><Feedback /></AuthenticatedPage>} />
        <Route path="/audit" element={<AuthenticatedPage><AuditLogs /></AuthenticatedPage>} />
        <Route path="/settings" element={<AuthenticatedPage><Settings /></AuthenticatedPage>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;