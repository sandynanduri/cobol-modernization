
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
import { ArrowRight, Upload, GitBranch } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  const { uploadedFiles, targetLanguage, setCurrentStep } = useAppStore();

  const handleAnalyze = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload COBOL files or import from a repository first",
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
      description: `Analyzing ${uploadedFiles.length} file(s) for ${targetLanguage} conversion`
    });
  };

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

            {/* Import COBOL Files Section - Full Width */}
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
                    disabled={uploadedFiles.length === 0 || !targetLanguage}
                    size="lg"
                    className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel - Full Width */}
            <PreviewPanel />
          </div>
        </div>
        
        {/* Trust Signal Footer */}
        <TrustSignal />
      </div>
    </TooltipProvider>
  );
};

export default HomePage;
