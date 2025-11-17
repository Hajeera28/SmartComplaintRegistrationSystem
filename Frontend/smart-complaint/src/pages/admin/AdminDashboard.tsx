import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
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
  Avatar,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from "@mui/material";
import { 
  Visibility as ViewIcon, 
  Assignment, 
  PersonAdd,
  Dashboard,
  People,
  Business,
  ReportProblem,
  TrendingUp,
  CheckCircle,
  Pending,
  PlayArrow,
  Add,
  Category as CategoryIcon,
  Edit,
  Warning,
  Delete
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllComplaints } from "../../api/complaint.api";
import { getAllOfficers, getAllCitizens, approveOfficer, denyOfficer, type Officer, type CitizenInfo } from "../../api/admin.api";
import { getAllDepartments, getAllCategories, addDepartment, addCategory, deleteCategory, deleteDepartment, type Department, type Category } from "../../api/department.api";
import { toast } from 'react-toastify';
import { getAllGrievances, updateGrievanceStatus, type Grievance } from "../../api/grievance.api";
import { type Complaint } from "../../types/Complaint";
import AppNavbar from "../../components/AppNavbar";
import Footer from "../../components/Footer";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [citizens, setCitizens] = useState<CitizenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addDialog, setAddDialog] = useState({ open: false, type: '', item: '', description: '', departmentId: 0 });
  const [grievanceDialog, setGrievanceDialog] = useState({ open: false, grievance: null as Grievance | null, remarks: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    loadAllData();
    
    // Poll for grievance updates every 2 minutes (reduced frequency)
    const interval = setInterval(() => {
      if (tabValue === 1) { // Only poll when grievances tab is active
        getAllGrievances()
          .then(data => setGrievances(data))
          .catch(() => {});
      }
    }, 120000); // 2 minutes instead of 45 seconds
    
    return () => clearInterval(interval);
  }, [tabValue]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // Load only essential data initially
      const [complaintsData, officersData] = await Promise.all([
        getAllComplaints(),
        getAllOfficers()
      ]);
      setComplaints(complaintsData);
      setOfficers(officersData);
      calculateStats(complaintsData);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tabIndex: number) => {
    try {
      switch (tabIndex) {
        case 1: // Grievances
          if (grievances.length === 0) {
            const grievancesData = await getAllGrievances();
            setGrievances(grievancesData);
          }
          break;
        case 2: // Departments
          if (departments.length === 0 || categories.length === 0) {
            const [departmentsData, categoriesData] = await Promise.all([
              getAllDepartments(),
              getAllCategories()
            ]);
            setDepartments(departmentsData);
            setCategories(categoriesData);
          }
          break;
        case 4: // Citizens
          if (citizens.length === 0) {
            const citizensData = await getAllCitizens();
            setCitizens(citizensData);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to load tab data:', error);
    }
  };



  const handleAddItem = async () => {
    if (!addDialog.item.trim()) return;
    
    try {
      if (addDialog.type === 'department') {
        const newDepartment = await addDepartment(addDialog.item, addDialog.description);
        setDepartments([...departments, newDepartment]);
      } else if (addDialog.type === 'category' && addDialog.departmentId) {
        const newCategory = await addCategory(addDialog.item, addDialog.departmentId);
        setCategories([...categories, newCategory]);
      }
      
      setAddDialog({ open: false, type: '', item: '', description: '', departmentId: 0 });
      toast.success(`${addDialog.type === 'department' ? 'Department' : 'Category'} added successfully!`);
    } catch (error: any) {
      console.error(`Failed to add ${addDialog.type}:`, error);
      toast.error(error?.response?.data?.message || `Failed to add ${addDialog.type}. Please try again.`);
    }
  };

  const getCategoriesByDepartment = (departmentId: number) => {
    return categories.filter(cat => cat.departmentId === departmentId);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteCategory(categoryId);
          setCategories(categories.filter(cat => cat.categoryId !== categoryId));
          toast.success('Category deleted successfully!');
        } catch (error: any) {
          console.error('Failed to delete category:', error);
          toast.error(error?.response?.data?.message || 'Failed to delete category. Please try again.');
        }
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    const deptCategories = getCategoriesByDepartment(departmentId);
    if (deptCategories.length > 0) {
      toast.error('Cannot delete department with existing categories. Please delete all categories first.');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Department',
      message: 'Are you sure you want to delete this department? This action cannot be undone.',
      onConfirm: async () => {
        try {

          await deleteDepartment(departmentId);
          setDepartments(departments.filter(dept => dept.departmentId !== departmentId));
          toast.success('Department deleted successfully!');
        } catch (error: any) {

          toast.error(error?.response?.data?.message || `Failed to delete department. Status: ${error?.response?.status || 'Unknown'}`);
        }
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleApproveOfficer = async (officerId: string) => {
    try {
      await approveOfficer(officerId);
      setOfficers(officers.map(o => 
        o.officerId === officerId ? { ...o, isApproved: true } : o
      ));
      toast.success('Officer approved successfully!');
    } catch (error: any) {
      console.error('Failed to approve officer:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve officer. Please try again.');
    }
  };

  const handleDenyOfficer = async (officerId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Deny Officer Registration',
      message: 'Are you sure you want to deny this officer registration? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await denyOfficer(officerId);
          setOfficers(officers.filter(o => o.officerId !== officerId));
          toast.success('Officer registration denied successfully!');
        } catch (error: any) {
          console.error('Failed to deny officer:', error);
          toast.error(error?.response?.data?.message || 'Failed to deny officer. Please try again.');
        }
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleGrievanceAction = async (action: 'resolve' | 'reject') => {
    if (!grievanceDialog.grievance) return;
    
    try {
      const statusId = action === 'resolve' ? 3 : 4; // 3=Resolved, 4=Rejected
      const status = action === 'resolve' ? 'Resolved' : 'Rejected';
      await updateGrievanceStatus(grievanceDialog.grievance.grievanceId, statusId, grievanceDialog.remarks);
      
      // Update local state
      setGrievances(grievances.map(g => 
        g.grievanceId === grievanceDialog.grievance!.grievanceId 
          ? { ...g, grievanceStatus: status, officerRemarks: grievanceDialog.remarks }
          : g
      ));
      
      toast.success(`Grievance ${action}d successfully!`);
      setGrievanceDialog({ open: false, grievance: null, remarks: '' });
      
      // Delay reload to prevent override
      setTimeout(() => {
        getAllGrievances().then(data => setGrievances(data)).catch(() => {});
      }, 2000);
    } catch (error: any) {
      console.error(`Failed to ${action} grievance:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} grievance. Please try again.`);
    }
  };

  const calculateStats = (data: Complaint[]) => {
    const stats = {
      total: data.length,
      pending: data.filter(c => c.complaintStatus === "Pending").length,
      inProgress: data.filter(c => c.complaintStatus === "InProgress").length,
      resolved: data.filter(c => c.complaintStatus === "Resolved").length,
      closed: data.filter(c => c.complaintStatus === "Closed").length,
    };
    setStats(stats);
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

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: React.ReactNode }) => (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)"
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar />
      <Box sx={{ bgcolor: "#f1f5f9", flex: 1, py: 4 }}>
        <Container maxWidth="xl">
        
        {/* Header Section */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          background: "linear-gradient(135deg, #000080 0%, #1e293b 50%, #3b82f6 100%)", 
          color: "white", 
          borderRadius: 4, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          borderTop: '4px solid #ff9933',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "rgba(255,153,51,0.2)", width: 64, height: 64, border: "2px solid rgba(255,255,255,0.2)" }}>
                <Dashboard sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} mb={1}>
                  प्रशासन पैनल | Admin Panel
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  System overview and management controls for government operations
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate("/admin/officers")}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  }
                }}
              >
                Manage Officers
              </Button>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => navigate("/admin/assignments")}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  }
                }}
              >
                Assign Complaints
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={4} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Total Complaints" value={stats.total} color="#3b82f6" icon={<ReportProblem />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon={<Pending />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="In Progress" value={stats.inProgress} color="#06b6d4" icon={<PlayArrow />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon={<CheckCircle />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Closed" value={stats.closed} color="#6b7280" icon={<Assignment />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Officer Approvals" value={officers.filter(o => !o.isApproved).length} color="#ef4444" icon={<PersonAdd />} />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, v) => {
                setTabValue(v);
                loadTabData(v);
              }}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2
                }
              }}
            >
              <Tab icon={<ReportProblem />} iconPosition="start" label="All Complaints" />
              <Tab icon={<Warning />} iconPosition="start" label="Grievances" />
              <Tab icon={<Business />} iconPosition="start" label="Departments" />
              <Tab icon={<People />} iconPosition="start" label="Officers" />
              <Tab icon={<People />} iconPosition="start" label="Citizens" />
            </Tabs>
          </Box>

          {/* All Complaints Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <TableContainer sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Created</TableCell>
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
                        <TableCell sx={{ fontWeight: 500 }}>{complaint.title}</TableCell>
                        <TableCell>{complaint.departmentName}</TableCell>
                        <TableCell>{complaint.categoryName}</TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.complaintStatus}
                            color={getStatusColor(complaint.complaintStatus) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#6b7280" }}>
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Grievances Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700} color="#1f2937">
                  Citizen Grievances
                </Typography>
                <Chip 
                  label={`${grievances.filter(g => g.grievanceStatus === 'Pending').length} Pending`} 
                  color="warning" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <TableContainer sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Grievance ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Complaint</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Assigned Officer</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Raised Date</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grievances.map((grievance) => (
                      <TableRow key={grievance.grievanceId} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                        <TableCell sx={{ fontWeight: 600, color: "#3b82f6" }}>#{grievance.grievanceId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{grievance.complaintTitle}</Typography>
                          <Typography variant="caption" color="text.secondary">Officer: {grievance.originalOfficerName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{grievance.assignedOfficerName || 'Unassigned'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grievance.grievanceStatus}
                            color={grievance.grievanceStatus === 'Pending' ? 'warning' : grievance.grievanceStatus === 'Under Review' ? 'info' : grievance.grievanceStatus === 'Resolved' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#6b7280" }}>
                          {new Date(grievance.raisedDate).toLocaleDateString()}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Departments Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700} color="#1f2937">
                  Department & Category Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddDialog({ open: true, type: 'department', item: '', description: '', departmentId: 0 })}
                  sx={{ textTransform: 'none' }}
                >
                  Add Department
                </Button>
              </Box>
              <Grid container spacing={3}>
                {departments.map((dept) => {
                  const deptCategories = getCategoriesByDepartment(dept.departmentId);
                  return (
                    <Grid size={{ xs: 12 }} key={dept.departmentId}>
                      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: "#3b82f6", width: 48, height: 48 }}>
                                <Business />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>{dept.departmentName}</Typography>
                                {dept.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {dept.description}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                  {complaints.filter(c => c.departmentName === dept.departmentName).length} Active Complaints
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => setAddDialog({ open: true, type: 'category', item: '', description: '', departmentId: dept.departmentId })}
                                sx={{ textTransform: 'none' }}
                              >
                                Add Category
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDepartment(dept.departmentId)}
                                sx={{ color: "#ef4444" }}
                              >
                                <Delete sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Typography variant="subtitle2" mb={2} color="#374151">
                            Categories ({deptCategories.length})
                          </Typography>
                          
                          <Grid container spacing={2}>
                            {deptCategories.map((category) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.categoryId}>
                                <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Avatar sx={{ bgcolor: "#e5e7eb", width: 32, height: 32 }}>
                                        <CategoryIcon sx={{ color: "#6b7280", fontSize: 16 }} />
                                      </Avatar>
                                      <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>{category.categoryName}</Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteCategory(category.categoryId)}
                                        sx={{ color: "#ef4444", ml: 1 }}
                                      >
                                        <Delete sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                            
                            {deptCategories.length === 0 && (
                              <Grid size={{ xs: 12 }}>
                                <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                  <Typography variant="body2">No categories added yet</Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

      {/* Officers Tab */}
      {tabValue === 3 && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Officer ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {officers.filter(o => o.isApproved).map((officer) => (
                  <TableRow key={officer.officerId} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#3b82f6" }}>{officer.officerId}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{officer.name}</TableCell>
                    <TableCell>{officer.email}</TableCell>
                    <TableCell>{officer.role}</TableCell>
                    <TableCell>{officer.departmentName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Citizens Tab */}
      {tabValue === 4 && (
        <Box sx={{ p: 3 }}>
          <TableContainer sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Citizen ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Complaints</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {citizens.map((citizen) => (
                  <TableRow key={citizen.citizenId} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#3b82f6" }}>{citizen.citizenId}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{citizen.name}</TableCell>
                    <TableCell>{citizen.email}</TableCell>
                    <TableCell>{citizen.phone}</TableCell>
                    <TableCell>{citizen.complaintCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
        </Paper>
        
        {/* Add Department/Category Dialog */}
        <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, type: '', item: '', description: '', departmentId: 0 })} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add New {addDialog.type === 'department' ? 'Department' : `Category to ${departments.find(d => d.departmentId === addDialog.departmentId)?.departmentName}`}
          </DialogTitle>
          <DialogContent>
            {addDialog.type === 'category' && (
              <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                Adding category to: <strong>{departments.find(d => d.departmentId === addDialog.departmentId)?.departmentName}</strong>
              </Alert>
            )}
            <TextField
              fullWidth
              label={`${addDialog.type === 'department' ? 'Department' : 'Category'} Name`}
              value={addDialog.item}
              onChange={(e) => setAddDialog({ ...addDialog, item: e.target.value })}
              sx={{ mt: 2 }}
              placeholder={addDialog.type === 'department' ? 'e.g., Traffic Police' : 'e.g., Signal Malfunction'}
            />
            {addDialog.type === 'department' && (
              <TextField
                fullWidth
                label="Department Description"
                value={addDialog.description}
                onChange={(e) => setAddDialog({ ...addDialog, description: e.target.value })}
                sx={{ mt: 2 }}
                multiline
                rows={2}
                placeholder="e.g., Handles traffic violations and road safety issues"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialog({ open: false, type: '', item: '', description: '', departmentId: 0 })}>Cancel</Button>
            <Button onClick={handleAddItem} variant="contained" disabled={!addDialog.item.trim()}>
              Add {addDialog.type === 'department' ? 'Department' : 'Category'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Grievance Review Dialog */}
        <Dialog open={grievanceDialog.open} onClose={() => setGrievanceDialog({ open: false, grievance: null, remarks: '' })} maxWidth="md" fullWidth>
          <DialogTitle>Review Grievance</DialogTitle>
          <DialogContent>
            {grievanceDialog.grievance && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">Complaint: {grievanceDialog.grievance.complaintTitle}</Typography>
                  <Typography variant="body2">Original Officer: {grievanceDialog.grievance.originalOfficerName}</Typography>
                  <Typography variant="body2">Assigned Officer: {grievanceDialog.grievance.assignedOfficerName}</Typography>
                </Alert>
                
                <Typography variant="subtitle2" mb={1}>Grievance Description:</Typography>
                <Paper sx={{ p: 2, bgcolor: "#f9fafb", mb: 3 }}>
                  <Typography variant="body2">{grievanceDialog.grievance.description}</Typography>
                </Paper>
                
                {grievanceDialog.grievance.imagePath && (
                  <>
                    <Typography variant="subtitle2" mb={1}>Attached Image:</Typography>
                    <Box sx={{ mb: 3 }}>
                      <img 
                        src={`https://localhost:7094${grievanceDialog.grievance.imagePath}`} 
                        alt="Grievance evidence" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  </>
                )}
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Officer Remarks"
                  value={grievanceDialog.remarks}
                  onChange={(e) => setGrievanceDialog({ ...grievanceDialog, remarks: e.target.value })}
                  placeholder="Add your remarks about this grievance..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGrievanceDialog({ open: false, grievance: null, remarks: '' })}>Cancel</Button>
            <Button onClick={() => handleGrievanceAction('reject')} color="error" variant="outlined">
              Reject
            </Button>
            <Button onClick={() => handleGrievanceAction('resolve')} variant="contained" color="success">
              Resolve
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} })} maxWidth="sm" fullWidth>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} })}>Cancel</Button>
            <Button onClick={confirmDialog.onConfirm} variant="contained" color="error">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}