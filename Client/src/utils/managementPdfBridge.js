export async function generateManagementPDF(pkg) {
  const response = await fetch('https://trip-sky-way-render-adeo.vercel.app/api/generate-itinerary-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pkg),
  });

  if (!response.ok) throw new Error('PDF API failed');

  const { pdf } = await response.json();
  const binary = atob(pdf);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  const blob = new Blob([array], { type: 'application/pdf' });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'itinerary.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
}
