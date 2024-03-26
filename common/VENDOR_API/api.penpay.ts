import axiosService from '../services/axios.service';
import { InternalServerError } from '../utils/errors';
import { PENPAY_BASE_URL, PENPAY_API_KEY } from '../../config/env';

class PenPayAPI {
  async verifyRSA(provider_id: string, rsaPIN: string) {
    try {
      return await axiosService({
        url: `${PENPAY_BASE_URL}/v1/pen-pay/rsa?provider=${provider_id}&rsaPin=${rsaPIN}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: PENPAY_API_KEY,
        },
      });
    } catch (ex: any) {
      throw new InternalServerError(ex.response.data.message);
    }
  }
}

export default new PenPayAPI();
