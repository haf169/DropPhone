import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { SoundType } from '../sound.entity';

export class CreateSoundDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsEnum(SoundType)
  type: SoundType;
}

export class SoundResponseDto {
  id: number;
  name: string;
  description: string;
  url: string;      // Full URL để tải file audio
  type: SoundType;
  isActive: boolean;
}
