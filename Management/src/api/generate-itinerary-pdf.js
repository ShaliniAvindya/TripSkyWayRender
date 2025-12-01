import { generateAndDownloadPDF } from '../features/itinerary/services/pdfService';

export default async function handler(req, res) {
  try {
    const data = req.body;

    const pdfBlob = await generateAndDownloadPDF(data); // returns Blob in browser

    // convert Blob to base64 to send over HTTP
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64PDF = Buffer.from(arrayBuffer).toString('base64');

    res.status(200).json({ pdf: base64PDF });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
}
