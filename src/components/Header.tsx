'use client'

import { useState } from 'react'
import { Menu, X, User, ChevronDown, GraduationCap, Sparkles, LogOut, Settings, FileText } from 'lucide-react'

interface HeaderProps {
  userName?: string
  onLogout?: () => void
}

export default function Header({ userName, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    setIsProfileOpen(false)
    onLogout?.()
  }

  return (
    <header className="sticky top-0 z-50 glass-dark shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg animate-float">
                <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Enroll<span className="gradient-text">IQ</span>
              </h1>
              <p className="text-[10px] lg:text-xs text-gray-400 -mt-1">Smart Enrollment Platform</p>
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl btn-shine"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {userName || 'Applicant'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-2xl border border-white/20 py-2 z-20 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {userName ? userName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{userName || 'Applicant'}</p>
                          <p className="text-sm text-gray-500">Scholarship Applicant</p>
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    
                    <div className="py-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-700 animate-fade-in">
            <hr className="my-3 border-gray-700" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 py-3 text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
