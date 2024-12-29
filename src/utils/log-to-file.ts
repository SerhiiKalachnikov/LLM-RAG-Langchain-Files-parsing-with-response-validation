import { OnModuleInit } from '@nestjs/common';
import colors from 'colors';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

export class StoreToFile implements OnModuleInit {
  private fileFolder: string;
  private isDev: boolean;

  constructor(folder: string = 'default') {
    this.fileFolder = join(cwd(), 'logs', folder);
    this.isDev = process.env.NODE_ENV === 'development';
  }
  onModuleInit() {
    if (!this.isDev) return;
    if (!existsSync(this.fileFolder))
      mkdir(this.fileFolder, { recursive: true });
  }

  public async storeToFileImage(
    data: Buffer,
    folder: string[],
    params?: {
      fileName?: string;
      format?: '.json' | '.txt';
      fileAddition?: string;
    },
  ) {
    if (!this.isDev) return;
    const { fileName = this.timeFilename() + '.png' } = params || {};
    const now = new Date().toISOString().split('T')[0];
    const folderPath = join(this.fileFolder, 'images', ...folder, now);
    const filePath = join(folderPath, fileName);
    if (!existsSync(folderPath)) await mkdir(folderPath, { recursive: true });
    await writeFile(filePath, data);
    console.log(colors.blue(`[${folder.join(' -> ')}] filePath: ${filePath}`));
  }

  public async storeToFileText(
    data: any,
    folder: string[],
    params?: {
      filename?: string;
      format?: '.json' | '.txt';
      fileAddition?: string;
    },
  ) {
    if (!this.isDev) return;
    const {
      filename = this.timeFilename(),
      format = '.json',
      fileAddition = '',
    } = params || {};
    const now = new Date().toISOString().split('T')[0];
    const folderPath = join(this.fileFolder, 'logs', ...folder, now);
    const filePath = join(folderPath, `${filename}_${fileAddition}${format}`);
    if (!existsSync(folderPath)) await mkdir(folderPath, { recursive: true });
    await writeFile(
      filePath,
      format == '.json' ? JSON.stringify(data, null, 2) : data,
      { encoding: 'utf-8' },
    );
    console.log(colors.blue(`[${folder.join(' -> ')}] filePath: ${filePath}`));
  }

  public timeFilename = () => Date.now().toString();
}
