import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useLogout from './../../Components/Auth/useLogOut';
import useAuthRedirect from './../../Components/Auth/useAuthRedirect';

const routes = {
  insert: [
    { path: "/add-new/researcher", label: "Add Researcher" },
    { path: "/add-new/activity", label: "Add Activity" },
    { path: "/add-new/researches", label: "Add Publication" },
    // { path: "/add-new/teaching-courses", label: "Add Teaching Course" },
    { path: "/add-new/partner", label: "Add Partner" },
    { path: "/add-new/project", label: "Add Project" },
    { path: "/add-new/dataset", label: "Add Dataset" },
  ],
  update: [
    { path: "/update", label: "Update Basic Info" },
    { path: "/update/researchers", label: "Researchers" },
    { path: "/update/projects", label: "Projects" },
    { path: "/update/publications", label: "Publications" },
  ],
  others:[
    { path: "/others/messages", label: "Messages" },
  ]
};

export default function Dashboard() {
  useAuthRedirect();
  const logout = useLogout()
  return (
    <Box sx={{ padding: "50px 5%", minHeight:'97vh' }}>
      <Box className="flex justify-between items-center flex-wrap"> 
        <Typography variant="h2" sx={{ color: "blue", mb: 3 }}>
          BIKE ADMIN Dashboard
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
            variant="contained"
            sx={{ bgcolor: "#23f502", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
          >
            {route.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
