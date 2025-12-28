import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useRBAC } from '../../../Hooks/useRBAC';
import useAuthRedirect from '../../../Components/Auth/useAuthRedirect';
import useLogout from '../../../Components/Auth/useLogOut';
import { RESOURCE_TYPES } from '../../../Utils/RBAC/rbacConstants';
import {
  getFeaturedMembers,
  updateFeaturedMembers,
  getAllResearchers,
  clearFeaturedMembers,
} from '../../../Utils/FeaturedMembers/featuredMembersService';

/**
 * Featured member card with move up/down buttons
 */
function FeaturedMemberCard({ member, index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid #ddd',
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
        {/* Order number */}
        <Box
          sx={{
            minWidth: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '18px',
          }}
        >
          #{index + 1}
        </Box>

        {/* Photo */}
        {member.photoURL && (
          <CardMedia
            component="img"
            sx={{
              width: 100,
              height: 100,
              borderRadius: 1,
              objectFit: 'cover',
            }}
            image={member.photoURL}
            alt={member.name}
          />
        )}

        {/* Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {member.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {member.position || member.educationLevel}
          </Typography>
        </Box>

        {/* Move buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move Up"
          >
            <ArrowUpwardIcon />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move Down"
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Box>

        {/* Delete button */}
        <IconButton color="error" size="small" onClick={() => onRemove(member.id)} title="Remove">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
}

/**
 * Available member selector card
 */
function AvailableMemberCard({ member, isSelected, onToggle }) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid blue' : '1px solid #ddd',
        backgroundColor: isSelected ? '#f0f0f0' : 'white',
        transition: 'all 0.3s ease',
        height: '100%',
      }}
      onClick={() => onToggle(member.id)}
    >
      <Box sx={{ position: 'relative' }}>
        <Checkbox
          checked={isSelected}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        />
        {member.photoURL && (
          <CardMedia
            component="img"
            sx={{
              height: 200,
              objectFit: 'cover',
            }}
            image={member.photoURL}
            alt={member.name}
          />
        )}
      </Box>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {member.name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {member.position || member.educationLevel}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * Main Featured Members Management Component
 */
export default function FeaturedMembersManager() {
  useAuthRedirect();
  const logout = useLogout();
  const { isSuperAdmin, isLoading: rbacLoading } = useRBAC(RESOURCE_TYPES.FEATURED_MEMBERS);

  const [featuredMembers, setFeaturedMembers] = useState([]);
  const [allResearchers, setAllResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [featuredIds, researchers] = await Promise.all([
          getFeaturedMembers(),
          getAllResearchers(),
        ]);

        // Convert IDs to full member objects using researchers data
        const featuredMembers = featuredIds
          .map(id => researchers.find(r => r.id === id))
          .filter(member => member !== undefined);

        setFeaturedMembers(featuredMembers);
        setAllResearchers(researchers);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if user is superadmin
  if (!isSuperAdmin) {
    return (
      <Box sx={{ padding: '50px 5%', minHeight: '100vh' }}>
        <Alert severity="error">You do not have permission to manage featured members. Only superadmins can access this feature.</Alert>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 3, minWidth: 200, p: 2 }}
          onClick={logout}
        >
          Log Out
        </Button>
      </Box>
    );
  }

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newMembers = [...featuredMembers];
    [newMembers[index - 1], newMembers[index]] = [newMembers[index], newMembers[index - 1]];
    setFeaturedMembers(newMembers);
  };

  const handleMoveDown = (index) => {
    if (index === featuredMembers.length - 1) return;
    const newMembers = [...featuredMembers];
    [newMembers[index], newMembers[index + 1]] = [newMembers[index + 1], newMembers[index]];
    setFeaturedMembers(newMembers);
  };

  const handleRemoveMember = (memberId) => {
    setFeaturedMembers(members => members.filter(m => m.id !== memberId));
  };

  const handleOpenAddDialog = () => {
    setSelectedMemberIds(new Set());
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedMemberIds(new Set());
    setSearchQuery('');
  };

  const handleToggleMember = (memberId) => {
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
  };

  const handleAddMembers = () => {
    const membersToAdd = allResearchers.filter(r => selectedMemberIds.has(r.id));
    const currentIds = new Set(featuredMembers.map(m => m.id));

    const newMembers = membersToAdd.filter(m => !currentIds.has(m.id));

    if (newMembers.length === 0) {
      setError('No new members to add');
      return;
    }

    setFeaturedMembers(members => [
      ...members,
      ...newMembers.map(m => ({
        id: m.id,
        name: m.name,
        photoURL: m.photoURL,
        position: m.position,
        educationLevel: m.educationLevel,
      })),
    ]);

    handleCloseAddDialog();
    setSuccess(`Added ${newMembers.length} member(s)`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateFeaturedMembers(featuredMembers);

      setSuccess('Featured members updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all featured members?')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await clearFeaturedMembers();
      setFeaturedMembers([]);
      setSuccess('All featured members cleared!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to clear: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (rbacLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '50px 5%', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h3" sx={{ color: '#333', fontWeight: 'bold' }}>
          Manage Featured Team Members
        </Typography>
        <Button variant="contained" color="error" sx={{ minWidth: 150, p: 2 }} onClick={logout}>
          Log Out
        </Button>
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Use the up/down arrow buttons to reorder featured members. Click "Add Members" to select new members. Click "Save" to update the frontend.
      </Alert>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Featured Members Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Current Featured Members ({featuredMembers.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                disabled={saving}
              >
                Add Members
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="success"
                onClick={handleSave}
                disabled={saving || featuredMembers.length === 0}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              {featuredMembers.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearAll}
                  disabled={saving}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>

          {featuredMembers.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No featured members yet. Click "Add Members" to get started!
            </Typography>
          ) : (
            <Box>
              {featuredMembers.map((member, index) => (
                <FeaturedMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  total={featuredMembers.length}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onRemove={handleRemoveMember}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Members Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Select Members to Feature</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select members to add to the featured list. Already featured members are disabled.
          </Typography>
          <TextField
            fullWidth
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Grid container spacing={2}>
            {allResearchers
              .filter(researcher =>
                researcher.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(researcher => {
              const isCurrentlyFeatured = featuredMembers.some(m => m.id === researcher.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={researcher.id}>
                  <Box
                    sx={{
                      opacity: isCurrentlyFeatured ? 0.5 : 1,
                      pointerEvents: isCurrentlyFeatured ? 'none' : 'auto',
                    }}
                  >
                    <AvailableMemberCard
                      member={researcher}
                      isSelected={selectedMemberIds.has(researcher.id)}
                      onToggle={handleToggleMember}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddMembers}
            variant="contained"
            disabled={selectedMemberIds.size === 0}
          >
            Add Selected ({selectedMemberIds.size})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
