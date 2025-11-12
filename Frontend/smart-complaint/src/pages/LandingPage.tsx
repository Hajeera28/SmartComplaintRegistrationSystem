import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton
} from "@mui/material";
import {
  Security,
  Speed,
  Visibility,
  Support,
  Login as LoginIcon,
  ArrowForward,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import Footer from "../components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Secure",
      description: "Government-grade security with encrypted data protection",
      icon: <Security sx={{ fontSize: 40 }} />,
      color: "#3b82f6"
    },
    {
      title: "Fast",
      description: "Quick complaint filing and real-time status tracking",
      icon: <Speed sx={{ fontSize: 40 }} />,
      color: "#10b981"
    },
    {
      title: "Transparent",
      description: "Complete visibility into complaint resolution process",
      icon: <Visibility sx={{ fontSize: 40 }} />,
      color: "#f59e0b"
    },
    {
      title: "Supportive",
      description: "24/7 support with dedicated officer assistance",
      icon: <Support sx={{ fontSize: 40 }} />,
      color: "#8b5cf6"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <Box sx={{ minHeight: "100vh", display: 'flex', flexDirection: 'column', backgroundColor: "#f1f5f9" }}>
      {/* Navbar */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        py: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Smart Complaint Portal
            </Typography>
            <Button
              component={Link}
              to="/get-started"
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                fontWeight: 600
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #3b82f6 100%)", 
        color: "white", 
        py: 8,
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography variant="h2" fontWeight={800} mb={2} sx={{ 
              background: 'linear-gradient(45deg, #ffffff 30%, #e0e7ff 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Smart Complaint Portal
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
              Government of India - Digital Complaint Management System
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
              Empowering citizens with a transparent, efficient, and accountable platform for civic issue resolution
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Features Carousel Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ position: "relative", overflow: "hidden", mb: 6 }}>
          <Box sx={{ 
            display: "flex", 
            transform: `translateX(-${currentFeature * 100}%)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ minWidth: "100%", display: "flex", justifyContent: "center" }}>
                <Card sx={{
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  width: 1200,
                  maxWidth: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Avatar sx={{ 
                      bgcolor: feature.color,
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 3
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight={700} mb={2} color="#1e293b">
                      {feature.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={6}>
          <IconButton
            onClick={() => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)}
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Box display="flex" gap={1}>
            {features.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentFeature ? features[currentFeature].color : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: index === currentFeature ? 'scale(1.2)' : 'scale(1)',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </Box>
          
          <IconButton
            onClick={() => setCurrentFeature((prev) => (prev + 1) % features.length)}
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Call to Action Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} mb={3} color="#1e293b">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4} sx={{ maxWidth: 600, mx: "auto" }}>
            Join thousands of citizens and officers using our digital complaint management system
          </Typography>
          <Button
            component={Link}
            to="/get-started"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
      
      <Footer />
    </Box>
  );
}