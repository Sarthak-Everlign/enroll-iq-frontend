'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, CameraOff, RotateCcw, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Video, Shield, Sparkles, Info } from 'lucide-react'

interface VideoKYCProps {
  onNext: (kycData: KYCData | null) => void
  onBack: () => void
  userName: string
}

export interface KYCData {
  photo: string
  timestamp: string
  verified: boolean
}

type KYCStep = 'instructions' | 'capture' | 'review' | 'complete'

export default function VideoKYC({ onNext, onBack, userName }: VideoKYCProps) {
  const [step, setStep] = useState<KYCStep>('instructions')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Instructions for KYC
  const instructions = [
    "Hold your Aadhaar card next to your face",
    "Ensure good lighting on your face",
    "Keep your face centered in the frame",
    "Make sure the Aadhaar card details are visible",
    "Remove glasses, caps, or anything covering your face"
  ]

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      setError('Unable to access camera. Please grant camera permission and try again.')
    }
  }, [])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  // Capture photo with countdown
  const startCapture = () => {
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown === null) return
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      capturePhoto()
      setCountdown(null)
    }
  }, [countdown])

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
        setStep('review')
        stopCamera()
      }
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
    setStep('capture')
    startCamera()
  }

  // Submit KYC
  const handleSubmit = () => {
    if (capturedImage) {
      setStep('complete')
      setTimeout(() => {
        onNext({
          photo: capturedImage,
          timestamp: new Date().toISOString(),
          verified: true
        })
      }, 2000)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">Video KYC Verification</h2>
        <Video className="w-5 h-5 text-purple-500" />
      </div>

      {step === 'instructions' && (
        <div className="space-y-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 text-lg mb-2">
                  Hello, {userName}!
                </h3>
                <p className="text-purple-700">
                  Complete your Video KYC verification by taking a photo with your Aadhaar card. 
                  This helps us verify your identity securely.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Instructions
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 pt-1">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reference Image */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Reference Example
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Sample Reference Image */}
                <div className="w-64 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Face outline */}
                    <div className="w-20 h-24 border-4 border-purple-400 rounded-full" />
                    {/* Aadhaar card representation */}
                    <div className="absolute -right-8 top-4 w-16 h-10 bg-gradient-to-r from-orange-400 to-green-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg transform rotate-6">
                      AADHAAR
                    </div>
                  </div>
                  <p className="text-purple-600 text-sm font-medium mt-4">Hold like this</p>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Face clearly visible</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Aadhaar card next to face</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Good lighting</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Card details readable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            
            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => onNext(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2"
              >
                Skip for now
                <ArrowRight className="w-4 h-4" />
              </button> */}
              
              <button
                onClick={() => {
                  setStep('capture')
                  startCamera()
                }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Camera
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'capture' && (
        <div className="space-y-6">
          {/* Camera View */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-w-2xl mx-auto shadow-2xl">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                <CameraOff className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                
                {/* Overlay guides */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face outline guide */}
                  <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-40 h-52 border-4 border-white/50 rounded-full" />
                  
                  {/* Aadhaar position guide */}
                  <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-20 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                    <span className="text-white/70 text-xs">Place Aadhaar here</span>
                  </div>

                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-purple-500 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-purple-500 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-purple-500 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-purple-500 rounded-br-xl" />
                </div>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-8xl font-bold text-white animate-pulse">
                      {countdown > 0 ? countdown : '📸'}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Instructions reminder */}
          <div className="max-w-2xl mx-auto bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-purple-700 text-sm text-center">
              Position your face in the oval guide and hold your Aadhaar card next to your face
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                stopCamera()
                setStep('instructions')
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Instructions
            </button>
            
            <button
              onClick={startCapture}
              disabled={!hasPermission || countdown !== null}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-6 h-6" />
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {step === 'review' && capturedImage && (
        <div className="space-y-8">
          {/* Captured Image Review */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Review Your Photo</h3>
              </div>
              <div className="p-4">
                <img
                  src={capturedImage}
                  alt="Captured KYC"
                  className="w-full rounded-xl transform scale-x-[-1]"
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">Please verify:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="checkbox-custom" defaultChecked />
                <span className="text-gray-700">Face is clearly visible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="checkbox-custom" defaultChecked />
                <span className="text-gray-700">Aadhaar card is visible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="checkbox-custom" defaultChecked />
                <span className="text-gray-700">Photo is not blurry</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="checkbox-custom" defaultChecked />
                <span className="text-gray-700">Good lighting</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={retakePhoto}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Photo
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Continue
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">KYC Verification Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your identity has been successfully verified.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Proceeding to document upload...</span>
          </div>
        </div>
      )}
    </div>
  )
}

