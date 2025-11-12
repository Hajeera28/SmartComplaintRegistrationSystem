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
import { Person, Save, ArrowBack, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCitizenProfile, updateCitizenProfile, type CitizenProfile } from '../api/profile.api';
import { tokenstore } from '../auth/tokenstore';
import AppNavbar from '../components/AppNavbar';

export default function CitizenProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CitizenProfile>({
    citizenId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    state: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const citizenId = tokenstore.getUserId();
      if (!citizenId) return;
      
      const data = await getCitizenProfile(citizenId);
      console.log('Loaded citizen profile:', data);
      console.log('All data keys:', Object.keys(data));
      console.log('State field value:', data.state);
      
      // Map the response data, checking for different possible field names
      setProfile({
        citizenId: data.citizenId || data.CitizenId || '',
        name: data.name || data.Name || '',
        email: data.email || data.Email || '',
        phone: data.phone || data.Phone || '',
        address: data.address || data.Address || '',
        state: data.state || data.State || data.stateName || data.StateName || ''
      });
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
      const citizenId = tokenstore.getUserId();
      if (!citizenId) return;
      
      // Validate phone number format (must be 10 digits starting with 6-9)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (profile.phone && !phoneRegex.test(profile.phone)) {
        setMessage('Phone number must be 10 digits starting with 6, 7, 8, or 9');
        return;
      }
      
      // Validate address length
      if (profile.address && profile.address.length > 200) {
        setMessage('Address must be less than 200 characters');
        return;
      }
      
      // Include CitizenId in update data
      const updateData = {
        citizenId: citizenId,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim()
      };
      
      console.log('Updating citizen profile:', updateData);
      await updateCitizenProfile(citizenId, updateData);
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data || 'Failed to update profile';
      setMessage(errorMessage);
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
            <Avatar sx={{ bgcolor: '#3b82f6', width: 80, height: 80 }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                My Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Update your personal information
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {message && (
            <Alert severity={typeof message === 'string' && message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
              {typeof message === 'string' ? message : JSON.stringify(message)}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                helperText="10 digits starting with 6, 7, 8, or 9"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                helperText={`${profile.address.length}/200 characters`}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ textTransform: 'none', px: 4 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Container>
      
      {/* Back to Dashboard Button */}
      <Fab
        color="primary"
        onClick={() => navigate('/citizen')}
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