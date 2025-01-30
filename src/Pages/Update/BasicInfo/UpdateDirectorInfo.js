import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { getFirestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { app } from "../../../Utils/Firebase/Firebase";
import Editor from "../../../Components/QuillEditor/Editor";

const UpdateDirectorInfo = () => {
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const db = getFirestore(app);

  // Fetch existing data
  useEffect(() => {
    const fetchDirectorInfo = async () => {
      try {
        const docRef = doc(db, "BasicInfo", "director-info");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDescription(docSnap.data().description || "");
        }
      } catch (error) {
        console.error("Error fetching director info:", error);
      }
    };
    fetchDirectorInfo();
  }, []);

  // Handle update
  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "BasicInfo", "director-info"), {
        description,
        updatedAt: Timestamp.now(),
      });
      alert("Director Info updated successfully!");
    } catch (error) {
      console.error("Error updating director info:", error);
      alert("An error occurred while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Typography variant="h3" className="mb-5">
        Update Director Info
      </Typography>
      <Box width={'85%'} minHeight={'100vh'}>
          <Editor value={description} editorTitle="Directors Info" updateHTMLContent={setDescription} />
      </Box>
    <Box className="my-6">
        <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={isSaving}
            sx={{ width: "200px", marginTop: "20px" }}
        >
            {isSaving ? "Saving..." : "Update"}
        </Button>
        
    </Box>
      
    </Box>
  );
};

export default UpdateDirectorInfo;
