const env=import.meta.env;
const formatLimit=(mb:number)=>mb>=1024?`${Number((mb/1024).toFixed(1))} GB`:`${mb} MB`;
const maxFileMB=Number(env.VITE_MAX_FILE_MB)||1024,maxBatchMB=Number(env.VITE_MAX_BATCH_MB)||1024,maxServerFileMB=Number(env.VITE_MAX_SERVER_FILE_MB)||1024;
export const brand={name:env.VITE_BRAND_NAME||'Formatku',tagline:'Konversi file, beres.',maxFileMB,maxBatchMB,maxServerFileMB,maxFileLabel:formatLimit(maxFileMB),maxBatchLabel:formatLimit(maxBatchMB),maxServerFileLabel:formatLimit(maxServerFileMB),maxFiles:Number(env.VITE_MAX_FILES)||50,concurrency:1};
