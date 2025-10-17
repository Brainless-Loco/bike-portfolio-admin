import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { db } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const VacancyList = () => {
  const [vacancies, setVacancies] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

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

  // filter by search term (position name or type)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vacancies;
    return vacancies.filter((v) => {
      const name = (v.position_name || "").toString().toLowerCase();
      const type = (v.position_type || "").toString().toLowerCase();
      return name.includes(q) || type.includes(q);
    });
  }, [vacancies, search]);

  // group by position_type
  const grouped = useMemo(() => {
    return filtered.reduce((acc, v) => {
      const type = v.position_type || "Unknown";
      if (!acc[type]) acc[type] = [];
      acc[type].push(v);
      return acc;
    }, {});
  }, [filtered]);

  const types = Object.keys(grouped).sort();

  const handleChange = (type) => (event, isExpanded) => {
    setExpanded(isExpanded ? type : false);
  };

  return (
    <Box className="border p-3 my-3 min-h-[95vh] bg-white rounded shadow">
      <Typography variant="h4" style={{ color: "#0c2461" }} gutterBottom>
        All the available vacancies
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          label="Search vacancies (name or type)"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      <Box className="mb-3">

        <Divider className=" bg-gray-500" />
      </Box>

      {types.length === 0 ? (
        <Typography>No vacancies match your search.</Typography>
      ) : (
        types.map((type) => (
          <Accordion
            key={type}
            expanded={expanded === type}
            onChange={handleChange(type)}
            className="mb-2"
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${type}-content`}
              id={`${type}-header`}
            >
              <Typography variant="h6" style={{ textTransform: "capitalize", color: "#0c2461" }}>
                {type} ({grouped[type].length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List style={{ width: "100%" }}>
                {grouped[type].map((vacancy) => (
                  <ListItem
                    className="bg-slate-200 rounded my-2"
                    key={vacancy.id}
                    button
                    component={Link}
                    to={`/Applications/${vacancy.id}`}
                  >
                    <ListItemText primary={`${vacancy.position_name || "Untitled"}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )
      }
    </Box>
  );
};

export default VacancyList;
