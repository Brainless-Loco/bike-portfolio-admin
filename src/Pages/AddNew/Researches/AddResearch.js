import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Avatar } from "@mui/material";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { app } from "./../../../Utils/Firebase/Firebase";
import SubmissionModal from "../../../Components/Modal/SubmissionModal";
import LongDescription from "../../../Components/Input/LongDescription";

const AddResearch = () => {
  const [title, setTitle] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [publisher, setPublisher] = useState({ title: "", externalLink: "" });
  const [otherInfo, setOtherInfo] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [researchers, setResearchers] = useState([]);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchResearchers = async () => {
      const researchersRef = collection(db, "researchers");
      const snapshot = await getDocs(researchersRef);
      const researcherList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        profilePhoto: doc.data().profilePhoto || "", // Default to empty string
      }));
      setResearchers(researcherList);
    };

    fetchResearchers();
    // eslint-disable-next-line
  }, []);

  const handleAddAuthor = () => {
    setAuthors((prev) => [...prev, { id: "", name: "", profilePhoto: "" }]);
  };

  // Handle author selection change
  const handleAuthorChange = (index, value) => {
    const selected = researchers.find((res) => res.id === value);
    if (selected) {
      setAuthors((prev) =>
        prev.map((author, i) =>
          i === index ? { ...author, id: selected.id, name: selected.name, profilePhoto: selected.profilePhoto } : author
        )
      );
    }
  };


  const updateAuthorGraph = async (authors) => {
    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];

      // Reference to the author's document in AuthorGraph
      const authorRef = doc(db, "AuthorGraph", author.id);
      const authorDoc = await getDoc(authorRef);

      // List of co-authors (excluding the current author)
      const coAuthors = authors
        .filter((a) => a.id !== author.id)
        .map((a) => ({ id: a.id, name: a.name, profilePhoto: a.profilePhoto }));

      if (authorDoc.exists()) {
        // If the document exists, update the co-authors list
        await updateDoc(authorRef, {
          coAuthors: arrayUnion(...coAuthors),
        });
      } else {
        // Create a new document if it doesn't exist
        await setDoc(authorRef, {
          name: author.name,
          profilePhoto: author.profilePhoto || "",
          coAuthors: coAuthors,
        });
      }
    }
  };


  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Convert authors to required format (ensure each has id, name, profilePhoto)
      const formattedAuthors = authors.map(author => ({
        id: author.id, // Ensure 'id' exists in authors array
        name: author.name,
        profilePhoto: author.profilePhoto || "", // Default empty if missing
      }));

      // Prepare new research document
      const newResearch = {
        title,
        authors: formattedAuthors, // Store with proper author structure
        publicationDate: Timestamp.fromDate(new Date(publicationDate)),
        publicationType,
        publisher,
        otherInfo,
        longDescription,
        createdAt: Timestamp.now(),
      };

      // Add research to Firestore
      // eslint-disable-next-line
      const researchRef = await addDoc(collection(db, "Researches"), newResearch);

      // Update the AuthorGraph collection with co-authorship relationships
      await updateAuthorGraph(formattedAuthors);

      alert("Research added successfully!");

      // Reset form fields
      setTitle("");
      setAuthors([]); // Reset authors list properly
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
      <Box className="my-5">
        <Typography variant="h6">Author List</Typography>
        {authors.map((author, index) => (
          <Box key={index} display="flex" alignItems="center" gap={2} className="mb-3">
            <Avatar src={author.profilePhoto} alt={author.name} />
            <FormControl fullWidth>
              <InputLabel id={`author-select-${index}`}>Select Author</InputLabel>
              <Select
                labelId={`author-select-${index}`}
                value={author.id}
                onChange={(e) => handleAuthorChange(index, e.target.value)}
              >
                {researchers.map((res) => (
                  <MenuItem key={res.id} value={res.id}>
                    {res.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
        <Button variant="outlined" onClick={handleAddAuthor}>
          Add Author
        </Button>
      </Box>

      {/* Date of Publication */}
      <Box className="mb-5 mt-10" >
        <Typography variant="h6">Date of Publication</Typography>
        <TextField type="date" slotProps={{ shrink: true }} value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} fullWidth />
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
