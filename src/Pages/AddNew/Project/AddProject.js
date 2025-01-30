import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "../../../Utils/Firebase/Firebase";
import ExternalLinks from "../../../Components/Input/ExternalLinksInput";
import LabelsInput from "../../../Components/Input/LabelsInput";
import LongDescription from "../../../Components/Input/LongDescription";
import SubmissionModal from './../../../Components/Modal/SubmissionModal';

const AddProject = () => {
  const [title, setTitle] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [labels, setLabels] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const db = getFirestore(app);

    try {
      const newProject = {
        title,
        longDescription,
        labels,
        externalLinks,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "Projects"), newProject);

      alert("Project added successfully!");
      setTitle("");
      setLongDescription("");
      setLabels([]);
      setExternalLinks([]);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("An error occurred while adding the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center">
      <Typography variant="h3">Add Project</Typography>

      {/* Project Title */}
      <Box className="my-5">
        <TextField
          label="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Box>

      {/* Long Description (Editor) */}
      <Box className="my-5">
        <LongDescription value={longDescription} onChange={setLongDescription} />
      </Box>

      {/* Labels (Dynamic Input) */}
      <Box className="my-5">
        <LabelsInput labels={labels} label="Labels" onChange={setLabels} />
      </Box>

      {/* External Links (Dynamic Input) */}
      <Box className="my-5">
        <ExternalLinks externalLinks={externalLinks} onChange={setExternalLinks} />
      </Box>

      {/* Submit Button */}
      <Box className="text-center my-5">
        <Button variant="contained" sx={{ width: "50%" }} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>

      {/* Submission Modal */}
      <SubmissionModal open={isSubmitting} />
    </Box>
  );
};

export default AddProject;
