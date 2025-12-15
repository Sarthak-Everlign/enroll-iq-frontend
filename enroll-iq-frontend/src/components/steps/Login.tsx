'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, ArrowRight, Shield, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import testData from '@/data/testData.json'

interface LoginProps {
  onLoginSuccess: (userData: UserData) => void
}

export interface UserData {
  id: string
  username: string
  email: string
  phone: string
}

type AuthStep = 'credentials' | 'verifyEmail' | 'verifyPhone' | 'success'

export default function Login({ onLoginSuccess }: LoginProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('credentials')
  const [isLogin, setIsLogin] = useState(true)
  
  // Form fields
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Get test user data
  const testUser = testData.users[0]

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCredentials = async () => {
    setError('')
    
    if (!email || !phone) {
      setError('Please enter both email and phone number')
      return
    }

    // Validate against test data
    if (email !== testUser.email || phone !== testUser.phone) {
      setError('Invalid credentials. Use: testing@email.com / 9876543210')
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    
    setAuthStep('verifyEmail')
    setCountdown(30)
  }

  const handleVerifyEmailOtp = async () => {
    setError('')
    
    if (emailOtp !== testUser.emailOtp) {
      setError(`Invalid OTP. Use: ${testUser.emailOtp}`)
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setLoading(false)
    
    setEmailVerified(true)
    setAuthStep('verifyPhone')
    setCountdown(30)
    setEmailOtp('')
  }

  const handleVerifyPhoneOtp = async () => {
    setError('')
    
    if (phoneOtp !== testUser.phoneOtp) {
      setError(`Invalid OTP. Use: ${testUser.phoneOtp}`)
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setLoading(false)
    
    setPhoneVerified(true)
    setAuthStep('success')
    
    // Wait a moment to show success, then proceed
    setTimeout(() => {
      onLoginSuccess({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        phone: testUser.phone,
      })
    }, 1500)
  }

  const handleResendOtp = () => {
    setCountdown(30)
    setError('')
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
                      placeholder="Enter a Valid Mail Address"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter a Valid Phone Number"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Test credentials hint */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <p className="text-purple-300 text-xs">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <strong>Test Mode:</strong> Use email: testing@email.com, phone: 9876543210
                </p>
              </div>

              <button
                onClick={handleSendCredentials}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-pink-400 hover:text-pink-300 font-medium"
                >
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {authStep === 'verifyEmail' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Email</h2>
                <p className="text-gray-400 text-sm">
                  Enter the 6-digit OTP sent to <span className="text-white">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email OTP
                </label>
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Test OTP hint */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-blue-300 text-xs">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <strong>Test OTP:</strong> {testUser.emailOtp}
                </p>
              </div>

              <button
                onClick={handleVerifyEmailOtp}
                disabled={loading || emailOtp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Email
                    <Shield className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Didn't receive OTP?{' '}
                {countdown > 0 ? (
                  <span className="text-gray-500">Resend in {countdown}s</span>
                ) : (
                  <button onClick={handleResendOtp} className="text-pink-400 hover:text-pink-300 font-medium">
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          )}

          {authStep === 'verifyPhone' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                {/* Email verified badge */}
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Email Verified</span>
                </div>
                
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Phone</h2>
                <p className="text-gray-400 text-sm">
                  Enter the 6-digit OTP sent to <span className="text-white">+91 {phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone OTP
                </label>
                <input
                  type="text"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Test OTP hint */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <p className="text-green-300 text-xs">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <strong>Test OTP:</strong> {testUser.phoneOtp}
                </p>
              </div>

              <button
                onClick={handleVerifyPhoneOtp}
                disabled={loading || phoneOtp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Phone
                    <Shield className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Didn't receive OTP?{' '}
                {countdown > 0 ? (
                  <span className="text-gray-500">Resend in {countdown}s</span>
                ) : (
                  <button onClick={handleResendOtp} className="text-pink-400 hover:text-pink-300 font-medium">
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          )}

          {authStep === 'success' && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Complete!</h2>
              <p className="text-gray-400 mb-4">
                Welcome, <span className="text-white font-medium">{testUser.username}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Redirecting to application...</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicators */}
        {authStep !== 'credentials' && authStep !== 'success' && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className={`w-3 h-3 rounded-full ${emailVerified ? 'bg-green-500' : authStep === 'verifyEmail' ? 'bg-pink-500 animate-pulse' : 'bg-gray-600'}`} />
            <div className="w-8 h-0.5 bg-gray-600" />
            <div className={`w-3 h-3 rounded-full ${phoneVerified ? 'bg-green-500' : authStep === 'verifyPhone' ? 'bg-pink-500 animate-pulse' : 'bg-gray-600'}`} />
          </div>
        )}
      </div>
    </div>
  )
}

