import React, { useState, useRef,useEffect } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Calculate as CalculatorIcon
} from '@mui/icons-material';
import companyIMage from '../assets/GR-Symbols-Logo-Transparent-Harizontal.png'
import SignatureImage1 from '../assets/signature1.png'
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Box,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';


const InvoiceSystem = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const printRef = useRef();

  // Company data based on your documents
  const companyData = {
    name: "GR SYMBOLS & DIGITALS",
    subtitle: "INDOOR&OUTDOOR ADVERTISING SIGNS",
    address: "PLOT NO 12, VENKATRAO NAGAR COLONY,KUKATPALLY,Hyderabad, Medchal Malkajgiri-500072",
    // location: "KUKATPALLY, Kukatpally, Hyderabad, Medchal Malkajgiri",
    // pincode: "500072",
    phone: "9912514956, 8686058020",
    email: "info@grsymbols.com, grsymbolsdigitals2018@gmail.com",
    gstin: "36CJLPG9226N1ZL",
    bankName: "ICICI Bank",
    accountNumber: "416605000083",
    branch: "Kukatpally, Hyd",
    ifsc: "ICIC0004166",
    authorizedSignatory: "G.Ravi"
  };


  const [formData, setFormData] = useState({
    // Document details
    documentNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    placeOfSupply: '',
    vehicleNumber: '',
    transportMode: '',
    campaignName: '', // For challan
    PONumber:'',
    
    // Customer details
    customer: {
      name: '',
      address: '',
      gstin: '',
      stateCode: '',
      pinCode: ''
    },
    
    // Consignee details (same as customer by default)
    consignee: {
      name: '',
      address: '',
      gstin: '',
      stateCode: ''
    },
    
    // Items
    items: [{
      slNo: 1,
      hsnCode: '94056090',
      description: '',
     
      width: '',
      height: '',
      qty: 1,
      sft: 0,
      rate: 0,
      amount: 0,
      cgstSgstRate: 18,
      cgstSgstAmount: 0,
      total: 0
    }],
    
    // Transport and totals
    transportExpenses: 0,
    subtotal: 0,
    totalCgst: 0,
    totalSgst: 0,
    grandTotal: 0,
    
    // Terms and conditions (for estimation)
    termsConditions: [
      "Work Will Processed After The Conformation OF Purchase Order Advance 50% Amount",
      "Work Will Be Delivered With In 10 to 30 Days From The Po's Or Advance Amount Received",
      "Above Estimation May Vary From 15 Days To 30 Days",
      "Artworks will Not change After The Confirmation / Work Started (Incase Any Changes Extra Charges will Be Applicable)"
    ]
  });

  const documentTypes = [
    { label: 'Tax Invoice', value: 'invoice', icon: <ReceiptIcon /> },
    { label: 'Delivery Challan', value: 'challan', icon: <ShippingIcon /> },
    { label: 'Estimation', value: 'estimation', icon: <CalculatorIcon /> }
  ];

  const currentDocType = documentTypes[activeTab].value;

  // Calculate item totals
 const calculateItemTotals = (item) => {
  const width = parseFloat(item.width) || 0;
  const height = parseFloat(item.height) || 0;
  const qty = parseFloat(item.qty) || 0;
  const rate = parseFloat(item.rate) || 0;
  const manualSft = parseFloat(item.sft) || 0;
  
  let sft, amount;
  
  // Check if SFT is manually entered
  if (manualSft > 0) {
    // If SFT is manually entered, use it directly
    sft = manualSft;
    amount = sft * qty * rate;
  } else {
    // If no manual SFT, calculate from width/height or use qty*rate
    
      // No dimensions provided, use qty * rate only
      sft = 0;
      amount = qty * rate;
    
  }
  
  const cgstSgstAmount = (amount * parseFloat(item.cgstSgstRate || 0)) / 100;
  const total = amount + cgstSgstAmount;
  
  return { sft, amount, cgstSgstAmount, total };
};


  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    const calculations = calculateItemTotals(newItems[index]);
    newItems[index] = { ...newItems[index], ...calculations };
    
    const newFormData = { ...formData, items: newItems };
    calculateOverallTotals(newFormData);
  };

  // Calculate overall totals
  const calculateOverallTotals = (data) => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    data.items.forEach(item => {
      subtotal += item.amount || 0;
      const taxAmount = (item.cgstSgstAmount || 0) / 2; // Split equally between CGST and SGST
      totalCgst += taxAmount;
      totalSgst += taxAmount;
    });

    subtotal += parseFloat(data.transportExpenses) || 0;
    const transportTax = ((parseFloat(data.transportExpenses) || 0) * 18) / 100;
    totalCgst += transportTax / 2;
    totalSgst += transportTax / 2;

    const grandTotal = subtotal + totalCgst + totalSgst;

    setFormData({
      ...data,
      subtotal,
      totalCgst,
      totalSgst,
      grandTotal
    });
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      slNo: formData.items.length + 1,
      hsnCode: '500089',
      description: '',
    
      width: '',
      height: '',
      qty: 1,
      sft: 0,
      rate: 0,
      amount: 0,
      cgstSgstRate: 18,
      cgstSgstAmount: 0,
      total: 0
    };
    
    const newFormData = { ...formData, items: [...formData.items, newItem] };
    calculateOverallTotals(newFormData);
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      const reNumberedItems = newItems.map((item, i) => ({ ...item, slNo: i + 1 }));
      const newFormData = { ...formData, items: reNumberedItems };
      calculateOverallTotals(newFormData);
    }
  };

  // Number to words conversion
  const numberToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertHundreds = (n) => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    if (amount === 0) return 'Zero Rupees';

    let result = '';
    const crores = Math.floor(amount / 10000000);
    if (crores > 0) {
      result += convertHundreds(crores) + 'Crore ';
      amount %= 10000000;
    }

    const lakhs = Math.floor(amount / 100000);
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + 'Lakh ';
      amount %= 100000;
    }

    const thousands = Math.floor(amount / 1000);
    if (thousands > 0) {
      result += convertHundreds(thousands) + 'Thousand ';
      amount %= 1000;
    }

    if (amount > 0) {
      result += convertHundreds(amount);
    }

    return result.trim() + ' Rupees Only';
  };

  // Handle print
  const handlePrint = () => {
    setPreviewOpen(true);
    setTimeout(() => window.print(), 500);
  };

  // Tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const prefixes = ['INV', 'CHA', 'EST'];
    const currentNumber = formData.documentNumber.split('-')[1] || '001';
    setFormData({
      ...formData,
      documentNumber: `${prefixes[newValue]}-${currentNumber}`
    });
  };
