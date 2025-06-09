
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { targetLanguage, setTargetLanguage } = useAppStore();

  const languages = [
    { 
      value: 'python' as const, 
      label: 'Python', 
      description: 'Modern, readable syntax with extensive libraries',
      tooltip: 'Python offers clean syntax, excellent for data processing and enterprise applications. Great for rapid development and maintenance.'
    },
    { 
      value: 'java' as const, 
      label: 'Java', 
      description: 'Enterprise-grade with strong typing and performance',
      tooltip: 'Java provides enterprise-grade reliability, strong typing, and excellent performance. Ideal for large-scale business applications.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label className="text-base font-medium">Choose Target Language</Label>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Select the modern programming language you want to convert your COBOL code to</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <Tooltip key={lang.value}>
            <TooltipTrigger asChild>
              <div
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${targetLanguage === lang.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => setTargetLanguage(lang.value)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 transition-colors
                      ${targetLanguage === lang.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                      }
                    `}
                  >
                    {targetLanguage === lang.value && (
                      <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{lang.label}</h3>
                    <p className="text-sm text-muted-foreground">{lang.description}</p>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{lang.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
