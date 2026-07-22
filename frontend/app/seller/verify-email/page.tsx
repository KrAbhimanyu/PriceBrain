'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(true);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/seller/register" className="inline-flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to registration
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We have sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Verification email sent to:</p>
              <p className="font-medium">seller@example.com</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push('/seller')} variant="default">
                Continue to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Resend Verification Email</>
                )}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Didn&apos;t receive the email?</strong><br />
                1. Check your spam/junk folder<br />
                2. Make sure you entered the correct email<br />
                3. Wait a few minutes and try again
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
