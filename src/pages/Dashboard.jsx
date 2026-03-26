import { useState, useEffect, useCallback } from 'react'
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container, Grid,
  Card, CardContent, CardActions, Button, TextField, InputBase,
  Menu, MenuItem, Avatar, Tooltip, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Pagination, Paper,
  useTheme, useMediaQuery, alpha, styled, Stack, Chip
} from '@mui/material'
import {
  Menu as MenuIcon, Search as SearchIcon, Plus, Bookmark,
  LogOut, Trash2, ExternalLink, Filter, MoreVertical, LayoutGrid,
  ShieldCheck, User as UserIcon, Edit2, Globe
} from 'lucide-react'
import { getBookmarks, createBookmark, deleteBookmark, updateBookmark } from '../api/api'
import { getUser, clearAuth } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const drawerWidth = 280

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  '&:hover': {
    backgroundColor: '#fff',
    borderColor: theme.palette.primary.main,
  },
  marginRight: theme.spacing(2),
  width: '100%',
  transition: 'all 0.2s ease',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#0f172a',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      width: '45ch',
    },
  },
}))

const Dashboard = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const user = getUser()
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [view, setView] = useState('all')
  const [openModal, setOpenModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ title: '', url: '' })

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBookmarks(page, 9, debouncedSearch, view === 'mine')
      setBookmarks(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error('Session expired or error loading links')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, view])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode) {
        await updateBookmark(selectedId, form)
        toast.success('Updated!')
      } else {
        await createBookmark(form)
        toast.success('Successfully Saved!')
      }
      setOpenModal(false)
      setForm({ title: '', url: '' })
      fetchBookmarks()
    } catch (err) {
      toast.error('Permission denied or connection error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await deleteBookmark(id)
      toast.success('Removed')
      fetchBookmarks()
    } catch (err) {
      toast.error('You can only delete your own links')
    }
  }

  const handleEditOpen = (bm) => {
    setEditMode(true)
    setSelectedId(bm.id)
    setForm({ title: bm.title, url: bm.url })
    setOpenModal(true)
  }

  const handleCreateOpen = () => {
    setEditMode(false)
    setForm({ title: '', url: '' })
    setOpenModal(true)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/auth')
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      <Toolbar sx={{ px: 3, display: 'flex', alignItems: 'center', gap: 2, height: 80 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
          <Bookmark size={22} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>
          BookMark
        </Typography>
      </Toolbar>
      
      <List sx={{ px: 2, py: 4, flex: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            selected={view === 'all'} 
            onClick={() => { setView('all'); setPage(0); }}
            sx={{ borderRadius: 3, py: 1.5, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#94a3b8' }}><Globe size={20} /></ListItemIcon>
            <ListItemText primary="All Collection" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            selected={view === 'mine'} 
            onClick={() => { setView('mine'); setPage(0); }}
            sx={{ borderRadius: 3, py: 1.5, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#94a3b8' }}><UserIcon size={20} /></ListItemIcon>
            <ListItemText primary="My Vault" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>IDENTITY CONFIRMED</Typography>
          <Typography variant="body2" sx={{ fontWeight: 900, mt: 0.5 }}>{user?.name}</Typography>
        </Paper>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box className="flex items-center">
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' }, color: '#0f172a' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: { xs: 'none', sm: 'block' } }}>
              Digital Collection
            </Typography>
          </Box>
          
          <Search>
            <StyledInputBase placeholder="Search titles or urls..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </Search>

          <Tooltip title="Secure Logout">
            <IconButton onClick={handleLogout} sx={{ bgcolor: '#fee2e2', color: '#ef4444', borderRadius: 2, '&:hover': { bgcolor: '#fecaca' } }}>
              <LogOut size={18} />
            </IconButton>
          </Tooltip>
        </Toolbar>
        {loading && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 }} />}
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', boxShadow: 24 } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' } }} open>{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2.5, sm: 4, md: 6 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1.5 }}>
                  {view === 'mine' ? 'My Collection' : 'BookMark Collection'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Showing {bookmarks.length} encrypted entries
                </Typography>
              </Box>
            </Stack>
          </Box>

          {!loading && bookmarks.length === 0 ? (
            <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 6, border: '2px dashed', borderColor: 'slate.200', bgcolor: 'transparent' }}>
              <ShieldCheck size={64} className="mx-auto mb-5 text-slate-300" />
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'slate.400' }}>Access Clear - No Entries Found</Typography>
              <Button onClick={handleCreateOpen} variant="contained" sx={{ mt: 3, px: 4, py: 1.5, borderRadius: 3, fontWeight: 900 }}>Create First Record</Button>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
              {bookmarks.map((bm) => (
                <Grid item xs={12} sm={6} lg={4} key={bm.id}>
                  <Card elevation={0} sx={{ 
                    borderRadius: 6, 
                    border: '1px solid', 
                    borderColor: 'white', 
                    bgcolor: 'white', 
                    cursor: 'pointer',
                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', borderColor: 'blue.100' } 
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 3.5, width: 52, height: 52 }}>
                          <ExternalLink size={24} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, noWrap: true, color: 'slate.900' }}>{bm.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 600, noWrap: true, display: 'block' }}>{bm.url}</Typography>
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={bm.createdBy} size="small" icon={<UserIcon size={12} />} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#f1f5f9', fontSize: '0.65rem' }} />
                        {user?.userId === bm.userId && <Chip label="OWNER" color="success" size="small" sx={{ borderRadius: 1.5, fontWeight: 900, fontSize: '0.6rem' }} />}
                      </Stack>
                    </CardContent>
                    
                    <Divider sx={{ opacity: 0.5 }} />
                    
                    <CardActions sx={{ p: 3, gap: 1 }}>
                      <Button fullWidth variant="contained" disableElevation href={bm.url.startsWith('http') ? bm.url : `https://${bm.url}`} target="_blank" sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}>Explore</Button>
                      
                      {user?.userId === bm.userId && (
                        <>
                          <Tooltip title="Alter Record">
                            <IconButton onClick={() => handleEditOpen(bm)} sx={{ bgcolor: '#f1f5f9', borderRadius: 3, p: 1.2, color: 'slate.600' }}><Edit2 size={16} /></IconButton>
                          </Tooltip>
                          <Tooltip title="Shred Record">
                            <IconButton onClick={() => handleDelete(bm.id)} sx={{ bgcolor: '#fff1f2', borderRadius: 3, p: 1.2, color: '#e11d48' }}><Trash2 size={16} /></IconButton>
                          </Tooltip>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} shape="rounded" size="large" sx={{ '& .MuiPaginationItem-root': { fontWeight: 900, borderRadius: 2 } }} />
            </Box>
          )}
        </Container>
      </Box>

      <Fab color="primary" onClick={handleCreateOpen} sx={{ position: 'fixed', bottom: { xs: 24, sm: 40 }, right: { xs: 24, sm: 40 }, width: 64, height: 64, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.4)', borderRadius: 4 }}>
        <Plus size={32} />
      </Fab>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>{editMode ? 'Alter Link' : 'New Secure Entry'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }} className="space-y-4">
            <TextField fullWidth label="Designation Title" placeholder="Safe Vault A" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Digital Address" placeholder="vault-a.com" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 800, color: 'slate.400' }}>Abort</Button>
            <Button type="submit" variant="contained" sx={{ px: 4, py: 1.2, borderRadius: 3, fontWeight: 900 }}>{editMode ? 'Confirm Alteration' : 'Securely Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Dashboard
