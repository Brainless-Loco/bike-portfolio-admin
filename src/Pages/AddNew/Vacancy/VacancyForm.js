import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Swal from "sweetalert2";
import { db } from "../../../Utils/Firebase/Firebase";
import Editor from "../../../Components/QuillEditor/Editor";

const VacancyForm = () => {
    const [allVacancies, setAllVacancies] = useState([]);
    const [positionType, setPositionType] = useState("");
    const [positionName, setPositionName] = useState("");
    const [applicationDeadline, setApplicationDeadline] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [broadDescription, setBroadDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [totalVacancy, setTotalVacancy] = useState("");
    const [positionTypes, setPositionTypes] = useState([]);
    const [positionNames, setPositionNames] = useState([]);
    const [existingVacancyId, setExistingVacancyId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, "Vacancies"));
            let types = new Set();
            let vacancies = [];
    
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                types.add(data.position_type);
                vacancies.push({ id: doc.id, ...data });
            });
    
            setAllVacancies(vacancies);
            setPositionTypes(Array.from(types));
        };
    
        fetchData();
    }, []); // Fetch only once
    
    useEffect(() => {
        // Filter position names based on the selected positionType
        if (positionType) {
            const filteredNames = allVacancies
                .filter((vac) => vac.position_type === positionType)
                .map((vac) => vac.position_name);
            
            setPositionNames([...new Set(filteredNames)]); // Ensure unique names
        } else {
            setPositionNames([]);
        }
    }, [positionType, allVacancies]);
    
    useEffect(() => {
        // Find existing vacancy based on selected positionType & positionName
        const existingVacancy = allVacancies.find(
            (vac) => vac.position_type === positionType && vac.position_name === positionName
        );
    
        if (existingVacancy) {
            setExistingVacancyId(existingVacancy.id);
            setApplicationDeadline(existingVacancy.application_deadline);
            setShortDescription(existingVacancy.short_description);
            setBroadDescription(existingVacancy.broad_description);
            setRequirements(existingVacancy.requirements);
            setTotalVacancy(existingVacancy.total_vacancy);
        } else {
            setExistingVacancyId(null);
            setApplicationDeadline("");
            setShortDescription("");
            setBroadDescription("");
            setRequirements("");
            setTotalVacancy("");
        }
    }, [positionType, positionName, allVacancies]);    

    const handleDeleteVacancy = async () => {
        if (!existingVacancyId) {
            Swal.fire("Error", "No vacancy selected to delete.", "error");
            return;
        }
    
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "Vacancies", existingVacancyId));
                    Swal.fire("Deleted!", "The vacancy has been deleted.", "success");
    
                    // Update state after deletion
                    setAllVacancies((prevVacancies) => prevVacancies.filter(vac => vac.id !== existingVacancyId));
                    setExistingVacancyId(null);
                    setPositionName("");
                    setApplicationDeadline("");
                    setShortDescription("");
                    setBroadDescription("");
                    setRequirements("");
                    setTotalVacancy("");
                } catch (error) {
                    Swal.fire("Error", "Failed to delete vacancy.", "error");
                    console.error("Error deleting document:", error);
                }
            }
        });
    };
    

    const handleSubmit = async () => {
        if (!positionType || !positionName || !applicationDeadline || !shortDescription || !broadDescription || !requirements || !totalVacancy) {
            Swal.fire("Error", "All fields are required!", "error");
            return;
        }

        try {
            if (existingVacancyId) {
                // Update existing vacancy
                await updateDoc(doc(db, "Vacancies", existingVacancyId), {
                    position_type: positionType,
                    position_name: positionName,
                    application_deadline: applicationDeadline,
                    short_description: shortDescription,
                    broad_description: broadDescription,
                    requirements: requirements,
                    total_vacancy: parseInt(totalVacancy),
                });
                Swal.fire("Success", "Vacancy updated successfully!", "success");
            } else {
                // Create new vacancy
                await addDoc(collection(db, "Vacancies"), {
                    position_type: positionType,
                    position_name: positionName,
                    application_deadline: applicationDeadline,
                    short_description: shortDescription,
                    broad_description: broadDescription,
                    requirements: requirements,
                    total_vacancy: parseInt(totalVacancy),
                });
                Swal.fire("Success", "Vacancy added successfully!", "success");
            }

            // Reset Form
            setPositionType("");
            setPositionName("");
            setApplicationDeadline("");
            setShortDescription("");
            setBroadDescription("");
            setRequirements("");
            setTotalVacancy("");
            setExistingVacancyId(null);
        } catch (error) {
            Swal.fire("Error", "Something went wrong!", "error");
        }
    };


    return (
        <div className="p-10 min-h-[95vh] space-y-2">
            <Typography color="#0c2461" variant="h4" sx={{ fontWeight: "bold", mb: 3, borderBottom: "3px solid #0c2461", pb: 1 }}>
                Insert/Update Vacant Positions
            </Typography>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                {/* Position Type */}
                <Autocomplete
                    freeSolo
                    options={positionTypes}
                    value={positionType}
                    onInputChange={(e, newValue) => setPositionType(newValue)}
                    renderInput={(params) => <TextField {...params} label="Position Type" variant="outlined" />}
                />

                {/* Position Name */}
                <Autocomplete
                    freeSolo
                    options={positionNames}
                    value={positionName}
                    onInputChange={(e, newValue) => {
                        setPositionName(newValue)
                    }}
                    renderInput={(params) => <TextField {...params} label="Position Name" variant="outlined" />}
                />

                {/* Application Deadline */}
                <TextField
                    type="datetime-local"
                    label="Application Deadline"
                    variant="outlined"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    InputLabelProps={{ shrink: true }}  // ✅ Forces the label to stay on top
                />


                {/* Total Vacancy */}
                <TextField
                    type="number"
                    label="Total Vacancy"
                    variant="outlined"
                    value={totalVacancy}
                    onChange={(e) => setTotalVacancy(e.target.value)}
                />


            </Box>


            {/* Requirements */}
            <Editor id="requirements" editorTitle={"Requirements"} updateHTMLContent={setRequirements} value={requirements} />

            {/* Short Description */}
            <TextField
                label="Short Description"
                fullWidth
                minRows={5}
                variant="outlined"
                multiline
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
            />

            {/* Broad Description */}
            <Editor id="broad_desc" editorTitle={"Broad Description"} updateHTMLContent={setBroadDescription} value={broadDescription} />

            {/* Submit Button */}
            <Box className="w-full pt-10 flex justify-center flex-wrap gap-3">
                <Button
                    variant="contained"
                    color="primary"
                    className="w-[80%] h-12"
                    onClick={handleSubmit}
                >
                    {existingVacancyId ? "Update" : "Submit"}
                </Button>

                <Button
                    variant="contained"
                    color="error"
                    className="w-[80%] h-12"
                    onClick={handleDeleteVacancy}
                    sx={{display:existingVacancyId ?"block" :'none'}}
                >
                    Delete
                </Button>
            </Box>

        </div>
    );
};

export default VacancyForm;
