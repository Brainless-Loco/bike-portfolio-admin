import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { db } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { getCurrentUser, hasAnyAccess, RESOURCE_TYPES } from "../../../Utils/RBAC/rbacUtils";

const ViewProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    useAuthRedirect();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Projects"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter based on user's access
                const user = getCurrentUser();
                let accessibleProjects = data;
                
                if (user && !user.isSuperAdmin) {
                    accessibleProjects = data.filter(project => {
                        return hasAnyAccess(RESOURCE_TYPES.PROJECTS, "read");
                    });
                }

                setProjects(accessibleProjects);
                setFilteredProjects(accessibleProjects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
            setLoading(false);
        };

        fetchProjects();
    }, []);

    // Handle search filter
    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredProjects(
            projects.filter(
                (project) =>
                    project.topic_title?.toLowerCase().includes(lowerSearch) ||
                    project.short_description?.toLowerCase().includes(lowerSearch)
            )
        );
    }, [search, projects]);

    if (loading) return <CircularProgress className="m-auto" />;

    return (
        <Box mb={2} py={2} className="bg-gray-100 p-4 rounded-lg min-h-[95vh]">
            <Typography variant="h4" textAlign="center" mb={2}>
                View Projects
            </Typography>

            {/* Search Input */}
            <FormControl fullWidth>
                <TextField
                    label="Search by Title or Description"
                    fullWidth
                    disabled
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </FormControl>

            {/* Projects List - Read Only */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {filteredProjects.map((project) => (
                    <Card key={project.id} className="shadow-lg rounded-lg">
                        <CardContent>
                            <Typography variant="h6" className="font-bold mb-2">
                                {project.topic_title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-700 mb-2">
                                {project.short_description}
                            </Typography>
                            {project.associated_members && project.associated_members.length > 0 && (
                                <Typography variant="caption" className="block text-gray-600 mt-2">
                                    <strong>Members:</strong> {project.associated_members.length}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {filteredProjects.length === 0 && (
                <Typography textAlign="center" className="mt-4">
                    No projects found.
                </Typography>
            )}
        </Box>
    );
};

export default ViewProjectsList;
