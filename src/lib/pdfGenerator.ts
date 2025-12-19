// lib/pdfGenerator.ts
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
  const doc = new jsPDF();
  
  let yPosition = 20;
  const lineHeight = 7;
  const sectionSpacing = 12;
  const leftMargin = 20;
  const rightMargin = 190;
  
  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight;
  };
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > 280) {
      doc.addPage();
      yPosition = 20;
    }
  };
  
  // Header
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHOLARSHIP APPLICATION', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 23, { align: 'center' });
  
  yPosition = 45;
  doc.setTextColor(0, 0, 0);
  
  // Personal Details Section
  doc.setFillColor(239, 246, 255);
  doc.rect(leftMargin - 5, yPosition - 5, rightMargin - leftMargin + 5, 10, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('PERSONAL DETAILS', leftMargin, yPosition);
  yPosition += sectionSpacing;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const personalDetails = [
    ['Full Name', data.fullName],
    ['Father\'s Name', data.fatherName],
    ['Mother\'s Name', data.motherName],
    ['Date of Birth', data.dob],
    ['Gender', data.gender],
    ['Marital Status', data.maritalStatus],
    ['Aadhaar Number', data.aadhaarNumber],
    ['PAN Number', data.panNumber],
    ['Mother Tongue', data.motherTongue],
  ];
  
  personalDetails.forEach(([label, value]) => {
    if (value) {
      checkNewPage();
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, leftMargin + 50, yPosition);
      yPosition += lineHeight;
    }
  });
  
  // Tribal Information Section
  if (data.tribe || data.stCertificateNumber || data.permanentMark1 || data.permanentMark2) {
    yPosition += sectionSpacing;
    checkNewPage(30);
    
    doc.setFillColor(243, 232, 255);
    doc.rect(leftMargin - 5, yPosition - 5, rightMargin - leftMargin + 5, 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(147, 51, 234);
    doc.text('TRIBAL INFORMATION', leftMargin, yPosition);
    yPosition += sectionSpacing;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const tribalDetails = [
      ['Permanent Mark 1', data.permanentMark1],
      ['Permanent Mark 2', data.permanentMark2],
      ['Tribe', data.tribe],
      ['ST Certificate Number', data.stCertificateNumber],
      ['Certificate Issue Date', data.certificateIssueDate],
      ['Caste Validity Cert. Number', data.casteValidityCertNumber],
      ['Caste Validity Issue Date', data.casteValidityIssueDate],
    ];
    
    tribalDetails.forEach(([label, value]) => {
      if (value) {
        checkNewPage();
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, leftMargin, yPosition);
        doc.setFont('helvetica', 'normal');
        const textHeight = addText(value, leftMargin + 60, yPosition, 110);
        yPosition += textHeight;
      }
    });
  }
  
  // Contact Information Section
  yPosition += sectionSpacing;
  checkNewPage(30);
  
  doc.setFillColor(219, 234, 254);
  doc.rect(leftMargin - 5, yPosition - 5, rightMargin - leftMargin + 5, 10, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('CONTACT INFORMATION', leftMargin, yPosition);
  yPosition += sectionSpacing;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const contactDetails = [
    ['Address', data.address],
    ['City', data.city],
    ['State', data.state],
    ['Pincode', data.pincode],
    ['Phone', data.phone],
    ['Email', data.email],
  ];
  
  contactDetails.forEach(([label, value]) => {
    if (value) {
      checkNewPage();
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      const textHeight = addText(value, leftMargin + 30, yPosition, 140);
      yPosition += textHeight;
    }
  });
  
  // University Details Section
  yPosition += sectionSpacing;
  checkNewPage(40);
  
  doc.setFillColor(254, 243, 199);
  doc.rect(leftMargin - 5, yPosition - 5, rightMargin - leftMargin + 5, 10, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('UNIVERSITY DETAILS', leftMargin, yPosition);
  yPosition += sectionSpacing;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const universityDetails = [
    ['University', data.universityName],
    ['Country', data.universityCountry],
    ['Course/Program', data.course],
    ['Degree Type', data.courseDegreeType],
    ['Total Fees (USD)', `$${parseFloat(data.totalFees).toLocaleString()}`],
    ['Total Fees (INR)', `₹${(parseFloat(data.totalFees) * 83).toLocaleString('en-IN')}`],
    ['Fees Verification', data.isVerified ? '✓ Verified' : 'Pending Verification'],
  ];
  
  universityDetails.forEach(([label, value]) => {
    if (value) {
      checkNewPage();
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      const textHeight = addText(value, leftMargin + 50, yPosition, 120);
      yPosition += textHeight;
    }
  });
  
  if (data.feesPageUrl) {
    checkNewPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Fees Page URL:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246);
    const urlHeight = addText(data.feesPageUrl, leftMargin + 50, yPosition, 120);
    yPosition += urlHeight;
    doc.setTextColor(0, 0, 0);
  }
  
  // Documents Uploaded Section
  yPosition += sectionSpacing;
  checkNewPage(30);
  
  doc.setFillColor(220, 252, 231);
  doc.rect(leftMargin - 5, yPosition - 5, rightMargin - leftMargin + 5, 10, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('DOCUMENTS UPLOADED', leftMargin, yPosition);
  yPosition += sectionSpacing;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const documents = [
    ['Form 16', data.documents.form16],
    ['Caste Certificate', data.documents.casteCertificate],
    ['10th Marksheet', data.documents.marksheet10th],
    ['12th Marksheet', data.documents.marksheet12th],
    ['Graduation Marksheet', data.documents.graduationMarksheet],
    ['Offer Letter', data.documents.offerLetter],
  ];
  
  documents.forEach(([label, uploaded]) => {
    checkNewPage();
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    
    if (uploaded) {
      doc.setTextColor(34, 197, 94);
      doc.text('✓ Uploaded', leftMargin + 60, yPosition);
    } else {
      doc.setTextColor(156, 163, 175);
      doc.text('Not Uploaded', leftMargin + 60, yPosition);
    }
    doc.setTextColor(0, 0, 0);
    yPosition += lineHeight;
  });
  
  // Footer
  yPosition += sectionSpacing;
  checkNewPage(20);
  
  doc.setDrawColor(220, 220, 220);
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a system-generated document. No signature is required.', 105, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('For queries, contact the scholarship department.', 105, yPosition, { align: 'center' });
  
  // Save the PDF
  const fileName = `Scholarship_Application_${data.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}