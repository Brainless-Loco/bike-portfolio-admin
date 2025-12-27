import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { db } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { getCurrentUser, hasAnyAccess, RESOURCE_TYPES } from "../../../Utils/RBAC/rbacUtils";

const ViewActivitiesList = () => {
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
                
                // Filter based on user's access to specific activities
                const user = getCurrentUser();
                let accessibleActivities = data;
                
                if (user && !user.isSuperAdmin) {
                    // Filter to only activities the user has read access to
                    accessibleActivities = data.filter(activity => {
                        return hasAnyAccess(RESOURCE_TYPES.ACTIVITIES, "read");
                    });
                }
                
                setActivities(accessibleActivities);
                setFilteredActivities(accessibleActivities);
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

    if (loading) return <CircularProgress className="m-auto" />;

    return (
        <Box mb={2} py={2} className="bg-gray-100 p-4 rounded-lg min-h-[95vh]">
            <Typography variant="h4" textAlign="center" mb={2}>
                View Activities
            </Typography>

            {/* Search Input */}
            <TextField
                label="Search by Title, Description, Label, or Date"
                fullWidth
                disabled
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
            />

            {/* Activities List - Read Only */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {filteredActivities.map((activity) => (
                    <Card key={activity.id} className="shadow-lg rounded-lg">
                        <CardContent>
                            <Typography variant="h6" className="font-bold mb-2">
                                {activity.title}
                            </Typography>
                            {activity.shortDescription && (
                                <Typography variant="body2" className="text-gray-700 mb-2">
                                    {activity.shortDescription}
                                </Typography>
                            )}
                            <Typography variant="caption" className="block text-gray-600 mb-2">
                                <strong>Date:</strong> {new Date(activity.activityDate).toLocaleDateString()}
                            </Typography>
                            {activity.labels && activity.labels.length > 0 && (
                                <Box className="flex flex-wrap gap-1 mt-2">
                                    {activity.labels.map((label, idx) => (
                                        <Typography 
                                            key={idx} 
                                            variant="caption" 
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                        >
                                            {label}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {filteredActivities.length === 0 && (
                <Typography textAlign="center" className="mt-4">
                    No activities found.
                </Typography>
            )}
        </Box>
    );
};

export default ViewActivitiesList;
