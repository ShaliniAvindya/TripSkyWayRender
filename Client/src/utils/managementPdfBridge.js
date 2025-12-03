import { generateAndDownloadPDF } from '../pdf/pdfService';
const generateManagementPDF = async (pkg) => {
  return generateAndDownloadPDF(pkg);
};

export { generateManagementPDF };
