import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Box,
  Snackbar,
  Alert,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Fab,
} from "@mui/material";
import {
  Assignment,
  Person,
  Business,
  Category,
  CalendarToday,
  CheckCircle,
  Pending,
  LocationOn,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { getAllComplaints } from "../../api/complaint.api";
import { getAllOfficers, assignComplaint, type Officer } from "../../api/admin.api";
import { type Complaint } from "../../types/Complaint";
import AppNavbar from "../../components/AppNavbar";
import { toast } from 'react-toastify';

export default function ComplaintAssignment() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsData, officersData] = await Promise.all([
        getAllComplaints(),
        getAllOfficers()
      ]);
      setComplaints(complaintsData);
      setOfficers(officersData.filter(o => o.isApproved));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSelectedOfficer("");
    setAssignDialog(true);
  };

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedOfficer) return;
    
    try {
      await assignComplaint(selectedComplaint.complaintId, selectedOfficer);
      
      // Reload data from server to get updated assignment info
      await loadData();
      
      setAssignDialog(false);
      setSelectedComplaint(null);
      setSelectedOfficer("");
      
      const officerName = officers.find(o => o.officerId === selectedOfficer)?.name;
      setSnackbar({ 
        open: true, 
        message: `Complaint successfully assigned to ${officerName}` 
      });
    } catch (error: any) {
      console.error("Failed to assign complaint:", error);
      toast.error(error?.response?.data?.message || 'Failed to assign complaint. Please try again.');
    }
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

  const unassignedComplaints = complaints.filter(c => !c.assignedOfficerId);
  const assignedComplaints = complaints.filter(c => c.assignedOfficerId);

  const getOfficerName = (officerId: string) => {
    const officer = officers.find(o => o.officerId === officerId);
    return officer ? officer.name : officerId;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppNavbar />
      <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
              <Assignment sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={1}>
                Complaint Assignment
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Assign complaints to appropriate officers
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Avatar sx={{ bgcolor: "#f59e0b", mx: "auto", mb: 2, width: 56, height: 56 }}>
                  <Pending />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">
                  {unassignedComplaints.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Unassigned</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Avatar sx={{ bgcolor: "#10b981", mx: "auto", mb: 2, width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="#10b981">
                  {assignedComplaints.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Assigned</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* All Complaints */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} color="#1f2937">
              All Complaints ({complaints.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unassigned: {unassignedComplaints.length} • Assigned: {assignedComplaints.length}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Complaint</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Assigned Officer</TableCell>
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
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#3b82f6">
                          #{complaint.complaintId}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200 }} noWrap>
                          {complaint.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Business sx={{ fontSize: 14, color: "#6b7280" }} />
                          <Typography variant="caption" color="text.secondary">
                            {complaint.departmentName}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Category sx={{ fontSize: 14, color: "#6b7280" }} />
                          <Typography variant="caption" color="text.secondary">
                            {complaint.categoryName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.complaintStatus}
                        color={getStatusColor(complaint.complaintStatus) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {complaint.assignedOfficerId ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: "#10b981", width: 24, height: 24 }}>
                            <Person sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {getOfficerName(complaint.assignedOfficerId)}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip 
                          label="Unassigned" 
                          size="small" 
                          sx={{ bgcolor: "#fef3c7", color: "#92400e" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 14, color: "#6b7280" }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={complaint.assignedOfficerId ? "outlined" : "contained"}
                        size="small"
                        onClick={() => handleAssignClick(complaint)}
                        disabled={!!complaint.assignedOfficerId}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          ...(complaint.assignedOfficerId ? {
                            color: "#6b7280",
                            borderColor: "#d1d5db"
                          } : {
                            bgcolor: "#3b82f6",
                            "&:hover": { bgcolor: "#2563eb" }
                          })
                        }}
                      >
                        {complaint.assignedOfficerId ? "Assigned" : "Assign"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {complaints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No complaints found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Assignment Dialog */}
        <Dialog 
          open={assignDialog} 
          onClose={() => setAssignDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "#3b82f6" }}>
                <Assignment />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                Assign Complaint
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {/* Complaint Info */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={2} color="#374151">
                Complaint Details
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body2" fontWeight={600} color="#3b82f6">
                  #{selectedComplaint?.complaintId}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedComplaint?.title}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Business sx={{ fontSize: 16, color: "#6b7280" }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedComplaint?.departmentName}
                </Typography>
              </Box>
            </Paper>

            {/* Officer Selection */}
            <TextField
              select
              label="Select Officer"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={2}>
                  <Person sx={{ color: "#6b7280" }} />
                  <Typography>Choose an officer</Typography>
                </Box>
              </MenuItem>
              {officers
                .filter(o => o.departmentName === selectedComplaint?.departmentName && o.role !== 'Commissioner')
                .map((officer) => (
                  <MenuItem key={officer.officerId} value={officer.officerId}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#3b82f6", width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {officer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {officer.officerId} • {officer.role}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
            </TextField>
            {officers.filter(o => o.departmentName === selectedComplaint?.departmentName && o.role !== 'Commissioner').length === 0 && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                No approved officers available for this department
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setAssignDialog(false)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              variant="contained"
              disabled={!selectedOfficer}
              sx={{ 
                textTransform: "none", 
                fontWeight: 600,
                borderRadius: 2,
                px: 3
              }}
            >
              Assign Officer
            </Button>
          </DialogActions>
        </Dialog>

      {/* Success Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ open: false, message: "" })}
      >
        <Alert severity="success" onClose={() => setSnackbar({ open: false, message: "" })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
      
      {/* Back to Dashboard Button */}
      <Fab
        color="primary"
        onClick={() => window.history.back()}
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
    </>
  );
}