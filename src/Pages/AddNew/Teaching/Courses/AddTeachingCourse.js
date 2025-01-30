import React, { useState } from "react";
import { Box, Button, TextField, Typography, Autocomplete } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "../../../../Utils/Firebase/Firebase";
import SubmissionModal from "../../../../Components/Modal/SubmissionModal";
import ExternalLinks from "../../../../Components/Input/ExternalLinksInput";

const predefinedCourseTypes = ["Thesis", "Course", "Others"];

const AddTeachingCourse = () => {
    const [yearTitle, setYearTitle] = useState("");
    const [courseType, setCourseType] = useState("");
    const [courseTitle, setCourseTitle] = useState("");
    const [institution, setInstitution] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [externalLinks, setExternalLinks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [courseTypes, setCourseTypes] = useState(predefinedCourseTypes);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const db = getFirestore(app);

        try {
            const newTeachingCourse = {
                yearTitle,
                courseType,
                courseTitle,
                institution,
                shortDescription,
                externalLinks,
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(db, "TeachingCourses"), newTeachingCourse);

            alert("Teaching course added successfully!");
            setYearTitle("");
            setCourseType("");
            setCourseTitle("");
            setInstitution("");
            setShortDescription("");
            setExternalLinks([]);
        } catch (error) {
            console.error("Error adding teaching course:", error);
            alert("An error occurred while adding the teaching course.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLinksChange = (newLinks) => {
        setExternalLinks(newLinks);
    };

    return (
        <Box className="row mx-10 d-flex justify-content-center align-items-center">
            <Typography variant="h3">Add Teaching Course</Typography>

            {/* Year Title */}
            <Box className="my-5">
                <TextField
                    label="Year Title"
                    value={yearTitle}
                    onChange={(e) => setYearTitle(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="mb-4"
                />
            </Box>


            {/* Course Type (Autocomplete - Add new if not exist) */}

            <Box className="my-5">
                <Autocomplete
                    freeSolo options={courseTypes} value={courseType}
                    onChange={(event, newValue) => {
                        if (newValue && !courseTypes.includes(newValue)) {
                            setCourseTypes([...courseTypes, newValue]);
                        }
                        setCourseType(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Course Type" fullWidth variant="outlined" className="mb-4" />} />
            </Box>
            {/* Course Title */}

            <Box className="my-5">
                <TextField
                    label="Course Title" value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    fullWidth variant="outlined"
                />
            </Box>

            <Box className="my-5">
                {/* Institution */}
                <TextField
                    label="Institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="mb-4"
                />
            </Box>


            <Box className="my-5">
                {/* Short Description */}
                <TextField
                    label="Short Description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    className="mb-4"
                />
            </Box>
            <Box className="my-5">
                {/* External Links */}
                <ExternalLinks externalLinks={externalLinks} onChange={handleLinksChange} />
            </Box>
            <Box className="my-5">
                {/* Submit Button */}
                <Box className="text-center my-5">
                    <Button variant="contained" sx={{ width: "50%" }} onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>

            {/* Submission Modal */}
            <SubmissionModal open={isSubmitting} />
        </Box>
    );
};

export default AddTeachingCourse;
