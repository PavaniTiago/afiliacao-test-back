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
import { MemberService } from '../../application/member.service';
import { CreateMemberSchema } from '../../application/dto/create-member.dto';
import type { CreateMemberDto } from '../../application/dto/create-member.dto';
import { UpdateMemberSchema } from '../../application/dto/update-member.dto';
import type { UpdateMemberDto } from '../../application/dto/update-member.dto';
import { ListMembersSchema } from '../../application/dto/list-members.dto';
import type { ListMembersDto } from '../../application/dto/list-members.dto';
import { MemberResponseDto } from '../dto/member-response.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
  };
}

@Controller('members')
@UseGuards(AuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateMemberSchema)) dto: CreateMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.memberService.create({ ...dto, userId });

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return MemberResponseDto.fromDomain(result.value);
  }

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListMembersSchema)) dto: ListMembersDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.memberService.findAll(userId, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return {
      data: result.value.data.map((member) =>
        MemberResponseDto.fromDomain(member),
      ),
      nextCursor: result.value.nextCursor,
      hasMore: result.value.hasMore,
    };
  }

  @Get('by-affiliate/:affiliateId')
  async listByAffiliate(
    @Param('affiliateId') affiliateId: string,
    @Query(new ZodValidationPipe(ListMembersSchema)) dto: ListMembersDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.memberService.listByAffiliate(
      affiliateId,
      userId,
      dto,
    );

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return {
      data: result.value.data.map((member) =>
        MemberResponseDto.fromDomain(member),
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

    const result = await this.memberService.findById(id, userId);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    if (!result.value) {
      throw new HttpException('Member not found', 404);
    }

    return MemberResponseDto.fromDomain(result.value);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateMemberSchema)) dto: UpdateMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.memberService.update(id, userId, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return MemberResponseDto.fromDomain(result.value);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User ID not found in session', 401);
    }

    const result = await this.memberService.delete(id, userId);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return { message: 'Member deleted successfully' };
  }
}
