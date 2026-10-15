import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SpecialtiesService } from "./specialties.service.js";
import { SpecialtyResponseDto } from "./dto/specialty.dto.js";
import { PositiveIdPipe } from "../common/positive-id.pipe.js";
import { Public } from "../auth/access.js";

@ApiTags("Especialidades")
@Controller("specialties")
export class SpecialtiesController {
  constructor(private readonly specialties: SpecialtiesService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: [SpecialtyResponseDto] })
  findAll() {
    return this.specialties.findAllActive();
  }

  @ApiBearerAuth()
  @Get(":id")
  @ApiOkResponse({ type: SpecialtyResponseDto })
  findById(@Param("id", PositiveIdPipe) id: number) {
    return this.specialties.findById(id);
  }
}
