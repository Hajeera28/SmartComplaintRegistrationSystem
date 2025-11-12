import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Divider,
  Paper,
  Grid,
  LinearProgress,
} from "@mui/material";
import {
  ReportProblem,
  Business,
  Category,
  LocationOn,
  Description,
  Title,
  CloudUpload
} from "@mui/icons-material";
import { createComplaint, getDepartments, getCategories } from "../api/complaint.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  citizenId: string;
}

export default function CreateComplaintDialog({ open, onClose, onSuccess, citizenId }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    departmentId: 0,
    categoryId: 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (formData.departmentId > 0) {
      const filtered = categories.filter(c => c.departmentId === formData.departmentId);
      setFilteredCategories(filtered);
      setFormData(prev => ({ ...prev, categoryId: 0 }));
    }
  }, [formData.departmentId, categories]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!citizenId) {
      alert('User session expired. Please login again.');
      return;
    }
    
    try {
      setLoading(true);
      await createComplaint({
        ...formData,
        citizenId,
        image: image || undefined,
      });
      alert('Complaint submitted successfully!');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create complaint:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(`Failed to create complaint: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      departmentId: 0,
      categoryId: 0,
    });
    setImage(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: "90vh" }
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <DialogTitle sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "#3b82f6", width: 48, height: 48 }}>
              <ReportProblem />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                File New Complaint
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Report an issue in your area
              </Typography>
            </Box>
          </Box>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2} color="#374151">
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Complaint Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: <Title sx={{ color: "#6b7280", mr: 1 }} />
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      fullWidth
                      placeholder="Describe the issue in detail..."
                      InputProps={{
                        startAdornment: <Description sx={{ color: "#6b7280", mr: 1, alignSelf: "flex-start", mt: 1 }} />
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      fullWidth
                      placeholder="Enter the exact location"
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: "#6b7280", mr: 1 }} />
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Category Selection */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#f0f9ff", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2} color="#374151">
                  Category Selection
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Department"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: <Business sx={{ color: "#6b7280", mr: 1 }} />
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    >
                      <MenuItem value={0}>Select Department</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.departmentId} value={dept.departmentId}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Business sx={{ fontSize: 16, color: "#6b7280" }} />
                            {dept.departmentName}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                      required
                      fullWidth
                      disabled={formData.departmentId === 0}
                      InputProps={{
                        startAdornment: <Category sx={{ color: "#6b7280", mr: 1 }} />
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    >
                      <MenuItem value={0}>Select Category</MenuItem>
                      {filteredCategories.map((cat) => (
                        <MenuItem key={cat.categoryId} value={cat.categoryId}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Category sx={{ fontSize: 16, color: "#6b7280" }} />
                            {cat.categoryName}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2} color="#374151">
                  Supporting Evidence
                </Typography>
                <Box 
                  sx={{
                    border: "2px dashed #d1d5db",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      bgcolor: "#f8fafc"
                    }
                  }}
                >
                  <CloudUpload sx={{ fontSize: 48, color: "#6b7280", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Upload an image to support your complaint (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      Choose Image
                    </Button>
                  </label>
                  {image && (
                    <Typography variant="body2" color="success.main" mt={1}>
                      Selected: {image.name}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              textTransform: "none", 
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              textTransform: "none", 
              fontWeight: 600,
              px: 4,
              borderRadius: 2
            }}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}