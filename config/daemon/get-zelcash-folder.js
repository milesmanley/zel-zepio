// @flow
import os from 'os';
import path from 'path';
import electron from 'electron'; // eslint-disable-line

export const getZelcashFolder = () => {
  const { app } = electron;

  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Zelcash');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.zelcash');
  }

  return path.join(app.getPath('appData'), 'Zelcash');
};
