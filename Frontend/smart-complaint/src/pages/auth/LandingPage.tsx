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
  IconButton,
  Grid,
  Paper
} from "@mui/material";
import {
  Security,
  Speed,
  Visibility,
  Support,
  Login as LoginIcon,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  AccountBalance,
  Gavel,
  Public
} from "@mui/icons-material";
import Footer from "../../components/Footer";
import ImageCarousel from "../../components/ImageCarousel";

export default function LandingPage() {
  const navigate = useNavigate();


  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Digital India Initiative",
      description: "Empowering citizens through technology and transparent governance for a better tomorrow"
    },
    {
      url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Transparent Governance",
      description: "Building trust through accountability and open communication with every citizen"
    },
    {
      url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Serving the Nation",
      description: "Dedicated to resolving civic issues and improving quality of life for all Indians"
    }
  ];

  const governmentServices = [
    {
      title: "न्याय | Justice",
      description: "Fair and timely resolution of citizen complaints with complete transparency",
      icon: <Gavel sx={{ fontSize: 40 }} />,
      color: "#ff9933"
    },
    {
      title: "सुरक्षा | Security", 
      description: "Government-grade security ensuring complete protection of citizen data",
      icon: <Security sx={{ fontSize: 40, color: '#000080' }} />,
      color: "#ffffff",
      border: "3px solid #000080"
    },
    {
      title: "सेवा | Service",
      description: "24/7 dedicated service for all citizens across the nation", 
      icon: <Public sx={{ fontSize: 40 }} />,
      color: "#138808"
    }
  ];



  return (
    <Box sx={{ minHeight: "100vh", display: 'flex', flexDirection: 'column', backgroundColor: "#f1f5f9" }}>
      {/* Navbar */}
      <Box sx={{ 
        background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)', 
        borderBottom: '3px solid #000080',
        py: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <AccountBalance sx={{ fontSize: 40, color: '#000080' }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="#000080">
                  भारत सरकार | Government of India
                </Typography>
                <Typography variant="body2" color="#1e293b" fontWeight={600}>
                  Smart Complaint Portal
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/get-started"
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #000080 0%, #1e40af 100%)',
                fontWeight: 600,
                border: '2px solid white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #000080 100%)'
                }
              }}
            >
              प्रवेश | Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section with Carousel */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ImageCarousel images={carouselImages} />
        </Box>
        
        {/* Government Emblem Section */}
        <Paper elevation={3} sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #ff9933 0%, #ffffff 50%, #138808 100%)',
          border: '2px solid #000080',
          borderRadius: 3
        }}>
          <Box textAlign="center">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <AccountBalance sx={{ fontSize: 60, color: '#000080', mr: 2 }} />
              <Typography variant="h3" fontWeight={800} color="#000080">
                भारत सरकार
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} mb={2} color="#000080">
              Government of India
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2c5530' }}>
              स्मार्ट शिकायत पोर्टल | Smart Complaint Portal
            </Typography>
            <Typography variant="h6" sx={{ color: '#1a472a', fontStyle: 'italic' }}>
              "सत्यमेव जयते" - Truth Alone Triumphs
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Government Services Section */}
      <Box sx={{ bgcolor: '#f8fafc', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={700} textAlign="center" mb={2} color="#1e293b">
            सरकारी सेवाएं | Government Services
          </Typography>
          <Typography variant="h6" textAlign="center" mb={6} color="text.secondary">
            Dedicated to serving the nation with transparency and efficiency
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={4} mb={6} sx={{ flexWrap: 'wrap' }}>
            {governmentServices.map((service, index) => (
              <Card key={index} sx={{ 
                textAlign: 'center', 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: service.border || '2px solid #e0e7ff',
                width: 300,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  borderColor: service.color
                }
              }}>
                <Avatar sx={{ 
                  bgcolor: service.color,
                  border: service.border,
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3
                }}>
                  {service.icon}
                </Avatar>
                <Typography variant="h5" fontWeight={700} mb={2} color="#1e293b">
                  {service.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {service.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
      
      {/* Call to Action Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={6} sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #000080 0%, #1e40af 50%, #3b82f6 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          mb: 6
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
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={700} mb={2}>
              आपकी आवाज़, हमारी प्राथमिकता
            </Typography>
            <Typography variant="h4" fontWeight={600} mb={3}>
              Your Voice, Our Priority
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 700, mx: "auto" }}>
              Join millions of citizens in building a better India through transparent governance and efficient complaint resolution
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
                background: 'linear-gradient(135deg, #ff9933 0%, #ff6b35 100%)',
                boxShadow: '0 8px 25px rgba(255, 153, 51, 0.4)',
                textTransform: 'none',
                borderRadius: 3,
                border: '2px solid white',
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(255, 153, 51, 0.6)',
                  transform: 'translateY(-2px)',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #ff9933 100%)'
                }
              }}
            >
              शुरू करें | Get Started
            </Button>
          </Box>
        </Paper>
      </Container>
      
      {/* Statistics Section */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
            आंकड़े जो बोलते हैं | Numbers That Speak
          </Typography>
          <Box display="flex" justifyContent="center" gap={6} sx={{ flexWrap: 'wrap' }}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight={700} color="#ff9933">
                10L+
              </Typography>
              <Typography variant="h6">
                Complaints Resolved
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight={700} color="#ffffff">
                50K+
              </Typography>
              <Typography variant="h6">
                Active Citizens
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight={700} color="#138808">
                500+
              </Typography>
              <Typography variant="h6">
                Government Officers
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight={700} color="#3b82f6">
                28
              </Typography>
              <Typography variant="h6">
                States & UTs Covered
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}