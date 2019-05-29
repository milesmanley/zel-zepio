// @flow

import cp from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import processExists from 'process-exists';
/* eslint-disable import/no-extraneous-dependencies */
import isDev from 'electron-is-dev';
import type { ChildProcess } from 'child_process';
import eres from 'eres';
import uuid from 'uuid/v4';
import findProcess from 'find-process';

/* eslint-disable-next-line import/named */
import { mainWindow } from '../electron';
import waitForDaemonClose from './wait-for-daemon-close';
import getBinariesPath from './get-binaries-path';
import getOsFolder from './get-os-folder';
import getDaemonName from './get-daemon-name';
import fetchParams from './run-fetch-params';
import { locateZelcashConf } from './locate-zelcash-conf';
import { log } from './logger';
import store from '../electron-store';
import { parseZelcashConf, parseCmdArgs, generateArgsFromConf } from './parse-zelcash-conf';
import { isTestnet } from '../is-testnet';
import {
  EMBEDDED_DAEMON,
  ZELCASH_NETWORK,
  TESTNET,
  MAINNET,
} from '../../app/constants/zelcash-network';

const getDaemonOptions = ({
  username, password, useDefaultZelcashConf, optionsFromZelcashConf,
}) => {
  /*
    -showmetrics
        Show metrics on stdout
    -metricsui
        Set to 1 for a persistent metrics screen, 0 for sequential metrics
        output
    -metricsrefreshtime
        Number of seconds between metrics refreshes
  */

  const defaultOptions = [
    '-server=1',
    '-showmetrics',
    '--metricsui=0',
    '-metricsrefreshtime=1',
    `-rpcuser=${username}`,
    `-rpcpassword=${password}`,
    ...(isTestnet() ? ['-testnet', '-addnode=testnet.zel.cash'] : ['-addnode=explorer.zel.cash']),
    // Overwriting the settings with values taken from "zelcash.conf"
    ...optionsFromZelcashConf,
  ];

  if (useDefaultZelcashConf) defaultOptions.push(`-conf=${locateZelcashConf()}`);

  return Array.from(new Set([...defaultOptions, ...optionsFromZelcashConf]));
};

let resolved = false;

const ZELCASHD_PROCESS_NAME = getDaemonName();

let isWindowOpened = false;

const sendToRenderer = (event: string, message: Object, shouldLog: boolean = true) => {
  if (shouldLog) {
    log(message);
  }

  if (isWindowOpened) {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(event, message);
    }
  } else {
    const interval = setInterval(() => {
      if (isWindowOpened) {
        mainWindow.webContents.send(event, message);
        clearInterval(interval);
      }
    }, 1000);
  }
};

// eslint-disable-next-line
const runDaemon: () => Promise<?ChildProcess> = () => new Promise(async (resolve, reject) => {
  mainWindow.webContents.on('dom-ready', () => {
    isWindowOpened = true;
  });

  const processName = path.join(getBinariesPath(), getOsFolder(), ZELCASHD_PROCESS_NAME);
  const isRelaunch = Boolean(process.argv.find(arg => arg === '--relaunch'));

  if (!mainWindow.isDestroyed()) mainWindow.webContents.send('zelcashd-params-download', 'Fetching params...');

  sendToRenderer('zelcash-daemon-status', {
    error: false,
    status:
        'Downloading network params, this may take some time depending on your connection speed',
  });

  const [err] = await eres(fetchParams());

  if (err) {
    sendToRenderer('zelcash-daemon-status', {
      error: true,
      status: `Error while fetching params: ${err.message}`,
    });

    return reject(new Error(err));
  }

  sendToRenderer('zelcash-daemon-status', {
    error: false,
    status: 'Zel-Zepio Starting',
  });

  // In case of --relaunch on argv, we need wait to close the old zelcash daemon
  // a workaround is use a interval to check if there is a old process running
  if (isRelaunch) {
    await waitForDaemonClose(ZELCASHD_PROCESS_NAME);
  }

  const [, isRunning] = await eres(processExists(ZELCASHD_PROCESS_NAME));

  // This will parse and save rpcuser and rpcpassword in the store
  let [, optionsFromZelcashConf] = await eres(parseZelcashConf());

  // if the user has a custom datadir and doesn't have a zelcash.conf in that folder,
  // we need to use the default zelcash.conf
  let useDefaultZelcashConf = false;

  if (optionsFromZelcashConf.datadir) {
    const hasDatadirConf = fs.existsSync(path.join(optionsFromZelcashConf.datadir, 'zelcash.conf'));

    if (hasDatadirConf) {
      optionsFromZelcashConf = await parseZelcashConf(
        path.join(String(optionsFromZelcashConf.datadir), 'zelcash.conf'),
      );
    } else {
      useDefaultZelcashConf = true;
    }
  }

  if (optionsFromZelcashConf.rpcuser) store.set('rpcuser', optionsFromZelcashConf.rpcuser);
  if (optionsFromZelcashConf.rpcpassword) store.set('rpcpassword', optionsFromZelcashConf.rpcpassword);

  if (isRunning) {
    log('Already is running!');

    store.set(EMBEDDED_DAEMON, false);
    // We need grab the rpcuser and rpcpassword from either process args or zelcash.conf

    // Command line args override zelcash.conf
    const [{ cmd }] = await findProcess('name', ZELCASHD_PROCESS_NAME);
    const { user, password, isTestnet: isTestnetFromCmd } = parseCmdArgs(cmd);

    store.set(
      ZELCASH_NETWORK,
      isTestnetFromCmd || optionsFromZelcashConf.testnet === '1' ? TESTNET : MAINNET,
    );

    if (user) store.set('rpcuser', user);
    if (password) store.set('rpcpassword', password);

    return resolve();
  }

  store.set(EMBEDDED_DAEMON, true);

  if (!isRelaunch) {
    store.set(ZELCASH_NETWORK, optionsFromZelcashConf.testnet === '1' ? TESTNET : MAINNET);
  }

  if (!optionsFromZelcashConf.rpcuser) store.set('rpcuser', uuid());
  if (!optionsFromZelcashConf.rpcpassword) store.set('rpcpassword', uuid());

  const rpcCredentials = {
    username: store.get('rpcuser'),
    password: store.get('rpcpassword'),
  };

  if (isDev) log('Rpc Credentials', rpcCredentials);

  const childProcess = cp.spawn(
    processName,
    getDaemonOptions({
      ...rpcCredentials,
      useDefaultZelcashConf,
      optionsFromZelcashConf: generateArgsFromConf(optionsFromZelcashConf),
    }),
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  childProcess.stdout.on('data', (data) => {
    sendToRenderer('zelcashd-log', data.toString(), false);
    if (!resolved) {
      resolve(childProcess);
      resolved = true;
    }
  });

  childProcess.stderr.on('data', (data) => {
    log(data.toString());
    reject(new Error(data.toString()));
  });

  childProcess.on('error', reject);

  if (os.platform() === 'win32') {
    resolved = true;
    resolve(childProcess);
  }
});

// eslint-disable-next-line
export default runDaemon;
