
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, ArrowRight, FileText, Zap, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AnalyzePage: React.FC = () => {
  const { currentFile, targetLanguage, setCurrentStep, setBusinessLogic } = useAppStore();

  const handleAnalyze = () => {
    // Simulate analysis process
    const mockBusinessLogic = `
# Business Logic Analysis for ${currentFile?.name}

## Key Components Identified:
1. Data validation routines
2. Calculation procedures  
3. File I/O operations
4. Error handling logic

## Conversion Recommendations:
- Modern ${targetLanguage} patterns will be applied
- Object-oriented structure recommended
- Error handling will use try-catch blocks
- File operations will use modern APIs
    `;
    
    setBusinessLogic(mockBusinessLogic);
    toast({
      title: "Analysis Complete",
      description: "Business logic has been extracted and analyzed"
    });
    setCurrentStep('convert');
  };

  if (!currentFile || !targetLanguage) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Required</CardTitle>
            <CardDescription>
              Please upload a file and select a target language first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentStep('upload')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">COBOL Analysis</h1>
        <p className="text-muted-foreground">
          Analyzing {currentFile.name} for {targetLanguage} conversion
        </p>
      </div>

      {/* Analysis Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>File Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Code Structure</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing COBOL divisions and sections
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Business Logic</h3>
              <p className="text-sm text-muted-foreground">
                Extracting core business rules
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Mapping external file references
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Name</label>
              <p className="font-medium">{currentFile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Size</label>
              <p className="font-medium">{(currentFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Target Language</label>
              <p className="font-medium capitalize">{targetLanguage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
              <p className="font-medium">{currentFile.uploadedAt.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
        <Button onClick={handleAnalyze}>
          Start Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AnalyzePage;
