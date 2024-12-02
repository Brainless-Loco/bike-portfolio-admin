import React, { useState} from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select'
import "quill/dist/quill.snow.css";
import Editor from "../../../Components/QuillEditor/Editor";
import { Helmet } from 'react-helmet-async';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storageBucket } from "../../../Utils/Firebase/Firebase";

const ResearcherProfileForm = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [broadDescription, setBroadDescription] = useState("");

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };


  const handleSubmit = async () => {
    if (!profilePhoto) {
      alert("Please upload a profile photo.");
      return;
    }
  
    const db = getFirestore();
    const storage = getStorage();
  
    try {
      // 1. Upload profile photo to Firebase Storage
      const uniqueImageName = `images/researchers/image-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.jpg`;
      const storageRef = ref(storage, uniqueImageName);
  
      // Convert the uploaded image to a Blob
      const photoBlob = await fetch(profilePhoto).then((res) => res.blob());
  
      // Upload the photo
      await uploadBytes(storageRef, photoBlob);
  
      // Get the photo's download URL
      const storageUrl = await getDownloadURL(storageRef);
  
      // 2. Save researcher details in Firestore
      const researcherData = {
        name,
        position,
        educationLevel,
        shortDescription,
        broadDescription, // HTML format is fine for Firestore
        profilePhoto: storageUrl,
      };
  
      await addDoc(collection(db, "researchers"), researcherData);
  
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  

  return (
    <Box className="mx-8 mb-5 p-5 bg-slate-300 text-center rounded shadow flex flex-col flex-wrap justify-center items-center">
       <Helmet>
        <title>Add New Researcher | BIKE</title>
      </Helmet>
      {/* Profile Photo */}
      <Box className="text-center mb-4">
        <Avatar
          src={profilePhoto}
          sx={{ width: 150, height: 150, margin: "0 auto", backgroundColor: "#e0e0e0", mb: 2 }}
        >
          {!profilePhoto && "No Photo"}
        </Avatar>
        <Button
          variant="contained"
          component="label"
          color="primary"
        >
          Upload Photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
        </Button>
      </Box>

      {/* Researcher Name */}
      <TextField
        label="Researcher Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        variant="outlined"
        margin="normal"
        className="bg-slate-100 w-2/4"
      />

      {/* Position */}
      <TextField
        label="Position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        variant="outlined"
        margin="normal"
        className="bg-slate-100 w-2/4"
      />

      {/* Education Level */}
      <FormControl margin="normal" 
        className="bg-slate-100 w-2/4">
        <InputLabel>Current Education Level</InputLabel>
        <Select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          label="Current Education Level"
        >
          {["BSc Student", "MS Student", "PhD Student", "Teacher", "Others"].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Short Description */}
      <TextField
        label="Short Description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        multiline
        rows={4}
        variant="outlined"
        margin="normal"
        helperText={`${shortDescription.length}/100 characters`}
        className="bg-slate-100 w-3/4"
      />

      {/* Broad Description */}
      <Box className="w-4/5">
        <Editor editorTitle={"Broad Description"} updateHTMLContent={setBroadDescription} />

      </Box>
      {/* <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Broad Description
        </Typography>
        <Box
          id="broad-description-editor"
          sx={{
            border: "1px solid #c4c4c4",
            borderRadius: 1,
            minHeight: 300,
            backgroundColor: "#fff",
          }}
        />
      </Box> */}

      {/* Submit Button */}
      <Box className="text-center mt-7 w-full">
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          className="mt-5 mx-auto w-[50%]"
        >
          Submit
        </Button>

      </Box>
    </Box>
  );
};

export default ResearcherProfileForm;
