import { authApi } from '../api/auth';

export const session = {
  async bootstrap() {
    await authApi.refresh();
    return authApi.fetchMe();
  }
};
