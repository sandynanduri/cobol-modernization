
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppStore } from '@/store/appStore';
import { Github, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GitHubExporterProps {
  code: string;
  fileName: string;
}

const GitHubExporter: React.FC<GitHubExporterProps> = ({ code, fileName }) => {
  const { targetLanguage } = useAppStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState(`Add converted ${fileName} to ${targetLanguage}`);
  const [filePath, setFilePath] = useState(`converted/${fileName.replace('.cbl', `.${targetLanguage === 'python' ? 'py' : 'java'}`)}`);
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Repository URL Required",
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Mock export process - in a real implementation, this would use GitHub API
      // to create or update files in the repository
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Export Successful",
        description: `Converted code has been saved to ${filePath}`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to save to repository. Please check your permissions and try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Github className="mr-2 h-4 w-4" />
          Export to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export to GitHub</DialogTitle>
          <DialogDescription>
            Save the converted code to your GitHub repository
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-repo-url">Repository URL</Label>
            <Input
              id="export-repo-url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-path">File Path</Label>
            <Input
              id="file-path"
              placeholder="path/to/file.py"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commit-message">Commit Message</Label>
            <Textarea
              id="commit-message"
              placeholder="Add converted COBOL file"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !repoUrl.trim()}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubExporter;
