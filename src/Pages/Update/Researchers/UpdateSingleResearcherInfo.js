import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Editor from "../../../Components/QuillEditor/Editor";
import { db, storage } from "../../../Utils/Firebase/Firebase";

const UpdateSingleResearcherInfo = () => {
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [researcher, setResearcher] = useState(location.state || null);
    const [newPhoto, setNewPhoto] = useState(null);
    const [description, setDescription] = useState("");



    useEffect(() => {
        if (!researcher) {
            const fetchResearcher = async () => {
                const docRef = doc(db, "researchers", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setResearcher(docSnap.data());
                    setDescription(docSnap.data().broadDescription || "");
                }
            };
            fetchResearcher();
        } else {
            setDescription(researcher.broadDescription || "");
        }
    }, [id, researcher]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "researchers", id);
            let photoURL = researcher.profilePhoto;

            // Upload new profile photo if selected
            if (newPhoto) {
                const photoRef = ref(storage, `images/researchers/${id}`);
                await uploadBytes(photoRef, newPhoto);
                photoURL = await getDownloadURL(photoRef);
            }

            // Update researcher data
            await updateDoc(docRef, {
                ...researcher,
                broadDescription: description,
                profilePhoto: photoURL,
            });

            alert("All the information has been updated successfully.")
            window.location.reload();

        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
    };

    if (!researcher) return <CircularProgress className="m-auto" />;

    return (
        // tailwind classes for w-full in small devices but screen w-3/4 in lg devices

        <div className="w-full md:w-3/4 mx-auto p-6 space-y-4 my-4 bg-white shadow-lg rounded-lg">
            <Typography variant="h5">Update Info for "<i>{researcher.name}</i>"</Typography>

            {/* Profile Photo */}
            <CardMedia component="img" sx={{ objectFit: 'contain', height: '200px', mb:2 }} image={newPhoto ? URL.createObjectURL(newPhoto) : researcher.profilePhoto} alt="Profile" />
            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                id="upload-profile-photo"
                style={{ display: "none" }}
                onChange={(e) => setNewPhoto(e.target.files[0])}
            />
            {/* MUI Upload Button */}
            <label htmlFor="upload-profile-photo">
                <Button
                    variant="contained"
                    component="span"
                    className="w-1/3"
                    mt={2}
                >
                    Upload New Photo
                </Button>
            </label>

            {/* Name */}
            <TextField label="Name" fullWidth value={researcher.name} onChange={(e) => setResearcher({ ...researcher, name: e.target.value })} />

            {/* Position */}
            <TextField label="Position" fullWidth value={researcher.position} onChange={(e) => setResearcher({ ...researcher, position: e.target.value })} />

            {/* Education Level */}
            <FormControl fullWidth>
                <InputLabel>Education Level?</InputLabel>
                <Select fullWidth value={researcher.educationLevel} onChange={(e) => setResearcher({ ...researcher, educationLevel: e.target.value })} label="Education Former?">
                    {["BSc Student", "MS Student", "PhD Student", "Teacher", "Others"].map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Is Former */}
            <FormControl fullWidth>
                <InputLabel>Is Former?</InputLabel>
                <Select fullWidth value={researcher.isFormer} onChange={(e) => setResearcher({ ...researcher, isFormer: e.target.value })} label="Is Former?">
                    <MenuItem value={true}>True</MenuItem>
                    <MenuItem value={false}>False</MenuItem>
                </Select>


            </FormControl>

            {/* Short Description */}
            <TextField
                label="Short Description"
                fullWidth
                multiline
                rows={3}
                value={researcher.shortDescription}
                onChange={(e) => setResearcher({ ...researcher, shortDescription: e.target.value })}
            />

            {/* Broad Description (Editor) */}
            <Editor value={description} editorTitle="Directors Info" updateHTMLContent={setDescription} />

            {/* Update Button */}
            <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
            </Button>
        </div>
    );
};

export default UpdateSingleResearcherInfo;
