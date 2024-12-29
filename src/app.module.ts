import { Module } from '@nestjs/common';

import { LlmModule } from './llm-module/llm.module';

@Module({
  imports: [LlmModule],
})
export class AppModule {}
