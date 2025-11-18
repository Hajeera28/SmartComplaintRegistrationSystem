import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokenstore } from '../auth/tokenstore';
import NotificationBell from './NotificationBell';
import { LogoutOutlined, Person, AccountBalance } from '@mui/icons-material';

export default function AppNavbar() {
  const navigate = useNavigate();
  const userRole = tokenstore.getRole();
  
  const handleLogout = () => {
    tokenstore.clear();
    navigate('/get-started');
  };

  const handleProfileClick = () => {
    if (userRole === 'Citizen') {
      navigate('/citizen/profile');
    } else if (userRole === 'Officer') {
      navigate('/officer/profile');
    }
  };

  const getUserName = () => {
    return tokenstore.getUsername() || 'User';
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 20%, #138808 40%, #000080 60%, #1e293b 100%)',
      borderBottom: '3px solid #000080'
    }}>
      <Toolbar>
        <Box 
          onClick={handleProfileClick}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mr: 2,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          <Person sx={{ 
            fontSize: '1.2rem', 
            color: '#ffffff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }} />
          <Typography
            sx={{ 
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {getUserName()} ({userRole})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
          <AccountBalance sx={{ fontSize: 32, color: '#000080' }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="#ffffff" sx={{ lineHeight: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              भारत सरकार
            </Typography>
            <Typography variant="body2" color="#ffffff" fontWeight={600} sx={{ lineHeight: 1, opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Government of India
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userRole !== 'Admin' && <NotificationBell />}
          <Button 
            variant="contained"
            onClick={handleLogout}
            startIcon={<LogoutOutlined />}
            sx={{ 
              textTransform: 'none',
              background: 'linear-gradient(135deg, #000080 0%, #1e40af 100%)',
              border: '2px solid white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1e40af 0%, #000080 100%)'
              }
            }}
          >
            लॉगआउट | Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}