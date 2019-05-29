// @flow

import electronStore from './electron-store';
import { ZELCASH_NETWORK, MAINNET } from '../app/constants/zelcash-network';

export const isTestnet = () => electronStore.get(ZELCASH_NETWORK) !== MAINNET;
