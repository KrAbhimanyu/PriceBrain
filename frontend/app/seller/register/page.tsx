'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check, Store, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

const sellerSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN'),
  address: z.string().min(10, 'Please enter your complete address'),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SellerFormData = z.infer<typeof sellerSchema>;

export default function SellerRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      storeName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gstin: '',
      address: '',
      agreeTerms: false,
    },
  });

  const watchPassword = watch('password');

  const passwordRequirements = [
    { test: (v: string) => v.length >= 8, label: 'At least 8 characters' },
    { test: (v: string) => /[a-z]/.test(v), label: 'One lowercase letter' },
    { test: (v: string) => /[A-Z]/.test(v), label: 'One uppercase letter' },
    { test: (v: string) => /[0-9]/.test(v), label: 'One number' },
    { test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v), label: 'One special character' },
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof SellerFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['storeName', 'ownerName'];
    else if (currentStep === 2) fieldsToValidate = ['email', 'phone', 'password', 'confirmPassword'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data: SellerFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Seller registration data:', data);
      toast.success('Registration submitted! Please verify your email.');
      router.push('/seller/verify-email');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">PriceBrain Seller</span>
          </Link>
          <h1 className="text-2xl font-bold">Become a Seller</h1>
          <p className="text-muted-foreground mt-2">Start selling on PriceBrain today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { step: 1, label: 'Store Info' },
            { step: 2, label: 'Account' },
            { step: 3, label: 'Verify' },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentStep >= item.step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= item.step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${currentStep > item.step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>
              {currentStep === 1 && 'Store Information'}
              {currentStep === 2 && 'Account Details'}
              {currentStep === 3 && 'Verify & Submit'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about your store'}
              {currentStep === 2 && 'Create your seller account'}
              {currentStep === 3 && 'Verify your details and GSTIN'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Step 1: Store Info */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name *</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="storeName"
                        placeholder="Enter your store name"
                        {...register('storeName')}
                        className={`pl-10 ${errors.storeName ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.storeName && <p className="text-sm text-destructive">{errors.storeName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Enter owner's full name"
                      {...register('ownerName')}
                      className={errors.ownerName ? 'border-destructive' : ''}
                    />
                    {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        {...register('phone')}
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        id="address"
                        placeholder="Enter complete business address"
                        {...register('address')}
                        className={`w-full px-10 py-2 border rounded-lg min-h-[80px] ${errors.address ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                  </div>

                  <Button type="button" className="w-full" onClick={nextStep}>
                    Continue
                  </Button>
                </>
              )}

              {/* Step 2: Account Details */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        {...register('password')}
                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            watchPassword ? (req.test(watchPassword) ? 'bg-green-500' : 'bg-muted') : 'bg-muted'
                          }`}>
                            {watchPassword && req.test(watchPassword) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>
                      Back
                    </Button>
                    <Button type="button" className="flex-1" onClick={nextStep}>
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Verify & Submit */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN Number *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="gstin"
                        placeholder="29AAACP1234C1ZX"
                        {...register('gstin')}
                        className={`pl-10 ${errors.gstin ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
                    <p className="text-xs text-muted-foreground">15-digit GST Identification Number</p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-medium">Summary</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Store:</span> {watch('storeName')}</p>
                      <p><span className="text-muted-foreground">Email:</span> {watch('email')}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {watch('phone')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      {...register('agreeTerms')}
                      className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">Seller Terms</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                  {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms.message}</p>}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Already have a seller account?{' '}
              <Link href="/seller/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
