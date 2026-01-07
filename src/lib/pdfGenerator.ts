import { jsPDF } from "jspdf";

interface PDFData {
  // Personal Details
  fullName: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
  dob: string;
  gender: string;
  aadhaarNumber: string;
  panNumber: string;
  motherTongue: string;
  permanentMark1: string;
  permanentMark2: string;

  // Tribal Information
  tribe: string;
  stCertificateNumber: string;
  certificateIssueDate: string;
  casteValidityCertNumber: string;
  casteValidityIssueDate: string;

  // Contact Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;

  // University Details
  universityName: string;
  universityCountry: string;
  course: string;
  courseDegreeType: string;
  totalFees: string;
  feesPageUrl: string;
  isVerified: boolean;

  // Documents
  documents: {
    form16: boolean;
    casteCertificate: boolean;
    marksheet10th: boolean;
    marksheet12th: boolean;
    graduationMarksheet: boolean;
    offerLetter: boolean;
  };
}

export function generateApplicationPDF(data: PDFData): void {
  const doc = new jsPDF("p", "mm", "a4");

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = 10;
  const LABEL_WIDTH = 65;
  const VALUE_WIDTH = PAGE_WIDTH - MARGIN * 2 - LABEL_WIDTH;
  const ROW_HEIGHT = 8;

  let yPosition = 15;

  /* ------------------ HELPERS ------------------ */

  const checkNewPage = (space: number) => {
    if (yPosition + space > PAGE_HEIGHT - 15) {
      doc.addPage();
      yPosition = 15;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkNewPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.rect(MARGIN, yPosition, PAGE_WIDTH - MARGIN * 2, 8);
    doc.text(title, MARGIN + 2, yPosition + 5.5);
    yPosition += 8;
  };

  const drawRow = (label: string, value?: string) => {
    checkNewPage(ROW_HEIGHT);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Label cell
    doc.rect(MARGIN, yPosition, LABEL_WIDTH, ROW_HEIGHT);
    doc.text(label, MARGIN + 2, yPosition + 5.5);

    // Value cell
    doc.rect(MARGIN + LABEL_WIDTH, yPosition, VALUE_WIDTH, ROW_HEIGHT);
    const text = value && value.trim() ? value : "-";
    const wrapped = doc.splitTextToSize(text, VALUE_WIDTH - 4);
    doc.text(wrapped, MARGIN + LABEL_WIDTH + 2, yPosition + 5.5);

    yPosition += ROW_HEIGHT;
  };

  /* ------------------ HEADER ------------------ */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SCHOLARSHIP APPLICATION FORM", PAGE_WIDTH / 2, 10, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    PAGE_WIDTH / 2,
    15,
    { align: "center" }
  );

  yPosition = 20;

  /* ------------------ PERSONAL DETAILS ------------------ */

  drawSectionHeader("PERSONAL DETAILS");

  drawRow("Full Name", data.fullName);
  drawRow("Father's Name", data.fatherName);
  drawRow("Mother's Name", data.motherName);
  drawRow("Date of Birth", data.dob);
  drawRow("Gender", data.gender);
  drawRow("Marital Status", data.maritalStatus);
  drawRow("Aadhaar Number", data.aadhaarNumber);
  drawRow("PAN Number", data.panNumber);
  drawRow("Mother Tongue", data.motherTongue);

  /* ------------------ TRIBAL INFORMATION ------------------ */

  drawSectionHeader("TRIBAL INFORMATION");

  drawRow("Permanent Mark 1", data.permanentMark1);
  drawRow("Permanent Mark 2", data.permanentMark2);
  drawRow("Tribe", data.tribe);
  drawRow("ST Certificate Number", data.stCertificateNumber);
  drawRow("Certificate Issue Date", data.certificateIssueDate);
  drawRow("Caste Validity Cert No.", data.casteValidityCertNumber);
  drawRow("Caste Validity Issue Date", data.casteValidityIssueDate);

  /* ------------------ CONTACT DETAILS ------------------ */

  drawSectionHeader("CONTACT DETAILS");

  drawRow("Address", data.address);
  drawRow("City", data.city);
  drawRow("State", data.state);
  drawRow("Pincode", data.pincode);
  drawRow("Mobile Number", data.phone);
  drawRow("Email Address", data.email);

  /* ------------------ UNIVERSITY DETAILS ------------------ */

  drawSectionHeader("UNIVERSITY DETAILS");

  drawRow("University Name", data.universityName);
  drawRow("Country", data.universityCountry);
  drawRow("Course / Program", data.course);
  drawRow("Degree Type", data.courseDegreeType);
  drawRow("Total Fees (USD)", data.totalFees);
  drawRow(
    "Total Fees (INR)",
    data.totalFees
      ? `₹${(Number(data.totalFees) * 83).toLocaleString("en-IN")}`
      : "-"
  );
  drawRow("Fees Verified", data.isVerified ? "YES" : "NO");
  drawRow("Fees Page URL", data.feesPageUrl);

  /* ------------------ DOCUMENTS ------------------ */

  drawSectionHeader("DOCUMENTS UPLOADED");

  drawRow("Form 16", data.documents.form16 ? "YES" : "NO");
  drawRow(
    "Caste Certificate",
    data.documents.casteCertificate ? "YES" : "NO"
  );
  drawRow("10th Marksheet", data.documents.marksheet10th ? "YES" : "NO");
  drawRow("12th Marksheet", data.documents.marksheet12th ? "YES" : "NO");
  drawRow(
    "Graduation Marksheet",
    data.documents.graduationMarksheet ? "YES" : "NO"
  );
  drawRow("Offer Letter", data.documents.offerLetter ? "YES" : "NO");

  /* ------------------ FOOTER ------------------ */

  doc.setFontSize(8);
  doc.text(
    "This is a system-generated document. No signature is required.",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 10,
    { align: "center" }
  );

  /* ------------------ SAVE ------------------ */

  const fileName = `Scholarship_Application_${data.fullName.replace(
    /\s+/g,
    "_"
  )}_${new Date().toISOString().split("T")[0]}.pdf`;

  doc.save(fileName);
}
