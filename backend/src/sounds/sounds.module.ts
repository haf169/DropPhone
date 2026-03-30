import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { SoundsController } from './sounds.controller';
import { SoundsService } from './sounds.service';
import { Sound } from './sound.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sound]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [SoundsController],
  providers: [SoundsService],
})
export class SoundsModule {}
