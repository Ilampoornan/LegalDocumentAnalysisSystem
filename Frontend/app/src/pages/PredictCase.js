import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Button, Divider, 
  Alert, CircularProgress, Stack, Card, CardContent,
  Stepper, Step, StepLabel,
  StepContent, StepButton
} from '@mui/material';
import {
  CloudUpload, InsertChartOutlined, CheckCircle, SkipNext,
  DescriptionOutlined, BarChart, VerifiedUser
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { theme} from '../theme';

const PredictCase = () => {
//   const theme = useTheme();
  const { token } = useAuth();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  
  // Document upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  
  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Prediction states
  const [predicting, setPredicting] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  
  // API configuration
  const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
  const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const uploadUrl = apiUrl + '/documents/upload-test';
  const verifyUrl = apiUrl + '/verification/verify';
  const predictUrl = apiUrl + '/documents/predict-case';

  // Complete a step
  const handleComplete = (step) => {
    const newCompleted = { ...completed };
    newCompleted[step] = true;
    setCompleted(newCompleted);
  };

  // Go to next step
  const handleNext = () => {
    const newActiveStep = activeStep + 1;
    setActiveStep(newActiveStep);
  };

  /**
   * Document upload handler
   */
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    setPredictionData(null);
    setVerificationResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload document');
      }
      
      setUploadResult({
        success: true,
        message: "Document successfully uploaded for prediction",
        data: data
      });

      // Mark step as completed
      handleComplete(0);
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadResult({
        success: false,
        message: error.message || 'An error occurred during upload'
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Verification handler
   */
  const handleVerification = async () => {
    if (!file) return;
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify document');
      }
      
      setVerificationResult({
        success: true,
        verified: data.verified,
        message: data.verified 
          ? "Document verification successful! Document exists on blockchain."
          : "Document not found on blockchain. This doesn't affect prediction.",
        data: data
      });

      // Mark step as completed
      handleComplete(1);
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationResult({
        success: false,
        message: error.message || 'An error occurred during verification'
      });
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Skip verification handler
   */
  const handleSkipVerification = () => {
    handleComplete(1);
    handleNext();
  };

  /**
   * Prediction handler
   */
  const handlePrediction = async () => {
    setPredicting(true);
    setPredictionData(null);
    
    try {
      const response = await fetch(predictUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to predict case outcome');
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPredictionData(result);
      handleComplete(2);
    } catch (error) {
      console.error('Error during prediction:', error);
      setPredictionData({ 
        error: error.message || "Internal server error. Please try again." 
      });
    } finally {
      setPredicting(false);
    }
  };

  // Steps configuration
  const steps = [
    {
      label: 'Upload Document',
      description: 'Upload a legal document to analyze.',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a legal document to analyze. Supported formats: PDF, DOC, DOCX, TXT.
          </Typography>
            
          {/* File Upload Form */}
          <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 3 }}>
            {/* Dropzone Area */}
            <Box 
              sx={{ 
                border: '2px dashed',
                borderColor: 'background.subtle',
                borderRadius: theme.shape.borderRadius,
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.subtle',
                cursor: 'pointer',
                mb: 3,
                '&:hover': {
                  borderColor: 'primary.main',
                }
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
              />
              <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Click to upload a document
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Supported formats: PDF, DOC, DOCX, TXT
              </Typography>
              {file && (
                <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                  File selected: {file.name}
                </Alert>
              )}
            </Box>
              
            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={!file || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <DescriptionOutlined />}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
            
            {/* Upload Results Display */}
            {uploadResult && (
              <Box sx={{ mt: 2 }}>
                <Alert severity={uploadResult.success ? "success" : "error"}>
                  {uploadResult.message}
                </Alert>
              </Box>
            )}

            {/* Next Step Button */}
            {uploadResult?.success && (
              <Button 
                variant="outlined"
                color="primary"
                onClick={handleNext}
                sx={{ mt: 2, ml: 'auto', display: 'block' }}
              >
                Continue to Verification
              </Button>
            )}
          </Box>
        </Box>
      )
    },
    {
      label: 'Verify Document (Optional)',
      description: 'Verify the document on the blockchain.',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Verify if this document has been previously registered on the blockchain.
            This step is optional - you can skip to prediction if you prefer.
          </Typography>
            
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Verify Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerification}
              disabled={verifying || !file}
              startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <VerifiedUser />}
              sx={{ py: 1.5, fontWeight: 500 }}
            >
              {verifying ? 'Verifying...' : 'Verify on Blockchain'}
            </Button>
            
            {/* Skip Button */}
            <Button
              variant="outlined"
              onClick={handleSkipVerification}
              startIcon={<SkipNext />}
              sx={{ py: 1.5, fontWeight: 500 }}
            >
              Skip Verification
            </Button>
          </Box>
          
          {/* Verification Results */}
          {verificationResult && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={
                  verificationResult.success 
                    ? (verificationResult.verified ? "success" : "warning") 
                    : "error"
                }
              >
                {verificationResult.message}
              </Alert>
              {verificationResult.success && verificationResult.data && verificationResult.data.doc_hash && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'background.subtle', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'background.subtle'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom fontWeight={500}>
                    Document Hash
                  </Typography>
                  <Box 
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    {verificationResult.data.doc_hash}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    This unique hash represents your document on the blockchain.
                  </Typography>
                </Box>
              )}
              {/* Next Step Button */}
              {verificationResult.success && (
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={handleNext}
                  sx={{ mt: 2, ml: 'auto', display: 'block' }}
                >
                  Continue to Prediction
                </Button>
              )}
            </Box>
          )}
        </Box>
      )
    },
    {
      label: 'Predict Case Outcome',
      description: 'Get AI prediction on the case outcome.',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use our AI model to predict the potential outcome of your legal document.
          </Typography>
            
          {/* Prediction Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePrediction}
            disabled={predicting}
            startIcon={predicting ? <CircularProgress size={20} color="inherit" /> : <BarChart />}
            sx={{
              py: 1.5,
              fontWeight: 500,
              width: '100%',
            }}
          >
            {predicting ? 'Analyzing...' : 'Predict Case Outcome'}
          </Button>
            
          {/* Prediction Results */}
          {predictionData && (
            <Box sx={{ mt: 3 }}>
              {predictionData.error ? (
                <Alert severity="error">{predictionData.error}</Alert>
              ) : (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: predictionData.prediction === 1 ? 'success.main' : 'error.main',
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    {/* Prediction Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Typography variant="h6" component="div">
                        Prediction Results
                      </Typography>
                      <InsertChartOutlined color="primary" />
                    </Box>
                      
                    <Divider sx={{ mb: 2, borderColor: 'background.subtle' }} />
                      
                    {/* Prediction Outcome */}
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      bgcolor: predictionData.prediction === 1 ? 'success.main' : 'error.main',
                      color: '#fff',
                      borderRadius: 15,
                      opacity: 0.9
                    }}>
                      <CheckCircle sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="500">
                        {predictionData.prediction === 1 ? 'Positive Outcome' : 'Negative Outcome'}
                      </Typography>
                    </Box>
                      
                    {/* Confidence Score */}
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Confidence:</strong>{" "}
                      {Array.isArray(predictionData.probability)
                        ? (Math.max(...predictionData.probability) * 100).toFixed(2) + "%"
                        : "N/A"}
                    </Typography>
                      
                    <Divider sx={{ my: 2, borderColor: 'background.subtle' }} />
                      
                    {/* Case Details */}
                    <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                      Case Details:
                    </Typography>
                      
                    {predictionData.features ? (
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            First Party
                          </Typography>
                          <Typography variant="body2">
                            {predictionData.features.first_party || 'Not specified'}
                          </Typography>
                        </Box>
                          
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Second Party
                          </Typography>
                          <Typography variant="body2">
                            {predictionData.features.second_party || 'Not specified'}
                          </Typography>
                        </Box>
                          
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Decision Type
                          </Typography>
                          <Typography variant="body2">
                            {predictionData.features.decision_type || 'Not specified'}
                          </Typography>
                        </Box>
                          
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Disposition
                          </Typography>
                          <Typography variant="body2">
                            {predictionData.features.disposition || 'Not specified'}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        No case details available.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Predict Case Outcome
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Upload a legal document, verify authenticity, and predict its potential outcome using AI
        </Typography>
      </Box>
      
      {/* Main Content Area with Stepper */}
      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'background.subtle',
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stepper 
            activeStep={activeStep} 
            orientation="vertical"
            sx={{ mb: 3 }}
          >
            {steps.map((step, index) => (
              <Step 
                key={step.label} 
                completed={completed[index]}
                sx={{
                  '& .MuiStepLabel-root': {
                    padding: '12px 0',
                  }
                }}
              >
                <StepButton 
                  onClick={() => {
                    // Only allow going to completed steps or the current + 1 step
                    if (completed[index] || index <= activeStep) {
                      setActiveStep(index);
                    }
                  }}
                  sx={{
                    '&.Mui-disabled': {
                      cursor: 'not-allowed',
                    }
                  }}
                  disabled={!completed[index] && index > activeStep}
                >
                  <StepLabel 
                    optional={
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    }
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500,
                        color: completed[index] ? 'primary.main' : 'inherit'
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </StepButton>
                
                <StepContent 
                  TransitionProps={{ unmountOnExit: false }}
                  sx={{ py: 2 }}
                >
                  {step.content}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
    </Container>
  );
};

export default PredictCase;