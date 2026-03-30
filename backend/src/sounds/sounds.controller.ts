import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SoundsService } from './sounds.service';
import { SoundType } from './sound.entity';
import { CreateSoundDto } from './dto/sound.dto';

@Controller('sounds')
export class SoundsController {
  constructor(private readonly soundsService: SoundsService) {}

  /**
   * GET /api/sounds
   * GET /api/sounds?type=FALL
   * GET /api/sounds?type=SLAP
   */
  @Get()
  async findAll(@Query('type') type?: SoundType) {
    return this.soundsService.findAll(type);
  }

  /**
   * POST /api/sounds/upload
   * Upload file âm thanh mới (dùng cho Web Admin)
   * Body: multipart/form-data với field "file", "name", "description", "type"
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `sound-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Chỉ cho phép file âm thanh
        if (!file.mimetype.match(/\/(mp3|mpeg|wav|ogg|aac|m4a)$/)) {
          cb(new Error('Only audio files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // Tối đa 10MB
    }),
  )
  async uploadSound(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateSoundDto,
  ) {
    return this.soundsService.create(dto, file.filename);
  }

  /**
   * DELETE /api/sounds/:id
   * Xóa âm thanh (dùng cho Web Admin)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSound(@Param('id', ParseIntPipe) id: number) {
    return this.soundsService.deleteSound(id);
  }
}
