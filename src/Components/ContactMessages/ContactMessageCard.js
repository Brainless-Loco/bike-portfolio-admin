import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const ContactMessageCard = ({ message, onView, onDelete }) => {
    return (
        <Card sx={{ marginBottom: "15px", boxShadow: 3 }} className="min-w-[30%] max-w-[50%]">
            <CardContent>
                <Typography variant="h6" lineHeight={1.1}>{message.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {message.message.slice(0, 50)}...
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {new Date(message.createdAt.toMillis()).toLocaleDateString("en-US")}
                </Typography>
                <Box sx={{ marginTop: 1 }}>
                    <Button variant="outlined" onClick={() => onView(message)} sx={{ marginRight: 1 }}>
                        View
                    </Button>
                    <Button variant="contained" color="error" onClick={() => onDelete(message.id)}>
                        Delete
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ContactMessageCard;
