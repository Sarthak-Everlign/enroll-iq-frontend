'use client'

import { useState } from 'react'
import { Mail, Phone, ArrowRight, CheckCircle2, Loader2, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { register, login, type AuthUser } from '@/lib/api'
import Image from 'next/image'

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

type AuthStep = 'splash' | 'credentials' | 'success'

// Background and button gradients from splash-login
const backgroundGradient =
  "radial-gradient(at 51% 67%, hsla(216,71%,87%,1) 0px, transparent 50%)," +
  "radial-gradient(at 34% 21%, hsla(214,83%,92%,1) 0px, transparent 50%)," +
  "radial-gradient(at 56% 37%, hsla(205,100%,98%,1) 0px, transparent 50%)," +
  "radial-gradient(at 1% 2%, hsla(217,65%,69%,1) 0px, transparent 50%)," +
  "radial-gradient(at 8% 75%, hsla(217,65%,71%,1) 0px, transparent 50%)," +
  "radial-gradient(at 67% 94%, hsla(217,65%,73%,1) 0px, transparent 50%)," +
  "radial-gradient(at 0% 98%, hsla(209,89%,60%,1) 0px, transparent 50%)"

const buttonGradient =
  "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)"

export default function Login({ onLoginSuccess }: LoginProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('splash')
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

  const handleGetStarted = () => {
    setAuthStep('credentials')
  }

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
          username: email.split('@')[0],
          type: "student",
        })
      }

  if (!result.success) {
    // ✅ FIXED: Extract message properly
    const errorMessage = typeof result.message === 'string' 
      ? result.message 
      : result.message?.msg || 'An error occurred. Please try again.'
    setError(errorMessage)
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

  // Splash Screen
  if (authStep === 'splash') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: backgroundGradient,
          backgroundColor: "#C9D7FF",
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          {/* Logo */}
          <div className="mb-12">
            <Image 
              src="/images/EnrollIQ.png" 
              alt="EnrollIQ" 
              width={280} 
              height={70}
              priority
            />
          </div>

          {/* Tagline */}
          <div className="text-center mb-8 flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B0B0B] mb-3">
              Smarter Enrollment Starts Here
            </h2>
            <p className="text-black/70 text-sm md:text-base md:whitespace-nowrap px-2">
              EnrollIQ that analyzes, validates, and resolves member eligibility with real-time intelligence.
            </p>
          </div>

          {/* Get Started Button */}
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-0.5"
            style={{
              backgroundImage: buttonGradient,
              boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: backgroundGradient,
        backgroundColor: "#C9D7FF",
      }}
    >
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-2">
            <Image 
              src="/images/EnrollIQ.png" 
              alt="EnrollIQ" 
              width={180} 
              height={45}
              priority
            />
          </div>
          <p className="text-black/70 text-sm">Smart Scholarship Enrollment Platform</p>
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
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70"
                style={{
                  backgroundImage: buttonGradient,
                  boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
                }}
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
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>

              {/* Info box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-blue-300 text-xs text-center">
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
