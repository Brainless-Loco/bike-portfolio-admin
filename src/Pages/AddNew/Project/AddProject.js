import { useEffect, useState } from "react";
import { Autocomplete, TextField, Box, Typography, Avatar, FormControl, InputLabel, Select, MenuItem, IconButton, Button } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../Utils/Firebase/Firebase";
import Swal from "sweetalert2";

const AddProject = () => {
  const [detailedProjects, setDetailedProjects] = useState([])
  const [projects, setProjects] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchProjects = async () => {
      const projectSnap = await getDocs(collection(db, "Projects"));
      setDetailedProjects(projectSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setProjects(projectSnap.docs.map(doc => doc.data().topic));
    };

    const fetchResearchers = async () => {
      const researcherSnap = await getDocs(collection(db, "researchers"));
      const tempResearchers = researcherSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // sort tempResearchers on name
      tempResearchers.sort((a, b) => a.name.localeCompare(b.name));
      setResearchers(tempResearchers);
    };

    fetchProjects();
    fetchResearchers();
  }, []);

  useEffect(() => {
    if (selectedTopic && projects.includes(selectedTopic)) {
      detailedProjects.forEach(p => {
        if (p.topic === selectedTopic) {
          setTopics(p.topics)
        }
      })
    }
  }, [selectedTopic, projects, detailedProjects])

  const handleAddTopic = () => {
    setTopics([...topics, { name: "", associatedMembers: [] }]);
  };

  const handleRemoveTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index, value) => {
    const updatedTopics = [...topics];
    updatedTopics[index].name = value;
    setTopics(updatedTopics);
  };

  const handleAddMember = (topicIndex) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].associatedMembers.push({ id: "", name: "", profilePhoto: "" });
    setTopics(updatedTopics);
  };

  const handleRemoveMember = (topicIndex, memberIndex) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].associatedMembers.splice(memberIndex, 1);
    setTopics(updatedTopics);
  };

  const handleMemberChange = (topicIndex, memberIndex, memberId) => {
    const member = researchers.find(res => res.id === memberId);
    if (!member) return;

    const updatedTopics = [...topics];
    updatedTopics[topicIndex].associatedMembers[memberIndex] = {
      id: member.id,
      name: member.name,
      profilePhoto: member.profilePhoto
    };
    setTopics(updatedTopics);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedTopic) return;


    const projectData = {
      topic: selectedTopic,
      topics: topics
    };
    let id = ""
    if (selectedTopic && projects.includes(selectedTopic)) {
      detailedProjects.forEach(p => {
        if (p.topic === selectedTopic) {
          id = p.id
        }
      })
      await updateDoc(doc(db, "Projects", id), projectData);
    }
    else {
      await addDoc(collection(db, "Projects"), projectData);
    }
    Swal.fire("Success", "New Topic Added!", "success").then(() => {
      // window.location.reload();
    });
    setSelectedTopic(null);
    setNewTopicDescription("");
    setTopics([]);
    setLoading(false)
  };



  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center min-h-[95vh] space-y-5">
      <Typography variant="h4">Add a Project Topic</Typography>
      <Autocomplete
        options={projects}
        freeSolo
        onInputChange={(_, newValue) => setSelectedTopic(newValue)}
        renderInput={(params) => <TextField {...params} label="Project Topic" fullWidth />}
      />
      {selectedTopic && !projects.includes(selectedTopic) && (
        <TextField
          label="Short Description"
          fullWidth
          className="mt-3"
          multiline
          rows={5}
          value={newTopicDescription}
          onChange={(e) => setNewTopicDescription(e.target.value)}
        />
      )}
      <Button variant="outlined" className="mt-3" onClick={handleAddTopic}>Add Topic</Button>
      {topics.map((topic, index) => (
        <Box key={index} className="mt-5 p-3 border rounded-lg">
          <TextField
            label="Topic Name"
            fullWidth
            value={topic.name}
            onChange={(e) => handleTopicChange(index, e.target.value)}
          />
          <Typography variant="h6" className="mt-3">Associated Members</Typography>
          {topic.associatedMembers.map((member, memberIndex) => (
            <Box key={memberIndex} display="flex" alignItems="center" gap={2} className="mb-3">
              <Avatar src={member.profilePhoto} alt={member.name} />
              <FormControl fullWidth>
                <InputLabel>Select Member</InputLabel>
                <Select
                  value={member.id}
                  onChange={(e) => handleMemberChange(index, memberIndex, e.target.value)}
                >
                  {researchers.map(res => (
                    <MenuItem key={res.id} value={res.id}>  {res.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton color="error" onClick={() => handleRemoveMember(index, memberIndex)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Box className="space-x-4">
            <Button variant="outlined" onClick={() => handleAddMember(index)}>Add Member</Button>
            <Button variant="contained" color="error" onClick={() => handleRemoveTopic(index)}>Remove Topic</Button>
          </Box>


        </Box>
      ))}
      <Box className="w-full pb-5">
        <Button variant="contained" color="primary" className=" mx-auto" onClick={handleSubmit}>{loading ? "Submitting Project" : "Submit Project"}</Button>

      </Box>


    </Box>
  );
};

export default AddProject;
