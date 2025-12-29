"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Shield,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import testData from "@/data/testData.json";
import { updateAadharPanVerification, getApplication } from "@/lib/api";

interface AadharPanVerificationProps {
  onNext: (aadharDetails: AadharDetails | null) => void;
  onBack: () => void;
}

export interface AadharDetails {
  aadharNumber: string;
  panNumber: string;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  photo: string;
}

type VerificationStep = "enterDetails" | "verifyAadhar" | "verified";

export default function AadharPanVerification({
  onNext,
  onBack,
}: AadharPanVerificationProps) {
  const [step, setStep] = useState<VerificationStep>("enterDetails");

  // Form fields
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharOtp, setAadharOtp] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadharValid, setAadharValid] = useState(false);
  const [panValid, setPanValid] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [verifiedDetails, setVerifiedDetails] = useState<AadharDetails | null>(
    null
  );

  // Test data
  const validAadhars = testData.aadharData.validAadharNumbers;
  const validPans = testData.panData.validPanNumbers;
  const testOtp = testData.aadharData.aadharOtp;

  useEffect(() => {
    const loadVerificationData = async () => {
      const res = await getApplication();
      if (!res.success || !res.data) {
        return;
      }

      const app = res.data;
      if (app.aadhaar_verified && app.pan_verified) {
        setAadharNumber(formatAadhar(app.aadhaar_number ?? ""));
        setPanNumber(app.pan_number ?? "");
        setAadharValid(true);
        setPanValid(true);

        const dob =
          app.dob_day && app.dob_month && app.dob_year
            ? `${app.dob_day}/${app.dob_month}/${app.dob_year}`
            : "";

        const details: AadharDetails = {
          aadharNumber: app.aadhaar_number ?? "",
          panNumber: app.pan_number ?? "",
          fullName: app.full_name ?? "",
          fatherName: app.father_name ?? "",
          dob: dob,
          gender: app.gender ?? "",
          address: app.address ?? "",
          city: app.city ?? "",
          state: app.state ?? "",
          pincode: app.pincode ?? "",
          phone: app.phone ?? "",
          photo: "",
        };

        setVerifiedDetails(details);

        setStep("verified");
      } else {
        console.log("⚠️ Not both verified yet");
      }
    };

    loadVerificationData();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format Aadhar number as user types (XXXX XXXX XXXX)
  const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  // Validate Aadhar format
  const validateAadhar = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.length === 12 && validAadhars.includes(cleaned)) {
      setAadharValid(true);
      return true;
    }
    setAadharValid(false);
    return false;
  };

  // Validate PAN format (ABCDE1234F)
  const validatePan = (value: string) => {
    // const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    // if (
    //   panRegex.test(value.toUpperCase()) &&
    //   validPans.includes(value.toUpperCase())
    // ) {
    //   setPanValid(true);
    return true;
    // }
    // setPanValid(false);
    // return false;
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhar(e.target.value);
    setAadharNumber(formatted);
    validateAadhar(formatted);
    setError("");
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 10);
    setPanNumber(value);
    validatePan(value);
    setError("");
  };

  const handleSendAadharOtp = async () => {
    setError("");

    const cleanedAadhar = aadharNumber.replace(/\s/g, "");

    if (!validAadhars.includes(cleanedAadhar)) {
      setError(`Invalid Aadhar. Use: ${validAadhars[0]}`);
      return;
    }

    // if (!validPans.includes(panNumber)) {
    //   setError(`Invalid PAN. Use: ${validPans[0]}`);
    //   return;
    // }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    setStep("verifyAadhar");
    setCountdown(30);
  };

  const handleVerifyAadharOtp = async () => {
    setError("");

    if (aadharOtp !== testOtp) {
      setError(`Invalid OTP. Use: ${testOtp}`);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get verified details from test data
    const cleanedAadhar = aadharNumber.replace(/\s/g, "");
    const aadharDetails =
      testData.aadharData.aadharDetails[
        cleanedAadhar as keyof typeof testData.aadharData.aadharDetails
      ];

    if (aadharDetails) {
      const details: AadharDetails = {
        aadharNumber: cleanedAadhar,
        panNumber: panNumber,
        fullName: aadharDetails.fullName,
        fatherName: aadharDetails.fatherName,
        dob: aadharDetails.dob,
        gender: aadharDetails.gender,
        address: aadharDetails.address,
        city: aadharDetails.city,
        state: aadharDetails.state,
        pincode: aadharDetails.pincode,
        phone: aadharDetails.phone,
        photo: aadharDetails.photo,
      };
      setVerifiedDetails(details);

      const dobParts = aadharDetails.dob.split("/");

      await updateAadharPanVerification({
        aadhaar_number: cleanedAadhar,
        aadhaar_verified: true,
        pan_number: panNumber,
        pan_verified: true,
        full_name: aadharDetails.fullName,
        father_name: aadharDetails.fatherName,
        dob_day: dobParts[0] || "",
        dob_month: dobParts[1] || "",
        dob_year: dobParts[2] || "",
        gender: aadharDetails.gender,
        address: aadharDetails.address,
        city: aadharDetails.city,
        state: aadharDetails.state,
        pincode: aadharDetails.pincode,
        phone: aadharDetails.phone,
      });
    }

    setLoading(false);
    setStep("verified");
  };

  const handleContinue = () => {
    if (verifiedDetails) {
      onNext(verifiedDetails);
    }
  };

  const handleResendOtp = () => {
    setCountdown(30);
    setError("");
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">
          Identity Verification
        </h2>
        <Shield className="w-5 h-5 text-blue-500" />
      </div>

      {step === "enterDetails" && (
        <div className="space-y-8">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Secure Verification
                </h3>
                <p className="text-sm text-blue-700">
                  Your Aadhar and PAN details are securely verified. This
                  information is used only for scholarship eligibility
                  verification.
                </p>
              </div>
            </div>
          </div>

          {/* Aadhar Card Input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Aadhaar Card</h3>
                <p className="text-sm text-gray-500">
                  Enter your 12-digit Aadhaar number
                </p>
              </div>
              {aadharValid && (
                <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </div>

            <input
              type="text"
              value={aadharNumber}
              onChange={handleAadharChange}
              placeholder="XXXX XXXX XXXX"
              className={`w-full px-4 py-4 bg-gray-50 border ${
                aadharValid ? "border-green-300 bg-green-50" : "border-gray-200"
              } rounded-xl text-gray-800 text-xl tracking-widest font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-center`}
              maxLength={14}
            />
          </div>

          {/* PAN Card Input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">PAN Card</h3>
                <p className="text-sm text-gray-500">
                  Enter your 10-character PAN number
                </p>
              </div>
              {panValid && (
                <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </div>

            <input
              type="text"
              value={panNumber}
              onChange={handlePanChange}
              placeholder="Enter PAN card"
              className={`w-full px-4 py-4 bg-gray-50 border ${
                panValid ? "border-green-300 bg-green-50" : "border-gray-200"
              } rounded-xl text-gray-800 text-xl tracking-widest font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-center uppercase`}
              maxLength={10}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div />

            <div className="flex items-center gap-4">
              <button
                onClick={handleSendAadharOtp}
                disabled={loading || !aadharValid || !panValid}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify with Aadhaar OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "verifyAadhar" && (
        <div className="space-y-8">
          {/* OTP Verification Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Verify Aadhaar
              </h3>
              <p className="text-gray-600">
                Enter the OTP sent to your Aadhaar-linked mobile number
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Aadhaar: {aadharNumber}
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={aadharOtp}
                onChange={(e) =>
                  setAadharOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-4 bg-white border border-orange-200 rounded-xl text-gray-800 text-2xl tracking-[0.5em] font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-center"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Didn't receive OTP?{" "}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("enterDetails")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Change Details
            </button>

            <button
              onClick={handleVerifyAadharOtp}
              disabled={loading || aadharOtp.length !== 6}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify OTP
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "verified" && verifiedDetails && (
        <div className="space-y-8">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">
                  Identity Verified Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Your Aadhaar and PAN have been verified. The following details
                  will be auto-filled.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Verified Details from Aadhaar
              </h3>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    label="Full Name"
                    value={verifiedDetails.fullName}
                  />
                  <DetailItem
                    label="Father's Name"
                    value={verifiedDetails.fatherName}
                  />
                  <DetailItem
                    label="Date of Birth"
                    value={verifiedDetails.dob}
                  />
                  <DetailItem
                    label="Gender"
                    value={
                      verifiedDetails.gender.charAt(0).toUpperCase() +
                      verifiedDetails.gender.slice(1)
                    }
                  />
                  <DetailItem
                    label="Aadhaar Number"
                    value={formatAadhar(verifiedDetails.aadharNumber)}
                    verified
                  />
                  <DetailItem
                    label="PAN Number"
                    value={verifiedDetails.panNumber}
                    verified
                  />
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Address"
                      value={`${verifiedDetails.address}, ${
                        verifiedDetails.city
                      }, ${
                        verifiedDetails.state.charAt(0).toUpperCase() +
                        verifiedDetails.state.slice(1)
                      } - ${verifiedDetails.pincode}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div />

            <button
              onClick={handleContinue}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Continue to Personal Details
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for displaying details
function DetailItem({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800 font-medium flex items-center gap-2">
        {value}
        {verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
      </p>
    </div>
  );
}
