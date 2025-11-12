import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getUnreadNotificationsByOfficer, getUnreadNotificationsByCitizen, markNotificationAsRead, markAllNotificationsAsRead, markAllNotificationsAsReadByCitizen, type Notification } from '../api/notification.api';
import { tokenstore } from '../auth/tokenstore';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const userId = tokenstore.getUserId();
      const userRole = tokenstore.getRole();
      if (!userId) return;
      
      let data: Notification[] = [];
      if (userRole === 'Officer' || userRole === 'Admin') {
        data = await getUnreadNotificationsByOfficer(userId);
      } else if (userRole === 'Citizen') {
        data = await getUnreadNotificationsByCitizen(userId);
      }
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const userId = tokenstore.getUserId();
      const userRole = tokenstore.getRole();
      if (!userId) return;
      
      if (userRole === 'Officer' || userRole === 'Admin') {
        await markAllNotificationsAsRead(userId);
      } else if (userRole === 'Citizen') {
        await markAllNotificationsAsReadByCitizen(userId);
      }
      setNotifications([]);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 2 }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 350, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.notificationId}
              onClick={() => handleMarkAsRead(notification.notificationId)}
              sx={{ whiteSpace: 'normal', alignItems: 'flex-start', py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={new Date(notification.createdAt).toLocaleString()}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}