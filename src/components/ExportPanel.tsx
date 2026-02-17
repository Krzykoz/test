import React, { useState } from 'react';
import { FileText, FileJson, FileCode } from 'lucide-react';
import { AnalysisResult, ExportSelection } from '../types';
import { ExportService } from '../services/exportService';

interface ExportPanelProps {
  analysisResult: AnalysisResult;
  selection: ExportSelection;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ analysisResult, selection }) => {
  const [exporting, setExporting] = useState(false);

  const selectedCount = Object.values(selection).filter(s => s.selected).length;

  const handleExport = async (format: 'csv' | 'json' | 'powershell') => {
    setExporting(true);
    try {
      switch (format) {
        case 'csv':
          await ExportService.exportToCSV(analysisResult, selection);
          break;
        case 'json':
          await ExportService.exportToJSON(analysisResult, selection);
          break;
        case 'powershell':
          await ExportService.exportToPowerShell(analysisResult, selection);
          break;
      }
    } catch (err) {
      alert(`Export failed: ${err}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h2>Export Recommendations</h2>
        <p className="export-subtitle">
          {selectedCount} {selectedCount === 1 ? 'identity' : 'identities'} selected
        </p>
      </div>

      <div className="export-buttons">
        <button
          onClick={() => handleExport('csv')}
          disabled={selectedCount === 0 || exporting}
          className="export-button"
        >
          <FileText size={20} />
          <div className="button-content">
            <div className="button-title">Export as CSV</div>
            <div className="button-description">Summary table for reporting</div>
          </div>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={selectedCount === 0 || exporting}
          className="export-button"
        >
          <FileJson size={20} />
          <div className="button-content">
            <div className="button-title">Export as JSON</div>
            <div className="button-description">Detailed data for further analysis</div>
          </div>
        </button>

        <button
          onClick={() => handleExport('powershell')}
          disabled={selectedCount === 0 || exporting}
          className="export-button"
        >
          <FileCode size={20} />
          <div className="button-content">
            <div className="button-title">Export as PowerShell</div>
            <div className="button-description">Ready-to-run migration script</div>
          </div>
        </button>
      </div>

      {selectedCount === 0 && (
        <div className="export-warning">
          Select at least one identity to export recommendations.
        </div>
      )}
    </div>
  );
};
