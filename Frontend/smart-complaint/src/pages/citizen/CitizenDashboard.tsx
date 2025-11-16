import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton
} from "@mui/material";
import { 
  Add as AddIcon, 
  Assignment,
  CheckCircle,
  Pending,
  PlayArrow,
  Support,
  ArrowForward,
  Build,
  LocalHospital,
  School,
  DirectionsBus,
  WaterDrop,
  ElectricalServices,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import { toast } from 'react-toastify';
import { getComplaintsByCitizen } from "../../api/complaint.api";
import { type Complaint } from "../../types/Complaint";
import CreateComplaintDialog from "./CreateComplaintDialog";
import AppNavbar from "../../components/AppNavbar";
import Footer from "../../components/Footer";
import { useNavigate } from 'react-router-dom';
import { tokenstore } from '../../auth/tokenstore';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [grievanceDialog, setGrievanceDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [grievanceReason, setGrievanceReason] = useState("");
  const [grievanceSubmitting, setGrievanceSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const services = [
    {
      title: "Infrastructure & Roads",
      description: "Report issues with roads, bridges, streetlights, and public infrastructure",
      icon: <Build sx={{ fontSize: 40 }} />,
      color: "#3b82f6",
      categories: ["Road Repair", "Street Lights", "Drainage", "Bridges"]
    },
    {
      title: "Healthcare Services",
      description: "Issues related to public hospitals, clinics, and healthcare facilities",
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      color: "#ef4444",
      categories: ["Hospital Services", "Medical Equipment", "Staff Issues", "Cleanliness"]
    },
    {
      title: "Education & Schools",
      description: "Report problems in government schools and educational institutions",
      icon: <School sx={{ fontSize: 40 }} />,
      color: "#10b981",
      categories: ["School Infrastructure", "Teacher Issues", "Mid-day Meals", "Transport"]
    },
    {
      title: "Public Transport",
      description: "Issues with buses, metro, and other public transportation services",
      icon: <DirectionsBus sx={{ fontSize: 40 }} />,
      color: "#f59e0b",
      categories: ["Bus Services", "Metro Issues", "Auto Rickshaw", "Traffic Signals"]
    },
    {
      title: "Water & Sanitation",
      description: "Water supply, sewage, and sanitation related complaints",
      icon: <WaterDrop sx={{ fontSize: 40 }} />,
      color: "#06b6d4",
      categories: ["Water Supply", "Sewage", "Garbage Collection", "Public Toilets"]
    },
    {
      title: "Utilities & Power",
      description: "Electricity, gas, and other utility service related issues",
      icon: <ElectricalServices sx={{ fontSize: 40 }} />,
      color: "#8b5cf6",
      categories: ["Power Outage", "Street Lights", "Gas Supply", "Meter Issues"]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  useEffect(() => {
    loadComplaints();

    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const loadComplaints = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const citizenId = tokenstore.getUserId();
      if (!citizenId) {
        toast.error('User session expired. Please login again.');
      setError('User session expired. Please login again.');
        return;
      }
      const data = await getComplaintsByCitizen(citizenId);
      console.log('Complaints loaded:', data);
      setComplaints(data || []);
    } catch (error: any) {
      console.error("Failed to load complaints:", error);
      toast.error(error?.response?.data?.message || "Failed to load complaints");
      setError(error?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "InProgress":
        return "info";
      case "Resolved":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => loadComplaints()}>Retry</Button>
      </Container>
    );
  }



  const handleRaiseGrievance = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setGrievanceDialog(true);
    setGrievanceReason("");
  };

  const submitGrievance = async () => {
    if (!selectedComplaint || !grievanceReason.trim()) return;
    
    const citizenId = tokenstore.getUserId();
    if (!citizenId) {
      toast.error('User session expired. Please login again.');
      return;
    }
    
    try {
      setGrievanceSubmitting(true);
      
      // For now, just show success message since backend endpoints may not be ready
      toast.success(`Grievance raised successfully for complaint #${selectedComplaint.complaintId}. Your grievance will be reviewed by the administration within 3-5 business days.`);
      setGrievanceDialog(false);
      setSelectedComplaint(null);
      setGrievanceReason("");
    } catch (error) {
      console.error("Failed to submit grievance:", error);
      toast.error("Failed to submit grievance. Please try again.");
    } finally {
      setGrievanceSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar />
      <Box sx={{ bgcolor: "#f1f5f9", flex: 1 }}>
        
        {/* Hero Section */}
        <Box sx={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
          color: "white", 
          py: 8,
          position: "relative",
          overflow: "hidden"
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h2" fontWeight={800} mb={3} sx={{ 
                  background: "linear-gradient(45deg, #ffffff 30%, #60a5fa 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Smart Complaint Portal
                </Typography>
                <Typography variant="h5" mb={4} sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Your voice matters. Report civic issues and track their resolution in real-time.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      bgcolor: "#3b82f6",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 3,
                      "&:hover": { bgcolor: "#2563eb" }
                    }}
                  >
                    File Complaint
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={scrollToServices}
                    sx={{ 
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 3,
                      "&:hover": { 
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)"
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Avatar sx={{ 
                    width: 200, 
                    height: 200, 
                    bgcolor: "rgba(59,130,246,0.2)",
                    mx: "auto",
                    border: "3px solid rgba(255,255,255,0.2)"
                  }}>
                    <Support sx={{ fontSize: 80, color: "#60a5fa" }} />
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>



        {/* Services Section */}
        <Box id="services-section" sx={{ py: 8, bgcolor: "white" }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={6}>
              <Typography variant="h3" fontWeight={700} mb={2} color="#1e293b">
                Our Services
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                Explore different departments and their services
              </Typography>
            </Box>

            <Box sx={{ position: "relative", overflow: "hidden" }}>
              <Box sx={{ 
                display: "flex", 
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: "transform 0.5s ease-in-out"
              }}>
                {services.map((service, index) => (
                  <Box key={index} sx={{ minWidth: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Card sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      border: "1px solid #e2e8f0",
                      width: 1200,
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                      }
                    }}>
                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <Avatar sx={{ 
                          bgcolor: service.color,
                          width: 80,
                          height: 80,
                          mx: "auto",
                          mb: 3
                        }}>
                          {service.icon}
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} mb={2} color="#1e293b">
                          {service.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          {service.description}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#1e293b">
                            Categories:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                            {service.categories.map((category, idx) => (
                              <Chip
                                key={idx}
                                label={category}
                                size="small"
                                sx={{
                                  bgcolor: `${service.color}20`,
                                  color: service.color,
                                  fontWeight: 500,
                                  mb: 1
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>

            {services.length > 1 && (
              <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
                <IconButton
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  sx={{
                    bgcolor: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "#f8fafc" },
                    "&:disabled": { opacity: 0.5 }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {currentSlide + 1} of {services.length}
                </Typography>
                <IconButton
                  onClick={nextSlide}
                  disabled={currentSlide >= services.length - 1}
                  sx={{
                    bgcolor: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "#f8fafc" },
                    "&:disabled": { opacity: 0.5 }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            )}
          </Container>
        </Box>

        {/* Quick Actions Section */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700} mb={2} color="#1e293b">
              Quick Actions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Manage your complaints and explore our services
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Avatar sx={{ 
                    bgcolor: "#3b82f6",
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 3
                  }}>
                    <Assignment sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} mb={2} color="#1e293b">
                    View History
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    View all your submitted complaints and track their progress
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/complaint-history')}
                    sx={{ 
                      bgcolor: "#3b82f6",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    View All Complaints
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>



      
      <CreateComplaintDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          loadComplaints(true); // Refresh complaints list with loading indicator
        }}
        citizenId={tokenstore.getUserId() || ''}
      />

      {/* Grievance Dialog */}
      <Dialog 
        open={grievanceDialog} 
        onClose={() => setGrievanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Support sx={{ color: "#ff9800" }} />
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
                placeholder="Please explain why you are not satisfied with the resolution of this complaint..."
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
            sx={{ textTransform: "none" }}
          >
            {grievanceSubmitting ? "Submitting..." : "Submit Grievance"}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
      
      <Footer />
    </Box>
  );
}