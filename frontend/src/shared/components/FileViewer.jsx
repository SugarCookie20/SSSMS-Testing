import React from 'react';
import { Download } from 'lucide-react';

/**
 * FileViewer — renders a file intelligently based on its extension:
 *   - PDF       → <iframe> (browser native PDF viewer)
 *   - Images    → <img> (jpg, jpeg, png, gif, webp)
 *   - Other     → Download prompt (ppt, pptx, xlsx, docx, etc.)
 *
 * Props:
 *   url      {string}  Full URL to the file (e.g. BASE_URL + /timetable/view/abc.jpg)
 *   fileName {string}  Original filename used for extension detection & download name
 *   title    {string}  Accessible label for the iframe / img alt text
 *   className {string} Extra CSS classes applied to the wrapper div
 */
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const PDF_EXTS   = ['.pdf'];

function getExt(fileName = '') {
    const dot = fileName.toLowerCase().lastIndexOf('.');
    return dot !== -1 ? fileName.toLowerCase().slice(dot) : '';
}

const FileViewer = ({ url, fileName = '', title = 'File', className = '' }) => {
    const ext = getExt(fileName);

    if (PDF_EXTS.includes(ext)) {
        return (
            <div className={`w-full h-full ${className}`}>
                <iframe src={url} className="w-full h-full" title={title} />
            </div>
        );
    }

    if (IMAGE_EXTS.includes(ext)) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 overflow-auto ${className}`}>
                <img
                    src={url}
                    alt={title}
                    className="max-w-full max-h-full object-contain rounded"
                />
            </div>
        );
    }

    // Non-viewable format — show a download card
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-gray-200 ${className}`}>
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 text-center max-w-xs">
                This file type cannot be previewed in the browser.<br />
                Click below to download it.
            </p>
            <a
                href={url}
                download={fileName}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                <Download className="w-4 h-4" />
                Download {fileName}
            </a>
        </div>
    );
};

export default FileViewer;
