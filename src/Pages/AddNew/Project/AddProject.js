import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { db } from "../../../Utils/Firebase/Firebase";
import Editor from "../../../Components/QuillEditor/Editor";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { Helmet } from "react-helmet-async";
import MemberList from "../../../Components/Projects/MemberList";

const AddProjects = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [members, setMembers] = useState([]);

  useAuthRedirect()

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      const querySnapshot = await getDocs(collection(db, "Projects"));
      const topicData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopics(topicData);
    };

    fetchTopics();
  }, []);

  const handleSelectTopic = (_, value) => {
    setSelectedTopic(value);
    setShortDescription(value?.short_description || "");
    setNewTopic(value?.topic_title || "");
    setMembers(value?.associated_members || [])
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim() || !shortDescription.trim()) return;

    Swal.fire({
      title: "Add New Topic",
      text: "Are you sure you want to add this topic?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Add",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const docRef = await addDoc(collection(db, "Projects"), {
          topic_title: newTopic,
          short_description: shortDescription,
          associated_members: members,
        });

        setTopics([...topics, { id: docRef.id, topic_title: newTopic, short_description: shortDescription,
          associated_members: members,
         }]);
        setSelectedTopic(null);
        setNewTopic("");
        setMembers([])
        setShortDescription("");

        Swal.fire("Success", "Topic added successfully!", "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  };

  const handleUpdateTopic = async () => {
    if (!selectedTopic?.id || !newTopic.trim() || !shortDescription.trim()) return;

    Swal.fire({
      title: "Update Topic",
      text: "Are you sure you want to update this topic?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Update",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await updateDoc(doc(db, "Projects", selectedTopic.id), {
          topic_title: newTopic,
          short_description: shortDescription,
          associated_members: members,
        });

        setTopics(
          topics.map((t) =>
            t.id === selectedTopic.id ? { ...t, topic_title: newTopic, short_description: shortDescription, 
              associated_members: members,
             } : t
          )
        );

        Swal.fire("Success", "Topic updated successfully!", "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedTopic?.id) return;

    Swal.fire({
      title: "Delete Topic",
      text: "Are you sure you want to delete this topic?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await deleteDoc(doc(db, "Projects", selectedTopic.id));

        setTopics(topics.filter((t) => t.id !== selectedTopic.id));
        setSelectedTopic(null);
        setNewTopic("");
        setShortDescription("");

        Swal.fire("Deleted", "Project topic has been deleted!", "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  };

  return (
    <div className="w-full space-y-4 min-h-[95vh]">
      <Helmet>
        <title>Add/Update Project Topic Info - BIKE Lab</title>
        <meta name="description" content="Add/Update project topic info in the BIKE Lab" />
      </Helmet>
      <Box className=" mx-7 mb-2 shadow rounded p-5">
        <Typography variant="h3">Add/Update Project Topic Info</Typography>
        <Autocomplete
          options={topics}
          getOptionLabel={(option) => option.topic_title}
          freeSolo
          className="mt-5"
          onInputChange={(_, value) => setNewTopic(value)}
          onChange={handleSelectTopic}
          renderInput={(params) => <TextField {...params} label="Project Topic" fullWidth />}
        />

        <MemberList members={members} setMembers={setMembers} />

        <Editor editorTitle="Short Description" value={shortDescription} updateHTMLContent={setShortDescription} />

        
        <div className="flex justify-around w-full mt-4">
          {!selectedTopic?.id ? (
            <Button variant="contained" color="primary" onClick={handleAddTopic} disabled={!newTopic || !shortDescription}>
              Add Topic
            </Button>
          ) : (
            <>
              <Button className="w-[30%]"
                variant="contained"
                color="primary"
                onClick={() => navigate(`/update/subtopics/${selectedTopic.id}`)}
              >
                Update Topic List
              </Button>
              <Button className="w-[30%]" variant="contained" color="primary" onClick={handleUpdateTopic} disabled={!newTopic || !shortDescription}>
                Update Topic
              </Button>

              <Button className="w-[30%]" variant="contained" color="error" onClick={handleDelete}>
                Delete Topic
              </Button>
            </>
          )}
        </div>

      </Box>
    </div>
  );
};

export default AddProjects;
