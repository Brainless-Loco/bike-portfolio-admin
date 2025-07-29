import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useLogout from './../../Components/Auth/useLogOut';
import useAuthRedirect from './../../Components/Auth/useAuthRedirect';

const routes = {
  insert: [
    { path: "/add-new/researcher", label: "Researcher" },
    { path: "/add-new/activity", label: "Activity" },
    { path: "/add-new/researches", label: "Publication" },
    // { path: "/add-new/teaching-courses", label: "Add Teaching Course" },
    { path: "/add-new/partner", label: "Partner" },
    { path: "/add-new/project", label: "Project" },
    // { path: "/add-new/dataset", label: "Dataset" },
    { path: "/add-new/vacancy", label: "Vacancy" },
  ],
  update: [
    // { path: "/update", label: "Update Basic Info" },
    { path: "/update/researchers", label: "Researchers" },
    { path: "/update/activities", label: "Activities" },
    { path: "/update/publications", label: "Publications" },
    { path: "/update/projects", label: "Projects" },
    { path: "/update/vacancy", label: "Vacancy" },
  ],
  others:[
    { path: "/others/messages", label: "Messages" },
    { path: "/others/applications", label: "Applications" },
    { path:"https://docs.google.com/document/d/16z6ZEAPfC5lMZLSaejWE0uvK1HDtF4Anr5YwBGWNqpg/edit?usp=sharing", label:"Server Set up WIKI", target:"__blank"}
  ]
};

export default function Dashboard() {
  useAuthRedirect();
  const logout = useLogout()
  return (
    <Box sx={{ padding: "50px 5%", minHeight:'97vh' }}>
      <Box className="flex justify-between items-center flex-wrap"> 
        <Typography variant="h2" sx={{ color: "blue", mb: 3 }}>
          BIKE Admin Dashboard
        </Typography>
        {/* log out button */}
        <Button variant="contained" color="error" sx={{ minWidth: 200, p: 2, borderRadius: 2 }} onClick={logout}>Log Out</Button>
      </Box>
      

      {/* Insert Section */}
      <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
        Insert
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
        {routes.insert.map((route) => (
          <Button
            key={route.path}
            component={Link}
            to={route.path}
            variant="contained"
            sx={{ bgcolor: "#1976d2", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
          >
            {route.label}
          </Button>
        ))}
      </Box>

      {/* Update Section */}
      <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
        Update
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb:4 }}>
        {routes.update.map((route) => (
          <Button
            key={route.path}
            component={Link}
            to={route.path}
            variant="contained"
            sx={{ bgcolor: "#ff9800", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
          >
            {route.label}
          </Button>
        ))}
      </Box>

      {/* Others Section */}
      <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
        Others
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {routes.others.map((route) => (
          <Button
            key={route.path}
            component={Link}
            to={route.path}
            target={route.target ?? ""}
            variant="contained"
            sx={{ bgcolor: "#014a0e", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
          >
            {route.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
