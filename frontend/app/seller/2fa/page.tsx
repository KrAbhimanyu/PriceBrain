'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Loader2, Smartphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function TwoFactorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, '');
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeValue = code.join('');
    if (codeValue.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Verification successful!');
      router.push('/seller');
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSetupStep(2);
      toast.success('2FA enabled successfully!');
    } catch (error) {
      toast.error('Failed to enable 2FA');
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
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {is2FAEnabled ? 'Enter Verification Code' : 'Two-Factor Authentication'}
            </CardTitle>
            <CardDescription>
              {is2FAEnabled 
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Add an extra layer of security to your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!is2FAEnabled ? (
              <div className="space-y-6">
                {setupStep === 0 && (
                  <>
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">
                            Use apps like Google Authenticator, Authy, or Microsoft Authenticator
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setSetupStep(1)}>
                      Set Up 2FA
                    </Button>
                  </>
                )}
                
                {setupStep === 1 && (
                  <>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Scan this QR code with your authenticator app:</p>
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                          [QR Code Placeholder]
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Or manually enter this code: <code className="bg-muted px-2 py-1 rounded">JBSWY3DPEHPK3PXP</code>
                    </p>
                    <Button className="w-full" onClick={handleEnable2FA} disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
                      ) : 'Continue to Verify'}
                    </Button>
                  </>
                )}
                
                {setupStep === 2 && (
                  <>
                    <div className="text-center mb-4">
                      <Lock className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">2FA is now enabled!</p>
                      <p className="text-sm text-muted-foreground">
                        Save your backup codes in a safe place
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Backup Codes:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        {['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6'].map(code => (
                          <div key={code} className="p-2 bg-background rounded">{code}</div>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => router.push('/seller')}>
                      Go to Dashboard
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold"
                    />
                  ))}
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleVerify} 
                  disabled={isLoading || code.join('').length !== 6}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : 'Verify'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Having trouble? <button className="text-primary hover:underline">Use a backup code</button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
