import { Module } from "@nestjs/common";
import { ConsultingRoomsController } from "./consulting-rooms.controller.js";
import { ConsultingRoomsService } from "./consulting-rooms.service.js";

@Module({
  controllers: [ConsultingRoomsController],
  providers: [ConsultingRoomsService],
  exports: [ConsultingRoomsService],
})
export class ConsultingRoomsModule {}
