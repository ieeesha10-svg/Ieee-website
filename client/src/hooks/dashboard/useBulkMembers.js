import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export function useBulkMembers() {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [uniqueColleges, setUniqueColleges] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchFilteredMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterCollege !== "all") params.set("college", filterCollege);
      if (filterStatus !== "all") {
        params.set("status", filterStatus === "active" ? "Active" : "Inactive");
      }

      params.set("limit", "2000");

      const res = await api.get(`/users/members?${params.toString()}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setMembers(data);

      if (isInitialLoad) {
        const colleges = new Set(data.map((m) => m.college).filter(Boolean));
        setUniqueColleges(Array.from(colleges));
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error("Failed to fetch filtered members", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [search, filterRole, filterCollege, filterStatus, isInitialLoad]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredMembers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchFilteredMembers]);

  return {
    members,
    loadingMembers,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    filterCollege,
    setFilterCollege,
    filterStatus,
    setFilterStatus,
    uniqueColleges,
  };
}
