import { generateAndDownloadPDF } 
  from '../features/itinerary/services/pdfService';

export default async function handler(req, res) {
  try {
    const data = req.body;

    const pdfBuffer = await generateAndDownloadPDF(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=itinerary.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
}
