// @flow
import fs from 'fs';
import path from 'path';
import { getZelcashFolder } from './get-zelcash-folder';

const ZELCASH_PID_FILE = 'zelcashd.pid';

export const getDaemonProcessId = (zelcashPath?: string) => {
  try {
    const myPath = zelcashPath || getZelcashFolder();
    const buffer = fs.readFileSync(path.join(myPath, ZELCASH_PID_FILE));
    const pid = Number(buffer.toString().trim());
    return pid;
  } catch (err) {
    return null;
  }
};
