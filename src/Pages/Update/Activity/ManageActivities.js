import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from "sweetalert2";
import { db } from "../../../Utils/Firebase/Firebase";
import ActivityCard from "./ActivityCard";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const ManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useAuthRedirect();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const q = query(collection(db, "Activities"), orderBy("activityDate", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setActivities(data);
                setFilteredActivities(data);
            } catch (err) {
                console.error("Error fetching activities:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredActivities(activities);
            return;
        }
        const lower = search.toLowerCase();
        const filtered = activities.filter(
            (a) =>
                a.title.toLowerCase().includes(lower) ||
                a.shortDescription?.toLowerCase().includes(lower) ||
                a.labels?.some((label) => label.toLowerCase().includes(lower)) ||
                new Date(a.activityDate).toLocaleDateString().includes(lower)
        );
        setFilteredActivities(filtered);
    }, [search, activities]);

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Delete Activity?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                await deleteDoc(doc(db, "Activities", id));
                setActivities((prev) => prev.filter((a) => a.id !== id));
                setFilteredActivities((prev) => prev.filter((a) => a.id !== id));
                Swal.fire("Deleted!", "Activity removed successfully", "success");
            } catch (err) {
                Swal.fire("Error", err.message, "error");
            }
        });
    };

    return (
        <Box p={4}>
            <Typography variant="h3" color="#0c2461" mb={3}>
                Manage Activities
            </Typography>

            <TextField
                fullWidth
                label="Search Activities"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3 }}
            />

            {loading ? (
                <Box display="flex" justifyContent="center" my={5}>
                    <CircularProgress />
                </Box>
            ) : (
                filteredActivities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </Box>
    );
};

export default ManageActivities;
