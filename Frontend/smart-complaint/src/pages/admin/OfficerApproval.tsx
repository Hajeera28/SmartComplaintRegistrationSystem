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
  Box,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  IconButton,
  Fab,
} from "@mui/material";
import { 
  PersonAdd, 
  CheckCircle, 
  Pending, 
  Email, 
  Business,
  Security,
  Delete,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { getAllOfficers, approveOfficer, deleteOfficer, type Officer } from "../../api/admin.api";
import AppNavbar from "../../components/AppNavbar";
import { toast } from 'react-toastify';

export default function OfficerApproval() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const data = await getAllOfficers();

      setOfficers(data);
    } catch (error) {
      console.error("Failed to load officers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (officerId: string) => {
    try {
      await approveOfficer(officerId);
      setOfficers(prev => 
        prev.map(officer => 
          officer.officerId === officerId 
            ? { ...officer, isApproved: true }
            : officer
        )
      );
    } catch (error: any) {
      console.error("Failed to approve officer:", error);
      toast.error(error?.response?.data?.message || 'Failed to approve officer. Please try again.');
    }
  };

  const handleDelete = async (officerId: string) => {
    if (!window.confirm('Are you sure you want to delete this officer?')) return;
    
    try {
      await deleteOfficer(officerId);
      setOfficers(prev => prev.filter(officer => officer.officerId !== officerId));
      toast.success('Officer deleted successfully!');
    } catch (error: any) {
      console.error("Failed to delete officer:", error);
      toast.error(error?.response?.data?.message || 'Failed to delete officer. Please try again.');
    }
  };

  const getRoleText = (role: string | number) => {
    if (typeof role === 'number') {
      switch (role) {
        case 1: return 'Field Officer';
        case 2: return 'Senior Officer';
        case 3: return 'Department Head';
        case 4: return 'Regional Head';
        case 5: return 'Commissioner';
        default: return 'Unknown Role';
      }
    }
    return role || 'Unknown Role';
  };

  const pendingOfficers = officers.filter(o => !o.isApproved);
  const approvedOfficers = officers.filter(o => o.isApproved);

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
              <PersonAdd sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={1}>
                Officer Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Review and approve officer registrations
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
                  {pendingOfficers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
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
                  {approvedOfficers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Approved Officers</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Officers */}
        <Paper elevation={0} sx={{ borderRadius: 3, mb: 4, overflow: "hidden" }}>
          <Box sx={{ p: 3, bgcolor: "#fef3c7", borderBottom: "1px solid #f59e0b" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Pending sx={{ color: "#f59e0b" }} />
              <Typography variant="h6" fontWeight={700} color="#92400e">
                Pending Approvals ({pendingOfficers.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="#92400e" sx={{ opacity: 0.8 }}>
              Officers waiting for approval to access the system
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Officer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Proof Document</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingOfficers.map((officer) => (
                  <TableRow 
                    key={officer.officerId}
                    sx={{ 
                      "&:hover": { bgcolor: "#f9fafb" },
                      "&:last-child td": { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#3b82f6", width: 40, height: 40 }}>
                          <Security />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {officer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {officer.officerId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" color="text.secondary">
                          {officer.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2">
                          {officer.departmentName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleText(officer.role)} 
                        size="small" 
                        sx={{ bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {officer.proofDocumentPath ? (
                        <Box>
                          <img 
                            src={`https://localhost:7094${officer.proofDocumentPath}`} 
                            alt="Officer ID Proof" 
                            style={{ 
                              width: '100px', 
                              height: '60px', 
                              objectFit: 'cover', 
                              borderRadius: '6px',
                              border: '2px solid #e5e7eb',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`https://localhost:7094${officer.proofDocumentPath}`, '_blank')}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'center', fontSize: '0.7rem' }}>
                            Click to view
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" color="error" fontWeight={500} fontSize="0.8rem">
                            No proof
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            Not uploaded
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleApprove(officer.officerId)}
                          sx={{
                            bgcolor: "#10b981",
                            "&:hover": { bgcolor: "#059669" },
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        >
                          Approve
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(officer.officerId)}
                          sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingOfficers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No pending officer approvals
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Approved Officers */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3, bgcolor: "#d1fae5", borderBottom: "1px solid #10b981" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle sx={{ color: "#10b981" }} />
              <Typography variant="h6" fontWeight={700} color="#065f46">
                Approved Officers ({approvedOfficers.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="#065f46" sx={{ opacity: 0.8 }}>
              Officers with active system access
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Officer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedOfficers.map((officer) => (
                  <TableRow 
                    key={officer.officerId}
                    sx={{ 
                      "&:hover": { bgcolor: "#f9fafb" },
                      "&:last-child td": { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#10b981", width: 40, height: 40 }}>
                          <Security />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {officer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {officer.officerId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" color="text.secondary">
                          {officer.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2">
                          {officer.departmentName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleText(officer.role)} 
                        size="small" 
                        sx={{ bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          icon={<CheckCircle sx={{ fontSize: 16 }} />}
                          label="Approved" 
                          color="success" 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(officer.officerId)}
                          sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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