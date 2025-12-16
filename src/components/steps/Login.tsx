'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, ArrowRight, Shield, CheckCircle2, Loader2, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { register, login, type AuthUser } from '@/lib/api'

interface LoginProps {
  onLoginSuccess: (userData: UserData) => void
}

export interface UserData {
  id: string
  username: string
  email: string
  phone: string
  token?: string
}

type AuthStep = 'credentials' | 'success'

export default function Login({ onLoginSuccess }: LoginProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('credentials')
  const [isLogin, setIsLogin] = useState(true)
  
  // Form fields
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successUser, setSuccessUser] = useState<AuthUser | null>(null)

  const handleSubmit = async () => {
    setError('')
    
    // Validation
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    if (!password) {
      setError('Please enter your password')
      return
    }

    if (!isLogin) {
      // Registration validation
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)

    try {
      let result
      
      if (isLogin) {
        // Login
        result = await login({ email, password })
      } else {
        // Register
        result = await register({ 
          email, 
          phone: phone || undefined, 
          password,
          username: email.split('@')[0]
        })
      }

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      // Success!
      if (result.user) {
        setSuccessUser(result.user)
        setAuthStep('success')
        
        // Wait a moment to show success, then proceed
        setTimeout(() => {
          onLoginSuccess({
            id: String(result.user!.id),
            username: result.user!.username || result.user!.email.split('@')[0],
            email: result.user!.email,
            phone: result.user!.phone || '',
            token: result.token,
          })
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 mb-4 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Enroll<span className="text-pink-500">IQ</span>
          </h1>
          <p className="text-gray-400">Smart Scholarship Enrollment Platform</p>
        </div>

        {/* Main Card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10">
          {authStep === 'credentials' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {isLogin ? 'Sign in to continue your application' : 'Register to start your scholarship journey'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter phone number"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Confirm your password"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="text-pink-400 hover:text-pink-300 font-medium"
                >
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>

              {/* Info box */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <p className="text-purple-300 text-xs text-center">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Your data is saved automatically. Sign in anytime to continue.
                </p>
              </div>
            </div>
          )}

          {authStep === 'success' && successUser && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back!' : 'Account Created!'}
              </h2>
              <p className="text-gray-400 mb-4">
                Welcome, <span className="text-white font-medium">{successUser.username || successUser.email.split('@')[0]}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading your application...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
