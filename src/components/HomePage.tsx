
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/appStore';
import FileUpload from './FileUpload';
import VCSConnector from './VCSConnector';
import LanguageSelector from './LanguageSelector';
import PreviewPanel from './PreviewPanel';
import TrustSignal from './TrustSignal';
import { ArrowRight, Code2, Zap, Shield, Upload, GitBranch } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  const { currentFile, targetLanguage, setCurrentStep } = useAppStore();

  const handleAnalyze = () => {
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please upload a COBOL file or import from a repository first",
        variant: "destructive"
      });
      return;
    }

    if (!targetLanguage) {
      toast({
        title: "No target language selected",
        description: "Please choose Python or Java as your target language",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('analyze');
    toast({
      title: "Starting analysis",
      description: `Analyzing ${currentFile.name} for ${targetLanguage} conversion`
    });
  };

  const features = [
    {
      icon: Code2,
      title: 'Smart Analysis',
      description: 'AI-powered business logic extraction from COBOL code'
    },
    {
      icon: Zap,
      title: 'Multi-Language Support',
      description: 'Convert to Python or Java with optimized syntax'
    },
    {
      icon: Shield,
      title: 'Enterprise Ready',
      description: 'Professional-grade conversion with validation'
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="max-w-6xl mx-auto space-y-8 px-4">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                COBOL to Modern Languages
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your COBOL code or import from any Git repository and convert to modern languages with AI-powered analysis and conversion
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload & Version Control Integration Section */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Import COBOL Files
                    </CardTitle>
                    <CardDescription>
                      Upload files directly or import from GitHub, Bitbucket, GitLab, or any Git repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="upload" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload Files</span>
                        </TabsTrigger>
                        <TabsTrigger value="vcs" className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4" />
                          <span>Import from Git</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload">
                        <FileUpload />
                      </TabsContent>
                      
                      <TabsContent value="vcs">
                        <VCSConnector />
                      </TabsContent>
                    </Tabs>

                    <LanguageSelector />
                    
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!currentFile || !targetLanguage}
                        size="lg"
                        className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Start Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-1">
                <PreviewPanel />
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Signal Footer */}
        <TrustSignal />
      </div>
    </TooltipProvider>
  );
};

export default HomePage;
