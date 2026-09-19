import React from 'react';
import { Shield, Lock, CheckCircle2, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Privacy & Document Retention Policy</h1>
        <p className="text-sm text-gray-500">
          Our honest privacy guarantees and client-side processing architecture.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-xs space-y-8 text-xs text-gray-600 leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            1. 100% Client-Side Processing by Default
          </h3>
          <p>
            The majority of our tools (Merge, Split, Rotate, Organize, Watermark, Page Numbers, Add Text, Sign PDF, JPG to PDF, PDF to JPG, Metadata Editor, Repair, and Compression) execute entirely in your web browser using JavaScript and WebAssembly.
          </p>
          <p>
            Your documents are parsed into memory within your device. They are <strong>never uploaded</strong> to remote servers for standard local processing.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            2. Zero Inspection & No Data Harvesting
          </h3>
          <p>
            We do not read, index, inspect, share, or sell the contents of your documents or metadata. Telemetry logged to the database records only operational counts and byte throughput for capacity management.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            3. Encryption Standards
          </h3>
          <p>
            Password protection and encrypted files utilize standard PDF encryption algorithms. Electronic signatures and annotations are baked directly into the document structure upon download.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            4. Cloud Document Vault
          </h3>
          <p>
            If you explicitly click "Save to Cloud Vault", the file is stored in your private, authenticated bucket. You maintain full ownership and can delete any file at any time.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
