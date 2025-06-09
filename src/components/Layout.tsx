
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Home, Search, Code, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStep, setCurrentStep } = useAppStore();

  const navItems = [
    { id: 'upload', label: 'Home', icon: Home },
    { id: 'analyze', label: 'Analyze', icon: Search },
    { id: 'convert', label: 'Convert', icon: Code },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">COBOL Converter</h1>
                <p className="text-sm text-muted-foreground">
                  Transform COBOL to modern languages with AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentStep(item.id as any)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors",
                  currentStep === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
