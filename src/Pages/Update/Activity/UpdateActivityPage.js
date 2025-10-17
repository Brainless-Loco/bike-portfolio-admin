import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from "sweetalert2";
import { db } from "../../../Utils/Firebase/Firebase";
import LabelsInput from "../../../Components/Input/LabelsInput";
import ExternalLinks from "../../../Components/Input/ExternalLinksInput";
import ShortDescription from "../../../Components/Input/ShortDescription";
import Editor from "../../../Components/QuillEditor/Editor";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const UpdateActivityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [labels, setLabels] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [activityDate, setActivityDate] = useState("");


  useAuthRedirect()

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const docRef = doc(db, "Activities", id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
          Swal.fire("Error", "Activity not found", "error");
          navigate("/manage-activities");
          return;
        }
        const data = snapshot.data();
        setTitle(data.title);
        setShortDescription(data.shortDescription || "");
        setLongDescription(data.longDescription || "");
        setLabels(data.labels || []);
        setExternalLinks(data.externalLinks || []);
        setActivityDate(
          new Date(data.activityDate.seconds * 1000).toISOString().split("T")[0]
        );
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id, navigate]);


  const handleUpdate = async () => {
    try {
      const updatedActivity = {
        title,
        shortDescription,
        longDescription,
        labels,
        externalLinks,
        activityDate: new Date(activityDate)
      };

      await updateDoc(doc(db, "Activities", id), updatedActivity);

      Swal.fire("Updated!", "Activity updated successfully", "success");
      navigate("/update/activities");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10} minHeight={"100vh"}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h3" mb={3} color="#0c2461">
        Update Activity
      </Typography>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="date"
        label="Activity Date"
        value={activityDate}
        onChange={(e) => setActivityDate(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <LabelsInput labels={labels} label="Labels" onChange={setLabels} />
      <ExternalLinks externalLinks={externalLinks} onChange={setExternalLinks} />
      <ShortDescription value={shortDescription} onChange={setShortDescription} />
       <Editor value={longDescription} editorTitle="Long Description" updateHTMLContent={(val) => setLongDescription(val)} />

      <Box textAlign="center" mt={3}>
        <Button variant="contained" sx={{ width: "50%" }} onClick={handleUpdate}>
          Update
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateActivityPage;
