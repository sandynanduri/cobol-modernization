
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, ArrowRight, FileText, Zap, CheckCircle, Code2, Database, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { analyzeCobolFile } from '@/lib/cobolAnalyzer';

const AnalyzePage: React.FC = () => {
  const { currentFile, targetLanguage, setCurrentStep, setBusinessLogic, setCurrentFile } = useAppStore();
  const [dependenciesOpen, setDependenciesOpen] = React.useState(false);

  useEffect(() => {
    if (currentFile && currentFile.content && !currentFile.cobolAnalysis) {
      const analysis = analyzeCobolFile(currentFile.content, currentFile.name);
      setCurrentFile({
        ...currentFile,
        cobolAnalysis: analysis
      });
    }
  }, [currentFile, setCurrentFile]);

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

  const getFileExtension = (fileName: string) => {
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
  };

  const getCobolTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'main-program': return 'bg-blue-100 text-blue-800';
      case 'copybook': return 'bg-green-100 text-green-800';
      case 'subprogram': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

      {/* Enhanced File Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>File Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Name</label>
                <p className="font-medium">{currentFile.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Extension</label>
                <p className="font-medium">{getFileExtension(currentFile.name) || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Size</label>
                <p className="font-medium">{(currentFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">COBOL Type</label>
                <div className="mt-1">
                  <Badge className={`${getCobolTypeColor(currentFile.cobolAnalysis?.fileType || 'unknown')} text-xs`}>
                    {currentFile.cobolAnalysis?.fileType.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
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

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">COBOL Divisions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentFile.cobolAnalysis?.divisions.map((division, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {division}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">Analyzing...</span>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Structure Status</label>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${currentFile.cobolAnalysis?.hasIdentificationDivision ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs">Identification Division</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${currentFile.cobolAnalysis?.hasProcedureDivision ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs">Procedure Division</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Dependencies Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={dependenciesOpen} onOpenChange={setDependenciesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="text-left">View Dependencies</span>
                {dependenciesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold">COPY Statements</h4>
                  </div>
                  {currentFile.cobolAnalysis?.dependencies.copyStatements.length ? (
                    <div className="space-y-1">
                      {currentFile.cobolAnalysis.dependencies.copyStatements.map((copy, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{copy}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No COPY statements found</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold">CALL Statements</h4>
                  </div>
                  {currentFile.cobolAnalysis?.dependencies.callStatements.length ? (
                    <div className="space-y-1">
                      {currentFile.cobolAnalysis.dependencies.callStatements.map((call, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{call}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No CALL statements found</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold">File Assignments</h4>
                  </div>
                  {currentFile.cobolAnalysis?.dependencies.fileAssignments.length ? (
                    <div className="space-y-1">
                      {currentFile.cobolAnalysis.dependencies.fileAssignments.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{file}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No file assignments found</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold">Database Connections</h4>
                  </div>
                  {currentFile.cobolAnalysis?.dependencies.databaseConnections.length ? (
                    <div className="space-y-1">
                      {currentFile.cobolAnalysis.dependencies.databaseConnections.map((db, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{db}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No database connections found</p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
