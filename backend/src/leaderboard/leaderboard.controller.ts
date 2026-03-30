import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ReportDropDto } from './dto/leaderboard.dto';

@Controller()
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * POST /api/report-drop
   * Mobile App gửi dữ liệu khi điện thoại bị rơi hoặc tát
   */
  @Post('report-drop')
  @HttpCode(HttpStatus.CREATED)
  async reportDrop(@Body() dto: ReportDropDto) {
    return this.leaderboardService.reportDrop(dto);
  }

  /**
   * GET /api/leaderboard
   * "Hall of Shame" - Top 10 người làm rơi điện thoại nhiều nhất
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.leaderboardService.getLeaderboard(Math.min(limit, 50));
  }

  /**
   * GET /api/stats?deviceId=xxx
   * Thống kê cá nhân của một thiết bị
   */
  @Get('stats')
  async getUserStats(@Query('deviceId') deviceId: string) {
    return this.leaderboardService.getUserStats(deviceId);
  }
}
