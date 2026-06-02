import { useState } from "react";
import { User, Bell, Shield, Building2, Palette } from "lucide-react";
import { PageHeader, PageBody } from "@/components/PageHeader";
import authService from "@/services/authService";

const sections = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "org", icon: Building2, label: "Organization" },
  { id: "notif", icon: Bell, label: "Notifications" },
  { id: "security", icon: Shield, label: "Security" },
  { id: "appearance", icon: Palette, label: "Appearance" },
];

function Settings() {
  const currentUser = authService.getCurrentUser() || {};
  const [activeSection, setActiveSection] = useState("profile");
  
  // Profile state variables
  const [name, setName] = useState(currentUser.name || "Dr. Amelia Ross");
  const [role, setRole] = useState(currentUser.role || "Administrator");
  const [email, setEmail] = useState(currentUser.email || "amelia.ross@vitapulse.io");
  const [phone, setPhone] = useState(currentUser.phone || "+1 415 555 0118");

  // Notification toggles
  const [notifStates, setNotifStates] = useState({
    appointments: true,
    cancellations: true,
    labResults: true,
    systemAlerts: false,
  });

  const toggleNotif = (key) => {
    setNotifStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your workspace, preferences and security" />
      <PageBody>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Settings Navigation */}
          <nav className="flex flex-row overflow-x-auto gap-1 pb-3 lg:pb-0 lg:flex-col lg:overflow-x-visible lg:space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                  activeSection === s.id
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </nav>

          {/* Settings Forms */}
          <div className="space-y-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Update your account information</p>
                
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</label>
                    <input
                      type="text"
                      value={role}
                      disabled
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button className="h-9 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition">
                    Cancel
                  </button>
                  <button className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                    Save changes
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notif" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold text-foreground">Notification preferences</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose what you want to be alerted about</p>
                
                <div className="mt-5 space-y-4">
                  {[
                    { key: "appointments", l: "New appointments", d: "When a new patient books a consultation" },
                    { key: "cancellations", l: "Cancellations", d: "When an appointment is cancelled or rescheduled" },
                    { key: "labResults", l: "Lab results", d: "When new lab results are uploaded" },
                    { key: "systemAlerts", l: "System alerts", d: "Operational and infrastructure notices" },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.l}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.d}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotif(n.key)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          notifStates[n.key] ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md transition-transform ${
                            notifStates[n.key] ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Placeholders */}
            {activeSection !== "profile" && activeSection !== "notif" && (
              <div className="rounded-2xl border border-border bg-card p-8 shadow-card flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">Advanced settings</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  This section ({activeSection}) contains advanced administrative policies configured globally.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default Settings;
