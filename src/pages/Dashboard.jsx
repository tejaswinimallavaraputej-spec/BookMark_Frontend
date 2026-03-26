import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bookmark, Plus, Trash2, LogOut, ExternalLink, Link2,
  Tag, Search, Globe, Clock, User as UserIcon, BookOpen, Layers, 
  X, CheckCircle2, Edit2, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { getBookmarks, createBookmark, deleteBookmark, updateBookmark } from '../api/api'
import { getUser, clearAuth } from '../utils/auth'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const navigate = useNavigate()
  const currentUser = getUser()

  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', url: '' })
  const [formErrors, setFormErrors] = useState({})
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
      const res = await getBookmarks(page, 10, debouncedSearch)
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
    toast.success('Logged out successfully')
    navigate('/auth')
  }

  const validateForm = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.url.trim()) errs.url = 'URL is required'
    else {
      try {
        new URL(form.url.startsWith('http') ? form.url : 'https://' + form.url)
      } catch {
        errs.url = 'Enter a valid URL'
      }
    }
    return errs
  }

  const resetForm = () => {
    setForm({ title: '', url: '' })
    setEditingId(null)
    setShowForm(false)
    setFormErrors({})
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    setFormErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const url = form.url.startsWith('http') ? form.url : 'https://' + form.url
      if (editingId) {
        await updateBookmark(editingId, { title: form.title.trim(), url })
        toast.success('Bookmark updated successfully')
      } else {
        await createBookmark({ title: form.title.trim(), url })
        toast.success('Bookmark added successfully')
        setPage(0)
      }
      resetForm()
      fetchBookmarks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save bookmark')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditInit = (bookmark) => {
    setForm({ title: bookmark.title, url: bookmark.url })
    setEditingId(bookmark.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    setActionId(id)
    try {
      await deleteBookmark(id)
      toast.success('Bookmark removed')
      fetchBookmarks()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) toast.error("You cannot delete bookmarks you do not own")
      else toast.error('Failed to delete bookmark')
    } finally {
      setActionId(null)
    }
  }

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
  }

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).origin
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch { return null }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const BookmarkCard = ({ bookmark }) => {
    const isOwner = bookmark.userId === currentUser?.userId
    return (
      <div className="card p-5 hover:border-blue-300 transition-colors group relative overflow-hidden bg-white">
        {isOwner && <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none rounded-bl-xl bg-blue-50/50" />}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <img
              src={getFavicon(bookmark.url)}
              alt=""
              className="w-5 h-5"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
            <Globe className="w-5 h-5 text-gray-400 hidden" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">
                  {bookmark.title}
                </h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 mt-1 truncate"
                >
                  <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{getDomain(bookmark.url)}</span>
                </a>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                  title="Open link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {isOwner && (
                  <>
                    <button
                      onClick={() => handleEditInit(bookmark)}
                      className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer border border-transparent hover:border-green-100"
                      title="Edit bookmark"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      disabled={actionId === bookmark.id}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer border border-transparent hover:border-red-100"
                      title="Delete bookmark"
                    >
                      {actionId === bookmark.id
                        ? <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className="badge bg-gray-50 text-gray-600 border-gray-200 gap-1.5">
                <UserIcon className="w-3 h-3 text-gray-400" />
                {bookmark.createdBy}
                {isOwner && <span className="text-blue-600 ml-1">(you)</span>}
              </span>
              <span className="badge bg-gray-50 text-gray-500 border-gray-200 gap-1.5">
                <Clock className="w-3 h-3 text-gray-400" />
                {formatDate(bookmark.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded shrink-0 bg-blue-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">BookmarkVault</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-700 font-medium pr-1">{currentUser?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Total Bookmarks', value: totalElements || 0, bg: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
            { icon: Layers, label: 'Current Page', value: `${page + 1} / ${Math.max(1, totalPages)}`, bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
            { icon: Globe, label: 'Scope', value: 'Global', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          ].map((stat) => (
            <div key={stat.label} className={`card p-5 outline outline-1 outline-transparent hover:outline-gray-200 transition-all ${stat.border}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative flex-1 max-w-lg w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or URL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-10 border-gray-300"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm()
              } else {
                setShowForm(true)
              }
            }}
            className={`${showForm ? 'btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200' : 'btn-primary'} sm:w-auto w-full flex items-center gap-2 px-5 py-2.5 rounded-lg`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel Form' : 'Add New Bookmark'}
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-8 border border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Bookmark' : 'Add New Bookmark'}</h2>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bookmark Title <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setFormErrors(p => ({ ...p, title: '' })) }}
                    placeholder="e.g. GitHub Repository"
                    className={`input-field pl-10 ${formErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.url}
                    onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setFormErrors(p => ({ ...p, url: '' })) }}
                    placeholder="https://github.com"
                    className={`input-field pl-10 ${formErrors.url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {formErrors.url && <p className="mt-1 text-sm text-red-600">{formErrors.url}</p>}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn-secondary px-5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-primary min-w-[140px]"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Save Bookmark'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium text-sm">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-xl">
            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {debouncedSearch ? 'No matching results found' : 'Your vault is empty'}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {debouncedSearch 
                ? 'Try adjusting your search terms or filters.' 
                : 'Click "Add New Bookmark" to store your first link to the global vault.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => (
                <BookmarkCard key={b.id} bookmark={b} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 py-6 mt-8">
                <div className="hidden sm:block text-sm text-gray-700">
                  Showing page <span className="font-semibold text-gray-900">{page + 1}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = page - 2 + i;
                      if (page < 2) pageNum = i;
                      if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                      pageNum = Math.max(0, Math.min(pageNum, totalPages - 1));
                      
                      if (i > 0 && pageNum <= (page - 2 + i - 1 < 2 ? i - 1 : page - 2 + i - 1)) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[40px] h-10 px-3 rounded-md text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                            page === pageNum 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
