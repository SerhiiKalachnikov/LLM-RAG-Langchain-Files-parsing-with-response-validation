import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { StoreToFile } from '../utils/log-to-file';
import { CalendarService } from './calendar.service';
import { UploadFileInput, UploadFileOutput, UserId } from './dto';
import { EMimeType } from './interfaces';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  private readonly logger = new Logger(LlmController.name);
  private readonly storeToFile = new StoreToFile(LlmController.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly calendarService: CalendarService,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-file')
  async uploadFile(
    @Body() input: UploadFileInput,
    @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileOutput> {
    const { eventType, courseId } = input;
    const { buffer, filename, mimetype } = file;

    this.logger.log('📁 Uploading file...', {
      filename,
      mimetype,
      userId,
      eventType,
      courseId,
    });

    const fileParsingResult = await this.llmService.captureCalendarEvents(
      buffer,
      filename,
      mimetype as EMimeType,
    );

    await this.storeToFile.storeToFileText(
      fileParsingResult,
      ['calendar', 'results'],
      { filename: filename, format: '.json' },
    );

    // store the result in the database
    this.logger.log('🗄️ Storing calendar results...');
    await this.calendarService.storeCalendarResults(
      fileParsingResult,
      userId,
      eventType,
      courseId,
    );

    this.logger.log('📁 File uploaded successfully!');

    return { is: true };
  }
}
