export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', end: true, title: 'Dashboard', sub: 'IEEE Student Branch — Admin Overview' },
  { to: '/dashboard/users', label: 'Members', icon: 'Users', title: 'Members', sub: '12 students' },
  { to: '/dashboard/events', label: 'Events', icon: 'Calendar', title: 'Events', sub: '8 events managed' },
  { to: '/dashboard/forms', label: 'Forms', icon: 'FileText', title: 'Registration Forms', sub: '7 forms — 4 currently open' },
  { to: '/dashboard/email', label: 'Emails', icon: 'Mail', title: 'Bulk Mailer', sub: 'Compose and send broadcast emails to members' },
  { to: '/dashboard/settings', label: 'Settings', icon: 'Settings', title: 'Settings', sub: 'Manage your admin profile, site config, and permissions' },
];

export const toolsItems = [
  { to: '/dashboard/scan', label: 'QR Attendance', icon: 'ScanQrCode', badge: 'LIVE', title: 'QR Scanner', sub: 'Scan student QR codes to log event attendance in real time' },
];
