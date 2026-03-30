import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { DropEvent } from './drop-event.entity';
import { ReportDropDto, LeaderboardEntryDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DropEvent)
    private readonly dropEventRepository: Repository<DropEvent>,
  ) {}

  async reportDrop(dto: ReportDropDto): Promise<{ message: string; eventId: number }> {
    // Upsert user theo deviceId
    let user = await this.userRepository.findOne({
      where: { deviceId: dto.deviceId },
    });

    if (!user) {
      user = this.userRepository.create({
        deviceId: dto.deviceId,
        username: dto.username || `Player_${dto.deviceId.slice(-4)}`,
      });
      user = await this.userRepository.save(user);
      this.logger.log(`New user registered: ${user.username}`);
    } else if (dto.username && dto.username !== user.username) {
      // Cập nhật username nếu thay đổi
      user.username = dto.username;
      await this.userRepository.save(user);
    }

    // Lưu sự kiện rơi/tát
    const event = this.dropEventRepository.create({
      userId: user.id,
      impactForce: dto.impactForce,
      eventType: dto.eventType,
      deviceModel: dto.deviceModel,
    });
    const savedEvent = await this.dropEventRepository.save(event);

    this.logger.log(
      `Drop event recorded: User=${user.username}, Force=${dto.impactForce}G, Type=${dto.eventType}`,
    );

    return { message: 'Drop event recorded successfully!', eventId: savedEvent.id };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntryDto[]> {
    try {
      // Fix: PostgreSQL không cho ORDER BY alias trong raw query
      const results = await this.dropEventRepository
        .createQueryBuilder('event')
        .select('event.userId', 'userId')
        .addSelect('COUNT(event.id)', 'totalDrops')
        .addSelect('MAX(event.impactForce)', 'maxImpactForce')
        .addSelect('MAX(event.timestamp)', 'lastDropAt')
        .groupBy('event.userId')
        .orderBy('COUNT(event.id)', 'DESC') // ← Fix: dùng expression, không dùng alias
        .limit(limit)
        .getRawMany();

      const leaderboard: LeaderboardEntryDto[] = [];
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        const user = await this.userRepository.findOne({
          where: { id: Number(row.userId) },
        });
        if (user) {
          leaderboard.push({
            rank: i + 1,
            username: user.username,
            deviceId: user.deviceId.slice(0, 8) + '****',
            totalDrops: parseInt(row.totalDrops, 10),
            maxImpactForce: parseFloat(parseFloat(row.maxImpactForce || '0').toFixed(2)),
            lastDropAt: row.lastDropAt,
          });
        }
      }
      return leaderboard;
    } catch (error) {
      this.logger.error('Leaderboard query failed:', error.message);
      return []; // Trả [] thay vì crash 500
    }
  }


  async getUserStats(deviceId: string) {
    const user = await this.userRepository.findOne({ where: { deviceId } });
    if (!user) return null;

    const totalDrops = await this.dropEventRepository.count({
      where: { userId: user.id },
    });

    const maxImpact = await this.dropEventRepository
      .createQueryBuilder('event')
      .select('MAX(event.impactForce)', 'max')
      .where('event.userId = :userId', { userId: user.id })
      .getRawOne();

    return {
      username: user.username,
      totalDrops,
      maxImpactForce: maxImpact?.max ? parseFloat(parseFloat(maxImpact.max).toFixed(2)) : 0,
      memberSince: user.createdAt,
    };
  }
}
