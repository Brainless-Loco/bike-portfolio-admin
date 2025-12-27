import { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../Utils/Firebase/Firebase";
import CircularProgress from "@mui/material/CircularProgress";
import Swal from "sweetalert2";
import useAuthRedirect from "../../Auth/useAuthRedirect";

export default function SingleResearcher({ researcher, viewOnly = false }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    useAuthRedirect();

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: `Do you really want to delete ${researcher.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, "researchers", researcher.id));
                Swal.fire("Deleted!", `${researcher.name} has been removed.`, "success");
                navigate("/researchers");
            } catch (error) {
                Swal.fire("Error", "Failed to delete researcher.", "error");
                console.error("Delete error:", error);
            }
            setLoading(false);
        }
    };

    return (
        <Card key={researcher.id} className="shadow-lg rounded-lg p-2">
            <CardMedia component="img" sx={{ height: 200, objectFit: "contain" }} image={researcher.profilePhoto} alt={researcher.name} />
            <CardContent>
                <Typography variant="subtitle1" lineHeight={1} my={1}>
                    {researcher.name}
                </Typography>
                <Box className="flex gap-2">
                    {/* View/Update Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate(`/update/researchers/${researcher.id}${viewOnly ? "?mode=view" : ""}`, { state: researcher })}
                    >
                        {viewOnly ? "View" : "Update"}
                    </Button>

                    {/* Delete Button - Hidden in view mode */}
                    {!viewOnly && (
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Delete"}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
