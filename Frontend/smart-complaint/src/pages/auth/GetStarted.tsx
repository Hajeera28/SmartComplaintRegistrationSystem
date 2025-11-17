import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { login, registerCitizen, registerOfficer } from "../../api/auth.api";
import { getDepartments } from "../../api/department.api";
import { tokenstore } from "../../auth/tokenstore";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  LinearProgress,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  Avatar
} from "@mui/material";
import {
  PersonAdd,
  Badge,
  Login as LoginIcon,
  ChevronLeft,
  ChevronRight,
  ArrowBack,
  CloudUpload
} from "@mui/icons-material";
import Footer from "../../components/Footer";

export default function GetStarted() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loginErrors, setLoginErrors] = useState({
    email: "",
    password: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    state: "Tamil Nadu",
    departmentId: 1,
    role: 1,
    userType: "citizen"
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    state: "",
    proofDocument: ""
  });

  const authCards = [
    {
      type: "login",
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      description: "Access your dashboard to manage complaints and track their progress",
      icon: <LoginIcon sx={{ fontSize: 40 }} />,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    },
    {
      type: "register-citizen",
      title: "Join as Citizen",
      subtitle: "Create your citizen account",
      description: "Register to file complaints and engage with civic services",
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      type: "register-officer",
      title: "Join as Officer",
      subtitle: "Create your officer account",
      description: "Register to manage and resolve citizen complaints efficiently",
      icon: <Badge sx={{ fontSize: 40 }} />,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    }
  ];

  const getFieldSx = (color: string) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      '&:hover fieldset': {
        borderColor: color
      },
      '&.Mui-focused fieldset': {
        borderColor: color,
        borderWidth: 2
      }
    }
  });

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return "";
  };

  const validateName = (name: string, isOfficer: boolean = false) => {
    if (!name.trim()) return "Name is required";
    const minLength = isOfficer ? 3 : 2;
    if (name.trim().length < minLength) return `Name must be at least ${minLength} characters`;
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name can only contain letters and spaces";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(phone)) return "Please enter a valid 10-digit mobile number";
    return "";
  };

  // Login handlers
  const handleLoginChange = (field: string, value: string) => {
    setLoginData({ ...loginData, [field]: value });
    setApiError("");
    
    let error = "";
    if (field === "email") error = validateEmail(value);
    if (field === "password") error = validatePassword(value);
    
    setLoginErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    //validation msgs under fields
    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);
    
    setLoginErrors({ email: emailError, password: passwordError });
    
    if (emailError || passwordError) return;

    try {
      setLoading(true);
      setApiError("");
      const { token, username, role } = await login(loginData);
      tokenstore.set(token);
      
      const roleString = role === 3 ? "Admin" : role === 2 ? "Officer" : "Citizen";
      tokenstore.setRole(roleString);
      tokenstore.setUsername(username);

      if (roleString === "Admin") {
        navigate("/admin", { replace: true });
      } else if (roleString === "Officer") {
        navigate("/officer", { replace: true });
      } else {
        navigate("/citizen", { replace: true });
      }
    } catch (err: any) {
      toast.error("Invalid email or password. Please try again.");
     // setApiError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (field: string, value: string | number) => {
    setRegisterData({ ...registerData, [field]: value });
    setApiError("");
    
    let error = "";
    const stringValue = value.toString();
    
    switch (field) {
      case "name":
        error = validateName(stringValue, registerData.userType === "officer");
        break;
      case "email":
        error = validateEmail(stringValue);
        break;
      case "password":
        error = validatePassword(stringValue);
        // Also validate confirm password if it exists
        if (registerData.confirmPassword) {
          const confirmError = registerData.confirmPassword !== stringValue ? "Passwords do not match" : "";
          setRegisterErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        if (!stringValue) {
          error = "Please confirm your password";
        } else if (stringValue !== registerData.password) {
          error = "Passwords do not match";
        }
        break;
      case "phone":
        error = validatePhone(stringValue);
        break;
      case "address":
        error = !stringValue.trim() ? "Address is required" : "";
        break;
      case "state":
        
        break;
    }
    
    setRegisterErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFileChange = (file: File | null) => {
    setProofFile(file);
    setApiError("");
    
    let error = "";
    if (!file) {
      error = "Proof document is required";
    } else if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      error = "Please upload an image or PDF file";
    } else if (file.size > 5 * 1024 * 1024) {
      error = "File size must be less than 5MB";
    }
    
    setRegisterErrors(prev => ({ ...prev, proofDocument: error }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    const isCitizen = registerData.userType === "citizen";
    const errors = {
      name: validateName(registerData.name, !isCitizen),
      email: validateEmail(registerData.email),
      password: validatePassword(registerData.password),
      confirmPassword: registerData.password !== registerData.confirmPassword ? "Passwords do not match" : "",
      phone: isCitizen ? validatePhone(registerData.phone) : "",
      address: isCitizen ? (!registerData.address.trim() ? "Address is required" : "") : "",
      state: "", // State is static, no validation needed
      proofDocument: !isCitizen && !proofFile ? "Proof document is required" : ""
    };
    
    setRegisterErrors(errors);
    
    if (Object.values(errors).some(error => error !== "")) return;

    try {
      setLoading(true);
      setApiError("");
      
      if (isCitizen) {
        await registerCitizen({
          name: registerData.name.trim(),
          email: registerData.email.toLowerCase().trim(),
          password: registerData.password,
          phone: registerData.phone,
          address: registerData.address.trim(),
          state: "Tamil Nadu",
        });
      } else {
        if (!proofFile) {
          setApiError("Proof document is required for officer registration");
          return;
        }
        await registerOfficer({
          name: registerData.name.trim(),
          email: registerData.email.toLowerCase().trim(),
          password: registerData.password,
          state: "Tamil Nadu",
          departmentId: registerData.departmentId,
          role: registerData.role,
          proofDocument: proofFile,
        });
      }
      
      if (isCitizen) {
        toast.success('Citizen registered successfully! Please login.');
      } else {
        toast.success('Registration successful! Wait for the admin approval.');
      }
      setCurrentCard(0);
    } catch (err: any) {

      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.errors) {
          const errors = Object.values(errorData.errors).flat();
          errorMessage = errors.join(', ');
        }
      }
      
      toast.error(errorMessage);
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <Stack spacing={3}>
        <TextField
          label="Email Address"
          type="email"
          variant="outlined"
          value={loginData.email}
          onChange={(e) => handleLoginChange("email", e.target.value)}
          error={!!loginErrors.email}
          helperText={loginErrors.email}
          fullWidth
          sx={getFieldSx('#3b82f6')}
        />
        
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={loginData.password}
          onChange={(e) => handleLoginChange("password", e.target.value)}
          error={!!loginErrors.password}
          helperText={loginErrors.password}
          fullWidth
          sx={getFieldSx('#3b82f6')}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !!loginErrors.email || !!loginErrors.password}
          sx={{ 
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            background: authCards[0].gradient,
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </Stack>
    </form>
  );

  const renderRegisterForm = () => {
    const isCitizen = registerData.userType === "citizen";
    
    return (
      <form onSubmit={handleRegister}>
        <Stack spacing={2.5}>
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant={isCitizen ? "contained" : "outlined"}
              onClick={() => setRegisterData({ ...registerData, userType: "citizen" })}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              Citizen
            </Button>
            <Button
              variant={!isCitizen ? "contained" : "outlined"}
              onClick={() => setRegisterData({ ...registerData, userType: "officer" })}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              Officer
            </Button>
          </Box>

          <TextField
            label="Full Name"
            value={registerData.name}
            onChange={(e) => handleRegisterChange("name", e.target.value)}
            error={!!registerErrors.name}
            helperText={registerErrors.name}
            fullWidth
            sx={getFieldSx(registerData.userType === "citizen" ? '#10b981' : '#f59e0b')}
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={registerData.email}
            onChange={(e) => handleRegisterChange("email", e.target.value)}
            error={!!registerErrors.email}
            helperText={registerErrors.email}
            fullWidth
            sx={getFieldSx(registerData.userType === "citizen" ? '#10b981' : '#f59e0b')}
          />
          
          <Box display="flex" gap={2}>
            <TextField
              label="Password"
              type="password"
              value={registerData.password}
              onChange={(e) => handleRegisterChange("password", e.target.value)}
              error={!!registerErrors.password}
              helperText={registerErrors.password}
              fullWidth
              sx={getFieldSx(registerData.userType === "citizen" ? '#10b981' : '#f59e0b')}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => handleRegisterChange("confirmPassword", e.target.value)}
              error={!!registerErrors.confirmPassword}
              helperText={registerErrors.confirmPassword}
              fullWidth
              sx={getFieldSx(registerData.userType === "citizen" ? '#10b981' : '#f59e0b')}
            />
          </Box>

          {isCitizen && (
            <>
              <Box display="flex" gap={2}>
                <TextField
                  label="Phone Number"
                  value={registerData.phone}
                  onChange={(e) => handleRegisterChange("phone", e.target.value)}
                  error={!!registerErrors.phone}
                  helperText={registerErrors.phone}
                  fullWidth
                  sx={getFieldSx('#10b981')}
                />
                <TextField
                  label="State"
                  value="Tamil Nadu"
                  disabled
                  fullWidth
                  sx={getFieldSx('#10b981')}
                />
              </Box>
              
              <TextField
                label="Address"
                multiline
                rows={2}
                value={registerData.address}
                onChange={(e) => handleRegisterChange("address", e.target.value)}
                error={!!registerErrors.address}
                helperText={registerErrors.address}
                fullWidth
                sx={getFieldSx('#10b981')}
              />
            </>
          )}

          {!isCitizen && (
            <>
              <TextField
                label="State"
                value="Tamil Nadu"
                disabled
                fullWidth
                sx={getFieldSx('#f59e0b')}
              />
              
              <Box display="flex" gap={2}>
                <TextField
                  select
                  label="Department"
                  value={registerData.departmentId}
                  onChange={(e) => handleRegisterChange("departmentId", Number(e.target.value))}
                  fullWidth
                  sx={getFieldSx('#f59e0b')}
                >
                  {departments.map((dept: any) => (
                    <MenuItem key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Officer Role"
                  value={registerData.role}
                  onChange={(e) => handleRegisterChange("role", Number(e.target.value))}
                  fullWidth
                  sx={getFieldSx('#f59e0b')}
                >
                  <MenuItem value={1}>Field Officer</MenuItem>
                  <MenuItem value={2}>Senior Officer</MenuItem>
                  <MenuItem value={3}>Department Head</MenuItem>
                  <MenuItem value={4}>Regional Head</MenuItem>
                  <MenuItem value={5}>Commissioner</MenuItem>
                </TextField>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" mb={1} color="#374151">
                  Proof Document (ID/Certificate) *
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{ 
                        textTransform: 'none',
                        borderColor: registerErrors.proofDocument ? '#ef4444' : '#f59e0b',
                        color: registerErrors.proofDocument ? '#ef4444' : '#f59e0b',
                        '&:hover': {
                          borderColor: registerErrors.proofDocument ? '#dc2626' : '#d97706',
                          bgcolor: registerErrors.proofDocument ? '#fef2f2' : '#fef3c7'
                        }
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {proofFile && (
                    <Typography variant="body2" color="success.main">
                      {proofFile.name}
                    </Typography>
                  )}
                </Box>
                {registerErrors.proofDocument && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {registerErrors.proofDocument}
                  </Typography>
                )}
              </Box>
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || Object.values(registerErrors).some(error => error !== "")}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: isCitizen ? authCards[1].gradient : authCards[2].gradient,
              boxShadow: `0 4px 15px ${isCitizen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${isCitizen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loading ? "Creating Account..." : `Register as ${isCitizen ? 'Citizen' : 'Officer'}`}
          </Button>
        </Stack>
      </form>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", display: 'flex', flexDirection: 'column', backgroundColor: "#f1f5f9" }}>
      {/* Navbar */}
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
            <Button
              component={Link}
              to="/"
              variant="text"
              startIcon={<ArrowBack />}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #3b82f6 100%)", 
        color: "white", 
        py: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography variant="h2" fontWeight={800} mb={2} sx={{ 
              background: 'linear-gradient(45deg, #ffffff 30%, #e0e7ff 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Get Started
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 2, fontWeight: 400 }}>
              Choose how you want to access the Smart Complaint Portal
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Auth Cards Carousel */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ position: "relative", overflow: "hidden", mb: 4 }}>
          <Box sx={{ 
            display: "flex", 
            transform: `translateX(-${currentCard * 100}%)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {authCards.map((card, index) => (
              <Box key={index} sx={{ minWidth: "100%", display: "flex", justifyContent: "center", px: 2 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    backgroundColor: "white",
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    border: `2px solid ${card.color}20`,
                    maxWidth: 500,
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: card.gradient
                    }
                  }}
                >
                  <Box textAlign="center" mb={3}>
                    <Avatar sx={{ 
                      bgcolor: card.color,
                      width: 60,
                      height: 60,
                      mx: "auto",
                      mb: 2,
                      boxShadow: `0 8px 32px ${card.color}40`
                    }}>
                      {card.icon}
                    </Avatar>
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      mb={1} 
                      sx={{
                        background: card.type === "login" 
                          ? 'linear-gradient(45deg, #1e293b 30%, #3b82f6 90%)'
                          : card.type === "register-citizen"
                          ? 'linear-gradient(45deg, #065f46 30%, #10b981 90%)'
                          : 'linear-gradient(45deg, #92400e 30%, #f59e0b 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="body1" color="#64748b" mb={1} fontWeight={500}>
                      {card.subtitle}
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ lineHeight: 1.5 }}>
                      {card.description}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {loading && <LinearProgress sx={{ mb: 2 }} />}
                  
                  {apiError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {apiError}
                    </Alert>
                  )}

                  {card.type === "login" && renderLoginForm()}
                  {(card.type === "register-citizen" || card.type === "register-officer") && renderRegisterForm()}
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <IconButton
            onClick={() => setCurrentCard((prev) => (prev - 1 + authCards.length) % authCards.length)}
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Box display="flex" gap={1}>
            {authCards.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentCard ? authCards[currentCard].color : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: index === currentCard ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: index === currentCard ? `0 4px 12px ${authCards[currentCard].color}40` : 'none',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: index === currentCard ? authCards[currentCard].color : '#cbd5e1'
                  }
                }}
                onClick={() => setCurrentCard(index)}
              />
            ))}
          </Box>
          
          <IconButton
            onClick={() => setCurrentCard((prev) => (prev + 1) % authCards.length)}
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="body1" color="#64748b">
            {currentCard === 0 ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="text"
              onClick={() => setCurrentCard(currentCard === 0 ? 1 : 0)}
              sx={{ 
                color: authCards[currentCard].color,
                textDecoration: "none",
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {currentCard === 0 ? "Register here" : "Sign in here"}
            </Button>
          </Typography>
        </Box>
      </Container>
      
      <Footer />
    </Box>
  );
}