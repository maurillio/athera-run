/**
 * ATHERA FLEX v3.4.0 - Report Exporter
 * Export relatório de ajustes em PDF
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  Loader2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// ============================================================================
// TYPES
// ============================================================================

interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  user: {
    name: string;
    email: string;
  };
  adjustments: {
    total: number;
    autoApplied: number;
    manualReviewed: number;
    avgConfidence: number;
  };
  metrics: {
    totalWorkouts: number;
    totalDistance: number;
    avgIntensity: number;
    completionRate: number;
  };
  topAdjustments: Array<{
    date: Date;
    type: string;
    confidence: number;
    reason: string;
  }>;
}

interface ReportExporterProps {
  reportData: ReportData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReportExporter({
  reportData,
  variant = 'default',
  size = 'default',
  className,
}: ReportExporterProps) {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const generatePDF = async () => {
    setExporting(true);
    setStatus('idle');

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(147, 51, 234); // purple-600
      doc.text('Athera Flex - Relatório de Ajustes', 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(
        `Período: ${reportData.period.start.toLocaleDateString('pt-BR')} - ${reportData.period.end.toLocaleDateString('pt-BR')}`,
        20,
        yPosition
      );

      // User Info
      yPosition += 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Atleta: ${reportData.user.name}`, 20, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Email: ${reportData.user.email}`, 20, yPosition);

      // Line separator
      yPosition += 10;
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.line(20, yPosition, pageWidth - 20, yPosition);

      // Adjustments Summary
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumo de Ajustes', 20, yPosition);

      yPosition += 10;
      doc.setFontSize(10);
      
      const adjustmentsSummary = [
        `Total de Ajustes: ${reportData.adjustments.total}`,
        `Auto-aplicados: ${reportData.adjustments.autoApplied}`,
        `Revisados manualmente: ${reportData.adjustments.manualReviewed}`,
        `Confiança média: ${reportData.adjustments.avgConfidence.toFixed(1)}%`,
      ];

      adjustmentsSummary.forEach((text) => {
        doc.text(text, 25, yPosition);
        yPosition += 7;
      });

      // Metrics Summary
      yPosition += 10;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Métricas de Treino', 20, yPosition);

      yPosition += 10;
      doc.setFontSize(10);
      
      const metricsSummary = [
        `Total de Treinos: ${reportData.metrics.totalWorkouts}`,
        `Distância Total: ${reportData.metrics.totalDistance.toFixed(1)} km`,
        `Intensidade Média: ${reportData.metrics.avgIntensity.toFixed(1)}/10`,
        `Taxa de Conclusão: ${reportData.metrics.completionRate.toFixed(1)}%`,
      ];

      metricsSummary.forEach((text) => {
        doc.text(text, 25, yPosition);
        yPosition += 7;
      });

      // Top Adjustments
      if (reportData.topAdjustments.length > 0) {
        yPosition += 15;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Principais Ajustes', 20, yPosition);

        yPosition += 10;
        doc.setFontSize(9);

        reportData.topAdjustments.forEach((adj, idx) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setTextColor(147, 51, 234); // purple-600
          doc.text(`${idx + 1}. ${adj.date.toLocaleDateString('pt-BR')} - ${adj.type}`, 25, yPosition);
          yPosition += 5;
          
          doc.setTextColor(107, 114, 128); // gray-500
          doc.text(`   Confiança: ${adj.confidence}%`, 25, yPosition);
          yPosition += 5;
          
          doc.setTextColor(0, 0, 0);
          const reasonLines = doc.splitTextToSize(`   ${adj.reason}`, pageWidth - 50);
          doc.text(reasonLines, 25, yPosition);
          yPosition += reasonLines.length * 5 + 5;
        });
      }

      // Footer
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text(
        'Gerado por Athera Run - Sistema Inteligente de Treinos',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      doc.text(
        `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      );

      // Save PDF
      const filename = `athera-flex-report-${reportData.period.start.toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setExporting(false);
    }
  };

  const getButtonContent = () => {
    if (exporting) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          PDF Gerado!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          Erro ao gerar
        </>
      );
    }

    return (
      <>
        <FileDown className="h-4 w-4 mr-2" />
        Exportar PDF
      </>
    );
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={generatePDF}
      disabled={exporting}
    >
      {getButtonContent()}
    </Button>
  );
}
