import { API_BASE_URL } from './apiConfig';
export async function generateManagementPDF(pkg) {
	try {
		const mgmt = await import('@management/features/itinerary/services/pdfService');
		if (mgmt && typeof mgmt.generateAndDownloadPDF === 'function') {
			return mgmt.generateAndDownloadPDF(pkg);
		}
	} catch (err) {
		console.warn('[managementPdfBridge] local management import failed, falling back to server PDF endpoint', err);
	}

	const API_BASE = API_BASE_URL;

	const packageId = pkg?._id || pkg?.id || pkg?.raw?._id || pkg?.package?._id || pkg?.package?.id;
	if (!packageId) {
		throw new Error('Package ID not found for PDF generation');
	}

	try {
		const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const itinRes = await fetch(`${API_BASE}/itineraries/package/${packageId}`, {
			headers,
		});

		if (!itinRes.ok) {
			const text = await itinRes.text().catch(() => '');
			throw new Error(`Failed to fetch itinerary: ${itinRes.status} ${text}`);
		}

		const itinData = await itinRes.json();
		const itinerary = itinData.data || itinData;
		const itineraryId = itinerary?._id || itinerary?.id || itinerary?.itinerary?._id;

		if (!itineraryId) {
			throw new Error('No itinerary found for this package');
		}

		// Download PDF from server endpoint
		const pdfRes = await fetch(`${API_BASE}/itineraries/${itineraryId}/pdf`, {
			headers,
		});

		if (!pdfRes.ok) {
			const text = await pdfRes.text().catch(() => '');
			throw new Error(`Failed to download PDF: ${pdfRes.status} ${text}`);
		}

		const blob = await pdfRes.blob();
		const contentDisposition = pdfRes.headers.get('content-disposition') || '';
		let filename = `itinerary_${packageId}.pdf`;
		const match = /filename\*?=([^;]+);?/.exec(contentDisposition) || /filename=\"?([^\";]+)\"?/.exec(contentDisposition);
		if (match && match[1]) {
			filename = match[1].replace(/UTF-8''/i, '').replace(/\"/g, '').trim();
		}

		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(link.href);

		return { blob, fileName: filename };
	} catch (error) {
		throw error;
	}
}

