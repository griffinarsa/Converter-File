import JSZip from 'jszip';

export async function extractZip(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer(), { checkCRC32: false, createFolders: false });
  const entries = Object.values(zip.files).filter(entry => !entry.dir);
  if (entries.length > 200) throw new Error('ZIP berisi lebih dari 200 file.');
  let expanded = 0;
  for (const entry of entries) {
    const metadata = (entry as unknown as { _data?: { uncompressedSize: number; compressedSize: number } })._data;
    const size = metadata?.uncompressedSize ?? 0;
    const compressed = metadata?.compressedSize ?? 0;
    expanded += size;
    if (expanded > 500 * 1024 * 1024 || size > Math.max(compressed, 1) * 100) {
      throw new Error('ZIP melewati batas ukuran setelah diekstrak.');
    }
    if ((Number(entry.unixPermissions) & 0o170000) === 0o120000) {
      throw new Error('ZIP berisi symbolic link yang tidak aman.');
    }
  }
  const names = new Set<string>();
  const extracted: File[] = [];
  for (const entry of entries) {
    const base = entry.name.split(/[\\/]/).filter(Boolean).pop();
    if (!base || base === '.' || base === '..') continue;
    const cleaned = base.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120);
    let name = cleaned || 'file';
    let suffix = 2;
    while (names.has(name.toLowerCase())) {
      const dot = cleaned.lastIndexOf('.');
      name = dot > 0 ? `${cleaned.slice(0, dot)} (${suffix++})${cleaned.slice(dot)}` : `${cleaned} (${suffix++})`;
    }
    names.add(name.toLowerCase());
    const blob = await entry.async('blob');
    extracted.push(new File([blob], name, { type: blob.type || 'application/octet-stream' }));
  }
  return extracted;
}
