export enum CalendarEventType {
  PERSONAL = 'PERSONAL',
  COURSE = 'COURSE',
  JOB = 'JOB',
  CLUB = 'CLUB',
  SPORT = 'SPORT',
}

export class UploadFileInput {
  // file: Express.Multer.File;
  eventType: CalendarEventType;
  courseId: number;
}

export class UploadFileOutput {
  is: boolean;
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Update to your Auth solution
export const UserId = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (data: unknown, ctx: ExecutionContext) => {
    return 1;
  },
);
