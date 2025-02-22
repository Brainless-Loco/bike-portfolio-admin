import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        const authInfo = JSON.parse(localStorage.getItem("adminLogin"));

        if (!authInfo) {
            navigate("/"); // Redirect if no auth info
        }
    }, [navigate]);
}
