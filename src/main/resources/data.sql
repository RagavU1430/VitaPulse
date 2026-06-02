-- PostgreSQL-compatible seed data for VitaPulse Hospital Management System

-- 1. Seed Users (passwords are BCrypt hashes of 'admin123' or 'patient123')
-- BCrypt hash for 'admin123': $2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q
-- BCrypt hash for 'patient123': $2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q (using same hash for convenience)
INSERT INTO users (name, email, password, role, patient_code) VALUES
('Admin User', 'admin@vitapulse.io', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'ADMIN', NULL),
('Olivia Bennett', 'olivia@example.com', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'PATIENT', 'PT000002'),
('Ethan Walker', 'ethan@example.com', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'PATIENT', 'PT000003'),
('Sophia Martinez', 'sophia@example.com', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'PATIENT', 'PT000004'),
('Liam Johnson', 'liam@example.com', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'PATIENT', 'PT000005');

-- 2. Seed Doctors
INSERT INTO doctors (name, specialization, experience, email, phone, doctor_code) VALUES
('Dr. Aisha Khan', 'Cardiology', 12, 'aisha.khan@vitapulse.io', '+1-555-0192', 'DR000001'),
('Dr. Marcus Lin', 'Radiology', 8, 'marcus.lin@vitapulse.io', '+1-555-0143', 'DR000002'),
('Dr. Priya Natarajan', 'Pediatrics', 15, 'priya.natarajan@vitapulse.io', '+1-555-0188', 'DR000003'),
('Dr. Samuel Okafor', 'Orthopedics', 10, 'samuel.okafor@vitapulse.io', '+1-555-0155', 'DR000004');

-- 3. Seed Patients (legacy support)
INSERT INTO patients (name, email, phone, age, gender) VALUES
('Olivia Bennett', 'olivia@example.com', '+1-555-2311', 28, 'Female'),
('Ethan Walker', 'ethan@example.com', '+1-555-8944', 35, 'Male'),
('Sophia Martinez', 'sophia@example.com', '+1-555-7611', 12, 'Female'),
('Liam Johnson', 'liam@example.com', '+1-555-5522', 54, 'Male');

-- 4. Seed Doctor Slots
INSERT INTO doctor_slots (doctor_id, slot_date, slot_time, available) VALUES
(1, '2026-06-03', '10:00:00', true),
(1, '2026-06-03', '11:00:00', false),
(1, '2026-06-03', '14:00:00', true),
(2, '2026-06-03', '09:00:00', true),
(2, '2026-06-03', '10:00:00', false),
(3, '2026-06-04', '11:00:00', true),
(4, '2026-06-04', '15:00:00', true);

-- 5. Seed Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES
(2, 1, '2026-06-03', '11:00:00', 'BOOKED'),
(3, 2, '2026-06-03', '10:00:00', 'COMPLETED'),
(4, 3, '2026-05-21', '11:00:00', 'COMPLETED');

-- 6. Seed Feedback (mock tables data)
INSERT INTO feedback (patient, doctor, rating, comment, date) VALUES
('Olivia Bennett', 'Dr. Aisha Khan', 5, 'Compassionate and incredibly thorough. Best cardiologist I''ve met.', '2026-05-28'),
('Ethan Walker', 'Dr. Marcus Lin', 5, 'Explained my MRI results in a way I could actually understand.', '2026-05-26'),
('Sophia Martinez', 'Dr. Priya Natarajan', 4, 'My daughter loved her. Wait time could be a touch shorter.', '2026-05-21'),
('Liam Johnson', 'Dr. Samuel Okafor', 5, 'Knee replacement consultation was top tier.', '2026-05-18');

-- 7. Seed Audit Logs
INSERT INTO audit_logs (actor, action, target, ip, at) VALUES
('admin@vitapulse.io', 'Updated doctor profile', 'Dr. Aisha Khan', '10.0.4.18', '2026-06-02 09:12:00'),
('reception01', 'Booked appointment', 'PT-58210 / DR-1024', '10.0.4.22', '2026-06-02 09:08:00'),
('dr.lin', 'Marked appointment completed', 'APT-A2', '10.0.4.31', '2026-06-02 10:46:00'),
('admin@vitapulse.io', 'Granted permission', 'Reports module / reception02', '10.0.4.18', '2026-06-01 18:33:00'),
('billing01', 'Generated receipt', 'APT-A7', '10.0.4.40', '2026-06-01 17:02:00');
