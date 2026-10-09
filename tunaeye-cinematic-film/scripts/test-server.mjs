import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const server = await createServer({ root, configLoader: 'runner', server: { host: '127.0.0.1', port: 4178, strictPort: true, watch: { ignored: ['**/tunaeye-product-demo/**', '**/tunaeye-cinematic-film/**', '**/test-results/**'] } } });
await server.listen();
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
