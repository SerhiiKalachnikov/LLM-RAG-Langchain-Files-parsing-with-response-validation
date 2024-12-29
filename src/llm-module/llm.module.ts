import { Module } from '@nestjs/common';

import { CalendarService } from './calendar.service';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
  controllers: [LlmController],
  providers: [LlmService, CalendarService],
})
export class LlmModule {}
