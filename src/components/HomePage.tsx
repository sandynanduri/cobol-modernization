
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import FileUpload from './FileUpload';
import LanguageSelector from './LanguageSelector';
import { ArrowRight, Code2, Zap, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  const { currentFile, targetLanguage, setCurrentStep } = useAppStore();

  const handleAnalyze = () => {
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please upload a COBOL file first",
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
          COBOL to Modern Languages
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your COBOL code and convert to modern languages with AI-powered analysis and conversion
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

      {/* Upload Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Upload & Configure
          </CardTitle>
          <CardDescription>
            Upload your COBOL file and select the target programming language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload />
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
  );
};

export default HomePage;
