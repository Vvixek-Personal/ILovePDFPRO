import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getToolById } from '../config/tools';
import PrivacyBadge from '../components/common/PrivacyBadge';
import { ChevronRight, ArrowLeft, Eye, Shield, FileText, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useToast } from '../contexts/ToastContext';
import PdfThumbnailPreview from '../components/common/PdfThumbnailPreview';

// Tool Components
import MergeTool from '../components/tools/MergeTool';
import SplitTool from '../components/tools/SplitTool';
import CompressTool from '../components/tools/CompressTool';
import OrganizeTool from '../components/tools/OrganizeTool';
import RotateTool from '../components/tools/RotateTool';
import WatermarkTool from '../components/tools/WatermarkTool';
import PageNumbersTool from '../components/tools/PageNumbersTool';
import JpgToPdfTool from '../components/tools/JpgToPdfTool';
import PdfToJpgTool from '../components/tools/PdfToJpgTool';
import SignTool from '../components/tools/SignTool';
import AddTextTool from '../components/tools/AddTextTool';
import ProtectTool from '../components/tools/ProtectTool';
import UnlockTool from '../components/tools/UnlockTool';
import MetadataTool from '../components/tools/MetadataTool';
import RepairTool from '../components/tools/RepairTool';
import OcrTool from '../components/tools/OcrTool';
import PdfToTextTool from '../components/tools/PdfToTextTool';
import TextToPdfTool from '../components/tools/TextToPdfTool';
import EditTool from '../components/tools/EditTool';
import CropTool from '../components/tools/CropTool';
import RedactTool from '../components/tools/RedactTool';
import CompareTool from '../components/tools/CompareTool';

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const { activeFile, clearActiveFile, handoffToTool } = useWorkflow();
  const { showToast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [candidateFile, setCandidateFile] = useState<File | null>(null);

  if (!toolId) {
    return <Navigate to="/" replace />;
  }

  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Tool Not Found</h2>
        <p className="text-sm text-gray-500">The requested tool does not exist.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-[#e5322d] text-white rounded-xl text-xs font-bold">
          Return to All Tools
        </Link>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'merge-pdf': return <MergeTool />;
      case 'split-pdf': return <SplitTool />;
      case 'compress-pdf': return <CompressTool />;
      case 'organize-pdf': return <OrganizeTool />;
      case 'rotate-pdf': return <RotateTool />;
      case 'watermark-pdf': return <WatermarkTool />;
      case 'page-numbers': return <PageNumbersTool />;
      case 'jpg-to-pdf': return <JpgToPdfTool />;
      case 'pdf-to-jpg': return <PdfToJpgTool />;
      case 'sign-pdf': return <SignTool />;
      case 'add-text': return <AddTextTool />;
      case 'protect-pdf': return <ProtectTool />;
      case 'unlock-pdf': return <UnlockTool />;
      case 'metadata-editor': return <MetadataTool />;
      case 'repair-pdf': return <RepairTool />;
      case 'ocr-pdf': return <OcrTool />;
      case 'pdf-to-text': return <PdfToTextTool />;
      case 'text-to-pdf': return <TextToPdfTool />;
      case 'edit-pdf': return <EditTool />;
      case 'crop-pdf': return <CropTool />;
      case 'redact-pdf': return <RedactTool />;
      case 'compare-pdf': return <CompareTool />;
      default: return <MergeTool />;
    }
  };

  return (
    <div className="min-h-[80vh] pb-20">
      {/* Tool Header & Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-bold">{tool.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{tool.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{tool.shortDesc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-300 text-slate-800 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px] touch-manipulation active:scale-95"
                title="Open client-side thumbnail preview & verifier"
              >
                <Eye className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Verify & Preview PDF</span>
                {activeFile && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                )}
              </button>

              <PrivacyBadge mode={tool.executionMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Document Pre-Processing Verification Ribbon */}
      {activeFile && (
        <div className="bg-slate-900 text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300">File In Workspace:</span>
                  <span className="font-extrabold text-xs text-white max-w-xs sm:max-w-md truncate">
                    {activeFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({(activeFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  100% Client-Side In-Memory • Ready for verification before processing in {tool.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] touch-manipulation active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Thumbnails & Pages</span>
              </button>

              <button
                type="button"
                onClick={clearActiveFile}
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Clear active file from workspace"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Tool Workspace */}
      <main className="py-8">
        {renderToolComponent()}
      </main>

      {/* Secure Client-Side PDF Thumbnail Preview Modal */}
      <PdfThumbnailPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={candidateFile || activeFile?.blob || null}
        fileName={candidateFile?.name || activeFile?.name}
        currentToolName={tool.name}
        onConfirmFile={(file) => {
          handoffToTool(file, file.name, 'verifier', activeFile?.pageCount);
          setCandidateFile(file);
          showToast(`Verified "${file.name}" ready for ${tool.name}`, 'success');
        }}
      />

      {/* Instructions & Guidelines Footer on Tool Page */}
      {tool.instructions && tool.instructions.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pt-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">
              How to use {tool.name}
            </h3>
            <ol className="space-y-3">
              {tool.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-[#e5322d] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolPage;
