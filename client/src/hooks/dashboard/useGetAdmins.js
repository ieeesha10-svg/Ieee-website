// useGetAdmins: Fetches the list of admins (board/xcom roles) and their roles,
// used by the "User Permissions" section of DashboardSettings. Exposes the raw
// state setters so the page can optimistically update/remove admins, plus refetch.
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { ADMIN_ROLES } from "../../data/roles";
import { pickColor } from "../../data/avatarColors";

function mapAdmin(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role || "member",
    initials: u.name
      ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "??",
    color: pickColor(u._id),
  };
}

export function useGetAdmins() {
  const [admins, setAdmins] = useState([]);
  const [adminRoles, setAdminRoles] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/all?role=${ADMIN_ROLES.join(",")}&limit=100`);
      const users = (res.data.users || []).map(mapAdmin);
      setAdmins(users);
      const rolesMap = {};
      users.forEach((a) => { rolesMap[a.id] = a.role; });
      setAdminRoles(rolesMap);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdmins();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchAdmins]);

  return { admins, adminRoles, setAdmins, setAdminRoles, loading, refetch: fetchAdmins };
}
