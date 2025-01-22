import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default defineConfig({
	plugins: [react(), polyfillNode()],
	assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'], // file ảnh
	define: {
		global: 'globalThis', // Định nghĩa `global` thành `globalThis`
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					tinymce: ['tinymce/tinymce'],
				},
			},
		},
	},
});
