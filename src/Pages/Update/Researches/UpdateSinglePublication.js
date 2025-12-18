import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { collection, getDoc, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../../Utils/Firebase/Firebase";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Swal from "sweetalert2";
import Editor from "../../../Components/QuillEditor/Editor";
import { Delete } from "@mui/icons-material";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const UpdateSinglePublication = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Check if we're in view mode
    const isViewMode = new URLSearchParams(location.search).get("mode") === "view";
    
    const [publication, setPublication] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);
    const [updating, setUpdating] = useState(false);
    const [researchers, setResearchers] = useState([]);


    useAuthRedirect();

    useEffect(() => {
        const fetchPublication = async () => {
            if (!publication) {
                const docRef = doc(db, "Researches", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPublication({ id: docSnap.id, ...docSnap.data() });
                }
            }
            setLoading(false);
        };

        fetchPublication();
    }, [id, publication]);

    useEffect(() => {
        const fetchResearchers = async () => {
            const querySnapshot = await getDocs(collection(db, "researchers"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setResearchers(data);
        };

        fetchResearchers();
    }, []);

    if (loading) return <CircularProgress className="m-auto" />;
    if (!publication) return <Typography>No Publication Found</Typography>;

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await updateDoc(doc(db, "Researches", publication.id), publication);
            Swal.fire("Success!", "Publication was updated successfully!", "success");
            navigate("/publications");
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire("Error", "Failed to update publication.", "error");
        }
        setUpdating(false);
    };

    const handleChange = (e) => setPublication({ ...publication, [e.target.name]: e.target.value });

    const handleAuthorChange = (index, newId) => {
        const selectedAuthor = researchers.find(res => res.id === newId);
        const newAuthors = [...publication.authors];
        newAuthors[index] = { id: newId, name: selectedAuthor.name, profilePhoto: selectedAuthor.profilePhoto };
        setPublication({ ...publication, authors: newAuthors });
    };

    const handleAddAuthor = () => setPublication({ ...publication, authors: [...publication.authors, { id: "", name: "", profilePhoto: "" }] });

    const handleRemoveAuthor = (index) => {
        const newAuthors = publication.authors.filter((_, i) => i !== index);
        setPublication({ ...publication, authors: newAuthors });
    };

    return (
        <Box className="p-4 space-y-4">
            <Typography variant="h4" mb={3}>{isViewMode ? "View Publication" : "Update Publication"}</Typography>

            <TextField 
              label="Title" 
              fullWidth 
              disabled={isViewMode}
              name="title" 
              value={publication.title} 
              onChange={handleChange} 
              className="mb-3" 
            />
            <TextField 
              label="Publisher Title" 
              fullWidth 
              disabled={isViewMode}
              name="publisher.title" 
              value={publication.publisher.title} 
              onChange={handleChange} 
              className="mb-3" 
            />
            <TextField 
              label="External Link" 
              fullWidth 
              disabled={isViewMode}
              name="publisher.externalLink" 
              value={publication.publisher.externalLink} 
              onChange={handleChange} 
              className="mb-3" 
            />

            <FormControl fullWidth className="mb-3" disabled={isViewMode}>
                <InputLabel>Publication Type</InputLabel>
                <Select name="publicationType" value={publication.publicationType} onChange={handleChange}>
                    {["Journal", "Conference", "Book", "Book (Chapters)", "Thesis", "Others"].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Publication Date"
                type="date"
                fullWidth
                disabled={isViewMode}
                name="publicationDate"
                value={
                    publication.publicationDate
                        ? new Date(
                            typeof publication.publicationDate === "string"
                                ? publication.publicationDate
                                : publication.publicationDate.seconds
                                    ? publication.publicationDate.seconds * 1000
                                    : publication.publicationDate
                        )
                            .toISOString()
                            .split("T")[0]
                        : ""
                }
                onChange={(e) =>
                    setPublication({
                        ...publication,
                        publicationDate: new Date(e.target.value).getTime(),
                    })
                }
            />

            <TextField
                label="Other Info"
                fullWidth
                disabled={isViewMode}
                multiline
                name="otherInfo"
                value={publication.otherInfo}
                onChange={handleChange}
                className="mb-3"
            />

            <Box className="my-5">
                <Typography variant="h6">Author List</Typography>
                {publication.authors.map((author, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2} className="mb-3">
                        <Avatar src={author.profilePhoto} alt={author.name} />
                        <FormControl fullWidth disabled={isViewMode}>
                            <InputLabel>Select Author</InputLabel>
                            <Select value={author.id} onChange={(e) => handleAuthorChange(index, e.target.value)}>
                                {researchers.map((res) => <MenuItem key={res.id} value={res.id}>{res.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {!isViewMode && (
                          <IconButton color="error" onClick={() => handleRemoveAuthor(index)}>
                              <Delete />
                          </IconButton>
                        )}
                    </Box>
                ))}
                {!isViewMode && (
                  <Button variant="outlined" onClick={handleAddAuthor}>Add Author</Button>
                )}
            </Box>

            <Editor value={publication.longDescription} editorTitle="Publication Details" updateHTMLContent={(val) => setPublication({ ...publication, longDescription: val })} readOnly={isViewMode} />

            {!isViewMode && (
              <Button variant="contained" fullWidth onClick={handleUpdate} disabled={updating}>
                  {updating ? <CircularProgress size={24} /> : "Update"}
              </Button>
            )}
        </Box>
    );
};

export default UpdateSinglePublication;
