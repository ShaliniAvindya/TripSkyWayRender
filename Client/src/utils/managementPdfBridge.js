export async function generateManagementPDF(pkg) {
  const response = await fetch(
    "https://trip-sky-way-render-adeo.vercel.app/api/pdf/generate-itinerary",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pkg),
    }
  );

  if (!response.ok) throw new Error("PDF generation failed");

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "itinerary.pdf";
  a.click();

  URL.revokeObjectURL(url);
}
