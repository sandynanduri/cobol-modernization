import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/appStore';
import GitHubExporter from './GitHubExporter';
import { ArrowLeft, ArrowRight, Code, Download, FileText, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ConvertPage: React.FC = () => {
  const { 
    uploadedFiles, 
    targetLanguage, 
    dependencyAnalysis,
    businessLogic, 
    pseudoCode,
    convertedCode,
    setConvertedCode,
    setPseudoCode,
    setBusinessLogic,
    setCurrentStep 
  } = useAppStore();

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isConversionComplete, setIsConversionComplete] = useState(false);

  const handleCompleteConversion = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to convert",
        variant: "destructive"
      });
      return;
    }

    // Generate BRD based on selected files
    const selectedFileNames = selectedFiles.join(', ');
    const mockBRD = `# Business Requirements Document

## Project Overview
Analysis and conversion requirements for selected COBOL files: ${selectedFileNames}

## Selected Files for Conversion
${selectedFiles.map(file => `- ${file}`).join('\n')}

## Business Logic Requirements

### Core Functionality
The selected COBOL files contain critical business logic that must be preserved during conversion:

1. **Data Processing Rules**
   - Input validation and data integrity checks
   - Business calculation algorithms
   - Output formatting requirements

2. **File Dependencies**
   ${dependencyAnalysis?.dependencies.filter(dep => 
     selectedFiles.includes(dep.fromFile) || selectedFiles.includes(dep.toFile)
   ).map(dep => `   - ${dep.fromFile} → ${dep.toFile}: ${dep.description}`).join('\n') || '   - No dependencies found for selected files'}

3. **Conversion Requirements**
   - Target Language: ${targetLanguage}
   - Maintain existing business logic
   - Ensure data integrity
   - Preserve performance characteristics

## Technical Specifications

### Input Requirements
- File format validation
- Data type conversions
- Error handling mechanisms

### Processing Logic
- Core business calculations
- Validation routines
- Data transformation rules

### Output Requirements
- Result formatting
- Error reporting
- Audit trail maintenance

## Success Criteria
1. All selected files converted successfully
2. Business logic preserved
3. Performance maintained
4. Error handling implemented
5. Testing completed successfully

---
Generated on ${new Date().toLocaleDateString()} for ${selectedFiles.length} selected file(s)`;

    setBusinessLogic(mockBRD);
    
    // Generate pseudo code
    const mockPseudoCode = `PSEUDO CODE for ${selectedFiles.length} selected COBOL files:

Selected Files: ${selectedFileNames}

1. INITIALIZE data validation flags for selected files
2. READ input data from selected files:
${selectedFiles.map((file, index) => `   ${index + 1}. Process ${file}`).join('\n')}
3. FOR each data record in selected files:
   a. VALIDATE input format
   b. IF valid THEN
      - CALCULATE business values
      - APPLY business rules
   c. ELSE
      - LOG error
      - SET error flag
4. FORMAT output results
5. WRITE results to output file
6. RETURN status code

Dependencies processed: ${dependencyAnalysis?.dependencies.length || 0}`;

    setPseudoCode(mockPseudoCode);

    // Generate converted code
    const mockConvertedCode = targetLanguage === 'python' 
      ? `# Converted from ${selectedFiles.length} selected COBOL files
# Selected files: ${selectedFileNames}
# Target: Python

class COBOLConverter:
    def __init__(self):
        self.data_validation = True
        self.selected_files = [${selectedFiles.map(f => `"${f}"`).join(', ')}]
        
    def process_data(self, input_data):
        """Process input data with validation for selected files"""
        if not self.validate_input(input_data):
            raise ValueError("Invalid input data")
            
        # Main processing logic for selected files
        result = self.calculate_values(input_data)
        return self.format_output(result)
        
    def validate_input(self, data):
        """Validate input data"""
        return data is not None and len(data) > 0
        
    def calculate_values(self, data):
        """Perform calculations based on selected file logic"""
        # Business logic implementation from selected files
        return sum(data) if isinstance(data, list) else data
        
    def format_output(self, result):
        """Format output for display"""
        return f"Result from {len(self.selected_files)} files: {result}"

if __name__ == "__main__":
    converter = COBOLConverter()
    sample_data = [1, 2, 3, 4, 5]
    print(converter.process_data(sample_data))
`
      : `// Converted from ${selectedFiles.length} selected COBOL files
// Selected files: ${selectedFileNames}
// Target: Java

public class COBOLConverter {
    private boolean dataValidation;
    private String[] selectedFiles = {${selectedFiles.map(f => `"${f}"`).join(', ')}};
    
    public COBOLConverter() {
        this.dataValidation = true;
    }
    
    public String processData(int[] inputData) throws IllegalArgumentException {
        if (!validateInput(inputData)) {
            throw new IllegalArgumentException("Invalid input data");
        }
        
        // Main processing logic for selected files
        int result = calculateValues(inputData);
        return formatOutput(result);
    }
    
    private boolean validateInput(int[] data) {
        return data != null && data.length > 0;
    }
    
    private int calculateValues(int[] data) {
        // Business logic implementation from selected files
        int sum = 0;
        for (int value : data) {
            sum += value;
        }
        return sum;
    }
    
    private String formatOutput(int result) {
        return "Result from " + selectedFiles.length + " files: " + result;
    }
    
    public static void main(String[] args) {
        COBOLConverter converter = new COBOLConverter();
        int[] sampleData = {1, 2, 3, 4, 5};
        System.out.println(converter.processData(sampleData));
    }
}
`;

    setConvertedCode(mockConvertedCode);
    setIsConversionComplete(true);
    
    toast({
      title: "Conversion Complete",
      description: `BRD and ${targetLanguage} code generated for ${selectedFiles.length} selected files`
    });
  };

  const getFileOptions = () => {
    const individualFiles = uploadedFiles.map(file => ({
      value: file.name,
      label: `📄 ${file.name}`,
      type: 'individual'
    }));

    const dependentGroups = dependencyAnalysis?.dependencies.reduce((groups, dep) => {
      const groupKey = `${dep.fromFile}-group`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          value: groupKey,
          label: `📁 ${dep.fromFile} + Dependencies`,
          type: 'group',
          files: [dep.fromFile, dep.toFile]
        };
      } else if (!groups[groupKey].files.includes(dep.toFile)) {
        groups[groupKey].files.push(dep.toFile);
      }
      return groups;
    }, {} as Record<string, any>) || {};

    return [...individualFiles, ...Object.values(dependentGroups)];
  };

  const handleFileSelection = (value: string) => {
    const option = getFileOptions().find(opt => opt.value === value);
    if (option?.type === 'group') {
      setSelectedFiles(option.files);
    } else {
      setSelectedFiles([value]);
    }
  };

  const handleDownload = () => {
    const fileExtension = targetLanguage === 'python' ? 'py' : 'java';
    const fileName = `converted_cobol_files.${fileExtension}`;
    
    const blob = new Blob([convertedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded",
      description: `${fileName} has been downloaded`
    });
  };

  const handleDownloadBRD = () => {
    const fileName = 'Business_Requirements_Document.md';
    
    const blob = new Blob([businessLogic], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "BRD Downloaded",
      description: "Business Requirements Document has been downloaded"
    });
  };

  if (uploadedFiles.length === 0 || !targetLanguage) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Required</CardTitle>
            <CardDescription>
              Please complete the analysis step first before converting files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentStep('analyze')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConversionComplete) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Files for Conversion</h1>
          <p className="text-muted-foreground">
            Choose individual files or dependency groups to convert to {targetLanguage}
          </p>
        </div>

        {/* File Selection */}
        <Card>
          <CardHeader>
            <CardTitle>File Selection</CardTitle>
            <CardDescription>
              Select individual files or grouped dependencies for conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Files:</label>
              <Select onValueChange={handleFileSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose files to convert..." />
                </SelectTrigger>
                <SelectContent>
                  {getFileOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Files:</label>
                <div className="bg-muted p-3 rounded-lg">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('analyze')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analysis
              </Button>
              <Button 
                onClick={handleCompleteConversion}
                disabled={selectedFiles.length === 0}
              >
                Complete Conversion
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">COBOL Conversion Results</h1>
        <p className="text-muted-foreground">
          Conversion completed for {selectedFiles.length} selected file(s) to {targetLanguage}
        </p>
      </div>

      {/* Conversion Tabs */}
      <Tabs defaultValue="brd" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brd">BRD</TabsTrigger>
          <TabsTrigger value="pseudo-code">Pseudo Code</TabsTrigger>
          <TabsTrigger value="converted-code">Converted Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brd">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Business Requirements Document (BRD)</CardTitle>
                  <CardDescription>
                    Business requirements and logic extracted from the selected COBOL files
                  </CardDescription>
                </div>
                <Button onClick={handleDownloadBRD} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download BRD
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none bg-background p-6 rounded-lg border overflow-auto max-h-[600px]">
                {businessLogic.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mb-4 text-primary">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mb-3 mt-6 text-primary">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium mb-2 mt-4">{line.substring(4)}</h3>;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="font-semibold mb-2">{line.slice(2, -2)}</p>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
                  } else if (line.startsWith('1. ') || line.match(/^\d+\. /)) {
                    return <li key={index} className="ml-4 mb-1 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>;
                  } else if (line.trim() === '---') {
                    return <hr key={index} className="my-6 border-border" />;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-2">{line}</p>;
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pseudo-code">
          <Card>
            <CardHeader>
              <CardTitle>Pseudo Code</CardTitle>
              <CardDescription>
                High-level algorithmic representation of the selected COBOL logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {pseudoCode || "No pseudo code generated yet..."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="converted-code">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Converted {targetLanguage} Code</CardTitle>
                  <CardDescription>
                    Modern {targetLanguage} implementation of the selected COBOL logic
                  </CardDescription>
                </div>
                {convertedCode && (
                  <div className="flex space-x-2">
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <GitHubExporter 
                      code={convertedCode} 
                      fileName={selectedFiles[0] || 'converted'} 
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {convertedCode || "No converted code generated yet..."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setIsConversionComplete(false);
          setSelectedFiles([]);
        }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Select Different Files
        </Button>
        <Button onClick={() => setCurrentStep('dashboard')}>
          View Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConvertPage;