const handleSave = () => {
  fetch("https://invoicemanagementsystem-95g0.onrender.com/api/save-document-number/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_type: currentDocType,
      document_number: formData.documentNumber
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Document saved!");
    });
};
useEffect(() => {
  fetch(`https://invoicemanagementsystem-95g0.onrender.com/api/get-next-document-number?doc_type=${currentDocType}`)
    .then(res => res.json())
    .then(data => {
      setFormData(prev => ({ ...prev, documentNumber: data.document_number }));
    });
}, [currentDocType]);
  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Invoice Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Tab Navigation */}
      <Paper sx={{ m: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          {documentTypes.map((doc, index) => (
            <Tab
              key={doc.value}
              icon={doc.icon}
              label={doc.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3} sx={{ p: 2 }}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          {/* Document Details */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title={`${documentTypes[activeTab].label} Details`}
              sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' }
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={`${documentTypes[activeTab].label} Number`}
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Place of Supply"
                    value={formData.placeOfSupply}
                    onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                  />
                </Grid>
                {currentDocType!=='estimation' && currentDocType!=='challan'&&(<Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="PO Number"
                        value={formData.PONumber}
                        onChange={(e) => setFormData({ ...formData, PONumber: e.target.value })}
                      />
                    </Grid>)}
                {currentDocType !== 'estimation' && (
                  <>
                   
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Number"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      />
                    </Grid>
                     
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Transportation Mode"
                        value={formData.transportMode}
                        onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                      />
                    </Grid>
                  </>
                )}
                {currentDocType === 'challan' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Campaign Name"
                      value={formData.campaignName}
                      onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Customer Details"
              sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' }
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={formData.customer.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, name: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GSTIN Number"
                    value={formData.customer.gstin}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, gstin: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Customer Address"
                    value={formData.customer.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, address: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pin Code"
                    value={formData.customer.pinCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, pinCode: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State Code"
                    value={formData.customer.stateCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, stateCode: e.target.value }
                    })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader 
              title="Items"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              }
              sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' },
                '& .MuiButton-root': { backgroundColor: 'white', color: '#1976d2' }
              }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Sl.No.</TableCell>
                      {currentDocType !== 'challan' && <TableCell>HSN CODE</TableCell>}
                      <TableCell>Description</TableCell>
                       <TableCell>W</TableCell>
                          <TableCell>H</TableCell>
                          <TableCell>Qty</TableCell>
                      {currentDocType !== 'challan' && (
                        <>
                         
                          <TableCell>Sft</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Amount</TableCell>
                        </>
                      )}
                      
                      {(currentDocType === 'invoice' || currentDocType === 'estimation') && (
                        <>
                         
                          <TableCell>CGST+SGST Amount</TableCell>
                          <TableCell>Total</TableCell>
                        </>
                      )}
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.slNo}</TableCell>
                        {currentDocType !== 'challan' && (
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.hsnCode}
                              onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            sx={{ minWidth: 200 }}
                          />
                        </TableCell>
                         <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.width}
                                onChange={(e) => updateItem(index, 'width', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.height}
                                onChange={(e) => updateItem(index, 'height', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                        {currentDocType !== 'challan' && (
                          <>
                           
                            <TableCell>
                             <TextField
                                size="small"
                                type="number"
                                value={item.sft}
                                onChange={(e) => updateItem(index, 'sft', e.target.value)}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateItem(index, 'rate', e.target.value)}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                ₹{item.amount.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                       
                        {(currentDocType === 'invoice' || currentDocType === 'estimation') && (
                          <>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.cgstSgstRate}
                                onChange={(e) => updateItem(index, 'cgstSgstRate', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                ₹{item.cgstSgstAmount.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                ₹{item.total.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {currentDocType !== 'challan' && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Transportation Expenses"
                      value={formData.transportExpenses}
                      onChange={(e) => {
                        const newFormData = { ...formData, transportExpenses: parseFloat(e.target.value) || 0 };
                        calculateOverallTotals(newFormData);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Terms & Conditions for Estimation */}
          {currentDocType === 'estimation' && (
            <Card sx={{ mt: 3 }}>
              <CardHeader 
                title="Terms & Conditions"
                sx={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white',
                  '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' }
                }}
              />
              <CardContent>
                {formData.termsConditions.map((term, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {index + 1}) {term}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Actions */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Actions"
              sx={{ 
                backgroundColor: '#4caf50', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' }
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handlePrint}
                    sx={{ backgroundColor: '#1976d2' }}
                  >
                    Download PDF
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ backgroundColor: '#4caf50' }}
                    onClick={handleSave}
                  >
                    Save {documentTypes[activeTab].label}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setPreviewOpen(true)}
                  >
                    Preview
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary */}
          {currentDocType !== 'challan' && (
            <Card>
              <CardHeader 
                title="Summary"
                sx={{ 
                  backgroundColor: '#ff9800', 
                  color: 'white',
                  '& .MuiCardHeader-title': { fontSize: '1.2rem', fontWeight: 'bold' }
                }}
              />
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{formData.subtotal.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">CGST:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">₹{formData.totalCgst.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">SGST:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">₹{formData.totalSgst.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Grand Total:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      ₹{formData.grandTotal.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    In Words: {numberToWords(Math.floor(formData.grandTotal))}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Print Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            '@media print': {
              boxShadow: 'none',
              margin: 0,
              maxWidth: 'none',
              width: '100%',
              height: '100%'
            }
          }
        }}
      >
     <DialogContent
  ref={printRef}
   sx={{
    p: 1, // Reduced padding
    '@media print': {
      p: 0,
      m: 0,
      transform: 'scale(0.98)', // Better scaling
      transformOrigin: 'top left',
      width: '100%',
      maxWidth: 'none',
    }
  }}
>
          {/* Print Template */}
          <Box sx={{ border: '2px solid black', p: 2 }}>
            {/* Header */}
  <Box sx={{ borderBottom: '2px solid black', pb: 2, mb: 2 }}>
  {/* Logo, Line, and Subtitle Row */}
  <Box sx={{ 
  display: 'flex', 
  alignItems: 'flex-end', // Align to bottom so line aligns with logo bottom
  mb: 2,
  gap: 2
}}>
  {/* Logo */}
  <img 
    src={companyIMage} 
    alt='Company logo' 
    style={{
      width: '200px',
      height: '50px',
      objectFit: 'contain'
    }}
  />
  
  {/* Subtitle and Line Container */}
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
    {/* Subtitle above the line */}
    <Typography variant="h6" sx={{ 
      color: '#1976d2',
      fontWeight: 'normal',
      textAlign: 'right' // Align to right
    }}>
      {companyData.subtitle}
    </Typography>
    
    {/* Line with gradient effect */}
  <Box sx={{ 
  height: '4px',
  background: 'linear-gradient(90deg, #1976d2 0%, #db3f3fff 40%, #3fdb76ff 70%, #e3f664ff 100%)',
  borderRadius: '2px',
  position: 'relative',
  '@media print': {
    // Fallback for print - use solid color if gradient fails
    background: '#1976d2',
    // Or try to force the gradient
    backgroundImage: 'linear-gradient(90deg, #1976d2 0%, #db3f3fff 40%, #3fdb76ff 70%, #e3f664ff 100%) !important',
    '-webkit-print-color-adjust': 'exact' // Force colors in print
  }
}}>
      {/* Optional: Add a dot/circle in the line */}
      <Box sx={{
        position: 'absolute',
        right: '100px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '8px',
        height: '8px',
        backgroundColor: '#1976d2',
        borderRadius: '50%'
      }} />
    </Box>
  </Box>
</Box>
  
  {/* Company Details - Centered */}
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="body2">{companyData.address}</Typography>
    <Typography variant="body2">{companyData.location}</Typography>
    <Typography variant="body2">{companyData.pincode}</Typography>
    <Typography variant="body2">PH: {companyData.phone}</Typography>
    <Typography variant="body2">Email: {companyData.email}</Typography>
    <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
      {currentDocType === 'invoice' && 'TAX INVOICE'}
      {currentDocType === 'challan' && 'DELIVERY CHALLAN'}
      {currentDocType === 'estimation' && 'ESTIMATION'}
    </Typography>
  </Box>
</Box>
            {/* Document Info Row */}
            <Grid container sx={{ borderBottom: '1px solid black', mb: 2 }}>
              <Grid item xs={6} sx={{ borderRight: '1px solid black', p: 1 }}>
                <Typography variant="body2">
                  <strong>GSTIN NO:</strong> {companyData.gstin}
                </Typography>
                <Typography variant="body2">
                  <strong>{documentTypes[activeTab].label} S.No:</strong> {formData.documentNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>{currentDocType === 'invoice' ? 'Invoice Date' : 'Date'}:</strong> {formData.date}
                </Typography>
                  <Typography variant="body2">
                      <strong>{currentDocType === 'invoice'?'PO Number:':''}</strong> {formData.PONumber}
                    </Typography>
              </Grid>
              <Grid item xs={6} sx={{ p: 1 }}>
                {currentDocType !== 'estimation' && (
                  <>
                 
                    <Typography variant="body2">
                      <strong>Transportation Mode:</strong> {formData.transportMode}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vehicle No:</strong> {formData.vehicleNumber}
                    </Typography>
                  </>
                )}
                <Typography variant="body2">
                  <strong>{currentDocType === 'invoice' ? 'Date & Time Of Supply' : 'Place Of Supply'}:</strong> {formData.placeOfSupply}
                </Typography>
                {currentDocType === 'challan' && formData.campaignName && (
                  <Typography variant="body2">
                    <strong>Campaign Name:</strong> {formData.campaignName}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Customer Details Row */}
            <Grid container sx={{ borderBottom: '1px solid black', mb: 2 }}>
              <Grid item xs={6} sx={{ borderRight: '1px solid black', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Details Of Receiver {currentDocType === 'invoice' ? '(Billed to)' : ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.customer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {formData.customer.address}
                </Typography>
                {formData.customer.pinCode && (
                  <Typography variant="body2">
                    <strong>Pin Code:</strong> {formData.customer.pinCode}
                  </Typography>
                )}
                {formData.customer.stateCode && (
                  <Typography variant="body2">
                    <strong>State Code:</strong> {formData.customer.stateCode}
                  </Typography>
                )}
                {formData.customer.gstin && (
                  <Typography variant="body2">
                    <strong>GSTIN NO:</strong> {formData.customer.gstin}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6} sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Details Of Consignee {currentDocType === 'invoice' ? '(Shipped to)' : ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.customer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {formData.customer.address}
                </Typography>
                {formData.customer.gstin && (
                  <Typography variant="body2">
                    <strong>GSTIN NO:</strong> {formData.customer.gstin}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Items Table */}
           <TableContainer sx={{ mb: 2 }}>
  <Table 
    size="small" 
    sx={{ 
      border: '1px solid black',
      width: '100%',
      '@media print': {
        fontSize: '0.7rem',
        '& .MuiTableCell-root': {
          padding: '2px 4px',
          fontSize: '0.7rem',
          lineHeight: '1.2'
        }
      }
    }}
  >
    <TableHead>
      <TableRow>
        <TableCell sx={{ border: '1px solid black', width: '4%', textAlign: 'center' }}>
          Sl.No.
        </TableCell>
        {currentDocType !== 'challan' && (
          <TableCell sx={{ border: '1px solid black', width: '8%', textAlign: 'center' }}>
            HSN CODE
          </TableCell>
        )}
        <TableCell sx={{ border: '1px solid black', width: currentDocType === 'challan' ? '40%' : '30%' }}>
          Description
        </TableCell>
        <TableCell sx={{ border: '1px solid black', width: '6%', textAlign: 'center' }}>W</TableCell>
        <TableCell sx={{ border: '1px solid black', width: '6%', textAlign: 'center' }}>H</TableCell>
        <TableCell sx={{ border: '1px solid black', width: '6%', textAlign: 'center' }}>Qty</TableCell>
        {currentDocType !== 'challan' && (
          <>
            <TableCell sx={{ border: '1px solid black', width: '8%', textAlign: 'center' }}>Sft</TableCell>
            <TableCell sx={{ border: '1px solid black', width: '8%', textAlign: 'center' }}>Rate</TableCell>
            <TableCell sx={{ border: '1px solid black', width: '10%', textAlign: 'center' }}>Amount</TableCell>
          </>
        )}
        {(currentDocType === 'invoice' || currentDocType === 'estimation') && (
          <>
            <TableCell sx={{ border: '1px solid black', width: '8%', textAlign: 'center', fontSize: '0.8rem' }}>
              CGST+SGST
            </TableCell>
            <TableCell sx={{ border: '1px solid black', width: '10%', textAlign: 'center' }}>TOTAL</TableCell>
          </>
        )}
      </TableRow>
    </TableHead>
    <TableBody>
      {formData.items.map((item, index) => (
        <TableRow key={index}>
          <TableCell sx={{ border: '1px solid black', textAlign: 'center', fontSize: '0.8rem' }}>
            {item.slNo}
          </TableCell>
          {currentDocType !== 'challan' && (
            <TableCell sx={{ border: '1px solid black', textAlign: 'center', fontSize: '0.8rem' }}>
              {item.hsnCode}
            </TableCell>
          )}
          <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', wordBreak: 'break-word' }}>
            {item.description}
          </TableCell>
          <TableCell sx={{ border: '1px solid black', textAlign: 'center', fontSize: '0.8rem' }}>
            {item.width}
          </TableCell>
          <TableCell sx={{ border: '1px solid black', textAlign: 'center', fontSize: '0.8rem' }}>
            {item.height}
          </TableCell>
          <TableCell sx={{ border: '1px solid black', textAlign: 'center', fontSize: '0.8rem' }}>
            {item.qty}
          </TableCell>
          {currentDocType !== 'challan' && (
            <>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {item.sft.toFixed(2)}
              </TableCell>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {item.rate}
              </TableCell>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {item.amount.toFixed(2)}
              </TableCell>
            </>
          )}
          {(currentDocType === 'invoice' || currentDocType === 'estimation') && (
            <>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {item.cgstSgstAmount.toFixed(2)}
              </TableCell>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {item.total.toFixed(2)}
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
      
      {/* Transport expenses row */}
      {currentDocType !== 'challan' && formData.transportExpenses > 0 && (
        <TableRow>
          <TableCell sx={{ border: '1px solid black' }}></TableCell>
          {currentDocType !== 'challan' && (
            <TableCell sx={{ border: '1px solid black' }}></TableCell>
          )}
          <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem' }}>
            Transportation expenses
          </TableCell>
          <TableCell sx={{ border: '1px solid black' }}></TableCell>
          <TableCell sx={{ border: '1px solid black' }}></TableCell>
          <TableCell sx={{ border: '1px solid black' }}></TableCell>
          {currentDocType !== 'challan' && (
            <>
              <TableCell sx={{ border: '1px solid black' }}></TableCell>
              <TableCell sx={{ border: '1px solid black' }}></TableCell>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {formData.transportExpenses.toFixed(2)}
              </TableCell>
            </>
          )}
          {(currentDocType === 'invoice' || currentDocType === 'estimation') && (
            <>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem' }}>
                {((formData.transportExpenses * 18) / 100).toFixed(2)}
              </TableCell>
              <TableCell sx={{ border: '1px solid black', textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {(formData.transportExpenses + (formData.transportExpenses * 18) / 100).toFixed(2)}
              </TableCell>
            </>
          )}
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


            {/* Footer Section */}
            {currentDocType !== 'challan' && (
              <Grid container>
                <Grid item xs={6} sx={{ borderRight: '1px solid black', p: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>In Words:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, textTransform: 'capitalize' }}>
                    {numberToWords(Math.floor(formData.grandTotal))}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Bank Details: {companyData.name}</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>{companyData.bankName} Account Number:</strong> {companyData.accountNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Branch:</strong> {companyData.branch}
                  </Typography>
                  <Typography variant="body2">
                    <strong>IFSC Code:</strong> {companyData.ifsc}
                  </Typography>
                   {/* Terms & Conditions for Estimation */}
            {currentDocType === 'estimation' && (
              <Box sx={{ mt: 3, borderTop: '1px solid black', pt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Terms & Conditions:
                </Typography>
                {formData.termsConditions.map((term, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                    {index + 1}) {term}
                  </Typography>
                ))}
              </Box>
            )}
                </Grid>
                
                <Grid item xs={6} sx={{ p: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 'bold' }}>SUBTOTAL</TableCell>
                          <TableCell sx={{ border: 'none', textAlign: 'right' }}>
                            {formData.subtotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ border: 'none' }}>CGST</TableCell>
                          <TableCell sx={{ border: 'none', textAlign: 'right' }}>
                            {formData.totalCgst.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ border: 'none' }}>SGST</TableCell>
                          <TableCell sx={{ border: 'none', textAlign: 'right' }}>
                            {formData.totalSgst.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ borderTop: '2px solid black', fontWeight: 'bold' }}>
                            {currentDocType === 'estimation' ? 'Total' : 'GRAND TOTAL'}
                          </TableCell>
                          <TableCell sx={{ borderTop: '2px solid black', textAlign: 'right', fontWeight: 'bold' }}>
                            {formData.grandTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                                <Box sx={{ mt: 4, textAlign: 'right' }}>
  <Typography variant="body2">Authorised Signature</Typography>
  <Box sx={{ mt: 1, mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
    <img 
      src={SignatureImage1} 
      alt='Authorized Signature' 
    style={{
        width: '120px',
        height: '60px',
        objectFit: 'contain'
      }}
    />
  </Box>
  <Typography variant="body2" sx={{ mt: 1 }}>
    for {companyData.name}
  </Typography>
  <Typography variant="body2" sx={{ mt: 3 }}>
    <strong>Name:</strong> {companyData.authorizedSignatory}
  </Typography>
</Box>
                </Grid>
              </Grid>
            )}

            {/* Challan specific footer */}
            {currentDocType === 'challan' && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Grid container spacing={4}>
                  {/* <Grid item xs={4}>
                    <Typography variant="body2">Transport</Typography>
                  </Grid> */}
                  {/* <Grid item xs={4}>
                    <Typography variant="body2">Total</Typography>
                  </Grid> */}
                  <Grid item xs={4}>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, textAlign: 'right' }}>
  <Typography variant="body2">Authorised Signature</Typography>
  <Box sx={{ mt: 1, mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
    <img 
      src={SignatureImage1} 
      alt='Authorized Signature' 
    style={{
        width: '120px',
        height: '60px',
        objectFit: 'contain'
      }}
    />
  </Box>
  <Typography variant="body2" sx={{ mt: 1 }}>
    for {companyData.name}
  </Typography>
  <Typography variant="body2" sx={{ mt: 3 }}>
    <strong>Name:</strong> {companyData.authorizedSignatory}
  </Typography>
</Box>
                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                  Please Visit Again….
                </Typography>
              </Box>
            )}

           
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InvoiceSystem;