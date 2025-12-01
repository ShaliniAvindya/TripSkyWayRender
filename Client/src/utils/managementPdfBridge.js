export async function generateManagementPDF(pkg) {
  const response = await fetch(
    "https://trip-sky-way-render-adeo.vercel.app/api/generate-itinerary-pdf",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pkg),
    }
  );

  if (!response.ok) throw new Error("PDF API failed");

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "itinerary.pdf";
  a.click();
  window.URL.revokeObjectURL(url);
}
