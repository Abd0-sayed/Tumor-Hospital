import { useState } from "react";
import "./style/needs.scss";
import * as XLSX from "xlsx";

const VolunteerExp = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(
        "https://tumorhospital.runasp.net/api/Volunteer/Volunteers",
      );
      const json = await res.json();

      const volunteerData = json.data || [];

      if (volunteerData.length === 0) {
        alert("No volunteer data found to export.");
        return;
      }

      // Map raw data to clean Excel columns
      const worksheetData = volunteerData.map((v) => ({
        "Volunteer Name": v.volunteerName,
        Email: v.email,
        Phone: v.phone,
        Amount: v.amountDonated,
        Category: v.charityNeedCategory || "None",
        Date: new Date(v.donationDate).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteers");

      XLSX.writeFile(workbook, "Hospital_Volunteers.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-btn"
      onClick={handleExportExcel}
      disabled={isExporting}
    >
      {isExporting ? "Exporting..." : "Export Volunteers"}
    </button>
  );
};

export default VolunteerExp;
