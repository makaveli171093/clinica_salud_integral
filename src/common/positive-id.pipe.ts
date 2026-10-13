import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
@Injectable()
export class PositiveIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) throw new BadRequestException('ID inválido');
    return Number(value);
  }
}
