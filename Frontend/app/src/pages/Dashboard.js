import React from 'react';
import { 
  Grid, Paper, Typography, Box, Button, Card, CardContent, 
  CardActions, Divider, Stack, LinearProgress, Avatar,
  IconButton,  Container
} from '@mui/material';
import { 
  Chat, Description, InsertDriveFile, Notifications,
  TrendingUp, Article, BarChart, Timer, PieChart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // const theme = useTheme();
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Chat />}
          onClick={() => navigate('/chat')}
        >
          New Chat
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Analytics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {[
              { title: 'Documents Analyzed', value: '12', icon: <Article />, color: '#4285F4' },
              { title: 'Chat Queries', value: '38', icon: <Chat />, color: '#EA4335' },
              { title: 'Contracts Created', value: '5', icon: <InsertDriveFile />, color: '#FBBC04' },
              { title: 'Accuracy Rate', value: '85%', icon: <PieChart />, color: '#34A853' }
            ].map((item, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper 
                  sx={{ 
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'background.subtle',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.title}
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${item.color}20`,
                        width: 40,
                        height: 40
                      }}
                    >
                      <Box component="span" sx={{ color: item.color }}>
                        {item.icon}
                      </Box>
                    </Avatar>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'background.subtle',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500">
                Quick Actions
              </Typography>
              <IconButton size="small" sx={{ bgcolor: 'background.subtle' }}>
                <TrendingUp fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ 
              my: 2, 
              borderColor: 'background.subtle' 
            }} />
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<Chat />}
                  onClick={() => navigate('/chat')}
                  sx={{ p: 1.5, height: '100%' }}
                >
                  Chat Assistant
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<Description />}
                  onClick={() => navigate('/documents')}
                  sx={{ p: 1.5, height: '100%' }}
                >
                  Analyze Document
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<InsertDriveFile />}
                  onClick={() => navigate('/predict-case')}
                  sx={{ p: 1.5, height: '100%' }}
                >
                  Predict Case
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<Notifications />}
                  sx={{ p: 1.5, height: '100%' }}
                >
                  Alerts
                </Button>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500">
                Recent Documents
              </Typography>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => navigate('/documents')}
                endIcon={<Article fontSize="small" />}
              >
                View All
              </Button>
            </Box>
            
            <Stack spacing={2}>
              {[
                
              ].map((doc, index) => (
                <Card 
                  key={index} 
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'background.subtle',
                    border: '1px solid',
                    borderColor: 'background.subtle',
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.dark' }}>
                          <Description fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Timer fontSize="inherit" /> {doc.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {doc.progress < 100 ? 'Processing...' : 'Complete'}
                        </Typography>
                      </Box>
                    </Box>
                    {doc.progress < 100 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={doc.progress} 
                        sx={{ mt: 1.5 }} 
                      />
                    )}
                  </CardContent>
                  <Divider sx={{ borderColor: 'background.paper' }} />
                  <CardActions sx={{ px: 2, py: 0.5 }}>
                    <Button size="small" sx={{ color: 'text.secondary' }}>View</Button>
                    <Button size="small" color="primary">Download</Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
        
        {/* Stats Card */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'background.subtle',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500">
                Activity Summary
              </Typography>
              <IconButton size="small" sx={{ bgcolor: 'background.subtle' }}>
                <BarChart fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, borderColor: 'background.subtle' }} />
            
            <Box sx={{ 
              p: 3, 
              bgcolor: 'background.subtle', 
              borderRadius: 4,
              mb: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <TrendingUp fontSize="small" />
                </Avatar>
                <Typography variant="body1" fontWeight={500}>
                  Monthly Usage
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" component="div" fontWeight="bold" color="primary.main">
                      73%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of quota used
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      27%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      remaining
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <LinearProgress 
                variant="determinate" 
                value={73} 
                sx={{ mb: 1, height: 8, borderRadius: 4 }} 
              />
              
              <Typography variant="caption" color="text.secondary">
                Next reset in 9 days
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                The Legal Document Analysis System uses advanced AI to help you understand and create legal documents with confidence.
              </Typography>
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => navigate('/chat')}
                sx={{ mb: 2 }}
              >
                Start New Chat
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => navigate('/documents')}
              >
                Upload Document
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;