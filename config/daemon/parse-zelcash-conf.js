// @flow

import fs from 'fs';

import { locateZelcashConf } from './locate-zelcash-conf';
import { filterObjectNullKeys } from '../../app/utils/filter-object-null-keys';

type ZelcashConfFile = {
  testnet: ?string,
  regtest: ?string,
  proxy: ?string,
  bind: ?string,
  whitebind: ?string,
  addnode: ?string,
  connect: ?string,
  listen: ?string,
  maxconnections: ?string,
  server: ?string,
  rpcbind: ?string,
  rpcuser: ?string,
  rpcpassword: ?string,
  rpcclienttimeout: ?string,
  rpcallowip: ?string,
  rpcport: ?string,
  rpcconnect: ?string,
  sendfreetransactions: ?string,
  txconfirmtarget: ?string,
  gen: ?string,
  genproclimit: ?string,
  keypool: ?string,
  paytxfee: ?string,
  datadir?: string,
  conf?: string,
};

// eslint-disable-next-line
export const parseZelcashConf = (customDir: ?string): Promise<ZelcashConfFile> => new Promise((resolve, reject) => {
  fs.readFile(customDir || locateZelcashConf(), (err, file) => {
    if (err) return reject(err);

    const fileString = file.toString();

    /* eslint-disable no-unused-vars */
    // $FlowFixMe
    const payload: ZelcashConfFile = filterObjectNullKeys(
      fileString.split('\n').reduce((acc, cur) => {
        if (!cur) return acc;

        const line = cur.trim();

        if (line.startsWith('#')) return acc;

        const [key, value] = cur.split('=');
        return { ...acc, [key.trim().toLowerCase()]: value.trim() };
      }, {}),
    );

    resolve(payload);
  });
});

/* eslint-disable-next-line max-len */
export const generateArgsFromConf = (obj: ZelcashConfFile): Array<string> => Object.keys(obj).reduce((acc, key) => {
  // We can omit the credentials for the command line
  if (key === 'rpcuser' || key === 'rpcpassword') return acc;

  return acc.concat(`-${key}=${String(obj[key])}`);
}, []);

export const parseCmdArgs = (
  cmd: string,
): { user: string, password: string, isTestnet: boolean } => {
  const splitArgs = cmd.split(' ');

  const rpcUserInArgs = splitArgs.find(x => x.startsWith('-rpcuser'));
  const rpcPasswordInArgs = splitArgs.find(x => x.startsWith('-rpcpassword'));
  const testnetInArgs = splitArgs.find(x => x.startsWith('-testnet'));

  const rpcUser = rpcUserInArgs ? rpcUserInArgs.replace('-rpcuser=', '') : '';
  const rpcPassword = rpcPasswordInArgs ? rpcPasswordInArgs.replace('-rpcpassword=', '') : '';

  return { user: rpcUser, password: rpcPassword, isTestnet: Boolean(testnetInArgs) };
};
