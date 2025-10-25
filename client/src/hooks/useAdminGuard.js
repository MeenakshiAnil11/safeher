import { useEffect, useState } from "react";

function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return; // bail on non-200s
        const data = await res.json();
        const role = data?.user?.role; // server returns { user: {..., role} }
        if (role === "admin") setIsAdmin(true);
      } catch (err) {
        console.error("Role check failed", err);
      }
    }
    checkRole();
  }, []);

  return isAdmin;
}

export default useAdminGuard;
