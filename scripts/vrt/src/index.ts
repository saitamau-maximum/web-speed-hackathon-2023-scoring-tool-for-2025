import path from 'node:path';
import { URL } from 'node:url';
import fs from 'fs-extra';
import config from 'config';
import yargs from 'yargs';
import axios from 'axios';

import type { Page, ViewPort } from './types';
import { logger } from './logger';
import { captureScreenshot } from './capture_screenshot';

async function main() {
  const argv = await yargs
    .option('url', {
      type: 'string',
      demandOption: true,
    })
    .help().argv;

  const baseUrl = argv.url;

  // Initialize
  await axios.post(new URL('/api/initialize', baseUrl).href, '', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  logger.info('Initialized: %s', baseUrl);

  const viewportList = config.get<ViewPort[]>('viewports');
  const pageList = config.get<Page[]>('pages');

  const exportPath = path.resolve(process.cwd(), './tmp/actual/');
  await fs.remove(exportPath);
  await fs.ensureDir(exportPath);

  for (const viewport of viewportList) {
    for (const page of pageList) {
      const url = new URL(page.path, baseUrl).href;
      const buffer = await captureScreenshot({
        url,
        width: viewport.width,
        height: viewport.height,
      });
      if (!buffer) {
        logger.error('Failed to capture: %s, %s', page.name, viewport.name);
        continue;
      }
      await fs.writeFile(path.resolve(exportPath, `./${page.name} - ${viewport.name}.png`), buffer);

      logger.info('Captured: %s, %s', page.name, viewport.name);
    }
  }
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});