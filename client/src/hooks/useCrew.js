import { useState, useEffect } from "react";
import api from "../utils/api";

export function useCrew() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await api.get("/crew");
        const crewData = response.data?.data || response.data || [];

        const formattedTeam = crewData.map((member) => ({
          id: member._id || member.id,
          name: member.name || "Unknown Member",
          role: member.role || member.position || "Member",
          description: member.description || member.bio || "No description provided.",
          image: member.image || "/images/avatar.jpg",
          socials: {
            linkedin: member.socials?.linkedin || member.linkedin || null,
            email: member.socials?.email || member.email || null,
            website: member.socials?.website || member.website || null,
          },
        }));

        setTeam(formattedTeam);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrew();
  }, []);

  return { team, isLoading };
}
