// Account Application PDF Generator
interface AccountApplicationData {
  applicationId: string;
  passport_photo_url: string;
  full_name: string;
  phone_number: string;
  state: string;
  local_government: string;
  address: string;
  date_of_birth: string;
  bvn: string;
  nin: string;
  next_of_kin_name: string;
  next_of_kin_address: string;
  next_of_kin_phone: string;
  account_type: string;
  status: string;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'Savings Account',
  current: 'Current Account',
  corporate: 'Corporate Account',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  declined: 'Declined',
  flagged: 'Flagged for Review',
};

export const generateAccountApplicationPdf = (data: AccountApplicationData) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Application - ${data.applicationId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      text-align: center;
      border-bottom: 3px solid #1a365d;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo { font-size: 28px; font-weight: bold; color: #1a365d; }
    .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
    .app-id {
      background: #f0f4f8;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .app-id-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .app-id-value { font-size: 24px; font-weight: bold; color: #1a365d; font-family: monospace; }
    .passport-section {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    .passport-img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      border: 3px solid #1a365d;
      object-fit: cover;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #1a365d;
      color: white;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item { margin-bottom: 10px; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; }
    .info-value { font-size: 14px; font-weight: 500; color: #333; }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-declined { background: #fee2e2; color: #991b1b; }
    .status-under_review { background: #dbeafe; color: #1e40af; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Yobe Microfinance Bank</div>
      <div class="subtitle">Account Opening Application Form</div>
    </div>

    <div class="app-id">
      <div class="app-id-label">Application Number</div>
      <div class="app-id-value">${data.applicationId}</div>
    </div>

    <div class="passport-section">
      <div style="text-align: center;">
        <div style="width: 150px; height: 150px; background: #f0f4f8; border-radius: 8px; border: 3px solid #1a365d; display: flex; align-items: center; justify-content: center;">
          <span style="color: #666; font-size: 12px;">Passport Photo</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Application Status</div>
      <div style="text-align: center;">
        <span class="status-badge status-${data.status}">${STATUS_LABELS[data.status] || data.status}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Personal Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Full Name</div>
          <div class="info-value">${data.full_name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone Number</div>
          <div class="info-value">${data.phone_number}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-value">${formatDate(data.date_of_birth)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Account Type</div>
          <div class="info-value">${ACCOUNT_TYPE_LABELS[data.account_type] || data.account_type}</div>
        </div>
        <div class="info-item">
          <div class="info-label">State</div>
          <div class="info-value">${data.state}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Local Government</div>
          <div class="info-value">${data.local_government}</div>
        </div>
      </div>
      <div class="info-item" style="margin-top: 15px;">
        <div class="info-label">Residential Address</div>
        <div class="info-value">${data.address}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Identification</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">BVN</div>
          <div class="info-value">${data.bvn}</div>
        </div>
        <div class="info-item">
          <div class="info-label">NIN</div>
          <div class="info-value">${data.nin}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Next of Kin Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Name</div>
          <div class="info-value">${data.next_of_kin_name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone Number</div>
          <div class="info-value">${data.next_of_kin_phone}</div>
        </div>
      </div>
      <div class="info-item" style="margin-top: 15px;">
        <div class="info-label">Address</div>
        <div class="info-value">${data.next_of_kin_address}</div>
      </div>
    </div>

    <div class="footer">
      <p>Generated on ${new Date().toLocaleDateString('en-NG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p style="margin-top: 10px;">Yobe Microfinance Bank - Building Financial Futures</p>
    </div>
  </div>
</body>
</html>
  `;

  // Open in new window for printing as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};