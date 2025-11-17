import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Avatar,
  Fab
} from '@mui/material';
import { ArrowBack, Support, Assignment, CheckCircle, Pending, PlayArrow, Dashboard as DashboardIcon, Visibility as ViewIcon, Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { getComplaintsByCitizen, getComplaintById } from '../../api/complaint.api';
import { createGrievance, getGrievancesByCitizen, checkGrievanceExists } from '../../api/grievance.api';
import { type Complaint } from '../../types/Complaint';
import { tokenstore } from '../../auth/tokenstore';
import AppNavbar from '../../components/AppNavbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';

export default function ComplaintHistory() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [grievanceDialog, setGrievanceDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [grievanceReason, setGrievanceReason] = useState('');
  const [grievanceSubmitting, setGrievanceSubmitting] = useState(false);
  const [citizenGrievances, setCitizenGrievances] = useState<any[]>([]);
  const [existingGrievances, setExistingGrievances] = useState<Set<number>>(new Set());
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedComplaintDetails, setSelectedComplaintDetails] = useState<Complaint | null>(null);
  const [officerImageError, setOfficerImageError] = useState(false);
  const [remarksDialog, setRemarksDialog] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState('');


  useEffect(() => {
    loadComplaints();
    
    // Poll for grievance status updates every 30 seconds
    const interval = setInterval(() => {
      const citizenId = tokenstore.getUserId();
      if (citizenId) {
        getGrievancesByCitizen(citizenId)
          .then(data => setCitizenGrievances(data || []))
          .catch(() => {});
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const citizenId = tokenstore.getUserId();
      if (!citizenId) {
        setError('User not found');
        return;
      }
      const data = await getComplaintsByCitizen(citizenId);
      if (!data || !Array.isArray(data)) {
        setError('Invalid data received from server');
        return;
      }
      setComplaints(data);
      
      // Load citizen's grievances
      try {
        const grievanceData = await getGrievancesByCitizen(citizenId);
        setCitizenGrievances(grievanceData || []);
        
        // Check for existing grievances
        const grievanceChecks = await Promise.allSettled(
          data.map(complaint => checkGrievanceExists(complaint.complaintId))
        );
        
        const existingSet = new Set<number>();
        grievanceChecks.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            existingSet.add(data[index].complaintId);
          }
        });
        setExistingGrievances(existingSet);
      } catch (grievanceError) {

        setCitizenGrievances([]);
      }
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      setError(error?.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'InProgress': return 'info';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const handleRaiseGrievance = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setGrievanceDialog(true);
    setGrievanceReason('');
  };

  const handleViewDetails = async (complaintId: number) => {
    try {
      const complaint = await getComplaintById(complaintId);

      setSelectedComplaintDetails(complaint);
      setOfficerImageError(false); // Reset error state
      setDetailsDialog(true);
    } catch (error: any) {
      console.error('Failed to load complaint details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load complaint details');
    }
  };

  const downloadComplaintDetails = (complaint: Complaint) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GOVERNMENT OF INDIA', 105, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('SMART COMPLAINT MANAGEMENT SYSTEM', 105, 30, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('OFFICIAL COMPLAINT RECEIPT', 105, 40, { align: 'center' });
    
    // Line separator
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    // Receipt details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECEIPT NO:', 20, 60);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`#${complaint.complaintId}`, 60, 60);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATE ISSUED:', 120, 60);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date().toLocaleDateString(), 160, 60);
    
    // Complaint details section
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMPLAINT DETAILS', 20, 80);
    pdf.line(20, 82, 100, 82);
    
    let yPos = 95;
    const lineHeight = 8;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Title:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    const titleLines = pdf.splitTextToSize(complaint.title, 120);
    pdf.text(titleLines, 50, yPos);
    yPos += titleLines.length * lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(complaint.description, 120);
    pdf.text(descLines, 50, yPos);
    yPos += descLines.length * lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Location:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.location, 50, yPos);
    yPos += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.categoryName, 50, yPos);
    yPos += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Department:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.departmentName, 50, yPos);
    yPos += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.complaintStatus, 50, yPos);
    yPos += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Filed Date:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date(complaint.createdAt).toLocaleDateString(), 50, yPos);
    yPos += lineHeight * 2;
    
    if (complaint.officerRemarks) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('OFFICER REMARKS', 20, yPos);
      pdf.line(20, yPos + 2, 100, yPos + 2);
      yPos += 10;
      
      pdf.setFont('helvetica', 'normal');
      const remarksLines = pdf.splitTextToSize(complaint.officerRemarks, 150);
      pdf.text(remarksLines, 20, yPos);
      yPos += remarksLines.length * lineHeight + 10;
    }
    
    // Footer
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.text('This is a computer-generated document. No signature required.', 105, 270, { align: 'center' });
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
    
    // Save the PDF
    pdf.save(`Complaint_Receipt_${complaint.complaintId}.pdf`);
  };

  const submitGrievance = async () => {
    if (!selectedComplaint || !grievanceReason.trim()) return;
    
    try {
      setGrievanceSubmitting(true);
      
      const citizenId = tokenstore.getUserId();
      if (!citizenId) {
        toast.error('User session expired. Please login again.');
        return;
      }
      
      await createGrievance(
        selectedComplaint.complaintId,
        grievanceReason.trim(),
        citizenId
      );
      
      toast.success(`Grievance raised successfully for complaint #${selectedComplaint.complaintId}. You will be notified when it's reviewed.`);
      setGrievanceDialog(false);
      setSelectedComplaint(null);
      setGrievanceReason('');
      
      // Update existing grievances set
      setExistingGrievances(prev => new Set([...prev, selectedComplaint.complaintId]));
      
      // Reload complaints and grievances to update status
      await loadComplaints();
    } catch (error: any) {
      console.error('Failed to submit grievance:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setGrievanceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppNavbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppNavbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={loadComplaints}>Retry</Button>
        </Container>
      </>
    );
  }

  return (
    <Box className="page-container">
      <AppNavbar />

      <Box className="content-background">
        <Container maxWidth="lg">



          
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700} mb={2} color="#1e293b">
              My Complaints History
            </Typography>
            <Typography variant="h6" color="text.secondary">
              View and manage all your submitted complaints
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Box display="flex" justifyContent="center" mb={6}>
          <Grid container spacing={4} maxWidth={800}>
            <Grid item xs={12} sm={3}>
              <Card className="stat-card">
                <CardContent className="card-content-center">
                  <Avatar className="stat-avatar" sx={{ bgcolor: "#ff9800" }}>
                    <Pending />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#ff9800">
                    {complaints.filter(c => c.complaintStatus === "Pending").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card className="stat-card">
                <CardContent className="card-content-center">
                  <Avatar className="stat-avatar" sx={{ bgcolor: "#2196f3" }}>
                    <PlayArrow />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#2196f3">
                    {complaints.filter(c => c.complaintStatus === "InProgress").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">In Progress</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card className="stat-card">
                <CardContent className="card-content-center">
                  <Avatar className="stat-avatar" sx={{ bgcolor: "#4caf50" }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#4caf50">
                    {complaints.filter(c => c.complaintStatus === "Resolved").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Resolved</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card className="stat-card">
                <CardContent className="card-content-center">
                  <Avatar className="stat-avatar" sx={{ bgcolor: "#757575" }}>
                    <Assignment />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#757575">
                    {complaints.filter(c => c.complaintStatus === "Closed").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Closed</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          </Box>
          
          <Grid container spacing={3}>
            {complaints.map((complaint) => (
              <Grid item xs={12} md={6} lg={4} key={complaint.complaintId}>
                <Card className="complaint-card">
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" fontWeight={700} color="#3b82f6">
                        #{complaint.complaintId}
                      </Typography>
                      <Chip
                        label={complaint.complaintStatus}
                        color={getStatusColor(complaint.complaintStatus) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={2} color="#1e293b">
                      {complaint.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Category: {complaint.categoryName}
                    </Typography>
                    <Typography variant="body2" color="#6b7280" mb={3}>
                      Created: {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(complaint.complaintId)}
                          className="small-button"
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadComplaintDetails(complaint)}
                          className="small-button"
                        >
                          Download
                        </Button>
                        {complaint.officerRemarks && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setSelectedRemarks(complaint.officerRemarks);
                              setRemarksDialog(true);
                            }}
                            className="small-button"
                          >
                            Officer Remarks
                          </Button>
                        )}
                        {(complaint.complaintStatus === 'Resolved' || complaint.complaintStatus === 'Closed') && (() => {
                          const existingGrievance = citizenGrievances.find(g => g.complaintId === complaint.complaintId);
                          if (existingGrievance || existingGrievances.has(complaint.complaintId)) {
                            return (
                              <Box>
                                <Chip
                                  label={`Grievance: ${existingGrievance?.grievanceStatus || 'Pending'}`}
                                  color={existingGrievance?.grievanceStatus === 'Resolved' ? 'success' : 
                                         existingGrievance?.grievanceStatus === 'Rejected' ? 'error' : 
                                         existingGrievance?.grievanceStatus === 'Under Review' ? 'info' : 'warning'}
                                  size="small"
                                  sx={{ fontSize: '0.8rem' }}
                                />

                              </Box>
                            );
                          }
                          return (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleRaiseGrievance(complaint)}
                              className="small-button"
                            >
                              Raise Grievance
                            </Button>
                          );
                        })()}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Grievance Dialog */}
          <Dialog 
            open={grievanceDialog} 
            onClose={() => setGrievanceDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Support sx={{ color: '#f59e0b' }} />
                Raise Grievance
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedComplaint && (
                <>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You are raising a grievance for complaint #{selectedComplaint.complaintId} - {selectedComplaint.title}
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Reason for Grievance"
                    placeholder="Please explain why you are not satisfied with the resolution..."
                    value={grievanceReason}
                    onChange={(e) => setGrievanceReason(e.target.value)}
                    required
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setGrievanceDialog(false)}
                disabled={grievanceSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitGrievance}
                variant="contained"
                color="warning"
                disabled={!grievanceReason.trim() || grievanceSubmitting}
                className="no-transform-button"
              >
                {grievanceSubmitting ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Complaint Details Dialog */}
          <Dialog 
            open={detailsDialog} 
            onClose={() => setDetailsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogContent>
              {selectedComplaintDetails && (
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                  <Typography variant="h6">{selectedComplaintDetails.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ID:</strong> #{selectedComplaintDetails.complaintId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {selectedComplaintDetails.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {selectedComplaintDetails.location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {selectedComplaintDetails.categoryName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {selectedComplaintDetails.departmentName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip 
                      label={selectedComplaintDetails.complaintStatus} 
                      color={getStatusColor(selectedComplaintDetails.complaintStatus) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedComplaintDetails.createdAt).toLocaleDateString()}
                  </Typography>

                  {selectedComplaintDetails.imagePath && (
                    <Box>
                      <Typography variant="body2" mb={1}><strong>Your Evidence:</strong></Typography>
                      <img 
                        src={`https://localhost:7094${selectedComplaintDetails.imagePath}`} 
                        alt="Your Evidence" 
                        className="evidence-image"
                      />
                    </Box>
                  )}
                  {selectedComplaintDetails.officerImagePath ? (
                    <Box>
                      <Typography variant="body2" mb={1}><strong>Officer's Proof:</strong></Typography>
                      {!officerImageError ? (
                        <img 
                          src={`https://localhost:7094${selectedComplaintDetails.officerImagePath}`} 
                          alt="Officer Proof" 
                          className="officer-image"
                          onError={(e) => {

                            setOfficerImageError(true);
                          }}
                          onLoad={() => {}}
                        />
                      ) : (
                        <Box
                          sx={{
                            maxWidth: '300px',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px dashed #ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 2,
                            color: '#ef4444',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                        >
                          Officer proof image failed to load
                        </Box>
                      )}
                    </Box>
                  ) : (
                    (selectedComplaintDetails.complaintStatus === 'Resolved' || selectedComplaintDetails.complaintStatus === 'Closed') ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Officer's Proof:</strong> No proof uploaded by officer
                        </Typography>
                      </Box>
                    ) : null
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Officer Remarks Dialog */}
          <Dialog 
            open={remarksDialog} 
            onClose={() => setRemarksDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Officer Remarks</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedRemarks}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRemarksDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Container>
        
        {/* Back to Dashboard Button */}
        <Fab
          color="primary"
          onClick={() => navigate('/citizen')}
          className="fixed-fab"
        >
          <DashboardIcon />
        </Fab>
      </Box>
      
      <Footer />
    </Box>
  );
}