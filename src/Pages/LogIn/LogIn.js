import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Utils/Firebase/Firebase";
import Swal from "sweetalert2";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";

const LogIn = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ identifier: "", password: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem("adminLogin");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const expiry = new Date(parsedUser.expiry);
            if (expiry > new Date()) {
                navigate("/dashboard");
            } else {
                localStorage.removeItem("adminLogin"); // Remove expired login
            }
        }
    }, [navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (event) => {
        event.preventDefault(); // Prevents full page reload
        setLoading(true);
        try {
            const authDocRef = doc(db, "BasicInfo", "auth");
            const authDocSnap = await getDoc(authDocRef);

            if (authDocSnap.exists()) {
                const accounts = authDocSnap.data().accounts || [];
                const foundUser = accounts.find(
                    (acc) =>
                        (acc.email === credentials.identifier ||
                            acc.username === credentials.identifier ||
                            acc.phone === credentials.identifier) &&
                        acc.password === credentials.password
                );

                if (foundUser) {
                    // Set login session for 7 days
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 7);
                    localStorage.setItem(
                        "adminLogin",
                        JSON.stringify({ ...foundUser, expiry: expiryDate.toISOString() })
                    );

                    Swal.fire("Success", "Login successful!", "success").then(() => {
                        navigate("/dashboard");
                    });
                } else {
                    Swal.fire("Error", "Invalid credentials!", "error");
                }
            } else {
                Swal.fire("Error", "No authentication data found!", "error");
            }
        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire("Error", "Failed to log in!", "error");
        }
        setLoading(false);
    };

    return (
        <Box className="p-6 max-w-md mx-auto space-y-4 min-h-[95vh] mt-10">
            <Typography variant="h4" textAlign="center">Admin Login</Typography>
            <form onSubmit={handleLogin} className="space-y-5">
                <TextField
                    label="Email, Username, or Phone"
                    name="identifier"
                    fullWidth
                    value={credentials.identifier}
                    onChange={handleChange}
                    className="mb-3"
                />
                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    fullWidth
                    value={credentials.password}
                    onChange={handleChange}
                    className="mb-3"
                />

                <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Log In"}
                </Button>
            </form>
        </Box>
    );
};

export default LogIn;
