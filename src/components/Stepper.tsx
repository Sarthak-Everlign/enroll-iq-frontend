'use client'

import { User, FileText, Building2, Check, CreditCard, Video } from 'lucide-react'
import { clsx } from 'clsx'

interface Step {
  id: number
  name: string
  description: string
  icon: React.ReactNode
}

interface StepperProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Identity Verification',
    description: 'Aadhaar & PAN',
    icon: <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />,
  },
  {
    id: 2,
    name: 'Video KYC',
    description: 'Face Verification',
    icon: <Video className="w-5 h-5 lg:w-6 lg:h-6" />,
  },
  {
    id: 3,
    name: 'Personal Details',
    description: 'Your Information',
    icon: <User className="w-5 h-5 lg:w-6 lg:h-6" />,
  },
  {
    id: 4,
    name: 'Documents & University',
    description: 'Upload & Course Details',
    icon: <FileText className="w-5 h-5 lg:w-6 lg:h-6" />,
  },
  {
    id: 5,
    name: 'Summary',
    description: 'Review & Confirmation',
    icon: <Check className="w-5 h-5 lg:w-6 lg:h-6" />,
  },
]

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4 lg:py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Desktop View */}
        <div className="hidden lg:flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 mx-16 rounded-full" />
          
          {/* Progress Line Active */}
          <div 
            className="absolute top-7 left-0 h-1 mx-16 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === 1 ? 0 : 2}rem)`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)'
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onStepClick?.(step.id)}
              >
                {/* Step Circle */}
                <div
                  className={clsx(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg',
                    isCompleted && 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200',
                    !isCompleted && !isCurrent && 'bg-white text-gray-400 border-2 border-gray-200'
                  )}
                  style={isCurrent ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                    color: 'white',
                    transform: 'scale(1.1)',
                    boxShadow: '0 10px 24px rgba(54, 68, 207, 0.35)'
                  } : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-3 text-center">
                  <p
                    className={clsx(
                      'text-xs font-semibold uppercase tracking-wider mb-0.5',
                      isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    )}
                    style={isCurrent ? { color: '#3b82f6' } : undefined}
                  >
                    Step {step.id}
                  </p>
                  <p
                    className={clsx(
                      'text-sm font-semibold whitespace-nowrap',
                      isCurrent || isCompleted ? 'text-gray-800' : 'text-gray-400'
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile View - Horizontal Scroll */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max pb-2">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer hover:opacity-80',
                      isCompleted && 'bg-green-100 text-green-700',
                      !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
                    )}
                    style={isCurrent ? {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: 'white',
                      boxShadow: '0 10px 24px rgba(54, 68, 207, 0.35)'
                    } : undefined}
                    onClick={() => onStepClick?.(step.id)}
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      isCurrent && 'bg-white/20',
                      isCompleted && 'bg-green-200',
                      !isCompleted && !isCurrent && 'bg-gray-200'
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{step.name}</span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={clsx(
                      'w-4 h-0.5 mx-1',
                      step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
