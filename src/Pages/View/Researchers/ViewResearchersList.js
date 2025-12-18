import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";
import { db } from "../../../Utils/Firebase/Firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { getCurrentUser, hasAnyAccess, RESOURCE_TYPES } from "../../../Utils/RBAC/rbacUtils";

const ViewResearchersList = () => {
    const [researchers, setResearchers] = useState([]);
    const [filteredResearchers, setFilteredResearchers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useAuthRedirect();

    useEffect(() => {
        const fetchResearchers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "researchers"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter based on user's access to specific researchers
                const user = getCurrentUser();
                let accessibleResearchers = data;
                
                if (user && !user.isSuperAdmin) {
                    // Filter to only researchers the user has read access to
                    accessibleResearchers = data.filter(researcher => {
                        return hasAnyAccess(RESOURCE_TYPES.RESEARCHERS, "read");
                    });
                }

                // Sort by isFormer (false first, then true), then by name
                accessibleResearchers.sort((a, b) => {
                    if (a.isFormer === b.isFormer) {
                        return a.name.localeCompare(b.name);
                    }
                    return a.isFormer ? 1 : -1;
                });

                setResearchers(accessibleResearchers);
                setFilteredResearchers(accessibleResearchers);
            } catch (error) {
                console.error("Error fetching researchers:", error);
            }
            setLoading(false);
        };

        fetchResearchers();
    }, []);

    // Filter researchers when searchQuery changes
    useEffect(() => {
        const filtered = researchers.filter(({ name, position, educationLevel }) =>
            [name, position, educationLevel]
                .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredResearchers(filtered);
    }, [searchQuery, researchers]);

    if (loading) return <CircularProgress className="m-auto" />;

    return (
        <Box mb={2} py={2} className="bg-gray-100 p-4 rounded-lg min-h-[95vh]">
            <Typography variant="h4" textAlign="center" mb={2}>
                View Team Members
            </Typography>

            {/* Search Box */}
            <Box className="flex justify-center mb-4">
                <TextField
                    label="Search by Name, Position, or Education Level"
                    variant="outlined"
                    fullWidth
                    disabled
                    className="w-full md:w-1/2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            {/* Researchers List - Read Only */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 p-4 bg-slate-300 rounded-lg">
                {filteredResearchers.length > 0 ? (
                    filteredResearchers.map((researcher) => (
                        <Card key={researcher.id} className="shadow-lg rounded-lg p-2">
                            <CardMedia 
                                component="img" 
                                sx={{ height: 200, objectFit: "contain" }} 
                                image={researcher.profilePhoto} 
                                alt={researcher.name} 
                            />
                            <CardContent>
                                <Typography variant="subtitle1" lineHeight={1} my={1}>
                                    {researcher.name}
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                    {researcher.position}
                                </Typography>
                                <Typography variant="caption" className="block text-gray-500">
                                    {researcher.educationLevel}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography textAlign="center" className="col-span-full">
                        No researchers found.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default ViewResearchersList;
