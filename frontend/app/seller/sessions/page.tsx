'use client';

import { useState } from 'react';
import { Laptop, Smartphone, Monitor, LogOut, Globe, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const MOCK_SESSIONS = [
  { id: '1', device: 'Desktop', browser: 'Chrome on Windows', location: 'Mumbai, India', ip: '192.168.1.1', lastActive: 'Active now', current: true, icon: Monitor },
  { id: '2', device: 'Mobile', browser: 'Safari on iPhone', location: 'Delhi, India', ip: '192.168.1.2', lastActive: '2 hours ago', current: false, icon: Smartphone },
  { id: '3', device: 'Laptop', browser: 'Firefox on MacOS', location: 'Bangalore, India', ip: '192.168.1.3', lastActive: 'Yesterday', current: false, icon: Laptop },
];

export default function SessionsPage() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('Session revoked successfully');
  };

  const handleRevokeAll = () => {
    const currentSession = sessions.find(s => s.current);
    setSessions(currentSession ? [currentSession] : []);
    toast.success('All other sessions have been revoked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground">Manage your logged-in devices</p>
        </div>
        <Button variant="outline" onClick={handleRevokeAll}>
          <LogOut className="h-4 w-4 mr-2" />
          Revoke All Other Sessions
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Security Tip</p>
          <p className="text-sm text-yellow-700">
            Review your active sessions regularly. If you see any unrecognized device, revoke the session immediately.
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className={session.current ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <session.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{session.device}</h3>
                      {session.current && (
                        <Badge className="bg-primary text-primary-foreground">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{session.browser}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {session.location}
                      </span>
                      <span>IP: {session.ip}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Revoke
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2FA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status: <span className="text-green-600">Enabled</span></p>
              <p className="text-sm text-muted-foreground">Your account is protected with 2FA</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/seller/2fa">Manage 2FA</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
