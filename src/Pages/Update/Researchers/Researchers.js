import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";
import { db } from "../../../Utils/Firebase/Firebase";
import SingleResearcher from "../../../Components/Update/Researchers/SingleResearcher";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { hasAccess, isSuperAdmin, RESOURCE_TYPES } from "../../../Utils/RBAC/rbacUtils";

const UpdateResearchersList = ({ viewOnly = false }) => {
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
                let accessibleResearchers = data;
                
                if (!isSuperAdmin()) {
                    // Filter to only researchers the user has access to
                    const operation = viewOnly ? "read" : "update";
                    accessibleResearchers = data.filter(researcher => {
                        return hasAccess(RESOURCE_TYPES.RESEARCHERS, operation, researcher.id);
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
                setFilteredResearchers(accessibleResearchers); // Initialize filtered list
            } catch (error) {
                console.error("Error fetching researchers:", error);
            }
            setLoading(false);
        };

        fetchResearchers();
    }, [viewOnly]);

    // Filter researchers when searchQuery changes
    useEffect(() => {
        const filtered = researchers.filter(({ name, position, educationLevel }) =>
            [name, position, educationLevel]
                .some(field => (field || "").toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredResearchers(filtered);
    }, [searchQuery, researchers]);

    if (loading) return <CircularProgress className="m-auto" />;

    return (
        <Box mb={2} py={2} className="bg-gray-100 p-4 rounded-lg min-h-[95vh]">
            <Typography variant="h4" textAlign="center" mb={2}>
                {viewOnly ? "View Team Members" : "Update Team Members Info"}
            </Typography>

            {/* Search Box */}
            <Box className="flex justify-center mb-4">
                <TextField
                    label="Search by Name, Position, or Education Level"
                    variant="outlined"
                    fullWidth
                    className="w-full md:w-1/2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            {/* Researchers List */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 p-4 bg-slate-300 rounded-lg">
                {filteredResearchers.length > 0 ? (
                    filteredResearchers.map((researcher) => (
                        <SingleResearcher key={researcher.id} researcher={researcher} viewOnly={viewOnly} />
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

export default UpdateResearchersList;
