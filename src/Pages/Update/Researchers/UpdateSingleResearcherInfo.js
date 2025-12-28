import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, } from "firebase/firestore";
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
import ResourceAccessGuard from "../../../Components/ResourceAccessGuard/ResourceAccessGuard";
import { db, storage } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import Swal from "sweetalert2";

const UpdateSingleResearcherInfo = () => {
    const { id } = useParams();
    const location = useLocation();
    
    // Check if we're in view mode
    const isViewMode = new URLSearchParams(location.search).get("mode") === "view";
    
    // const [loading, setLoading] = useState(false);
    const [researcher, setResearcher] = useState(location.state || null);
    const [newPhoto, setNewPhoto] = useState(null);
    const [description, setDescription] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useAuthRedirect();

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
        setIsUpdating(true);
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
            const updatedData = {
                ...researcher,
                broadDescription: description,
                profilePhoto: photoURL,
            };
            
            await updateDoc(docRef, updatedData);

            // Update local state immediately
            setResearcher(updatedData);
            setNewPhoto(null);
            setDescription(updatedData.broadDescription);

            Swal.fire("Success!", "All the information has been updated successfully.", "success");
        } catch (error) {
            Swal.fire("Error", "Failed to Update.", "error");
            console.error("Update failed:", error);
        }
        setIsUpdating(false);
    };

    if (!researcher) return <CircularProgress className="m-auto" />;

    return (
      <ResourceAccessGuard resource="researchers" operation={isViewMode ? "read" : "update"} resourceId={id}>
        <div className="w-full md:w-3/4 mx-auto p-6 space-y-4 my-4 bg-white shadow-lg rounded-lg">
            <Typography variant="h5">{isViewMode ? "View Info for " : "Update Info for "}"<i>{researcher.name}</i>"</Typography>

            {/* Profile Photo */}
            <CardMedia component="img" sx={{ objectFit: 'contain', height: '200px', mb: 2 }} image={newPhoto ? URL.createObjectURL(newPhoto) : researcher.profilePhoto} alt="Profile" />
            {/* Hidden File Input */}
            {!isViewMode && (
              <>
                <input
                    type="file"
                    accept="image/*"
                    id="upload-profile-photo"
                    style={{ display: "none" }}
                    onChange={(e) => setNewPhoto(e.target.files[0])}
                />
                {/* MUI Upload Button */}
                <label htmlFor="upload-profile-photo" className="w-full flex justify-center">
                    <Button
                        variant="contained"
                        component="span"
                        className="w-1/3 bg-cyan-500"
                        mt={2}
                    >
                        Upload New Photo
                    </Button>
                </label>
              </>
            )}

            {/* Name */}
            <TextField 
              label="Name" 
              fullWidth 
              disabled={isViewMode}
              value={researcher.name} 
              onChange={(e) => setResearcher({ ...researcher, name: e.target.value })} 
            />

            {/* Position */}
            <TextField 
              label="Position" 
              fullWidth 
              disabled={isViewMode}
              value={researcher.position} 
              onChange={(e) => setResearcher({ ...researcher, position: e.target.value })} 
            />

            {/* Education Level */}
            <TextField
                label="Education Level"
                fullWidth
                disabled={isViewMode}
                value={researcher.educationLevel || ""}
                onChange={(e) => setResearcher({ ...researcher, educationLevel: e.target.value })}
            />

            {/* Is Former */}
            <FormControl fullWidth disabled={isViewMode}>
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
                disabled={isViewMode}
                multiline
                rows={3}
                value={researcher.shortDescription}
                onChange={(e) => setResearcher({ ...researcher, shortDescription: e.target.value })}
            />

            {/* Broad Description (Editor) */}
            <Editor value={description} editorTitle="Directors Info" updateHTMLContent={setDescription} readOnly={isViewMode} />

            {/* Update Button */}
            {!isViewMode && (
              <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? <CircularProgress size={24} color="inherit" /> : "Update"}
              </Button>
            )}
        </div>
      </ResourceAccessGuard>
    );
};

export default UpdateSingleResearcherInfo;
