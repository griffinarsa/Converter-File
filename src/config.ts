const env=import.meta.env;
export const brand={name:env.VITE_BRAND_NAME||'Formatku',tagline:'Konversi file, beres.',maxFileMB:Number(env.VITE_MAX_FILE_MB)||100,maxBatchMB:Number(env.VITE_MAX_BATCH_MB)||500,maxFiles:Number(env.VITE_MAX_FILES)||50,concurrency:3};
