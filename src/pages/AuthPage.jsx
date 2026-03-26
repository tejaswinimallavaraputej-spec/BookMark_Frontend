import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Paper, Typography, TextField, Button,
  IconButton, InputAdornment, Tab, Tabs, Avatar, Fade,
  CircularProgress
} from '@mui/material'
import {
  Lock, Mail, User, Eye, EyeOff, Bookmark
} from 'lucide-react'
import { login, register } from '../api/api'
import { setAuth } from '../utils/auth'
import toast from 'react-hot-toast'

const AuthPage = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = tab === 0 ? await login(form) : await register(form)
      const { token, ...user } = res.data
      setAuth(token, user)
      toast.success(tab === 0 ? 'Welcome back!' : 'Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      className="min-h-screen flex items-center justify-center p-4"
      sx={{ 
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url("/auth-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Container maxWidth="xs" className="relative z-10">
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={24} 
            className="p-8 pb-12 rounded-[40px] bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
            sx={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <Box className="flex flex-col items-center mb-10 pt-4">
              <Avatar className="bg-blue-600 w-14 h-14 mb-4 shadow-lg shadow-blue-500/30">
                <Bookmark className="w-7 h-7 text-white" />
              </Avatar>
              <Typography variant="h4" className="font-black text-slate-900 tracking-tight">
                BookMark
              </Typography>
              <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Digital Collection Hub
              </Typography>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              className="mb-10 border-b border-slate-100"
              sx={{ 
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' },
                '& .MuiTab-root': { color: '#94a3b8', fontWeight: 800, fontSize: '0.875rem' }
              }}
            >
              <Tab label="Login" className="lowercase" />
              <Tab label="Register" className="lowercase" />
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-6">
              {tab === 1 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><User className="w-4 h-4 text-blue-600" /></InputAdornment>,
                  }}
                  variant="outlined"
                  required
                />
              )}

              <TextField
                fullWidth
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Mail className="w-4 h-4 text-blue-600" /></InputAdornment>,
                }}
                variant="outlined"
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock className="w-4 h-4 text-blue-600" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                required
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                className="py-4 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all mt-4 text-base uppercase tracking-wider"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default AuthPage
