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

const ViewPublicationsList = () => {
    const [publications, setPublications] = useState([]);
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    useAuthRedirect();

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Researches"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter based on user's access to specific publications
                const user = getCurrentUser();
                let accessiblePublications = data;
                
                if (user && !user.isSuperAdmin) {
                    // Filter to only publications the user has read access to
                    accessiblePublications = data.filter(pub => {
                        return hasAnyAccess(RESOURCE_TYPES.PUBLICATIONS, "read");
                    });
                }

                // Sort by publicationDate descending
                accessiblePublications.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

                setPublications(accessiblePublications);
                setFilteredPublications(accessiblePublications);
            } catch (error) {
                console.error("Error fetching publications:", error);
            }
            setLoading(false);
        };

        fetchPublications();
    }, []);

    // Handle search filter
    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredPublications(
            publications.filter(
                (pub) =>
                    pub.title.toLowerCase().includes(lowerSearch) ||
                    pub.publisher?.title?.toLowerCase().includes(lowerSearch) ||
                    pub.publicationType.toLowerCase().includes(lowerSearch)
            )
        );
    }, [search, publications]);

    if (loading) return <CircularProgress className="m-auto" />;

    return (
        <Box mb={2} py={2} className="bg-gray-100 p-4 rounded-lg min-h-[95vh]">
            <Typography variant="h4" textAlign="center" mb={2}>
                View Research Publications
            </Typography>

            {/* Search Input */}
            <FormControl fullWidth>
                <TextField
                    label="Search by Title, Publisher, or Type"
                    fullWidth
                    disabled
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </FormControl>

            {/* Publications List - Read Only */}
            <Box className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                {filteredPublications.map((pub) => (
                    <Card key={pub.id} className="shadow-lg rounded-lg">
                        <CardContent>
                            <Typography variant="h6" className="font-bold mb-2">
                                {pub.title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-700 mb-2">
                                <strong>Type:</strong> {pub.publicationType}
                            </Typography>
                            {pub.publisher?.title && (
                                <Typography variant="body2" className="text-gray-600">
                                    <strong>Publisher:</strong> {pub.publisher.title}
                                </Typography>
                            )}
                            {pub.publicationDate && (
                                <Typography variant="caption" className="block text-gray-500 mt-2">
                                    Published: {new Date(pub.publicationDate).toLocaleDateString()}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {filteredPublications.length === 0 && (
                <Typography textAlign="center" className="mt-4">
                    No publications found.
                </Typography>
            )}
        </Box>
    );
};

export default ViewPublicationsList;
