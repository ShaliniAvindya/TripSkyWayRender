import express from "express";
import { generateAndDownloadPDF } from "../services/pdfService.js";

const router = express.Router();

router.post("/generate-itinerary", async (req, res) => {
  try {
    const pdfBuffer = await generateAndDownloadPDF(req.body);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=itinerary.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

export default router;
