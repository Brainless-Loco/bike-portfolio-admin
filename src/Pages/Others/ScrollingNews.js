import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../Utils/Firebase/Firebase';
import useAuthRedirect from '../../Components/Auth/useAuthRedirect';

const ScrollingNews = () => {
  useAuthRedirect();
  const [newsData, setNewsData] = useState({
    title: '',
    startDateTime: '',
    endDateTime: '',
    speed: '30',
    link: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [archivedNews, setArchivedNews] = useState([]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const SCROLLING_NEWS_DOC = 'scrollingNews';
  const SCROLLING_NEWS_COLLECTION = 'ScrollingNews';
  const ARCHIVED_NEWS_DOC = 'archived';

  // Fetch current news from Firebase
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const docRef = doc(db, SCROLLING_NEWS_COLLECTION, SCROLLING_NEWS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNewsData(docSnap.data());
        } else {
          // Initialize empty document
          await setDoc(docRef, {
            title: '',
            startDateTime: '',
            endDateTime: '',
            speed: '30',
            link: '',
          });
        }

        // Fetch archived news
        const archivedRef = doc(db, SCROLLING_NEWS_COLLECTION, ARCHIVED_NEWS_DOC);
        const archivedSnap = await getDoc(archivedRef);
        if (archivedSnap.exists() && archivedSnap.data().news) {
          setArchivedNews(archivedSnap.data().news);
        }
      } catch (error) {
        setMessage('Error fetching news: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleInputChange = (field, value) => {
    setNewsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNews = async () => {
    if (!newsData.title || !newsData.startDateTime || !newsData.endDateTime) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (new Date(newsData.startDateTime) >= new Date(newsData.endDateTime)) {
      setMessage('Start date must be before end date');
      return;
    }

    setUpdating(true);
    try {
      const docRef = doc(db, SCROLLING_NEWS_COLLECTION, SCROLLING_NEWS_DOC);
      await updateDoc(docRef, newsData);
      setMessage('News updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating news: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleArchiveNews = async () => {
    setUpdating(true);
    try {
      const archivedRef = doc(db, SCROLLING_NEWS_COLLECTION, ARCHIVED_NEWS_DOC);
      const archivedData = {
        ...newsData,
        archivedAt: new Date().toISOString(),
      };

      // Add to archived news array
      await updateDoc(archivedRef, {
        news: arrayUnion(archivedData),
      });

      // Clear current news
      const docRef = doc(db, SCROLLING_NEWS_COLLECTION, SCROLLING_NEWS_DOC);
      await updateDoc(docRef, {
        title: '',
        startDateTime: '',
        endDateTime: '',
        speed: '30',
        link: '',
      });

      setNewsData({
        title: '',
        startDateTime: '',
        endDateTime: '',
        speed: '30',
        link: '',
      });

      setMessage('News archived successfully!');
      setTimeout(() => setMessage(''), 3000);
      setArchiveDialogOpen(false);

      // Refresh archived news
      const archivedSnap = await getDoc(archivedRef);
      if (archivedSnap.exists() && archivedSnap.data().news) {
        setArchivedNews(archivedSnap.data().news);
      }
    } catch (error) {
      setMessage('Error archiving news: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#0c2461', fontWeight: '600' }}>
        Manage Scrolling News
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#0c2461' }}>
          Current News
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="News Title *"
            fullWidth
            value={newsData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., BIKE Lab is recruiting funded PhD and MPhil candidates under HEAT Project."
            multiline
            rows={2}
          />

          <TextField
            label="Start Date & Time *"
            type="datetime-local"
            fullWidth
            value={newsData.startDateTime}
            onChange={(e) => handleInputChange('startDateTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Date & Time *"
            type="datetime-local"
            fullWidth
            value={newsData.endDateTime}
            onChange={(e) => handleInputChange('endDateTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Animation Speed (seconds)"
            type="number"
            fullWidth
            value={newsData.speed}
            onChange={(e) => handleInputChange('speed', e.target.value)}
            inputProps={{ min: '5', max: '60', step: '5' }}
            helperText="Time for text to scroll (5-60 seconds)"
          />

          <TextField
            label="Link (URL)"
            fullWidth
            value={newsData.link}
            onChange={(e) => handleInputChange('link', e.target.value)}
            placeholder="https://example.com"
            helperText="Leave empty if no link needed"
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSaveNews}
              disabled={updating}
              sx={{ backgroundColor: '#0c2461' }}
            >
              {updating ? <CircularProgress size={24} /> : 'Save News'}
            </Button>

            {newsData.title && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setArchiveDialogOpen(true)}
                disabled={updating}
              >
                Archive News
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Archived News Section */}
      {archivedNews.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#0c2461' }}>
            Archived News ({archivedNews.length})
          </Typography>

          <List>
            {archivedNews.map((news, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                <ListItemText
                  primary={news.title}
                  secondary={`Archived: ${new Date(news.archivedAt).toLocaleString()} | Period: ${new Date(news.startDateTime).toLocaleDateString()} - ${new Date(news.endDateTime).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <DialogTitle>Archive Current News?</DialogTitle>
        <DialogContent>
          <Typography>
            This will move the current news to the archived section and clear the active news.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleArchiveNews} color="error" variant="contained">
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScrollingNews;
