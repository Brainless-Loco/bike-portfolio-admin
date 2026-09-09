// Example Node.js Express endpoint to merge applicant documents server-side
// Requires: firebase-admin, express, pdf-lib

const express = require('express');
const admin = require('firebase-admin');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Initialize Firebase Admin (ensure GOOGLE_APPLICATION_CREDENTIALS env var or initializeApp with credentials)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(express.json());

// Helper: collect documents from applicant object (same schema as client)
function collectDocuments(applicantDocs) {
  const docList = [];
  if (!applicantDocs) return docList;

  if (applicantDocs.applicationDocs && typeof applicantDocs.applicationDocs === 'object') {
    Object.entries(applicantDocs.applicationDocs).forEach(([key, url]) => {
      if (url) docList.push({ type: 'Application Document', title: key, url });
    });
  }

  if (Array.isArray(applicantDocs.otherDocs)) {
    applicantDocs.otherDocs.forEach((d, i) => { if (d?.url) docList.push({ type: 'Other Document', title: d.title || `Document ${i+1}`, url: d.url }); });
  }

  if (Array.isArray(applicantDocs.references)) {
    applicantDocs.references.forEach((url, i) => { if (url) docList.push({ type: 'Reference', title: `Reference ${i+1}`, url }); });
  }

  if (Array.isArray(applicantDocs.publications)) {
    applicantDocs.publications.forEach((p, i) => {
      if (p?.file) docList.push({ type: 'Publication', title: p.title || `Publication ${i+1}`, url: p.file });
      if (p?.coAuthorStatement) docList.push({ type: 'Co-Author Statement', title: `${p.title || `Publication ${i+1}`} - Co-Author Statement`, url: p.coAuthorStatement });
    });
  }

  return docList;
}

// Utility: convert public firebase URL to storage path if possible
function extractStoragePath(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('gs://')) {
      const parts = url.split('/');
      return parts.slice(2).join('/');
    }
    if (!url.startsWith('http')) return url;
    if (!url.includes('firebasestorage.googleapis.com')) return null;
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
    if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);
    return null;
  } catch (e) {
    return null;
  }
}

// Placeholder page (simple text page) for non-PDFs or failed downloads
async function addPlaceholderPage(pdfDoc, info, message) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  page.drawText('Document Not Available', { x:50, y: height - 50, size: 14, font: bold, color: rgb(0.5,0,0)});
  page.drawText(`Type: ${info.type}`, { x:50, y: height - 75, size: 10, font });
  page.drawText(`Title: ${info.title}`, { x:50, y: height - 95, size: 10, font });
  page.drawText(message || 'Could not download/merge this file.', { x:50, y: height - 125, size: 9, font });
}

// Main endpoint: GET /merge?vacancyId=...&applicantId=...
app.get('/merge', async (req, res) => {
  try {
    const { vacancyId, applicantId } = req.query;
    if (!vacancyId || !applicantId) return res.status(400).send('vacancyId and applicantId are required');

    // Fetch applicant doc
    const snap = await db.doc(`Vacancies/${vacancyId}/Applications/${applicantId}`).get();
    if (!snap.exists) return res.status(404).send('Application not found');
    const applicant = snap.data();

    // Fetch vacancy details
    const vacancySnap = await db.doc(`Vacancies/${vacancyId}`).get();
    const vacancy = vacancySnap.exists ? vacancySnap.data() : {};
    const positionName = vacancy.position_name || 'Position';

    // Build merged PDF
    const mergedPdf = await PDFDocument.create();

    // Summary page (simple)
    const summaryPage = mergedPdf.addPage([595.28,841.89]);
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const bold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
    summaryPage.drawText('BIKE Lab, CSE, University of Chittagong', { x:50, y:800, size:14, font: bold });
    summaryPage.drawText(`Position: ${positionName}`, { x:50, y:780, size:12, font: bold });
    summaryPage.drawText(`Applicant: ${(applicant.personalData?.firstName||'') + ' ' + (applicant.personalData?.lastName||'')}`, { x:50, y:760, size:10, font });

    // Index page
    const indexPage = mergedPdf.addPage([595.28,841.89]);
    indexPage.drawText('DOCUMENT INDEX', { x:50, y:800, size:12, font: bold });

    const documents = collectDocuments(applicant.documents || {});

    // List and merge documents
    let indexY = 760;
    for (let i=0;i<documents.length;i++) {
      const info = documents[i];
      indexPage.drawText(`${i+1}. ${info.type} - ${info.title}`, { x:50, y:indexY, size:10, font });
      indexY -= 16;

      // Try to get storage path and download bytes
      const storagePath = extractStoragePath(info.url);

      try {
        let fileBuffer = null;
        if (storagePath) {
          // download from bucket
          const file = bucket.file(storagePath);
          const data = await file.download(); // returns [Buffer]
          fileBuffer = data[0];
        } else if (info.url && info.url.startsWith('http')) {
          // fetch public URL server-side
          const fetchRes = await fetch(info.url);
          if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
          fileBuffer = Buffer.from(await fetchRes.arrayBuffer());
        }

        if (fileBuffer) {
          try {
            const docPdf = await PDFDocument.load(fileBuffer);
            const copied = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
            copied.forEach(p => mergedPdf.addPage(p));
          } catch (e) {
            // Not a PDF
            await addPlaceholderPage(mergedPdf, info, 'File is not a PDF or is corrupted');
          }
        } else {
          await addPlaceholderPage(mergedPdf, info, 'No accessible URL or storage path');
        }
      } catch (err) {
        console.warn('Failed to download or merge', info.title, err);
        await addPlaceholderPage(mergedPdf, info, `Download error: ${err.message}`);
      }
    }

    const bytes = await mergedPdf.save();

    // Debug: save merged PDF to a temp file on the server for inspection
    try {
      const fs = require('fs');
      const path = require('path');
      const tmpDir = path.join(__dirname, '..', 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpPath = path.join(tmpDir, `merged_${vacancyId}_${applicantId}.pdf`);
      fs.writeFileSync(tmpPath, Buffer.from(bytes));
      console.log(`Merged PDF written to ${tmpPath} (${bytes.length} bytes)`);
      console.log('First bytes:', Buffer.from(bytes).slice(0, 8).toString('hex'));
    } catch (fsErr) {
      console.warn('Failed to write debug merged PDF to disk:', fsErr);
    }

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Application_${applicant.personalData?.firstName||''}_${applicant.personalData?.lastName||''}_${positionName || 'Position'}.pdf"`);
    res.setHeader('Content-Length', Buffer.byteLength(Buffer.from(bytes)));
    res.status(200).end(Buffer.from(bytes));

  } catch (error) {
    console.error('merge error', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = app;

// If run directly, start an HTTP server for local testing
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`mergeApplicationPdf server listening on http://localhost:${port}`);
  });
}
