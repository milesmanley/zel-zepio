// @flow

import { isTestnet } from '../../config/is-testnet';
import { TESTNET, MAINNET } from '../constants/zelcash-network';

export const getLatestAddressKey = (type: string) => `LATEST_${type === 'shielded' ? 'SHIELDED' : 'TRANSPARENT'}_ADDRESS_${
  isTestnet() ? TESTNET : MAINNET
}`;
