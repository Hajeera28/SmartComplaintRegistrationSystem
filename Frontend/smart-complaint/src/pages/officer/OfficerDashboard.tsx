import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  Stack,
  Tabs,
  Tab,
  Alert,
  Fab
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  Assignment,
  CheckCircle,
  Pending,
  PlayArrow,
  Person,
  LocationOn,
  CalendarToday,
  Warning,
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  CloudUpload
} from "@mui/icons-material";
import { getComplaintsByOfficer, updateComplaintStatus, getComplaintById, getAllComplaints } from "../../api/complaint.api";
import { getGrievancesByOfficer, updateGrievanceStatus, getAllGrievances } from "../../api/grievance.api";
import { getOfficerByUserId } from "../../api/admin.api";
import { type Complaint } from "../../types/Complaint";
import { type Grievance } from "../../types/Grievance";
import { tokenstore } from "../../auth/tokenstore";
import AppNavbar from "../../components/AppNavbar";
import Footer from "../../components/Footer";
import { toast } from 'react-toastify';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerRole, setOfficerRole] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateData, setUpdateData] = useState({
    statusId: 1,
    officerRemarks: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [openGrievanceDialog, setOpenGrievanceDialog] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [grievanceUpdateData, setGrievanceUpdateData] = useState({
    statusId: 1,
    officerRemarks: "",
  });
  const [openComplaintDialog, setOpenComplaintDialog] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState<Complaint | null>(null);
  const [stats, setStats] = useState({
    assigned: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [grievanceStats, setGrievanceStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    checkOfficerApproval();
  }, []);

  const checkOfficerApproval = async () => {
    try {
      const userId = tokenstore.getNumericUserId();
      console.log('Checking approval for user ID:', userId);
      
      if (!userId) {
        navigate('/login');
        return;
      }
      
      const officer = await getOfficerByUserId(userId);
      console.log('Officer data received:', officer);
      
      if (!officer) {
        toast.error('Officer profile not found');
        navigate('/login');
        return;
      }
      
      console.log('Officer approval status:', officer.isApproved);
      setIsApproved(officer.isApproved);
      
      if (officer.isApproved) {
        const role = tokenstore.getOfficerRole();
        setOfficerRole(role || 1);
        loadComplaints();
      }
    } catch (error) {
      console.error('Failed to check officer approval:', error);
      console.error('Error details:', error);
      setIsApproved(false);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const officerId = tokenstore.getUserId();
      const role = tokenstore.getOfficerRole();
      
      console.log('Officer ID:', officerId);
      console.log('Officer Role:', role);
      
      if (!officerId) {
        console.error("No officer ID found in token");
        return;
      }
      
      let data;
      if (role === 5) { // Commissioner - view all complaints
        console.log('Loading all complaints for commissioner');
        data = await getAllComplaints();
        console.log('All complaints loaded:', data.length);
      } else { // Other officers - view assigned complaints
        console.log('Loading assigned complaints for officer');
        data = await getComplaintsByOfficer(officerId);
        console.log('Assigned complaints loaded:', data.length);
      }
      
      setComplaints(data);
      calculateStats(data);
      
      // Only load grievances for non-field officers (role !== 1)
      if (role && role !== 1) {
        loadGrievances();
      }
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrievances = async () => {
    try {
      const officerId = tokenstore.getUserId();
      const role = tokenstore.getOfficerRole();
      if (!officerId) return;
      
      let data;
      if (role === 5) { // Commissioner - view all grievances
        data = await getAllGrievances();
      } else { // Other officers - view assigned grievances
        data = await getGrievancesByOfficer(officerId);
      }
      
      const mappedGrievances = data.map(g => ({
        grievanceId: g.grievanceId,
        complaintId: g.complaintId || 0,
        complaintTitle: g.complaintTitle || 'N/A',
        citizenName: g.citizenName || 'Unknown',
        reason: g.description || 'No description',
        status: g.grievanceStatus as 'Pending' | 'Under Review' | 'Resolved' | 'Rejected',
        createdAt: g.raisedDate
      }));
      setGrievances(mappedGrievances);
      calculateGrievanceStats(mappedGrievances);
    } catch (error) {
      console.error("Failed to load grievances:", error);
      setGrievances([]);
    }
  };

  const calculateStats = (data: Complaint[]) => {
    const stats = {
      assigned: data.length,
      pending: data.filter(c => c.complaintStatus === "Pending").length,
      inProgress: data.filter(c => c.complaintStatus === "InProgress").length,
      resolved: data.filter(c => c.complaintStatus === "Resolved").length,
    };
    setStats(stats);
  };

  const calculateGrievanceStats = (data: any[]) => {
    const stats = {
      total: data.length,
      pending: data.filter(g => g.status === "Pending").length,
      underReview: data.filter(g => g.status === "Under Review").length,
      resolved: data.filter(g => g.status === "Resolved").length,
      rejected: data.filter(g => g.status === "Rejected").length,
    };
    setGrievanceStats(stats);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "warning";
      case "InProgress": return "info";
      case "Resolved": return "success";
      case "Closed": return "default";
      default: return "default";
    }
  };

  const getGrievanceStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "warning";
      case "Under Review": return "info";
      case "Resolved": return "success";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  const handleUpdateClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      statusId: getStatusId(complaint.complaintStatus),
      officerRemarks: complaint.officerRemarks || "",
    });
    setProofFile(null);
    setOpenDialog(true);
  };

  const getStatusId = (status: string) => {
    switch (status) {
      case "Pending": return 1;
      case "InProgress": return 2;
      case "Resolved": return 3;
      case "Closed": return 4;
      default: return 1;
    }
  };

  const getStatusName = (statusId: number) => {
    switch (statusId) {
      case 1: return "Pending";
      case 2: return "InProgress";
      case 3: return "Resolved";
      case 4: return "Closed";
      default: return "Pending";
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedComplaint) return;
    
    try {
      await updateComplaintStatus(
        selectedComplaint.complaintId,
        updateData.statusId,
        updateData.officerRemarks,
        proofFile || undefined
      );
      toast.success("Complaint status updated successfully!");
      setOpenDialog(false);
      setProofFile(null);
      loadComplaints();
    } catch (error: any) {
      console.error("Failed to update complaint:", error);
      toast.error(error?.response?.data?.message || 'Failed to update complaint status');
    }
  };

  const handleGrievanceUpdate = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setGrievanceUpdateData({
      statusId: getGrievanceStatusId(grievance.status),
      officerRemarks: "",
    });
    setOpenGrievanceDialog(true);
  };

  const getGrievanceStatusId = (status: string) => {
    switch (status) {
      case "Pending": return 1;
      case "Under Review": return 2;
      case "Resolved": return 3;
      case "Rejected": return 4;
      default: return 1;
    }
  };

  const getGrievanceStatusName = (statusId: number) => {
    switch (statusId) {
      case 1: return "Pending";
      case 2: return "Under Review";
      case 3: return "Resolved";
      case 4: return "Rejected";
      default: return "Pending";
    }
  };

  const handleGrievanceSubmit = async () => {
    if (!selectedGrievance) return;
    
    try {
      await updateGrievanceStatus(
        selectedGrievance.grievanceId,
        grievanceUpdateData.statusId,
        grievanceUpdateData.officerRemarks
      );
      // Update local grievance state immediately
      setGrievances(prev => prev.map(g => 
        g.grievanceId === selectedGrievance.grievanceId 
          ? { ...g, status: getGrievanceStatusName(grievanceUpdateData.statusId) as any }
          : g
      ));
      
      toast.success("Grievance status updated successfully!");
      setOpenGrievanceDialog(false);
    } catch (error: any) {
      console.error("Failed to update grievance:", error);
      toast.error(error?.response?.data?.message || 'Failed to update grievance status');
    }
  };

  const handleViewComplaint = async (complaintId: number) => {
    try {
      const complaint = await getComplaintById(complaintId);
      setComplaintDetails(complaint);
      setOpenComplaintDialog(true);
    } catch (error: any) {
      console.error("Failed to load complaint details:", error);
      toast.error(error?.response?.data?.message || 'Failed to load complaint details');
    }
  };

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: React.ReactNode }) => (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      border: "1px solid #e2e8f0",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        borderColor: "#cbd5e1"
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
              {title}
            </Typography>
            <Typography variant="h3" color={color} fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (isApproved === null) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (isApproved === false) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppNavbar />
        <Box sx={{ bgcolor: "#f1f5f9", flex: 1, py: 4 }}>
          <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
              <Avatar sx={{ bgcolor: "#f59e0b", mx: "auto", mb: 3, width: 80, height: 80 }}>
                <Pending sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} mb={2} color="#1f2937">
                Registration Pending
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Your officer registration is currently under review by the admin. You will be able to access the dashboard once your registration is approved.
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please wait for admin approval. You will receive notification once your account is activated.
              </Alert>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Back to Login
              </Button>
            </Paper>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar />
      <Box sx={{ bgcolor: "#f1f5f9", flex: 1, py: 4 }}>
        <Container maxWidth="lg">
        
        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
          <Box>
            <Box>
              <Typography variant="h3" fontWeight={700} mb={1}>
                Welcome back, {tokenstore.getUsername() || 'Officer'}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                {officerRole === 5 ? '🏛️ Commissioner Dashboard' : officerRole === 4 ? '🌟 Regional Head Dashboard' : officerRole === 3 ? '🏢 Department Head Dashboard' : officerRole === 2 ? '👨‍💼 Senior Officer Dashboard' : '👮‍♂️ Field Officer Dashboard'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                {officerRole === 5 ? 'Oversee all operations, review complaints and manage grievances across the system' : 
                 officerRole === 4 ? 'Monitor regional operations and handle escalated matters efficiently' :
                 officerRole === 3 ? 'Lead your department and ensure smooth complaint resolution processes' :
                 officerRole === 2 ? 'Guide junior officers and handle complex complaint cases with expertise' :
                 'Serve citizens by resolving complaints promptly and maintaining community trust'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, v) => setTabValue(v)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2
                }
              }}
            >
              <Tab icon={<Assignment />} iconPosition="start" label={officerRole === 5 ? "All Complaints" : "My Complaints"} />
              {officerRole !== 1 && <Tab icon={<Warning />} iconPosition="start" label="Grievances" />}
            </Tabs>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        {tabValue === 0 && (
        <Grid container spacing={4} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title={officerRole === 5 ? "Total" : "Assigned"} value={stats.assigned} color="#3b82f6" icon={<Assignment />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon={<Pending />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="In Progress" value={stats.inProgress} color="#06b6d4" icon={<PlayArrow />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon={<CheckCircle />} />
          </Grid>
        </Grid>
        )}

        {/* Assigned Complaints Table */}
        {tabValue === 0 && (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} color="#1f2937">
              {officerRole === 5 ? 'All Complaints' : 'My Assigned Complaints'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {officerRole === 5 ? 'View all complaints in the system' : 'Manage and update the status of complaints assigned to you'}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow 
                    key={complaint.complaintId}
                    sx={{ 
                      "&:hover": { bgcolor: "#f9fafb" },
                      "&:last-child td": { border: 0 }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#3b82f6" }}>#{complaint.complaintId}</TableCell>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>
                        {complaint.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" color="text.secondary">
                          {complaint.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{complaint.categoryName}</TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.complaintStatus}
                        color={getStatusColor(complaint.complaintStatus) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {officerRole !== 5 && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateClick(complaint)}
                            sx={{ 
                              bgcolor: "#3b82f6", 
                              color: "white",
                              "&:hover": { bgcolor: "#2563eb" }
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small"
                          onClick={() => handleViewComplaint(complaint.complaintId)}
                          sx={{ 
                            bgcolor: "#6b7280", 
                            color: "white",
                            "&:hover": { bgcolor: "#4b5563" }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}

        {/* Grievances Tab - Only for non-field officers */}
        {tabValue === 1 && officerRole !== 1 && (
          <>
            {/* Grievance Statistics Cards */}
            <Grid container spacing={4} mb={4}>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="Total" value={grievanceStats.total} color="#3b82f6" icon={<Warning />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="Pending" value={grievanceStats.pending} color="#f59e0b" icon={<Pending />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="Under Review" value={grievanceStats.underReview} color="#06b6d4" icon={<PlayArrow />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="Resolved" value={grievanceStats.resolved} color="#10b981" icon={<CheckCircle />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="Rejected" value={grievanceStats.rejected} color="#ef4444" icon={<Warning />} />
              </Grid>
            </Grid>
            
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <Typography variant="h6" fontWeight={700} color="#1f2937">
                  {officerRole === 5 ? 'All Grievances' : 'Grievances on Complaints'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {officerRole === 5 ? 'Review and manage all grievances raised by citizens' : 'Citizens have raised grievances on complaints that were handled'}
                </Typography>
              </Box>
            
            {grievances.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#f9fafb" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Grievance ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Complaint</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Citizen</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grievances.map((grievance) => (
                      <TableRow key={grievance.grievanceId} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                        <TableCell sx={{ fontWeight: 600, color: "#3b82f6" }}>#{grievance.grievanceId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{grievance.complaintTitle}</Typography>
                          <Typography variant="caption" color="text.secondary">#{grievance.complaintId}</Typography>
                        </TableCell>
                        <TableCell>{grievance.citizenName}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap title={grievance.reason}>
                            {grievance.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grievance.status}
                            color={getGrievanceStatusColor(grievance.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#6b7280" }}>
                          {new Date(grievance.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleGrievanceUpdate(grievance)}
                              sx={{ 
                                bgcolor: "#f59e0b", 
                                color: "white",
                                "&:hover": { bgcolor: "#d97706" }
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleViewComplaint(grievance.complaintId)}
                              sx={{ 
                                bgcolor: "#10b981", 
                                color: "white",
                                "&:hover": { bgcolor: "#059669" }
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Avatar sx={{ bgcolor: "#e5e7eb", mx: "auto", mb: 3, width: 80, height: 80 }}>
                  <Warning sx={{ fontSize: 40, color: "#6b7280" }} />
                </Avatar>
                <Typography variant="h6" fontWeight={600} mb={2} color="#1f2937">
                  No grievances found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  No citizens have raised grievances on your handled complaints
                </Typography>
              </Box>
            )}
            </Paper>
          </>
        )}

        {complaints.length === 0 && tabValue === 0 && (
          <Paper elevation={0} sx={{ textAlign: "center", py: 8, borderRadius: 3, bgcolor: "white" }}>
            <Avatar sx={{ bgcolor: "#e5e7eb", mx: "auto", mb: 3, width: 80, height: 80 }}>
              <Assignment sx={{ fontSize: 40, color: "#6b7280" }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} mb={2} color="#1f2937">
              {officerRole === 5 ? 'No complaints in the system' : 'No complaints assigned yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {officerRole === 5 ? 'No complaints have been filed yet' : 'You will see complaints here once they are assigned to you by the admin'}
            </Typography>
          </Paper>
        )}

        {/* Update Status Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Complaint Status</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Complaint: {selectedComplaint?.title}
            </Typography>
            
            {selectedComplaint?.imagePath && (
              <Box>
                <Typography variant="subtitle2" mb={1}>Citizen's Evidence:</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <img 
                    src={`https://localhost:7094${selectedComplaint.imagePath}`} 
                    alt="Complaint evidence" 
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => window.open(`https://localhost:7094${selectedComplaint.imagePath}`, '_blank')}
                    sx={{ textTransform: 'none' }}
                  >
                    View
                  </Button>
                </Box>
              </Box>
            )}
            
            <TextField
              select
              label="Status"
              value={updateData.statusId}
              onChange={(e) => setUpdateData({ ...updateData, statusId: Number(e.target.value) })}
              fullWidth
            >
              <MenuItem value={1}>Pending</MenuItem>
              <MenuItem value={2}>In Progress</MenuItem>
              <MenuItem value={3}>Resolved</MenuItem>
              <MenuItem value={4}>Closed</MenuItem>
            </TextField>
            
            <TextField
              label="Officer Remarks"
              multiline
              rows={3}
              value={updateData.officerRemarks}
              onChange={(e) => setUpdateData({ ...updateData, officerRemarks: e.target.value })}
              fullWidth
              placeholder="Add your remarks about this complaint..."
            />
            
            {(updateData.statusId === 3 || updateData.statusId === 4) && (
              <Box>
                <Typography variant="subtitle2" mb={1}>Upload Proof (Optional):</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{ textTransform: 'none' }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {proofFile && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="success.main">
                        {proofFile.name}
                      </Typography>
                      <img 
                        src={URL.createObjectURL(proofFile)} 
                        alt="Proof preview" 
                        style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained">
            Update Status
          </Button>
        </DialogActions>
        </Dialog>

        {/* Grievance Update Dialog */}
        <Dialog open={openGrievanceDialog} onClose={() => setOpenGrievanceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Grievance Status</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Grievance: {selectedGrievance?.reason}
              </Typography>
              <TextField
                select
                label="Status"
                value={grievanceUpdateData.statusId}
                onChange={(e) => setGrievanceUpdateData({ ...grievanceUpdateData, statusId: Number(e.target.value) })}
                fullWidth
              >
                <MenuItem value={1}>Pending</MenuItem>
                <MenuItem value={2}>Under Review</MenuItem>
                <MenuItem value={3}>Resolved</MenuItem>
                <MenuItem value={4}>Rejected</MenuItem>
              </TextField>
              <TextField
                label="Officer Remarks"
                multiline
                rows={3}
                value={grievanceUpdateData.officerRemarks}
                onChange={(e) => setGrievanceUpdateData({ ...grievanceUpdateData, officerRemarks: e.target.value })}
                fullWidth
                placeholder="Add your remarks about this grievance..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGrievanceDialog(false)}>Cancel</Button>
            <Button onClick={handleGrievanceSubmit} variant="contained">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Complaint Details Dialog */}
        <Dialog open={openComplaintDialog} onClose={() => setOpenComplaintDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Original Complaint Details</DialogTitle>
          <DialogContent>
            {complaintDetails && (
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <Typography variant="h6">{complaintDetails.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>ID:</strong> #{complaintDetails.complaintId}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {complaintDetails.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {complaintDetails.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {complaintDetails.categoryName}
                </Typography>
                <Typography variant="body2">
                  <strong>Department:</strong> {complaintDetails.departmentName}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> 
                  <Chip 
                    label={complaintDetails.complaintStatus} 
                    color={getStatusColor(complaintDetails.complaintStatus) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(complaintDetails.createdAt).toLocaleDateString()}
                </Typography>
                {complaintDetails.officerRemarks && (
                  <Typography variant="body2">
                    <strong>Officer Remarks:</strong> {complaintDetails.officerRemarks}
                  </Typography>
                )}
                {complaintDetails.imagePath && (
                  <Box>
                    <Typography variant="body2" mb={1}><strong>Citizen's Evidence:</strong></Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <img 
                        src={`https://localhost:7094${complaintDetails.imagePath}`} 
                        alt="Complaint" 
                        style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(`https://localhost:7094${complaintDetails.imagePath}`, '_blank')}
                        sx={{ textTransform: 'none' }}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                )}
                {complaintDetails.officerImagePath && (
                  <Box>
                    <Typography variant="body2" mb={1}><strong>Officer's Proof:</strong></Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <img 
                        src={`https://localhost:7094${complaintDetails.officerImagePath}`} 
                        alt="Officer Proof" 
                        style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(`https://localhost:7094${complaintDetails.officerImagePath}`, '_blank')}
                        sx={{ textTransform: 'none' }}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenComplaintDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}