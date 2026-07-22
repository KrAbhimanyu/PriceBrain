'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Smartphone, Loader2, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function OTPLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`OTP sent to +91 ${phone}`);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6 - index).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
          setOtp(newOtp);
        }
      });
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Login successful!');
      router.push('/seller');
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`OTP resent to +91 ${phone}`);
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/seller/login" className="inline-flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 'phone' 
              ? 'We will send you an OTP for verification'
              : `Enter the 6-digit code sent to +91 ${phone}`
            }
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSendOTP} disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
                  ) : 'Send OTP'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold"
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in <span className="font-medium">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleVerifyOTP} 
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : 'Verify & Login'}
                </Button>

                <button
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Change phone number
                </button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground text-center">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
