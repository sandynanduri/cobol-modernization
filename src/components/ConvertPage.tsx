import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import GitHubExporter from './GitHubExporter';
import { ArrowLeft, ArrowRight, Code, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ConvertPage: React.FC = () => {
  const { 
    uploadedFiles, 
    targetLanguage, 
    businessLogic, 
    pseudoCode,
    convertedCode,
    setConvertedCode,
    setPseudoCode,
    setCurrentStep 
  } = useAppStore();

  const handleConvert = () => {
    const mainFile = uploadedFiles[0]; // Use first file as the main file for demo
    // Simulate conversion process
    const mockConvertedCode = targetLanguage === 'python' 
      ? `# Converted from ${uploadedFiles.length} COBOL files
# Target: Python

class COBOLConverter:
    def __init__(self):
        self.data_validation = True
        
    def process_data(self, input_data):
        """Process input data with validation"""
        if not self.validate_input(input_data):
            raise ValueError("Invalid input data")
            
        # Main processing logic
        result = self.calculate_values(input_data)
        return self.format_output(result)
        
    def validate_input(self, data):
        """Validate input data"""
        return data is not None and len(data) > 0
        
    def calculate_values(self, data):
        """Perform calculations"""
        # Business logic implementation
        return sum(data) if isinstance(data, list) else data
        
    def format_output(self, result):
        """Format output for display"""
        return f"Result: {result}"

if __name__ == "__main__":
    converter = COBOLConverter()
    sample_data = [1, 2, 3, 4, 5]
    print(converter.process_data(sample_data))
`
      : `// Converted from ${uploadedFiles.length} COBOL files
// Target: Java

public class COBOLConverter {
    private boolean dataValidation;
    
    public COBOLConverter() {
        this.dataValidation = true;
    }
    
    public String processData(int[] inputData) throws IllegalArgumentException {
        if (!validateInput(inputData)) {
            throw new IllegalArgumentException("Invalid input data");
        }
        
        // Main processing logic
        int result = calculateValues(inputData);
        return formatOutput(result);
    }
    
    private boolean validateInput(int[] data) {
        return data != null && data.length > 0;
    }
    
    private int calculateValues(int[] data) {
        // Business logic implementation
        int sum = 0;
        for (int value : data) {
            sum += value;
        }
        return sum;
    }
    
    private String formatOutput(int result) {
        return "Result: " + result;
    }
    
    public static void main(String[] args) {
        COBOLConverter converter = new COBOLConverter();
        int[] sampleData = {1, 2, 3, 4, 5};
        System.out.println(converter.processData(sampleData));
    }
}
`;

    setConvertedCode(mockConvertedCode);
    
    // Generate pseudo code
    const mockPseudoCode = `PSEUDO CODE for ${uploadedFiles.length} COBOL files:

1. INITIALIZE data validation flags
2. READ input data from files
3. FOR each data record:
   a. VALIDATE input format
   b. IF valid THEN
      - CALCULATE business values
      - APPLY business rules
   c. ELSE
      - LOG error
      - SET error flag
4. FORMAT output results
5. WRITE results to output file
6. RETURN status code`;

    setPseudoCode(mockPseudoCode);
    
    toast({
      title: "Conversion Complete",
      description: `COBOL code has been converted to ${targetLanguage}`
    });
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

  if (uploadedFiles.length === 0 || !targetLanguage || !businessLogic) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Required</CardTitle>
            <CardDescription>
              Please complete the analysis step first
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">COBOL Conversion</h1>
        <p className="text-muted-foreground">
          Converting {uploadedFiles.length} file(s) to {targetLanguage}
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
                    Business requirements and logic extracted from the COBOL files
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
                High-level algorithmic representation of the COBOL logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {pseudoCode || "Generate conversion to see pseudo code..."}
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
                    Modern {targetLanguage} implementation of the COBOL logic
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
                      fileName={uploadedFiles[0]?.name || 'converted'} 
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {convertedCode ? (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {convertedCode}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click "Start Conversion" to generate the {targetLanguage} code
                  </p>
                  <Button onClick={handleConvert}>
                    Start Conversion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('analyze')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analysis
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
