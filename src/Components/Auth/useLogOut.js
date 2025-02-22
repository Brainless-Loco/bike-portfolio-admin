import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const useLogout = () => {
    const navigate = useNavigate();

    const logout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, log out",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("adminLogin");
                Swal.fire("Logged Out", "You have been logged out.", "success").then(() => {
                    navigate("/");
                });
            }
        });
    };

    return logout;
};

export default useLogout;
