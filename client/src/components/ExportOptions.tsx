import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Calendar,
  DollarSign,
  BarChart3,
  Users,
  Loader2
} from 'lucide-react';

export interface ExportConfig {
  format: 'pdf' | 'csv' | 'excel' | 'png';
  sections: {
    summary: boolean;
    revenueChart: boolean;
    venuePerformance: boolean;
    detailedBreakdown: boolean;
    bookingsList: boolean;
  };
  dateRange: {
    start: string;
    end: string;
  };
  customizations: {
    includeCharts: boolean;
    includeLogos: boolean;
    includeSummary: boolean;
    pageOrientation: 'portrait' | 'landscape';
  };
}

interface ExportOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  isExporting?: boolean;
  defaultFormat?: 'pdf' | 'csv' | 'excel' | 'png';
}

export default function ExportOptions({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
  defaultFormat = 'pdf',
}: ExportOptionsProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: defaultFormat,
    sections: {
      summary: true,
      revenueChart: true,
      venuePerformance: true,
      detailedBreakdown: false,
      bookingsList: false,
    },
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    customizations: {
      includeCharts: true,
      includeLogos: true,
      includeSummary: true,
      pageOrientation: 'portrait',
    },
  });

  const updateConfig = (updates: Partial<ExportConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const updateSections = (section: keyof ExportConfig['sections'], value: boolean) => {
    setConfig({
      ...config,
      sections: { ...config.sections, [section]: value },
    });
  };

  const updateCustomizations = (key: keyof ExportConfig['customizations'], value: any) => {
    setConfig({
      ...config,
      customizations: { ...config.customizations, [key]: value },
    });
  };

  const handleExport = () => {
    onExport(config);
  };

  const getFormatInfo = (format: string) => {
    switch (format) {
      case 'pdf':
        return {
          icon: <FileText className="h-5 w-5" />,
          label: 'PDF Document',
          description: 'Professional report with charts and formatting',
          size: '~2-5 MB',
        };
      case 'excel':
        return {
          icon: <FileSpreadsheet className="h-5 w-5" />,
          label: 'Excel Spreadsheet',
          description: 'Data in spreadsheet format for analysis',
          size: '~500 KB - 2 MB',
        };
      case 'csv':
        return {
          icon: <FileSpreadsheet className="h-5 w-5" />,
          label: 'CSV File',
          description: 'Raw data in comma-separated format',
          size: '~50-200 KB',
        };
      case 'png':
        return {
          icon: <FileImage className="h-5 w-5" />,
          label: 'PNG Image',
          description: 'Charts and summary as high-quality image',
          size: '~1-3 MB',
        };
      default:
        return { icon: null, label: '', description: '', size: '' };
    }
  };

  const formatInfo = getFormatInfo(config.format);

  const getSelectedSectionsCount = () => {
    return Object.values(config.sections).filter(Boolean).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Revenue Report
          </DialogTitle>
          <DialogDescription>
            Configure your report export options and download format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={config.format}
                  onValueChange={(value) => updateConfig({ format: value as ExportConfig['format'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF Document
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel Spreadsheet
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV File
                      </div>
                    </SelectItem>
                    <SelectItem value="png">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        PNG Image
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Format Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-600">{formatInfo.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{formatInfo.label}</h4>
                      <p className="text-sm text-gray-600 mb-1">{formatInfo.description}</p>
                      <p className="text-xs text-gray-500">Estimated size: {formatInfo.size}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <input
                    id="start-date"
                    type="date"
                    value={config.dateRange.start}
                    onChange={(e) => updateConfig({
                      dateRange: { ...config.dateRange, start: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <input
                    id="end-date"
                    type="date"
                    value={config.dateRange.end}
                    onChange={(e) => updateConfig({
                      dateRange: { ...config.dateRange, end: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Report Sections
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({getSelectedSectionsCount()} selected)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="summary"
                    checked={config.sections.summary}
                    onCheckedChange={(checked) => updateSections('summary', !!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="summary" className="text-sm font-medium">
                      Revenue Summary
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Key metrics and totals
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="revenueChart"
                    checked={config.sections.revenueChart}
                    onCheckedChange={(checked) => updateSections('revenueChart', !!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="revenueChart" className="text-sm font-medium">
                      Revenue Trend Chart
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Visual trend analysis
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="venuePerformance"
                    checked={config.sections.venuePerformance}
                    onCheckedChange={(checked) => updateSections('venuePerformance', !!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="venuePerformance" className="text-sm font-medium">
                      Venue Performance
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Individual venue stats
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="detailedBreakdown"
                    checked={config.sections.detailedBreakdown}
                    onCheckedChange={(checked) => updateSections('detailedBreakdown', !!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="detailedBreakdown" className="text-sm font-medium">
                      Detailed Breakdown
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Period-by-period data
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="bookingsList"
                    checked={config.sections.bookingsList}
                    onCheckedChange={(checked) => updateSections('bookingsList', !!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="bookingsList" className="text-sm font-medium">
                      Individual Bookings
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Complete booking list
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          {config.format === 'pdf' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-charts" className="text-sm font-medium">
                        Include Charts
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Add visual charts and graphs to the PDF
                      </p>
                    </div>
                    <Checkbox
                      id="include-charts"
                      checked={config.customizations.includeCharts}
                      onCheckedChange={(checked) => updateCustomizations('includeCharts', !!checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-logos" className="text-sm font-medium">
                        Include Branding
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Add your venue logos and branding
                      </p>
                    </div>
                    <Checkbox
                      id="include-logos"
                      checked={config.customizations.includeLogos}
                      onCheckedChange={(checked) => updateCustomizations('includeLogos', !!checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Page Orientation</Label>
                    <Select
                      value={config.customizations.pageOrientation}
                      onValueChange={(value) => updateCustomizations('pageOrientation', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || getSelectedSectionsCount() === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
