import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";

const ActivityCard = ({ activity, onDelete, viewOnly = false }) => {
    const navigate = useNavigate();

    return (
        <Box key={activity.id} p={2} mb={2} border="1px solid #ccc" borderRadius={2} boxShadow={1} >
            <Typography variant="h6"> {activity.title} </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {activity.activityDate?.seconds
                    ? new Date(activity.activityDate.seconds * 1000).toLocaleDateString("en-GB")
                    : ""}
            </Typography>

            <Box my={1}>
                {activity.labels?.map((label, idx) => (
                    <Chip color="primary" variant="outlined" key={idx} label={label} sx={{ mr: 1 }} />
                ))}
            </Box>

            <Box display="flex" gap={2}>
                <Button variant="contained" color="primary"
                    onClick={() => navigate(`/update/activities/${activity.id}${viewOnly ? "?mode=view" : ""}`)} >
                    {viewOnly ? "View" : "Update"}
                </Button>

                {!viewOnly && (
                    <Button variant="contained" color="error" onClick={() => onDelete(activity.id)} >
                        Delete
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ActivityCard;
