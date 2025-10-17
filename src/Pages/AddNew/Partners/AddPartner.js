import React, { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "../../../Utils/Firebase/Firebase";
import SubmissionModal from "../../../Components/Modal/SubmissionModal";
import LongDescription from "../../../Components/Input/LongDescription";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const AddPartner = () => {
  const [partnerTitle, setPartnerTitle] = useState("");
  const [startDateOfPartnership, setStartDateOfPartnership] = useState("");
  const [endDateOfPartnership, setEndDateOfPartnership] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAuthRedirect();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const db = getFirestore(app);

    try {
      const newPartner = {
        partnerTitle,
        startDateOfPartnership,
        endDateOfPartnership,
        longDescription,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "Partners"), newPartner);

      alert("Partner added successfully!");
      setPartnerTitle("");
      setStartDateOfPartnership("");
      setEndDateOfPartnership("");
      setLongDescription("");
    } catch (error) {
      console.error("Error adding partner:", error);
      alert("An error occurred while adding the partner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center">
      <Typography variant="h3">Add Partner</Typography>

      {/* Partner Title */}
      <Box className="my-5">
        <TextField
          label="Partner Title"
          value={partnerTitle}
          onChange={(e) => setPartnerTitle(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Box>

      {/* Date of Partnership */}
      <Box className="my-5">
        <Typography variant="subtitle2">Start Date of Partnership</Typography>
        <TextField
          type="date"
          value={startDateOfPartnership}
          onChange={(e) => setStartDateOfPartnership(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Box>

      <Box className="my-5">
        <Typography variant="subtitle2">End Date of Partnership (If N/A, leave blank)</Typography>
        <TextField
          type="date"
          value={endDateOfPartnership}
          onChange={(e) => setEndDateOfPartnership(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Box>

      {/* Long Description (Editor) */}
      <Box className="my-5">
        <LongDescription value={longDescription} onChange={setLongDescription} />
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

export default AddPartner;
