import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { formatAcademicYear } from "../../utils/formatAcademicYear";
import { pickColor } from "../../data/avatarColors";

function mapUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    initials: u.name
      ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "??",
    college: u.college
      ? u.college.charAt(0).toUpperCase() + u.college.slice(1)
      : "N/A",
    year: formatAcademicYear(u.yearOfStudy),
    yearOfStudy: u.yearOfStudy,
    position: u.position || "",
    organization: u.organization || "",
    roleInOrganization: u.roleInOrganization || "",
    yearsOfExperience: u.yearsOfExperience,
    reasonForRegistration: u.reasonForRegistration || "",
    attendance: 0,
    maxAttendance: 1,
    status: u.isVerified ? "Verified" : "Unverified",
    role: u.role || "member",
    avatarColor: pickColor(u._id),
  };
}

export function useSearchMembers() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!keyword || keyword.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await api.get(
          `/users/search?keyword=${encodeURIComponent(keyword.trim())}`,
          { signal: controller.signal },
        );
        setResults((res.data?.data || []).map(mapUser));
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Advanced search failed:", err);
          setError(err.response?.data?.message || err.message || "Search failed");
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  return { keyword, setKeyword, results, setResults, isLoading, error };
}
