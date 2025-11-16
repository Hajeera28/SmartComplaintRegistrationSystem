import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Fab
} from '@mui/material';
import { Badge, Save, ArrowBack, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getOfficerProfile, updateOfficerProfile, type OfficerProfile } from '../../api/profile.api';
import { tokenstore } from '../../auth/tokenstore';
import AppNavbar from '../../components/AppNavbar';

export default function OfficerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OfficerProfile>({
    officerId: '',
    name: '',
    email: '',
    state: '',
    role: '',
    departmentName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const officerId = tokenstore.getUserId();
      if (!officerId) return;
      
      const data = await getOfficerProfile(officerId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const officerId = tokenstore.getUserId();
      if (!officerId) return;
      
      // Only send editable fields to avoid foreign key constraint issues
      const updateData = {
        name: profile.name,
        email: profile.email
      };
      
      console.log('Sending officer update data:', updateData);
      await updateOfficerProfile(officerId, updateData);
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Error response:', error.response?.data);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppNavbar />
      <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>

          
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Avatar sx={{ bgcolor: '#10b981', width: 80, height: 80 }}>
              <Badge sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Officer Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View your professional information
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {message && (
            <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={profile.name}
                disabled
                helperText="Name cannot be changed"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                disabled
                helperText="Email cannot be changed"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={profile.departmentName}
                disabled
                helperText="Department cannot be changed"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                value={profile.role}
                disabled
                helperText="Role is assigned by administration"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: '#1e293b'
                  }
                }}
              />
            </Grid>
          </Grid>


        </Paper>
      </Container>
      
      {/* Back to Dashboard Button */}
      <Fab
        color="primary"
        onClick={() => navigate('/officer')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#10b981',
          '&:hover': {
            bgcolor: '#059669'
          }
        }}
      >
        <DashboardIcon />
      </Fab>
    </Box>
    </>
  );
}