import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  useTheme
} from "@mui/material";
import {
  CloudUpload,
  Description,
  Delete,
  Search,
  ArticleOutlined,
  ErrorOutline,
  CheckCircleOutline,
  WarningAmber
} from "@mui/icons-material";

const DocumentAnalysis = () => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file extension
      const extension = selectedFile.name.split(".").pop().toLowerCase();
      if (["txt", "pdf", "docx"].includes(extension)) {
        setFile(selectedFile);
        setError("");
      } else {
        setFile(null);
        setError("Please upload a .txt, .pdf, or .docx file.");
      }
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const analyzeFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze/file/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Failed to analyze file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("text", text);

    try {
      const response = await fetch("http://localhost:8000/analyze/text/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Failed to analyze text: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult(null);
    setError("");
  };

  const renderResults = () => {
    if (!result) return null;

    const analysis = result.analysis;
    const llamaSummary = result.llama_summary;

    // Parse the llama summary if it's a string containing JSON
    let parsedSummary = llamaSummary;
    if (llamaSummary && typeof llamaSummary.summary === "string") {
      try {
        // Handle JSON wrapped in backticks like: ``` { "json": "here" } ```
        let summaryText = llamaSummary.summary;

        // Remove backticks if present
        if (summaryText.includes("```")) {
          summaryText = summaryText
            .replace(/```\s*(?:\w+\s*)?/, "")
            .replace(/\s*```\s*$/, "");
        }

        // Clean up and try to parse if it looks like JSON
        summaryText = summaryText.trim();
        if (summaryText.startsWith("{") && summaryText.endsWith("}")) {
          const summaryData = JSON.parse(summaryText);

          parsedSummary = {
            ...llamaSummary,
            ...summaryData,
          };
        }
      } catch (e) {
        console.error("Failed to parse summary JSON:", e, llamaSummary.summary);
      }
    }

    return (
      <Box sx={{ mt: 5 }}>
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'background.subtle' }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
            Analysis Results
          </Typography>

          <Card sx={{ mb: 4, bgcolor: 'background.subtle' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Document Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Text Length: {analysis.text_length} characters
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Sentence Count: {analysis.sentence_count}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, bgcolor: 'background.subtle' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Legal Terms Found
              </Typography>
              {analysis.legal_terms_found && analysis.legal_terms_found.length > 0 ? (
                <Grid container spacing={1}>
                  {analysis.legal_terms_found.map((term, index) => (
                    <Grid item key={index}>
                      <Chip 
                        label={term} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific legal terms identified.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, bgcolor: 'background.subtle' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Entities Detected
              </Typography>
              {analysis.entities && analysis.entities.length > 0 ? (
                <List dense>
                  {analysis.entities.slice(0, 15).map((entity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={entity.text}
                        secondary={entity.type}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No entities detected.
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 4, bgcolor: 'background.subtle' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Key Phrases
              </Typography>
              {analysis.key_phrases && analysis.key_phrases.length > 0 ? (
                <List dense>
                  {analysis.key_phrases.map((phrase, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={phrase} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No key phrases identified.
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ bgcolor: 'background.subtle' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Summary
              </Typography>
              {parsedSummary ? (
                <Box>
                  <Typography variant="body2" paragraph>
                    {parsedSummary.summary}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Key Clauses:
                    </Typography>
                    {Array.isArray(parsedSummary.key_clauses) && parsedSummary.key_clauses.length > 0 ? (
                      <List dense>
                        {parsedSummary.key_clauses.map((clause, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={clause} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No key clauses identified.
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Potential Issues:
                    </Typography>
                    {Array.isArray(parsedSummary.potential_issues) && parsedSummary.potential_issues.length > 0 ? (
                      <List dense>
                        {parsedSummary.potential_issues.map((issue, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <WarningAmber color="warning" fontSize="small" />
                                  <Typography variant="body2">{issue}</Typography>
                                </Box>
                              } 
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No potential issues identified.
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Parties and Obligations:
                    </Typography>
                    {Array.isArray(parsedSummary.parties_and_obligations) && parsedSummary.parties_and_obligations.length > 0 ? (
                      parsedSummary.parties_and_obligations.map((party, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2, mt: 1 }}>
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {party.party}
                            </Typography>
                            
                            {party.obligations && party.obligations.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  Obligations:
                                </Typography>
                                <List dense>
                                  {party.obligations.map((obligation, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemText 
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <Typography variant="body2" component="span" sx={{ fontSize: '1rem' }}>•</Typography>
                                            <Typography variant="body2">{obligation}</Typography>
                                          </Box>
                                        } 
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                            
                            {party.rights && party.rights.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  Rights:
                                </Typography>
                                <List dense>
                                  {party.rights.map((right, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemText 
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <Typography variant="body2" component="span" sx={{ fontSize: '1rem' }}>•</Typography>
                                            <Typography variant="body2">{right}</Typography>
                                          </Box>
                                        } 
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No parties or obligations identified.
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Processing Time:</strong>{" "}
                      {parsedSummary.processing_time || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No summary available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Legal Document Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a document or paste text for detailed legal analysis
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ 
        bgcolor: 'background.paper', 
        border: '1px solid', 
        borderColor: 'background.subtle',
        overflow: 'hidden'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="document analysis tabs"
            variant="fullWidth"
          >
            <Tab label="Upload Document" />
            <Tab label="Paste Text" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 4 
            }}>
              {!file ? (
                <Box 
                  component="label" 
                  htmlFor="file-upload"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'background.subtle',
                    borderRadius: 2,
                    p: 6,
                    width: '100%',
                    maxWidth: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'background.subtle',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'background.paper',
                    }
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.docx"
                    style={{ display: 'none' }}
                  />
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Click here to upload a file
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    We support .TXT, .DOCX, and text-based PDFs
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'background.subtle',
                  borderRadius: 2,
                  bgcolor: 'background.subtle',
                  width: '100%',
                  maxWidth: 500,
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Description color="primary" sx={{ mr: 2 }} />
                    <Typography variant="body2">{file.name}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setFile(null)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={analyzeFile}
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                sx={{ mt: 3 }}
              >
                {loading ? "Analyzing..." : "Analyze Document"}
              </Button>
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
              <TextField
                fullWidth
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your legal text here..."
                multiline
                rows={10}
                variant="outlined"
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={analyzeText}
                  disabled={!text.trim() || loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                >
                  {loading ? "Analyzing..." : "Analyze Text"}
                </Button>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {loading && !result && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Processing your document...
              </Typography>
            </Box>
          )}

          {renderResults()}
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentAnalysis;