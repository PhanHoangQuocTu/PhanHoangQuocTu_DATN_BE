import { BadRequestException, Injectable } from '@nestjs/common';
import { PROVINCES_DATA } from './lib/const';
import axios from 'axios'
@Injectable()
export class MetadataService {
  getProvinces() {
    return {
      message: 'Get provinces successfully',
      data: PROVINCES_DATA
    };
  }

  async getAddress(address: string): Promise<any> {
    const response = await axios.get(
      `https://rsapi.goong.io/Place/AutoComplete?api_key=GS65AY8rHZnAKAMvfwP8tZvMNaszJrCS1bZM6NYg&input=${address}`,
    )
    if (response && response?.status === 200) {
      return response?.data
    }

    throw new BadRequestException('Get address failed')
  }
}