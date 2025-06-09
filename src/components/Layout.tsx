
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:48px_48px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-blue-300/10 via-indigo-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    COBOL Converter
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Transform COBOL to modern languages with AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="border-b bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentStep(item.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200",
                    currentStep === item.id
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50/50"
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
    </div>
  );
};

export default Layout;
