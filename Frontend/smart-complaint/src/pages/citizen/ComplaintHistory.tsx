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
import { ArrowBack, Support, Assignment, CheckCircle, Pending, PlayArrow, Dashboard as DashboardIcon, Visibility as ViewIcon } from '@mui/icons-material';
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
        console.log('No grievances found or API not available');
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
      console.log('Complaint details received:', complaint);
      console.log('Officer image path:', complaint.officerImagePath);
      console.log('Full image URL would be:', `https://localhost:7094${complaint.officerImagePath}`);
      setSelectedComplaintDetails(complaint);
      setOfficerImageError(false); // Reset error state
      setDetailsDialog(true);
    } catch (error: any) {
      console.error('Failed to load complaint details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load complaint details');
    }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar />

      <Box sx={{ bgcolor: '#f1f5f9', flex: 1, py: 4 }}>
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
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)"
                }
              }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Avatar sx={{ bgcolor: "#ff9800", mx: "auto", mb: 2, width: 56, height: 56 }}>
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
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)"
                }
              }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Avatar sx={{ bgcolor: "#2196f3", mx: "auto", mb: 2, width: 56, height: 56 }}>
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
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)"
                }
              }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Avatar sx={{ bgcolor: "#4caf50", mx: "auto", mb: 2, width: 56, height: 56 }}>
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
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)"
                }
              }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Avatar sx={{ bgcolor: "#757575", mx: "auto", mb: 2, width: 56, height: 56 }}>
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
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                  }
                }}>
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(complaint.complaintId)}
                          sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                        >
                          View Details
                        </Button>
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
                                {existingGrievance?.officerRemarks && (
                                  <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                                    Officer: {existingGrievance.officerRemarks}
                                  </Typography>
                                )}
                              </Box>
                            );
                          }
                          return (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleRaiseGrievance(complaint)}
                              sx={{ textTransform: 'none', fontSize: '0.875rem' }}
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
                sx={{ textTransform: 'none' }}
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
                  {selectedComplaintDetails.officerRemarks && (
                    <Typography variant="body2">
                      <strong>Officer Remarks:</strong> {selectedComplaintDetails.officerRemarks}
                    </Typography>
                  )}
                  {selectedComplaintDetails.imagePath && (
                    <Box>
                      <Typography variant="body2" mb={1}><strong>Your Evidence:</strong></Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <img 
                          src={`https://localhost:7094${selectedComplaintDetails.imagePath}`} 
                          alt="Your Evidence" 
                          style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => window.open(`https://localhost:7094${selectedComplaintDetails.imagePath}`, '_blank')}
                          sx={{ textTransform: 'none' }}
                        >
                          View Your Evidence
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {selectedComplaintDetails.officerImagePath ? (
                    <Box>
                      <Typography variant="body2" mb={1}><strong>Officer's Proof:</strong></Typography>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          {!officerImageError ? (
                            <img 
                              src={`https://localhost:7094${selectedComplaintDetails.officerImagePath}`} 
                              alt="Officer Proof" 
                              style={{ 
                                maxWidth: '300px', 
                                maxHeight: '200px', 
                                borderRadius: '8px', 
                                objectFit: 'contain',
                                border: '1px solid #e2e8f0'
                              }}
                              onError={(e) => {
                                console.error('Failed to load officer image:', selectedComplaintDetails.officerImagePath);
                                console.error('Full URL:', `https://localhost:7094${selectedComplaintDetails.officerImagePath}`);
                                setOfficerImageError(true);
                              }}
                              onLoad={() => console.log('Officer image loaded successfully:', selectedComplaintDetails.officerImagePath)}
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
                        <Stack spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => {
                              const imageUrl = `https://localhost:7094${selectedComplaintDetails.officerImagePath}`;
                              console.log('Opening officer image:', imageUrl);
                              window.open(imageUrl, '_blank');
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            View Officer Proof
                          </Button>

                          {officerImageError && (
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => setOfficerImageError(false)}
                              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                            >
                              Retry Loading Image
                            </Button>
                          )}
                        </Stack>
                      </Box>
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
        </Container>
        
        {/* Back to Dashboard Button */}
        <Fab
          color="primary"
          onClick={() => navigate('/citizen')}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb'
            }
          }}
        >
          <DashboardIcon />
        </Fab>
      </Box>
      
      <Footer />
    </Box>
  );
}