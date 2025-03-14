import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { db } from "../../../Utils/Firebase/Firebase";
import PDFModal from "../../../Components/Modal/PDFModal";

const ApplicantDetails = () => {
  const { vacancy_id, applicant_id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      const docSnap = await getDoc(doc(db, `Vacancies/${vacancy_id}/Applications/${applicant_id}`));
      if (docSnap.exists()) {
        setApplicant(docSnap.data());
      }
    };

    fetchApplicant();
  }, [vacancy_id, applicant_id]);

  if (!applicant) return <Typography>Loading...</Typography>;

  return (
    <Box className="border p-3 my-3 bg-white rounded shadow min-h-[95vh]">
      <Typography variant="h4" style={{ color: "#0c2461" }} gutterBottom>Applicant Details</Typography>
      <Typography>Name: {applicant.personalData?.name}</Typography>
      <Typography>Email: {applicant.personalData?.email}</Typography>
      {Object.entries(applicant.documents || {}).map(([key, url]) => (
        <Button key={key} variant="contained" className="m-2" onClick={() => setSelectedPDF(url)}>
          Show {key}
        </Button>
      ))}
      <PDFModal pdfUrl={selectedPDF} onClose={() => setSelectedPDF(null)} />
    </Box>
  );
};

export default ApplicantDetails;
