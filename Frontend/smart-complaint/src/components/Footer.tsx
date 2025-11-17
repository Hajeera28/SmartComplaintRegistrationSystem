import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Email, Phone, LocationOn, AccountBalance } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box sx={{ 
      bgcolor: '#000080', 
      color: 'white', 
      py: 6, 
      mt: 'auto',
      background: 'linear-gradient(135deg, #000080 0%, #1e293b 50%, #0f172a 100%)',
      borderTop: '4px solid #ff9933'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccountBalance sx={{ fontSize: 30, color: '#ff9933' }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  भारत सरकार
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Government of India
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              डिजिटल इंडिया के तहत नागरिक सेवाओं के लिए डिजिटल प्लेटफॉर्म
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Transparent and accountable governance for every citizen of India.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              त्वरित लिंक | Quick Links
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/get-started" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                Get Started
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
              संपर्क जानकारी | Contact Information
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
            © 2024 भारत सरकार | Government of India. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            डिजिटल इंडिया के लिए ❤️ से बनाया गया | Made with ❤️ for Digital India
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}