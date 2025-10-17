import React, { useEffect, useState, useMemo } from "react";
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

      const getTime = (ts) => {
        if (!ts) return 0;
        if (ts.seconds) return ts.seconds * 1000;
        if (ts.toDate) return ts.toDate().getTime();
        return new Date(ts).getTime ? new Date(ts).getTime() : 0;
      };

      appList.sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp));
      setApplications(appList);
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

          for (const filePath of Object.values(documents || {})) {
            await deleteObject(ref(storage, filePath));
          }

          setApplications((prev) => prev.filter((app) => app.id !== applicant_id));

          Swal.fire("Deleted!", "The application has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete the application.", "error");
        }
      }
    });
  };

  useAuthRedirect();

  const filteredApplications = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) => {
      const name = `${app.personalData?.firstName || ""} ${app.personalData?.lastName || ""}`.toLowerCase();
      const email = (app.personalData?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [applications, searchQuery]);

  const toDate = (ts) => {
    if (!ts) return new Date(0);
    if (typeof ts?.toDate === "function") return ts.toDate();
    if (typeof ts?.seconds === "number") return new Date(ts.seconds * 1000);
    if (typeof ts === "number") return new Date(ts);
    return new Date(ts);
  };

  const formatTimestamp = (ts) => {
    const date = toDate(ts);
    try {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Europe/London",
        timeZoneName: "short",
      });
      const parts = fmt.formatToParts(date);
      const map = {};
      parts.forEach((p) => {
        map[p.type] = p.value;
      });
      return `${map.day} ${map.month}, ${map.year} at ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod} (${map.timeZoneName})`;
    } catch {
      // Fallback
      return date.toLocaleString();
    }
  };

  return (
    <Box className="border p-3 my-3 bg-white rounded shadow min-h-[95vh]">
      <Typography variant="h4" style={{ color: "#0c2461" }} gutterBottom>
        Applications for {vacancyTitle}
      </Typography>
      <TextField
        label="Search Applicant"
        variant="outlined"
        fullWidth
        className="mb-3"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <List>
        {filteredApplications.map((app) => (
          <ListItem key={app.id} className="d-flex justify-content-between bg-slate-200 rounded mb-2 p-2">
            <ListItemText
              primary={(app.personalData?.firstName || "") + " " + (app.personalData?.lastName || "") + " | " + (app.personalData?.email || "")}
              secondary={`Applied on: ${formatTimestamp(app.timestamp)}`}
              className="w-4/5"
            />
            <Box className="flex w-1/5 justify-center items-center rounded gap-2">
              <Button className="mx-1" variant="outlined" component={Link} to={`/Applications/${vacancy_id}/applicant/${app.id}`}>
                View
              </Button>
              <Button className="mx-1" variant="contained" color="error" onClick={() => deleteApplication(app.id, app.documents)}>
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
