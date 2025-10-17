import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import LabelsInput from "../../../Components/Input/LabelsInput";
import ExternalLinks from "../../../Components/Input/ExternalLinksInput";
import ShortDescription from '../../../Components/Input/ShortDescription';
import SubmissionModal from '../../../Components/Modal/SubmissionModal';
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from './../../../Utils/Firebase/Firebase';
import LongDescription from "../../../Components/Input/LongDescription";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const AddActivity = () => {
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labels, setLabels] = useState([])
  const [externalLinks, setExternalLinks] = useState([])
  const [activityDate, setActivityDate] = useState();

  useAuthRedirect();



  const handleEffDateChange = (e) => {
    // console.log(Date(e))
    setActivityDate(new Date(e))
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
      window.location.reload();
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
      <FormControl sx={{width:'100%'}}>
        <FormLabel>Date of Activity</FormLabel>
        <TextField type="date" onChange={(e)=>{handleEffDateChange(e.target.value)}} style={{ width:'40%', marginBottom:'10px', border:'1px solid gray', borderRadius:'5px'}}/>

      </FormControl>
      <LabelsInput labels={labels} label="Research Topics" onChange={handleLabelsChange} />
      <ExternalLinks externalLinks={externalLinks} onChange={handleLinksChange} />
      <ShortDescription value={shortDescription} onChange={setShortDescription} />
      <LongDescription onChange={setLongDescription} />
      <Box className="text-center my-5">
        <Button variant="contained" className="mx-auto" sx={{ width: '50%' }} onClick={handleSubmit}>
          Submit
        </Button>

      </Box>

      <SubmissionModal open={isSubmitting} />
    </Box>
  );
};

export default AddActivity;
