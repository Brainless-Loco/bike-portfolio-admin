import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../Utils/Firebase/Firebase";
import Swal from "sweetalert2";

export default function SinglePublication({ pub, onDelete }) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This publication will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "Researches", pub.id));
                    Swal.fire("Deleted!", "Publication has been removed.", "success");
                    onDelete(pub.id); // Remove from UI
                } catch (error) {
                    console.error("Error deleting:", error);
                    Swal.fire("Error", "Failed to delete publication.", "error");
                }
            }
        });
    };

    return (
        <Card key={pub.id} className="shadow-lg rounded-lg">
            <CardContent>
                <Typography variant="subtitle1" lineHeight={1.15}>{pub.title}</Typography>
                <Typography variant="body2" color="textSecondary">{pub.publisher.title}</Typography>
                <Typography variant="body2">{new Date(pub.publicationDate).toDateString()}</Typography>
                <Typography variant="body2" mb={2}>
                    <strong>Authors:</strong>{" "}
                    {pub.authors.map((author) => (
                        <a key={author.id} style={{ color: "blue" }} href={`https://web.bike-csecu.com/Team/${author.id}`} target="__blank" rel="noopener noreferrer">
                            {author.name} |
                        </a>
                    ))}
                </Typography>
            <Box className="space-y-3">
                <Button
                    variant="contained"
                    fullWidth
                    className="mt-2"
                    onClick={() => navigate(`/update/publications/${pub.id}`, { state: pub })}
                >
                    Update
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    className="mt-2"
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </Box>
            </CardContent>
        </Card>
    );
}
