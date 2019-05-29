// @flow

import path from 'path';
import os from 'os';

import { app } from '../electron'; // eslint-disable-line

export const locateZelcashConf = () => {
  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Zelcash', 'zelcash.conf');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.zelcash', 'zelcash.conf');
  }

  return path.join(app.getPath('appData'), 'Zelcash', 'zelcash.conf');
};
