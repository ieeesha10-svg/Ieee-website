export const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    end: true,
    title: "Dashboard",
    sub: "IEEE Student Branch — Admin Overview",
  },
    {
      to: "/dashboard/users",
      label: "Members",
      icon: "Users",
      title: "Members",
    },
    {
      to: "/dashboard/committee-requests",
      label: "Committee Requests",
      icon: "Inbox",
      // Drives the glowing notification dot in the sidebar while requests are
      // waiting to be decided.
      pendingDot: true,
      title: "Committee Requests",
      sub: "Approve or reject committee applications, and see who decided each one",
    },
  {
    to: "/dashboard/events",
    label: "Events",
    icon: "Calendar",
    title: "Events",
  },
  {
    to: "/dashboard/forms",
    label: "Forms",
    icon: "FileText",
    title: "Registration Forms",
  },
  {
    to: "/dashboard/crew",
    label: "Crew",
    icon: "Users",
    title: "Crew Management",
  },
  {
    to: "/dashboard/email",
    label: "Emails",
    icon: "Mail",
    // The whole page is a write: composing and sending. Board can read the
    // delivery history in Email Logs, so the mailer is hidden from it.
    writeOnly: true,
    title: "Bulk Mailer",
    sub: "Compose and send broadcast emails to members",
  },
  {
    to: "/dashboard/email-logs",
    label: "Email Logs",
    icon: "FileText",
    title: "Email Logs",
    sub: "View delivery history and status",
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: "Settings",
    title: "Settings",
    sub: "Manage your admin profile, site config, and permissions",
  },
];

export const toolsItems = [
  {
    to: "/dashboard/scan",
    label: "QR Attendance",
    icon: "ScanQrCode",
    badge: "LIVE",
    title: "QR Scanner",
    sub: "Scan student QR codes to log event attendance in real time",
  },
];
