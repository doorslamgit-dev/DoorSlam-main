// src/components/print/PrintStyles.tsx
// Print-specific styles for reports
// FEAT-010: Theme-aligned print rules (no hard-coded hex, token-aware backgrounds)

export function PrintStyles() {
  return (
    <style>{`
      @media print {
        .no-print {
          display: none !important;
        }

        body {
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @page {
          size: A4;
          margin: 15mm;
        }

        .report-card {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .page-break-before {
          page-break-before: always;
        }

        h2, h3 {
          page-break-after: avoid;
        }

        thead {
          display: table-header-group;
        }

        /*
         * Ensure token-based background utilities render correctly in print.
         * We intentionally avoid colour values here and rely on utility classes.
         */
        .bg-primary-50,
        .bg-neutral-50,
        .bg-accent-green\\/10,
        .bg-accent-green\\/15,
        .bg-accent-amber\\/10,
        .bg-accent-amber\\/15 {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }

      @media screen {
        .print-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          box-shadow: var(--shadow-soft, 0 0 20px rgba(0, 0, 0, 0.1));
        }
      }
    `}</style>
  );
}

export default PrintStyles;
