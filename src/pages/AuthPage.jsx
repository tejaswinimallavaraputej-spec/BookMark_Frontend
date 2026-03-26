import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Paper, Typography, TextField, Button,
  IconButton, InputAdornment, Tab, Tabs, Avatar, Fade,
  CircularProgress
} from '@mui/material'
import {
  Lock, Mail, User, Eye, EyeOff, Bookmark,
  Github, Twitter, Chrome
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
      setAuth(res.data.token, res.data.user)
      toast.success(tab === 0 ? 'Welcome back!' : 'Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />

      <Container maxWidth="xs" className="relative z-10">
        <Fade in={true} timeout={800}>
          <Paper elevation={24} className="p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Box className="flex flex-col items-center mb-8">
              <Avatar className="bg-blue-600 w-14 h-14 mb-4 shadow-lg shadow-blue-500/30">
                <Bookmark className="w-7 h-7 text-white" />
              </Avatar>
              <Typography variant="h4" className="font-black text-slate-900 tracking-tight">
                Vaultify
              </Typography>
              <Typography variant="body2" className="text-slate-500 font-medium">
                Your digital bookmarks, secured.
              </Typography>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              className="mb-8 border-b border-slate-100"
              sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}
            >
              <Tab label="Login" className="font-bold lowercase py-4" />
              <Tab label="Register" className="font-bold lowercase py-4" />
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-5">
              {tab === 1 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><User className="w-4 h-4 text-slate-400" /></InputAdornment>,
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
                  startAdornment: <InputAdornment position="start"><Mail className="w-4 h-4 text-slate-400" /></InputAdornment>,
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
                  startAdornment: <InputAdornment position="start"><Lock className="w-4 h-4 text-slate-400" /></InputAdornment>,
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
                className="py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all mt-4"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default AuthPage
