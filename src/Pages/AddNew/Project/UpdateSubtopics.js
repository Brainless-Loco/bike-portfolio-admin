import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Box, TextField, Button, Autocomplete, Typography } from "@mui/material";
import Swal from "sweetalert2";
import { db } from "../../../Utils/Firebase/Firebase";
import Editor from "../../../Components/QuillEditor/Editor";
import MemberList from "../../../Components/Projects/MemberList";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const UpdateSubtopics = () => {
    const { id } = useParams(); // Project ID from URL
    const [subtopics, setSubtopics] = useState([]);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [subtopicTitle, setSubtopicTitle] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState([]);
    
    useAuthRedirect()

    useEffect(() => {
        const fetchSubtopics = async () => {
            const querySnapshot = await getDocs(collection(db, `Projects/${id}/SubTopics`));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSubtopics(data);
        };

        fetchSubtopics();
    }, [id]);

    const handleSelectSubtopic = (_, value) => {
        setSelectedSubtopic(value);
        setSubtopicTitle(value?.subtopic_title || "");
        setDescription(value?.description || "");
        setMembers(value?.associated_members || []);
    };

    const handleAddSubtopic = async () => {
        if (!subtopicTitle.trim() || !description.trim()) return;

        Swal.fire({
            title: "Add Subtopic",
            text: "Are you sure you want to add this subtopic?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Add",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const docRef = await addDoc(collection(db, `Projects/${id}/SubTopics`), {
                    subtopic_title: subtopicTitle,
                    description,
                    associated_members: members,
                });

                setSubtopics([...subtopics, { id: docRef.id, subtopic_title: subtopicTitle, description, associated_members: members }]);
                setSelectedSubtopic(null);
                setSubtopicTitle("");
                setDescription("");
                setMembers([]);

                Swal.fire("Success", "Subtopic added successfully!", "success");
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        });
    };

    const handleUpdateSubtopic = async () => {
        if (!selectedSubtopic?.id || !subtopicTitle.trim() || !description.trim()) return;

        Swal.fire({
            title: "Update Subtopic",
            text: "Are you sure you want to update this subtopic?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Update",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                await updateDoc(doc(db, `Projects/${id}/SubTopics`, selectedSubtopic.id), {
                    subtopic_title: subtopicTitle,
                    description,
                    associated_members: members,
                });

                setSubtopics(
                    subtopics.map((s) =>
                        s.id === selectedSubtopic.id ? { ...s, subtopic_title: subtopicTitle, description, associated_members: members } : s
                    )
                );

                Swal.fire("Success", "Subtopic updated successfully!", "success");
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        });
    };

    const handleDeleteSubtopic = async () => {
        if (!selectedSubtopic?.id) return;

        Swal.fire({
            title: "Delete Subtopic",
            text: "Are you sure you want to delete this subtopic?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                await deleteDoc(doc(db, `Projects/${id}/SubTopics`, selectedSubtopic.id));

                setSubtopics(subtopics.filter((s) => s.id !== selectedSubtopic.id));
                setSelectedSubtopic(null);
                setSubtopicTitle("");
                setDescription("");
                setMembers([]);

                Swal.fire("Deleted", "Subtopic has been deleted!", "success");
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        });
    };

    return (
        <Box className="w-full px-5 py-5 ">
            <Box className="space-y-4 rounded shadow p-3">
                <Typography variant="h3">Add/Update Subtopics</Typography>
                <Autocomplete
                    options={subtopics}
                    getOptionLabel={(option) => option.subtopic_title}
                    freeSolo
                    onInputChange={(_, value) => setSubtopicTitle(value)}
                    onChange={handleSelectSubtopic}
                    renderInput={(params) => <TextField {...params} label="Subtopic Title" fullWidth />}
                />

                <Editor editorTitle="Description" value={description} updateHTMLContent={setDescription} />

                <MemberList members={members} setMembers={setMembers} />

                <Box className="flex justify-around w-full mt-4">
                    {!selectedSubtopic?.id ? (
                        <Button variant="contained" color="primary" onClick={handleAddSubtopic} disabled={!subtopicTitle || !description}>
                            Add Subtopic
                        </Button>
                    ) : (
                        <>
                            <Button variant="contained" className="w-[35%]" color="primary" onClick={handleUpdateSubtopic} disabled={!subtopicTitle || !description}>
                                Update Subtopic
                            </Button>
                            <Button variant="contained" className="w-[35%]" color="error" onClick={handleDeleteSubtopic}>
                                Delete Subtopic
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

        </Box>
    );
};

export default UpdateSubtopics;
