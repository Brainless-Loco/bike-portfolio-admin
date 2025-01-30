import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import LabelsInput from "../../../Components/Input/LabelsInput";
import ExternalLinks from "../../../Components/Input/ExternalLinksInput";
import ShortDescription from './ShortDescription';
import LongDescription from './LongDescription';
import SubmissionModal from './SubmissionModal';
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from './../../../Utils/Firebase/Firebase';
import {  DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from './../../../../node_modules/@mui/x-date-pickers/AdapterDayjs/AdapterDayjs';

const AddActivity = () => {
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labels, setLabels] = useState([])
  const [externalLinks, setExternalLinks] = useState([])
  const [activityDate, setActivityDate] = useState();
  
  
  
  const handleEffDateChange = (date) =>{
    setActivityDate(date.$d);
  }
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const db = getFirestore(app);
  
    try {
      // Creating the new activity object
      const newActivity = {
        title,
        activityDate,
        shortDescription,
        longDescription,
        labels,
        externalLinks,
        createdAt: Timestamp.now(), // Store the timestamp of creation
      };
  
      // Adding the document to Firestore
      await addDoc(collection(db, "Activities"), newActivity);
  
      // Success feedback
      alert("Activity added successfully!");
      
      // Reset form states after successful submission
      setTitle("");
      setShortDescription("");
      setLongDescription("");
      setLabels([]);
      setExternalLinks([]);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("An error occurred while adding the activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLabelsChange = (newLabels) => {
    setLabels(newLabels)
  };

  const handleLinksChange = (newLinks) => {
    setExternalLinks(newLinks)
  };
  // setIsSubmitting(false)

  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center">
        <Typography variant="h3">Add new Activity</Typography>
        <Box className="my-5">
          <TextField
              label={"Title"} value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth variant="outlined" className="mb-5" />

        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker onChange={handleEffDateChange}  value={activityDate} label="Date of Activity" />
          </LocalizationProvider>
      <LabelsInput labels={labels} label="Research Topics" onChange={handleLabelsChange} />
      <ExternalLinks externalLinks={externalLinks} onChange={handleLinksChange} />
      <ShortDescription value={shortDescription} onChange={setShortDescription} />
      <LongDescription onChange={setLongDescription} />
      <Box className="text-center my-5">
        <Button variant="contained" className="mx-auto" sx={{width:'50%'}} onClick={handleSubmit}>
          Submit
        </Button>

      </Box>

      <SubmissionModal open={isSubmitting} />
    </Box>
  );
};

export default AddActivity;
