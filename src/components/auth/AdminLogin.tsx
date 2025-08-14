import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_CONFIG } from '@/config/app-config';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: '/admin'
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">{APP_CONFIG.ADMIN.LOGIN_TITLE}</CardTitle>
            <CardDescription className="mt-2">
              Access the admin portal to manage documents and settings
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="lg"
          >
            {isLoading ? 'Redirecting...' : APP_CONFIG.ADMIN.LOGIN_BUTTON}
          </Button>
          
          {APP_CONFIG.BRANDING.SHOW_POWERED_BY && (
            <div className="text-center text-sm text-muted-foreground">
              Powered by {APP_CONFIG.BRANDING.POWERED_BY}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;