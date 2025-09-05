import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    base: "./", // ✅ عشان يعرف يشوف الملفات من public

    server: {
        host: 'localhost',
        port: 3000,
        strictPort: true,
        proxy: {
            '^/api/.*': {
                target: 'https://pdf360.ne',
                changeOrigin: true,
                secure: false,
                ws: true,
    },
},
},
});
