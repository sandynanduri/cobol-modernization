
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, ArrowRight, Code, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ConvertPage: React.FC = () => {
  const { 
    currentFile, 
    targetLanguage, 
    businessLogic, 
    convertedCode,
    setConvertedCode,
    setCurrentStep 
  } = useAppStore();

  const handleConvert = () => {
    // Simulate conversion process
    const mockConvertedCode = targetLanguage === 'python' 
      ? `# Converted from ${currentFile?.name}
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
      : `// Converted from ${currentFile?.name}
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
    toast({
      title: "Conversion Complete",
      description: `COBOL code has been converted to ${targetLanguage}`
    });
  };

  const handleDownload = () => {
    const fileExtension = targetLanguage === 'python' ? 'py' : 'java';
    const fileName = `converted_${currentFile?.name?.replace('.cbl', '')}.${fileExtension}`;
    
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

  if (!currentFile || !targetLanguage || !businessLogic) {
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
          Converting {currentFile.name} to {targetLanguage}
        </p>
      </div>

      {/* Conversion Tabs */}
      <Tabs defaultValue="business-logic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business-logic">Business Logic</TabsTrigger>
          <TabsTrigger value="converted-code">Converted Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business-logic">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Business Logic</CardTitle>
              <CardDescription>
                Core business rules and logic identified from the COBOL code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {businessLogic}
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
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
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
