import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Swal from "sweetalert2";
import { db } from "../../../Utils/Firebase/Firebase";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import { Helmet } from "react-helmet-async";

export default function ViewProjectDetail() {
  useAuthRedirect();
  const { id } = useParams();
  const location = useLocation();

  // Check if we're in view mode
  const isViewMode = new URLSearchParams(location.search).get("mode") === "view";

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [subtopics, setSubtopics] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "Projects", id));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        }

        const subtopicsSnapshot = await getDocs(collection(db, `Projects/${id}/SubTopics`));
        const subtopicsData = subtopicsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (a.serial || 0) - (b.serial || 0));

        setSubtopics(subtopicsData);
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10} minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={4}>
        <Typography>Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Helmet>
        <title>{project.topic_title} - BIKE Lab</title>
      </Helmet>

      <Typography variant="h3" mb={2} color="#0c2461">
        {isViewMode ? "View Project" : "Project Details"}
      </Typography>

      <Typography variant="h5" mb={3} color="#0c2461">
        {project.topic_title}
      </Typography>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Short Description
        </Typography>
        <Box
          dangerouslySetInnerHTML={{ __html: project.short_description || "" }}
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            mb: 3,
          }}
        />
      </Box>

      {project.associated_members?.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>
          {project.associated_members.map((member) => (
            <Typography key={member.id} variant="body2">
              • {member.name}
            </Typography>
          ))}
        </Box>
      )}

      {subtopics.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>
            Subtopics
          </Typography>

          {subtopics.map((subtopic) => (
            <Accordion key={subtopic.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{subtopic.subtopic_title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {subtopic.description && (
                    <Box
                      dangerouslySetInnerHTML={{ __html: subtopic.description }}
                      sx={{ mb: 2 }}
                    />
                  )}

                  {subtopic.associated_members?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Members
                      </Typography>
                      {subtopic.associated_members.map((member) => (
                        <Typography key={member.id} variant="body2">
                          • {member.name}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
