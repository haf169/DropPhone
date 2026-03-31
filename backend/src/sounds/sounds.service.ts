import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sound, SoundType } from './sound.entity';
import { ConfigService } from '@nestjs/config';
import { CreateSoundDto, SoundResponseDto } from './dto/sound.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SoundsService implements OnModuleInit {
  private readonly logger = new Logger(SoundsService.name);

  constructor(
    @InjectRepository(Sound)
    private readonly soundRepository: Repository<Sound>,
    private readonly configService: ConfigService,
  ) {}

  // Seed dữ liệu mẫu khi khởi động lần đầu
  async onModuleInit() {
    const count = await this.soundRepository.count();
    if (count === 0) {
      this.logger.log('Seeding default sounds...');
      await this.seedDefaultSounds();
    }
  }

  private async seedDefaultSounds() {
    const defaults = [
      {
        name: 'Emotional Damage',
        description: 'EMOTIONAL DAMAGE!! khi điện thoại rơi tự do',
        filename: 'emotional-damage-meme.mp3',
        type: SoundType.FALL,
      },
      {
        name: 'Emotional Damage',
        description: 'EMOTIONAL DAMAGE!! khi bị tát',
        filename: 'emotional-damage-meme.mp3',
        type: SoundType.SLAP,
      },
    ];

    for (const sound of defaults) {
      const entity = this.soundRepository.create(sound);
      await this.soundRepository.save(entity);
    }
    this.logger.log('Default sounds seeded!');
  }

  private buildUrl(filename: string): string {
    const baseUrl = this.configService.get<string>(
      'API_BASE_URL',
      'http://localhost:3001',
    );
    return `${baseUrl}/uploads/${filename}`;
  }

  async findAll(type?: SoundType): Promise<SoundResponseDto[]> {
    const where: any = { isActive: true };
    if (type) where.type = type;

    const sounds = await this.soundRepository.find({ where, order: { id: 'ASC' } });
    return sounds.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      url: this.buildUrl(s.filename),
      type: s.type,
      isActive: s.isActive,
    }));
  }

  async create(dto: CreateSoundDto, filename: string): Promise<SoundResponseDto> {
    const sound = this.soundRepository.create({
      name: dto.name,
      description: dto.description,
      filename,
      type: dto.type,
    });
    const saved = await this.soundRepository.save(sound);
    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      url: this.buildUrl(saved.filename),
      type: saved.type,
      isActive: saved.isActive,
    };
  }

  async deleteSound(id: number): Promise<void> {
    const sound = await this.soundRepository.findOne({ where: { id } });
    if (sound) {
      // Xóa file vật lý
      const filePath = path.join(process.cwd(), 'uploads', sound.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await this.soundRepository.delete(id);
    }
  }
}
