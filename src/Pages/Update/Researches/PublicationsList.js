import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Box, Typography, TextField, FormControl } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { db } from "../../../Utils/Firebase/Firebase";
import SinglePublication from "../../../Components/Update/Publications/SinglePublication";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const PublicationsList = () => {
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

                // Sort by publicationDate descending
                data.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

                setPublications(data);
                setFilteredPublications(data);
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
                Update Research Publications
            </Typography>

            {/* Search Input */}
            <FormControl fullWidth>
                <TextField
                    label="Search by Title, Publisher, or Type"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </FormControl>
            {/* Publications List */}
            <Box className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                {filteredPublications.map((pub) => (
                    <SinglePublication pub={pub} />
                ))}
            </Box>
        </Box>
    );
};

export default PublicationsList;
