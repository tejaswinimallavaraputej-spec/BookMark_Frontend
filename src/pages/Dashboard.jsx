import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, Container, Grid, Card, CardContent,
  IconButton, Button, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Fab, Skeleton, Badge, Tooltip, Stack, useMediaQuery, useTheme
} from '@mui/material'
import {
  Bookmark, Shield, Plus, LogOut, ExternalLink, Link2, Search,
  Globe, Clock, User as UserIcon, BookOpen, Layers, X, Edit2,
  ChevronLeft, ChevronRight, Menu as MenuIcon, Filter, MoreVertical, Trash2
} from 'lucide-react'
import { getBookmarks, createBookmark, deleteBookmark, updateBookmark } from '../api/api'
import { getUser, clearAuth } from '../utils/auth'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const currentUser = getUser()

  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBookmarks(page, 9, debouncedSearch)
      setBookmarks(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch {
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const handleLogout = () => {
    clearAuth()
    toast.success('Goodbye!')
    navigate('/auth')
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const url = form.url.startsWith('http') ? form.url : 'https://' + form.url
      if (editingId) {
        await updateBookmark(editingId, { title: form.title, url })
        toast.success('Updated!')
      } else {
        await createBookmark({ title: form.title, url })
        toast.success('Added to vault!')
        setPage(0)
      }
      setOpenDialog(false)
      setForm({ title: '', url: '' })
      setEditingId(null)
      fetchBookmarks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setActionId(id)
    try {
      await deleteBookmark(id)
      toast.success('Removed')
      fetchBookmarks()
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Not yours to delete!' : 'Delete failed')
    } finally {
      setActionId(null)
    }
  }

  const NavContent = () => (
    <Box className="p-4 h-full bg-slate-50 flex flex-col">
      <Box className="flex items-center gap-3 mb-10 px-2 mt-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <Typography variant="h6" className="font-black text-slate-900 tracking-tighter uppercase text-base">Vault Explorer</Typography>
      </Box>

      <List className="space-y-2 flex-grow">
        {[
          { label: 'All Vaults', icon: Layers, active: true },
          { label: 'My Bookmarks', icon: BookOpen },
          { label: 'Security Scan', icon: Shield, badge: 'New' },
        ].map((item) => (
          <ListItem key={item.label} button className={`rounded-xl py-3 px-4 ${item.active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'} transition-all`}>
            <ListItemIcon className="min-w-[40px]"><item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400'}`} /></ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: item.active ? 700 : 500 }} />
            {item.badge && <Badge badgeContent={item.badge} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, fontWeight: 800 } }} />}
          </ListItem>
        ))}
      </List>

      <Box className="mt-auto px-2">
        <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest block mb-4">Account</Typography>
        <Box className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200">
          <Avatar className="bg-blue-100 text-blue-700 font-black text-xs w-8 h-8">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0 pr-2">
            <Typography variant="caption" className="text-slate-900 font-black truncate block line-height-1 mb-[-2px]">{currentUser?.name}</Typography>
            <Typography variant="caption" className="text-slate-400 font-medium truncate block text-[10px]">Active Session</Typography>
          </div>
          <IconButton onClick={handleLogout} size="small" className="ml-auto hover:bg-red-50 hover:text-red-500"><LogOut className="w-4 h-4" /></IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box className="flex min-h-screen bg-white">
      {!isMobile && (
        <Drawer variant="permanent" open className="w-[280px] flex-shrink-0" sx={{ '& .MuiDrawer-paper': { width: 280, borderRight: '1px solid #f1f5f9' } }}>
          <NavContent />
        </Drawer>
      )}

      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 280 } }}>
          <NavContent />
        </Drawer>
      )}

      <Box component="main" className="flex-grow flex flex-col overflow-hidden">
        <AppBar position="sticky" elevation={0} className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
          <Toolbar className="px-6 py-4 flex justify-between gap-4">
            {isMobile && <IconButton onClick={() => setDrawerOpen(true)} className="mr-2 border border-slate-200"><MenuIcon /></IconButton>}
            
            <Box className="flex-grow max-w-2xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search resources, titles, or tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </Box>

            {!isMobile && (
              <Button onClick={() => setOpenDialog(true)} variant="contained" startIcon={<Plus className="w-4 h-4" />} className="bg-blue-600 hover:bg-blue-700 py-2.5 px-6 rounded-xl font-bold shadow-lg shadow-blue-500/20 lowercase tracking-tight">
                New Bookmark
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" className="px-6 py-8 flex-grow">
          <Grid container spacing={4}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid item key={i} xs={12} sm={6} lg={4}>
                  <Skeleton variant="rectangular" height={220} className="rounded-3xl" />
                </Grid>
              ))
            ) : bookmarks.length === 0 ? (
              <Box className="w-full flex flex-col items-center justify-center py-40 opacity-40">
                <Bookmark className="w-20 h-20 mb-4 stroke-1" />
                <Typography variant="h5" className="font-black">No links found</Typography>
                <Typography variant="body2">Start building your secure digital repository today.</Typography>
              </Box>
            ) : (
              bookmarks.map((b) => (
                <Grid item key={b.id} xs={12} sm={6} lg={4}>
                  <Card elevation={0} className="rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group overflow-hidden">
                    <CardContent className="p-6">
                      <Box className="flex items-start justify-between mb-6">
                        <Box className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <img src={`https://www.google.com/s2/favicons?domain=${new URL(b.url).origin}&sz=64`} alt="" className="w-6 h-6" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                          <Globe className="w-6 h-6 text-slate-200 hidden" />
                        </Box>
                        <Stack direction="row" spacing={0.5} className="sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip title="Open Link"><IconButton href={b.url} target="_blank" className="bg-white border border-slate-200 text-slate-500 hover:text-blue-600"><ExternalLink className="w-4 h-4" /></IconButton></Tooltip>
                          {b.userId === currentUser?.userId && (
                            <>
                              <Tooltip title="Edit"><IconButton onClick={() => { setForm({ title: b.title, url: b.url }); setEditingId(b.id); setOpenDialog(true) }} className="bg-white border border-slate-200 text-slate-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton disabled={actionId === b.id} onClick={() => handleDelete(b.id)} className="bg-white border border-slate-200 text-slate-500 hover:text-red-600">{actionId === b.id ? <CircularProgress size={16} color="inherit" /> : <Trash2 className="w-4 h-4" />}</IconButton></Tooltip>
                            </>
                          )}
                        </Stack>
                      </Box>
                      <Typography variant="h6" className="font-bold text-slate-900 mb-1 leading-tight line-clamp-1">{b.title}</Typography>
                      <Typography variant="body2" className="text-slate-400 font-medium truncate mb-6 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> {new URL(b.url).hostname}</Typography>
                      
                      <Box className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                           <UserIcon className="w-3 h-3 text-slate-400" />
                           <Typography variant="caption" className="text-slate-600 font-black uppercase text-[9px] tracking-wider">{b.createdBy === currentUser?.name ? 'OWNER' : b.createdBy}</Typography>
                        </div>
                        <Typography variant="caption" className="text-slate-400 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(b.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {totalPages > 1 && (
            <Box className="mt-12 flex justify-center items-center gap-4">
              <Button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 text-slate-600 px-4 lowercase font-bold hover:bg-slate-50"><ChevronLeft className="w-4 h-4 mr-2" /> prev</Button>
              <Typography variant="body2" className="text-slate-400 font-bold">page {page + 1} of {totalPages}</Typography>
              <Button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 text-slate-600 px-4 lowercase font-bold hover:bg-slate-50">next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </Box>
          )}
        </Container>
      </Box>

      {isMobile && (
        <Fab onClick={() => setOpenDialog(true)} color="primary" className="fixed bottom-6 right-6 shadow-2xl shadow-blue-600/50 bg-blue-600">
          <Plus />
        </Fab>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ className: 'rounded-3xl p-4', sx: { maxWidth: 450, width: '100%' } }}>
        <DialogTitle className="font-black text-2xl flex items-center justify-between pb-2">
          {editingId ? 'Edit Resource' : 'Archive New Link'}
          <IconButton onClick={() => setOpenDialog(false)}><X className="w-5 h-5" /></IconButton>
        </DialogTitle>
        <DialogContent className="pt-2">
          <Typography variant="body2" className="text-slate-400 font-medium mb-6">Store links securely in the community vault.</Typography>
          <Stack spacing={3}>
            <TextField fullWidth label="Resource Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} variant="outlined" />
            <TextField fullWidth label="Target URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} variant="outlined" placeholder="https://..." />
          </Stack>
        </DialogContent>
        <DialogActions className="p-4 pt-0">
          <Button fullWidth onClick={handleSave} variant="contained" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 lowercase tracking-tight">
             {submitting ? <CircularProgress size={24} color="inherit" /> : (editingId ? 'Save Changes' : 'Secure and Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Dashboard
