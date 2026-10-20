import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/access.js";
import { PositiveIdPipe } from "../common/positive-id.pipe.js";
import { ConsultingRoomsService } from "./consulting-rooms.service.js";
import { CreateConsultingRoomDto } from "./dto/create-consulting-room.dto.js";
import { ConsultingRoomResponseDto } from "./dto/consulting-room-response.dto.js";

@ApiTags("Consultorios")
@ApiBearerAuth()
@Controller("consulting-rooms")
export class ConsultingRoomsController {
  constructor(private readonly consultingRooms: ConsultingRoomsService) {}

  @Post()
  @Roles("ADMINISTRADOR")
  @ApiCreatedResponse({ type: ConsultingRoomResponseDto })
  create(@Body() dto: CreateConsultingRoomDto) {
    return this.consultingRooms.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [ConsultingRoomResponseDto] })
  findAll() {
    return this.consultingRooms.findAllActive();
  }

  @Get(":id")
  @ApiOkResponse({ type: ConsultingRoomResponseDto })
  findById(@Param("id", PositiveIdPipe) id: number) {
    return this.consultingRooms.findById(id);
  }
}
