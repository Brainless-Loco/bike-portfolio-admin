import React, { useState } from "react";
import { Box, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "./../../../Utils/Firebase/Firebase";
import SubmissionModal from "../../../Components/Modal/SubmissionModal";
import LongDescription from "../../../Components/Input/LongDescription";

const AddResearch = () => {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState([{ name: "", profileLink: "" }]);
  const [publicationDate, setPublicationDate] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [publisher, setPublisher] = useState({ title: "", externalLink: "" });
  const [otherInfo, setOtherInfo] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: "", profileLink: "" }]);
  };

  const handleAuthorChange = (index, field, value) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index][field] = value;
    setAuthors(updatedAuthors);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const db = getFirestore(app);

    try {
      const newResearch = {
        title,
        authors,
        publicationDate: Timestamp.fromDate(new Date(publicationDate)),
        publicationType,
        publisher,
        otherInfo,
        longDescription,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "Researches"), newResearch);

      alert("Research added successfully!");
      setTitle("");
      setAuthors([{ name: "", profileLink: "" }]);
      setPublicationDate("");
      setPublicationType("");
      setPublisher({ title: "", externalLink: "" });
      setOtherInfo("");
      setLongDescription("");
    } catch (error) {
      console.error("Error adding research:", error);
      alert("An error occurred while adding the research.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center">
      <Typography variant="h3">Add Research</Typography>

      {/* Title */}
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth variant="outlined" className="mb-4" />

      {/* Authors (Dynamic) */}
      <Typography variant="h6">Author List</Typography>
      {authors.map((author, index) => (
        <Box key={index} display="flex" gap={2} className="mb-3">
          <TextField label="Name" value={author.name} onChange={(e) => handleAuthorChange(index, "name", e.target.value)} fullWidth />
          <TextField label="Profile Link" value={author.profileLink} onChange={(e) => handleAuthorChange(index, "profileLink", e.target.value)} fullWidth />
        </Box>
      ))}
      <Button variant="outlined" onClick={handleAddAuthor}>Add Author</Button>

      {/* Date of Publication */}
      <Box  className="mb-5 mt-10" >

            <TextField type="date" label="Publication Date" InputLabelProps={{ shrink: true }} value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} fullWidth/>
      </Box>

      {/* Publication Type */}
      <FormControl fullWidth className="mb-6">
        <InputLabel>Publication Type</InputLabel>
        <Select value={publicationType} onChange={(e) => setPublicationType(e.target.value)}>
          {["Conference", "Journal", "Book", "Book (Chapters)", "Thesis", "Others"].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Publisher */}
      <Box className="my-5">
        <Typography variant="h6">Publisher</Typography>
        <Box display="flex" gap={2} className="mb-4">
            <TextField label="Title" value={publisher.title} onChange={(e) => setPublisher({ ...publisher, title: e.target.value })} fullWidth />
            <TextField label="External Link" value={publisher.externalLink} onChange={(e) => setPublisher({ ...publisher, externalLink: e.target.value })} fullWidth />
        </Box>
      </Box>
      

      {/* Other Info */}
      <TextField label="Other Info" value={otherInfo} onChange={(e) => setOtherInfo(e.target.value)} fullWidth multiline rows={3} className="mb-4" />

      {/* Long Description (Editor Component) */}
      <LongDescription onChange={setLongDescription} />

      {/* Submit Button */}
      <Box className="text-center my-5">
        <Button variant="contained" sx={{ width: "50%" }} onClick={handleSubmit}>Submit</Button>
      </Box>

      {/* Submission Modal */}
      <SubmissionModal open={isSubmitting} />
    </Box>
  );
};

export default AddResearch;
