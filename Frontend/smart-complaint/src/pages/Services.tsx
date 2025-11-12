import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Business,
  Build,
  LocalHospital,
  School,
  DirectionsBus,
  WaterDrop,
  ElectricalServices,
  Security,
  Park
} from '@mui/icons-material';
import { getAllDepartments, getAllCategories } from '../api/department.api';
import AppNavbar from '../components/AppNavbar';

interface Department {
  departmentId: number;
  departmentName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  departmentId: number;
}

export default function Services() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDept, setCurrentDept] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptData, catData] = await Promise.all([
        getAllDepartments(),
        getAllCategories()
      ]);
      setDepartments(deptData);
      setCategories(catData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (deptName: string) => {
    const name = deptName.toLowerCase();
    if (name.includes('public works') || name.includes('infrastructure')) return <Build sx={{ fontSize: 40 }} />;
    if (name.includes('health') || name.includes('medical')) return <LocalHospital sx={{ fontSize: 40 }} />;
    if (name.includes('education') || name.includes('school')) return <School sx={{ fontSize: 40 }} />;
    if (name.includes('transport') || name.includes('traffic')) return <DirectionsBus sx={{ fontSize: 40 }} />;
    if (name.includes('water') || name.includes('sanitation')) return <WaterDrop sx={{ fontSize: 40 }} />;
    if (name.includes('electric') || name.includes('power')) return <ElectricalServices sx={{ fontSize: 40 }} />;
    if (name.includes('security') || name.includes('police')) return <Security sx={{ fontSize: 40 }} />;
    if (name.includes('park') || name.includes('environment')) return <Park sx={{ fontSize: 40 }} />;
    return <Business sx={{ fontSize: 40 }} />;
  };

  const getDepartmentColor = (index: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    return colors[index % colors.length];
  };

  const nextDept = () => {
    setCurrentDept((prev) => (prev + 1) % departments.length);
  };

  const prevDept = () => {
    setCurrentDept((prev) => (prev - 1 + departments.length) % departments.length);
  };

  const getCurrentDepartmentCategories = () => {
    if (!departments[currentDept]) return [];
    return categories.filter(cat => cat.departmentId === departments[currentDept].departmentId);
  };

  if (loading) {
    return (
      <>
        <AppNavbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppNavbar />
      <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700} mb={2} color="#1e293b">
              Our Services
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Explore government departments and their services
            </Typography>
          </Box>

          {departments.length > 0 && (
            <Box sx={{ position: 'relative', mb: 6 }}>
              <Paper elevation={0} sx={{ 
                p: 6, 
                borderRadius: 4, 
                background: `linear-gradient(135deg, ${getDepartmentColor(currentDept)}15 0%, ${getDepartmentColor(currentDept)}05 100%)`,
                border: `2px solid ${getDepartmentColor(currentDept)}20`
              }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Avatar sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: getDepartmentColor(currentDept),
                        mx: 'auto',
                        mb: 2
                      }}>
                        {getDepartmentIcon(departments[currentDept].departmentName)}
                      </Avatar>
                      <Typography variant="h4" fontWeight={700} color="#1e293b">
                        {departments[currentDept].departmentName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" mb={3} color="#1e293b">
                      Available Services:
                    </Typography>
                    <Grid container spacing={2}>
                      {getCurrentDepartmentCategories().map((category) => (
                        <Grid item xs={12} sm={6} key={category.categoryId}>
                          <Chip 
                            label={category.categoryName}
                            sx={{ 
                              bgcolor: getDepartmentColor(currentDept),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              py: 2,
                              px: 1,
                              width: '100%',
                              justifyContent: 'flex-start'
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>

              <IconButton
                onClick={prevDept}
                sx={{ 
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextDept}
                sx={{ 
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}

          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Department {currentDept + 1} of {departments.length}
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}