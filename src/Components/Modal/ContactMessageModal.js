import React from "react";
import Modal from "@mui/material/Modal"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"

const ContactMessageModal = ({ open, handleClose, message }) => {
    if (!message) return null;

    return (
        <Modal open={open} onClose={handleClose} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box sx={{ bgcolor: "white", p: 3, width: "50%", borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    {message.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Email: {message.email}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {message.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    Sent on: {new Date(message.createdAt.toMillis()).toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                    <Button onClick={handleClose} variant="contained">
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ContactMessageModal;
