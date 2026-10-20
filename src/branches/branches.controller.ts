import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BranchesService } from "./branches.service.js";
import { BranchResponseDto, CreateBranchDto } from "./dto/branch.dto.js";
import { PositiveIdPipe } from "../common/positive-id.pipe.js";
import { Roles } from "../auth/access.js";

@ApiTags("Sedes")
@ApiBearerAuth()
@Controller("branches")
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  @ApiOkResponse({ type: [BranchResponseDto] })
  findAll() {
    return this.branches.findAllActive();
  }

  @Get(":id")
  @ApiOkResponse({ type: BranchResponseDto })
  findById(@Param("id", PositiveIdPipe) id: number) {
    return this.branches.findById(id);
  }

  @Roles("ADMINISTRADOR")
  @Post()
  @ApiCreatedResponse({ type: BranchResponseDto })
  create(@Body() dto: CreateBranchDto) {
    return this.branches.create(dto);
  }
}
