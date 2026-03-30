import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { EventType } from '../drop-event.entity';
import { Type } from 'class-transformer';

export class ReportDropDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  impactForce: number;

  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceModel?: string;
}

export class LeaderboardEntryDto {
  rank: number;
  username: string;
  deviceId: string;
  deviceModel?: string;
  totalDrops: number;
  maxImpactForce: number;
  lastDropAt: Date;
}

