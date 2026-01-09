'use client'

import { useState } from 'react'
import { Menu, X, User, ChevronDown, LogOut } from 'lucide-react'
import Image from 'next/image'

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
          {/* Logo with Scholarship Name */}
          <div className="flex items-center gap-3">
  <img 
    src="/images/EnrollIQ1.png" 
    alt="EnrollIQ" 
    width={140} 
    height={35}
    className="h-8 w-auto"
  />

  <div className="hidden md:block h-10 w-px bg-white/20"></div>

  <div className="hidden md:flex items-center gap-3">
    <div>
      <div className="text-white text-sm font-semibold leading-tight">
        Rajarshi Shahu Maharaj
      </div>
      <div className="text-white/70 text-xs leading-tight">
        Foreign Scholarship Scheme
      </div>
    </div>

    {/* AY badge */}
    <div
      className="px-3 py-1 rounded-lg text-white text-xs font-semibold whitespace-nowrap"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(54,68,207,0.9) 0%, rgba(133,243,255,0.9) 100%)",
        boxShadow: "0 4px 12px rgba(54, 68, 207, 0.35)",
      }}
    >
      AY 2025–2026
    </div>
  </div>
</div>

          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl btn-shine"
                style={{
                  backgroundImage: "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                  boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
                }}
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
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundImage: "linear-gradient(135deg, #3644CF 0%, #85F3FF 100%)",
                          }}
                        >
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
            {/* Mobile Scholarship Name */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="text-white text-sm font-semibold">
                Rajarshi Shahu Maharaj
              </div>
              <div className="text-white/70 text-xs">
                Foreign Scholarship Scheme
              </div>
            </div>
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
