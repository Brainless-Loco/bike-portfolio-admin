import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "../../../Utils/Firebase/Firebase";
import Editor from "../../../Components/QuillEditor/Editor";
import LabelsInput from "../../../Components/Input/LabelsInput";

const AddDataset = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState([]);
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !link.trim()) {
      alert("Title and Link are required!");
      return;
    }

    setIsSubmitting(true);
    const db = getFirestore(app);

    try {
      const newDataset = {
        title,
        description,
        link,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "Datasets"), newDataset);

      alert("Dataset added successfully!");
      setTitle("");
      setDescription("");
      setLink("");
    } catch (error) {
      console.error("Error adding dataset:", error);
      alert("An error occurred while adding the dataset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Add New Dataset
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Box my={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Box>

        <Editor editorTitle="Description" updateHTMLContent={setDescription} value={description} />

        <Box my={3}>
          <TextField
            label="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Box>

        <LabelsInput labels={labels} label={"Add Labels"} onChange={(e) => setLabels(e.target.value)} />

        <Box my={5} textAlign="center">
          <Button
            variant="contained"
            sx={{ width: "50%" }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddDataset;
