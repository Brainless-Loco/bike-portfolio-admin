import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { db } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const VacancyList = () => {
  const [vacancies, setVacancies] = useState([]);

  useAuthRedirect();

  useEffect(() => {
    const fetchVacancies = async () => {
      const snapshot = await getDocs(collection(db, "Vacancies"));
      const vacancyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVacancies(vacancyList);
    };

    fetchVacancies();
  }, []);

  return (
    <Box className="border p-3 my-3 min-h-[95vh] bg-white rounded shadow">
      <Typography variant="h4" style={{ color: "#0c2461" }} gutterBottom>All the available vacancies</Typography>
      <List>
        {vacancies.map((vacancy) => (
          <ListItem className="bg-slate-200 rounded" key={vacancy.id} button component={Link} to={`/Applications/${vacancy.id}`}>
            <ListItemText primary={vacancy.position_name + ' (' + vacancy.position_type+')'}  />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VacancyList;
