import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, ArrowRight, FileText, Zap, CheckCircle, Code2, Database, ExternalLink, ChevronDown, ChevronRight, Loader2, AlertTriangle, FileCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { analyzeCobolFile } from '@/lib/cobolAnalyzer';
import { supabase } from '@/integrations/supabase/client';

const AnalyzePage: React.FC = () => {
  const { 
    uploadedFiles, 
    targetLanguage, 
    setCurrentStep, 
    setBusinessLogic, 
    updateUploadedFile,
    dependencyAnalysis,
    isAnalyzingDependencies,
    setDependencyAnalysis,
    setIsAnalyzingDependencies
  } = useAppStore();
  const [dependenciesOpen, setDependenciesOpen] = React.useState(false);

  useEffect(() => {
    uploadedFiles.forEach((file) => {
      if (file.content && !file.cobolAnalysis) {
        const analysis = analyzeCobolFile(file.content, file.name);
        updateUploadedFile(file.id, { cobolAnalysis: analysis });
      }
    });
  }, [uploadedFiles, updateUploadedFile]);

  const analyzeDependencies = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsAnalyzingDependencies(true);
    try {
      const files = uploadedFiles.map(file => ({
        name: file.name,
        content: file.content || ''
      }));

      const { data, error } = await supabase.functions.invoke('analyze-dependencies', {
        body: { files }
      });

      if (error) {
        throw error;
      }

      setDependencyAnalysis(data);
      
      toast({
        title: "Dependency Analysis Complete",
        description: data.hasDependencies 
          ? `Found ${data.dependencies.length} dependencies between files`
          : "No dependencies found between files"
      });
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze dependencies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingDependencies(false);
    }
  };

  const handleAnalyze = async () => {
    // First analyze dependencies
    await analyzeDependencies();
    
    const mockBusinessLogic = `
# Business Logic Analysis for ${uploadedFiles.length} COBOL Files

## Files Analyzed:
${uploadedFiles.map((file, index) => `${index + 1}. ${file.name} (${file.cobolAnalysis?.fileType || 'unknown'})`).join('\n')}

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
      description: `Business logic extracted from ${uploadedFiles.length} file(s)`
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

  // Aggregate all dependencies from all files
  const aggregatedDependencies = uploadedFiles.reduce((acc, file) => {
    if (file.cobolAnalysis?.dependencies) {
      acc.copyStatements.push(...file.cobolAnalysis.dependencies.copyStatements);
      acc.callStatements.push(...file.cobolAnalysis.dependencies.callStatements);
      acc.fileAssignments.push(...file.cobolAnalysis.dependencies.fileAssignments);
      acc.databaseConnections.push(...file.cobolAnalysis.dependencies.databaseConnections);
    }
    return acc;
  }, {
    copyStatements: [] as string[],
    callStatements: [] as string[],
    fileAssignments: [] as string[],
    databaseConnections: [] as string[]
  });

  // Remove duplicates
  Object.keys(aggregatedDependencies).forEach(key => {
    aggregatedDependencies[key as keyof typeof aggregatedDependencies] = 
      [...new Set(aggregatedDependencies[key as keyof typeof aggregatedDependencies])];
  });

  if (uploadedFiles.length === 0 || !targetLanguage) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Required</CardTitle>
            <CardDescription>
              Please upload files and select a target language first
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
          Analyzing {uploadedFiles.length} file(s) for {targetLanguage} conversion
        </p>
      </div>

      {/* Analysis Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Files Analysis</span>
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

      {/* Files Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Files Information ({uploadedFiles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{file.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getCobolTypeColor(file.cobolAnalysis?.fileType || 'unknown')} text-xs`}>
                        {file.cobolAnalysis?.fileType.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">COBOL Divisions</label>
                    <div className="flex flex-wrap gap-1">
                      {file.cobolAnalysis?.divisions.map((division, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {division}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">Analyzing...</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Structure Status</label>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${file.cobolAnalysis?.hasIdentificationDivision ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs">Identification Division</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${file.cobolAnalysis?.hasProcedureDivision ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs">Procedure Division</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dependencies Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>AI-Powered Dependencies Analysis</span>
          </CardTitle>
          <CardDescription>
            OpenAI analyzes your COBOL files to identify inter-file dependencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedFiles.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              <Button 
                onClick={analyzeDependencies}
                disabled={isAnalyzingDependencies}
                size="sm"
              >
                {isAnalyzingDependencies ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Dependencies...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze Dependencies
                  </>
                )}
              </Button>
            </div>
          )}

          {uploadedFiles.length === 1 && (
            <div className="text-center p-4 border rounded-lg bg-muted/50">
              <FileCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Upload multiple files to analyze dependencies between them
              </p>
            </div>
          )}

          {dependencyAnalysis && (
            <div className="space-y-4">
              {/* Analysis Summary */}
              <div className={`p-4 rounded-lg border ${
                dependencyAnalysis.hasDependencies 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {dependencyAnalysis.hasDependencies ? (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <FileCheck className="h-5 w-5 text-green-600" />
                  )}
                  <h4 className="font-semibold">
                    {dependencyAnalysis.hasDependencies ? 'Dependencies Found' : 'No Dependencies'}
                  </h4>
                </div>
                <p className="text-sm">{dependencyAnalysis.summary}</p>
              </div>

              {/* Dependencies List */}
              {dependencyAnalysis.hasDependencies && dependencyAnalysis.dependencies.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Identified Dependencies:</h5>
                  {dependencyAnalysis.dependencies.map((dep, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {dep.dependencyType}
                        </Badge>
                        <span className="text-sm font-medium">
                          {dep.fromFile} → {dep.toFile}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{dep.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {dependencyAnalysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Conversion Recommendations:</h5>
                  <ul className="space-y-1">
                    {dependencyAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!dependencyAnalysis && !isAnalyzingDependencies && uploadedFiles.length > 1 && (
            <div className="text-center p-4 border rounded-lg bg-muted/50">
              <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Click "Analyze Dependencies" to check for inter-file dependencies using AI
              </p>
            </div>
          )}
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
