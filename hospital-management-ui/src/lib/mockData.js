export const feedback = [
  { id: "f1", patient: "Olivia Bennett", doctor: "Dr. Aisha Khan", rating: 5, comment: "Compassionate and incredibly thorough. Best cardiologist I've met.", date: "2026-05-28" },
  { id: "f2", patient: "Ethan Walker", doctor: "Dr. Marcus Lin", rating: 5, comment: "Explained my MRI results in a way I could actually understand.", date: "2026-05-26" },
  { id: "f3", patient: "Sophia Martinez", doctor: "Dr. Priya Natarajan", rating: 4, comment: "My daughter loved her. Wait time could be a touch shorter.", date: "2026-05-21" },
  { id: "f4", patient: "Liam Johnson", doctor: "Dr. Samuel Okafor", rating: 5, comment: "Knee replacement consultation was top tier.", date: "2026-05-18" },
];

export const auditLogs = [
  { id: "l1", actor: "admin@vitapulse.io", action: "Updated doctor profile", target: "Dr. Aisha Khan", ip: "10.0.4.18", at: "2026-06-02 09:12" },
  { id: "l2", actor: "reception01", action: "Booked appointment", target: "PT-58210 / DR-1024", ip: "10.0.4.22", at: "2026-06-02 09:08" },
  { id: "l3", actor: "dr.lin", action: "Marked appointment completed", target: "APT-A2", ip: "10.0.4.31", at: "2026-06-02 10:46" },
  { id: "l4", actor: "admin@vitapulse.io", action: "Granted permission", target: "Reports module / reception02", ip: "10.0.4.18", at: "2026-06-01 18:33" },
  { id: "l5", actor: "billing01", action: "Generated receipt", target: "APT-A7", ip: "10.0.4.40", at: "2026-06-01 17:02" },
];
