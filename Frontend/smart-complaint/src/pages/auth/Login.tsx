import React, { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth.api";
import { tokenstore } from "../../auth/tokenstore";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar
} from "@mui/material";
import { Security, Speed, Visibility, Support } from "@mui/icons-material";
import Footer from "../../components/Footer";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const nav = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    setApiError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    setApiError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({ email: emailError, password: passwordError });
    
    if (emailError || passwordError) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      const { token, username, role } = await login({ email, password });
      tokenstore.set(token);
      
      const roleString = role === 3 ? "Admin" : role === 2 ? "Officer" : "Citizen";
      tokenstore.setRole(roleString);
      tokenstore.setUsername(username);

      if (roleString === "Admin") {
        nav("/admin", { replace: true });
      } else if (roleString === "Officer") {
        nav("/officer", { replace: true });
      } else {
        nav("/citizen", { replace: true });
      }
    } catch (err: any) {
      setApiError("Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: 'flex', flexDirection: 'column', backgroundColor: "#f1f5f9" }}>
      {/* Simple Navbar */}
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
            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                to="/"
                variant="text"
                sx={{ textTransform: 'none' }}
              >
                ← Back to Home
              </Button>
              <Button
                component={Link}
                to="/get-started"
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Get Started
              </Button>
            </Stack>
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

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3, 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
              }
            }}>
              <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Security />
              </Avatar>
              <Typography variant="h6" fontWeight={600} mb={1}>Secure</Typography>
              <Typography variant="body2" color="text.secondary">
                Government-grade security with encrypted data protection
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3, 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
              }
            }}>
              <Avatar sx={{ bgcolor: '#10b981', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Speed />
              </Avatar>
              <Typography variant="h6" fontWeight={600} mb={1}>Fast</Typography>
              <Typography variant="body2" color="text.secondary">
                Quick complaint filing and real-time status tracking
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3, 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
              }
            }}>
              <Avatar sx={{ bgcolor: '#f59e0b', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Visibility />
              </Avatar>
              <Typography variant="h6" fontWeight={600} mb={1}>Transparent</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete visibility into complaint resolution process
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3, 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
              }
            }}>
              <Avatar sx={{ bgcolor: '#8b5cf6', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Support />
              </Avatar>
              <Typography variant="h6" fontWeight={600} mb={1}>Supportive</Typography>
              <Typography variant="body2" color="text.secondary">
                24/7 support with dedicated officer assistance
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Login Section */}
        <Grid container spacing={6} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ pr: { md: 4 } }}>
              <Typography variant="h3" fontWeight={700} mb={3} color="#1e293b">
                Welcome Back
              </Typography>
              <Typography variant="h6" color="#64748b" mb={4} fontWeight={400}>
                Access your account to manage civic issues efficiently and stay connected with your community.
              </Typography>
              
              <Box mb={4}>
                <Typography variant="h6" fontWeight={600} mb={3} color="#374151">
                  Platform Benefits:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                      <Typography variant="body1" color="#4b5563">
                        File and track complaints with photo evidence
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                      <Typography variant="body1" color="#4b5563">
                        Real-time notifications and status updates
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                      <Typography variant="body1" color="#4b5563">
                        Direct communication with assigned officers
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                      <Typography variant="body1" color="#4b5563">
                        Grievance system for accountability
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                backgroundColor: "white",
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                height: 'fit-content'
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={700} mb={2} color="#1e293b">
                  Sign In
                </Typography>
                <Typography variant="body1" color="#64748b">
                  Enter your credentials to access your account
                </Typography>
              </Box>

              {loading && <LinearProgress sx={{ mb: 2 }} />}
              
              {apiError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {apiError}
                </Alert>
              )}

              <form onSubmit={onSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                  />
                  
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !!errors.email || !!errors.password}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#e5e7eb',
                        color: '#9ca3af'
                      }
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center" mt={4}>
                <Typography variant="body1" color="#64748b">
                  Don't have an account?{' '}
                  <Link to="/get-started" style={{ 
                    color: "#3b82f6", 
                    textDecoration: "none",
                    fontWeight: 600,
                    borderBottom: '2px solid transparent',
                    transition: 'border-color 0.2s'
                  }}>
                    Get Started
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
    </Box>
  );
}