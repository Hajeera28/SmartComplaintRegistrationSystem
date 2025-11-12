import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokenstore } from '../auth/tokenstore';
import NotificationBell from './NotificationBell';
import { LogoutOutlined, Person } from '@mui/icons-material';

export default function AppNavbar() {
  const navigate = useNavigate();
  const userRole = tokenstore.getRole();
  
  const handleLogout = () => {
    tokenstore.clear();
    navigate('/login');
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
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <Toolbar>
        <Button
          color="inherit"
          onClick={handleProfileClick}
          startIcon={
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 32, height: 32 }}>
              <Person sx={{ fontSize: 18 }} />
            </Avatar>
          }
          sx={{ 
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            flexGrow: 1,
            justifyContent: 'flex-start'
          }}
        >
          {getUserName()} ({userRole})
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationBell />
          <Button 
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutOutlined />}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}