import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box sx={{ 
      bgcolor: '#0f172a', 
      color: 'white', 
      py: 6, 
      mt: 'auto',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Smart Complaint Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Government of India's digital platform for efficient complaint management and citizen services.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Empowering citizens with transparent and accountable governance.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Quick Links
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/login" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                Login
              </Link>
              <Link href="/register" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                Register
              </Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                Help & Support
              </Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                Privacy Policy
              </Link>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Contact Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  support@smartcomplaint.gov.in
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  1800-XXX-XXXX (Toll Free)
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  New Delhi, India
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2024 Government of India. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Made with ❤️ for Digital India
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}