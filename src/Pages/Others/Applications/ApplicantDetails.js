import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Link from "@mui/material/Link";
import { db } from "../../../Utils/Firebase/Firebase";
import PDFModal from "../../../Components/Modal/PDFModal";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";
import BasicKeyValueTableRow from "./TableTemplates/BasicKeyValueTableRow";

const ApplicantDetails = () => {
  const { vacancy_id, applicant_id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);
  const [modalType, setModalType] = useState(null); // 'pdf' | 'other' | null

  useAuthRedirect();

  useEffect(() => {
    const fetchApplicant = async () => {
      const docSnap = await getDoc(doc(db, `Vacancies/${vacancy_id}/Applications/${applicant_id}`));
      if (docSnap.exists()) {
        setApplicant(docSnap.data());
      }
    };

    fetchApplicant();
  }, [vacancy_id, applicant_id]);

  const openDocument = (url) => {
    if (!url) {
      setSelectedDocUrl(null);
      setModalType("other");
      return;
    }
    // const lower = url.toLowerCase();
    // Try to check if it's a PDF by fetching headers
    setSelectedDocUrl(url);
    setModalType("other");
  };

  const closeModal = () => {
    setSelectedDocUrl(null);
    setModalType(null);
  };

  // helper to render the new documents structure
  const renderDocuments = (docs = {}) => {
    if (!docs || Object.keys(docs).length === 0) return "—";

    return (
      <div className="space-y-4">
        {/* applicationDocs: simple key -> url map */}
        {docs.applicationDocs && Object.keys(docs.applicationDocs).length > 0 && (
          <div>
            <div className="font-medium mb-2">Application documents</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(docs.applicationDocs).map(([key, url]) => (
                <Button
                  key={key}
                  variant={url ? "contained" : "text"}
                  size="small"
                  onClick={() => openDocument(url)}
                  className="capitalize"
                >
                  {key.replace(/[_\-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* otherDocs: array of { title, url } */}
        {Array.isArray(docs.otherDocs) && docs.otherDocs.length > 0 && (
          <div>
            <div className="font-medium mb-2">Other documents</div>
            <Table size="small" className="w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold text-sm border border-gray-200 p-1">Title</TableCell>
                  <TableCell className="font-semibold text-sm border border-gray-200 p-1">File</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docs.otherDocs.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm border border-gray-200 p-1">{d?.title || `Document ${i + 1}`}</TableCell>
                    <TableCell className="text-sm border border-gray-200 p-1">
                      {d?.url ? (
                        <Button size="small" variant="contained" onClick={() => openDocument(d.url)}>
                          View
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* references: array of urls */}
        {Array.isArray(docs.references) && docs.references.length > 0 && (
          <div>
            <div className="font-medium mb-2">References</div>
            <div className="flex flex-wrap gap-2">
              {docs.references.map((url, i) => (
                <Button key={i} size="small" variant={url ? "contained" : "text"} onClick={() => openDocument(url)}>
                  Reference {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* publications: array of { title, file, coAuthorStatement } */}
        {Array.isArray(docs.publications) && docs.publications.length > 0 && (
          <div>
            <div className="font-medium mb-2">Publications</div>
            <Table size="small" className="w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold text-sm border border-gray-200 p-1">Title</TableCell>
                  <TableCell className="font-semibold text-sm border border-gray-200 p-1">File</TableCell>
                  <TableCell className="font-semibold text-sm border border-gray-200 p-1">Co-author statement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docs.publications.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm border border-gray-200 p-1">{p?.title || `Publication ${i + 1}`}</TableCell>
                    <TableCell className="text-sm border border-gray-200 p-1">
                      {p?.file ? (
                        <Button size="small" variant="contained" onClick={() => openDocument(p.file)}>View</Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm border border-gray-200 p-1">
                      {p?.coAuthorStatement ? (
                        <Button size="small" variant="contained" onClick={() => openDocument(p.coAuthorStatement)}>View</Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    if (ts.toDate) {
      try {
        return ts.toDate().toString();
      } catch {}
    }
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toString();
    }
    return new Date(ts).toString();
  };

  if (!applicant) return <Typography>Loading...</Typography>;

  const email = applicant.personalData?.email || "";
  const mobile = applicant.personalData?.mobile || "";
  const termsAccepted = !!applicant.personalData?.termsAccepted;
  
  return (
    <Box className="border p-3 my-3 bg-white rounded shadow min-h-[95vh]">
      <Typography className="text-[#0c2461] pb-3" variant="h3">Applicant Details</Typography>

      <TableContainer component={Paper} className="mb-4">
        <Table className="min-w-full">
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 bg-gray-100 p-2">Field</TableCell>
              <TableCell className="font-semibold text-base border border-gray-200 bg-gray-100 p-2">Value</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

            <BasicKeyValueTableRow label={"Full Name"} value={(applicant.personalData?.firstName || "") +" " +( applicant.personalData?.lastName || "")}
            />

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Email</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {email ? <Link href={`mailto:${email}`} className="text-blue-600">{email}</Link> : "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Mobile</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {mobile ? <Link href={`tel:${mobile}`} className="text-blue-600">{mobile}</Link> : "—"}
              </TableCell>
            </TableRow>

            <BasicKeyValueTableRow 
              label={"Address"}
              value={applicant.personalData?.address || "—"}
              />

            <BasicKeyValueTableRow
              label="Country"
              value={applicant.personalData?.country || "—"}
            />

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Submitted at</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">{formatTimestamp(applicant.timestamp)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Latest Job history</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {applicant.jobHistory ? (
                  <div className="space-y-1">
                    <div><span className="font-medium">Occupation:</span> {applicant.jobHistory.occupation || "—"}</div>
                    <div><span className="font-medium">Workplace:</span> {applicant.jobHistory.workplace || "—"}</div>
                  </div>
                ) : "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Education</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {Array.isArray(applicant.education) && applicant.education.length > 0 ? (
                  <Table size="small" className="w-full">
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold text-sm border border-gray-200 p-1">Degree</TableCell>
                        <TableCell className="font-bold text-sm border border-gray-200 p-1">University</TableCell>
                        <TableCell className="font-bold text-sm border border-gray-200 p-1">Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applicant.education.map((ed, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm border border-gray-200 p-1">{ed.degree || "—"}</TableCell>
                          <TableCell className="text-sm border border-gray-200 p-1">{ed.university || "—"}</TableCell>
                          <TableCell className="text-sm border border-gray-200 p-1">{ed.year_of_passing || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : "—"}
              </TableCell>
            </TableRow>

            {/* Documents row - uses renderDocuments helper */}
            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Documents</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {renderDocuments(applicant.documents)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-base border border-gray-200 p-2 align-top">Terms accepted</TableCell>
              <TableCell className="text-base border border-gray-200 p-2 align-top">
                {termsAccepted ? "✅ Accepted" : "❌ Not accepted"}
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer>

      {modalType === "pdf" && selectedDocUrl && <PDFModal pdfUrl={selectedDocUrl} onClose={closeModal} />}

      <Dialog open={modalType === "other"} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>Document preview</DialogTitle>
        <DialogContent>
          {selectedDocUrl ? (
            <>
              <Typography className="mb-2">The selected document does not appear to be a PDF. You can open it in a new tab:</Typography>
              <Link href={selectedDocUrl} target="_blank" rel="noopener noreferrer">{selectedDocUrl}</Link>
            </>
          ) : (
            <Typography>No document available for this entry.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicantDetails;
