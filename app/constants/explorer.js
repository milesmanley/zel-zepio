// @flow

import { isTestnet } from '../../config/is-testnet';

export const ZEL_EXPLORER_BASE_URL = isTestnet()
  ? 'https://testnet.zel.cash/tx/'
  : 'https://explorer.zel.cash/tx/';
