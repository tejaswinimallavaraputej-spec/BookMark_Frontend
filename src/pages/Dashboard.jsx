import { useState, useEffect, useCallback } from 'react'
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container, Grid,
  Card, CardContent, CardActions, Button, TextField, InputBase,
  Menu, MenuItem, Avatar, Tooltip, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Pagination,
  useTheme, useMediaQuery, alpha, styled
} from '@mui/material'
import {
  Menu as MenuIcon, Search as SearchIcon, Plus, Bookmark,
  LogOut, Trash2, ExternalLink, Filter, MoreVertical, LayoutGrid
} from 'lucide-react'
import { getBookmarks, createBookmark, deleteBookmark } from '../api/api'
import { getUser, clearAuth } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const drawerWidth = 280

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
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
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
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
  const [openAdd, setOpenAdd] = useState(false)
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' })

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBookmarks(page, 9, debouncedSearch)
      setBookmarks(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createBookmark(newBookmark)
      toast.success('Bookmark added!')
      setOpenAdd(false)
      setNewBookmark({ title: '', url: '' })
      fetchBookmarks()
    } catch (err) {
      toast.error('Failed to add bookmark')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bookmark?')) return
    try {
      await deleteBookmark(id)
      toast.success('Deleted')
      fetchBookmarks()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/auth')
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ px: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <Bookmark size={18} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'text.primary' }}>
          Bookmark
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, py: 3 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            selected 
            sx={{ 
              borderRadius: 2,
              '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LayoutGrid size={20} />
            </ListItemIcon>
            <ListItemText primary="All Bookmarks" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Logged in as</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, noWrap: true }}>{user?.name}</Typography>
        </Paper>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Search sx={{ bgcolor: '#f1f5f9', border: '1px solid transparent', '&:hover': { border: '1px solid #e2e8f0' } }}>
            <SearchIconWrapper>
              <SearchIcon size={18} color={theme.palette.text.secondary} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by title or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ color: 'text.primary' }}
            />
          </Search>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                <LogOut size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        {loading && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />}
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: 10 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
      >
        <Container maxWidth="lg">
          <Box className="flex justify-between items-end mb-8">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
                My Collection
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Keep your digital worlds organized
              </Typography>
            </Box>
          </Box>

          {bookmarks.length === 0 && !loading ? (
            <Paper variant="outlined" sx={{ p: 8, textAlign: 'center', borderRadius: 5, borderStyle: 'dashed' }}>
              <Bookmark size={48} className="mx-auto mb-4 text-slate-300" />
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700 }}>No bookmarks found</Typography>
              <Button onClick={() => setOpenAdd(true)} variant="contained" sx={{ mt: 2, borderRadius: 2 }}>Add your first one</Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {bookmarks.map((bm) => (
                <Grid item xs={12} sm={6} lg={4} key={bm.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.05)', borderColor: 'primary.light' }
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44, borderRadius: 3 }}>
                          <ExternalLink size={22} />
                        </Avatar>
                        <IconButton size="small" onClick={() => handleDelete(bm.id)}>
                          <Trash2 size={16} className="text-slate-400 hover:text-red-500" />
                        </IconButton>
                      </Box>
                      <Typography variant="h6" className="font-bold line-clamp-1 mb-1" sx={{ color: 'text.primary' }}>
                        {bm.title}
                      </Typography>
                      <Typography variant="body2" className="line-clamp-1 text-slate-500" sx={{ mb: 2 }}>
                        {bm.url}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        size="small"
                        href={bm.url.startsWith('http') ? bm.url : `https://${bm.url}`}
                        target="_blank"
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Open Link
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page + 1} 
                onChange={(_, v) => setPage(v - 1)}
                color="primary"
                sx={{ '& .MuiPaginationItem-root': { fontWeight: 700 } }}
              />
            </Box>
          )}
        </Container>
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)' }}
        onClick={() => setOpenAdd(true)}
      >
        <Plus />
      </Fab>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} PaperProps={{ sx: { borderRadius: 4, padding: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 0 }}>Add New Link</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent className="space-y-4">
            <TextField
              fullWidth
              label="Title"
              placeholder="e.g. Google"
              value={newBookmark.title}
              onChange={e => setNewBookmark({ ...newBookmark, title: e.target.value })}
              required
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="URL"
              placeholder="https://google.com"
              value={newBookmark.url}
              onChange={e => setNewBookmark({ ...newBookmark, url: e.target.value })}
              required
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenAdd(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>Save Bookmark</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Dashboard
