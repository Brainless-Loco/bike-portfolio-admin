import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Swal from "sweetalert2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { db, storage } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const ApplicationsList = () => {
  const { vacancy_id } = useParams();
  const [applications, setApplications] = useState([]);
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const vacancyDoc = await getDocs(collection(db, `Vacancies`));
      const vacancy = vacancyDoc.docs.find((v) => v.id === vacancy_id);
      setVacancyTitle(vacancy?.data()?.position_name || "Vacancy");

      const snapshot = await getDocs(collection(db, `Vacancies/${vacancy_id}/Applications`));
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(appList.sort((a, b) => b.timestamp - a.timestamp));
    };

    fetchData();
  }, [vacancy_id]);

  const deleteApplication = async (applicant_id, documents) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the application and uploaded documents!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, `Vacancies/${vacancy_id}/Applications`, applicant_id));

          for (const filePath of Object.values(documents)) {
            await deleteObject(ref(storage, filePath));
          }

          setApplications(applications.filter((app) => app.id !== applicant_id));

          Swal.fire("Deleted!", "The application has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete the application.", "error");
        }
      }
    });
  };

  const filteredApps = applications.filter((app) =>
    app.personalData?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useAuthRedirect();

  return (
    <Box className="border p-3 my-3 bg-white rounded shadow min-h-[95vh]">
      <Typography variant="h4" style={{ color: "#0c2461" }} gutterBottom>Applications for {vacancyTitle}</Typography>
      <TextField
        label="Search Applicant"
        variant="outlined"
        fullWidth
        className="mb-3"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <List>
        {filteredApps.map((app) => (
          <ListItem key={app.id} className="d-flex justify-content-between">
            <ListItemText
              primary={app.personalData?.name}
              secondary={`Applied on: ${new Date(app.timestamp.seconds * 1000).toLocaleString()}`}
            />
            <Box>
              <Button variant="outlined" component={Link} to={`/Applications/${vacancy_id}/applicant/${app.id}`}>
                View
              </Button>
              <Button variant="contained" color="error" onClick={() => deleteApplication(app.id, app.documents)}>
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ApplicationsList;
