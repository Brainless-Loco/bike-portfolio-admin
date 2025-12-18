import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { db } from "../../../Utils/Firebase/Firebase";
import { hasAccess, isSuperAdmin, RESOURCE_TYPES } from "../../../Utils/RBAC/rbacUtils";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

export default function ViewProjectsList() {
  useAuthRedirect();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Projects"));
        const projectData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter based on user's access
        let accessibleProjects = projectData;

        if (!isSuperAdmin()) {
          // For view mode, filter to projects the user has read access to
          accessibleProjects = projectData.filter((project) => {
            return hasAccess(RESOURCE_TYPES.PROJECTS, "read", project.id);
          });
        }

        setProjects(accessibleProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10} minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h3" mb={3} color="#0c2461">
        View Projects
      </Typography>

      {projects.length === 0 ? (
        <Typography color="textSecondary">No projects available</Typography>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {projects.map((project) => (
            <Card key={project.id} sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.topic_title}
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  dangerouslySetInnerHTML={{
                    __html: project.short_description || "No description available",
                  }}
                  sx={{ mb: 2, maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}
                />

                {project.associated_members?.length > 0 && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Members:</strong> {project.associated_members.map((m) => m.name).join(", ")}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/update/projects/${project.id}?mode=view`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
