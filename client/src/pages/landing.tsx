import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-corp-blue rounded-lg flex items-center justify-center">
              <i className="fas fa-comments text-white text-2xl"></i>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Corporate Messenger
              </h1>
              <p className="text-gray-600">
                Professional team communication platform for your organization
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                className="w-full bg-corp-blue hover:bg-blue-700"
                size="lg"
              >
                Sign In to Continue
              </Button>
              
              <p className="text-sm text-gray-500">
                Secure authentication powered by your organization's identity provider
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <i className="fas fa-comments text-corp-blue"></i>
                <span>Real-time messaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-video text-corp-blue"></i>
                <span>Voice & video calling</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-search text-corp-blue"></i>
                <span>User search by ID</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-alt text-corp-blue"></i>
                <span>Enterprise-grade security</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
