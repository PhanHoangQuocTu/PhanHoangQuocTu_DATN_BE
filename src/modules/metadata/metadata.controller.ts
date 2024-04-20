import { Controller, Get, Param } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) { }


  @Get('provinces')
  getProvinces() {
    return this.metadataService.getProvinces();
  }


  @Get(':address')
  async findOne(@Param('address') address: string): Promise<any> {
    return await this.metadataService.getAddress(address);
  }

}
