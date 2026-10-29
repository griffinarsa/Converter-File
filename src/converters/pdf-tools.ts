import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(files: File[]) {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }
  return new Blob([await merged.save()], { type: 'application/pdf' });
}

export async function splitPdf(file: File) {
  const source = await PDFDocument.load(await file.arrayBuffer());
  if (source.getPageCount() > 500) throw new Error('PDF di atas 500 halaman belum bisa dipecah di browser.');
  const pages: Blob[] = [];
  for (let index = 0; index < source.getPageCount(); index++) {
    const part = await PDFDocument.create();
    const [page] = await part.copyPages(source, [index]);
    part.addPage(page);
    pages.push(new Blob([await part.save()], { type: 'application/pdf' }));
  }
  return pages;
}

export async function compressPdf(file: File) {
  const body = new FormData();
  body.append('file', file);
  body.append('to', 'pdf-compress');
  const response = await fetch('/api/convert', { method: 'POST', body });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error || 'PDF gagal dikompres.');
  }
  return response.blob();
}
