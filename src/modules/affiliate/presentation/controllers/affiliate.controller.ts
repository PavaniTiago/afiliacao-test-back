import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ZodValidationPipe } from '../../../../shared/infrastructure/pipes/zod-validation.pipe';
import { AuthGuard } from '../../../../shared/infrastructure/auth/guards/auth.guard';
import { AffiliateService } from '../../application/affiliate.service';
import { CreateAffiliateSchema } from '../../application/dto/create-affiliate.dto';
import type { CreateAffiliateDto } from '../../application/dto/create-affiliate.dto';
import { UpdateAffiliateSchema } from '../../application/dto/update-affiliate.dto';
import type { UpdateAffiliateDto } from '../../application/dto/update-affiliate.dto';
import { ListAffiliatesSchema } from '../../application/dto/list-affiliates.dto';
import type { ListAffiliatesDto } from '../../application/dto/list-affiliates.dto';
import {
  AffiliateResponseDto,
  AffiliateRankingResponseDto,
} from '../dto/affiliate-response.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
  };
}

@Controller('affiliates')
@UseGuards(AuthGuard)
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateAffiliateSchema))
    dto: Omit<CreateAffiliateDto, 'userId'>,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const dtoWithUserId: CreateAffiliateDto = {
      ...dto,
      userId,
    };

    const result = await this.affiliateService.create(dtoWithUserId);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return AffiliateResponseDto.fromDomain(result.value);
  }

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListAffiliatesSchema))
    dto: ListAffiliatesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.affiliateService.findAll(userId, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return {
      data: result.value.data.map((affiliate) =>
        AffiliateResponseDto.fromDomain(affiliate),
      ),
      nextCursor: result.value.nextCursor,
      hasMore: result.value.hasMore,
    };
  }

  @Get('ranking')
  async getRanking(
    @Query(new ZodValidationPipe(ListAffiliatesSchema))
    dto: ListAffiliatesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.affiliateService.getRanking(userId, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return {
      data: result.value.data.map((ranking) =>
        AffiliateRankingResponseDto.fromDomain(ranking),
      ),
      nextCursor: result.value.nextCursor,
      hasMore: result.value.hasMore,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.affiliateService.findById(id, userId);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    if (!result.value) {
      throw new HttpException('Affiliate not found', 404);
    }

    return AffiliateResponseDto.fromDomain(result.value);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAffiliateSchema)) dto: UpdateAffiliateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.affiliateService.update(id, userId, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return AffiliateResponseDto.fromDomain(result.value);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.affiliateService.delete(id, userId);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return { message: 'Affiliate deleted successfully' };
  }
}
