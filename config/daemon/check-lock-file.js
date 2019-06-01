// @flow
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import eres from 'eres';

import { getZelcashFolder } from './get-zelcash-folder';

const ZELCASH_LOCK_FILE = '.lock';

export const checkLockFile = async (zelcashPath?: string) => {
  try {
    const myPath = zelcashPath || getZelcashFolder();
    const [cannotAccess] = await eres(promisify(fs.access)(path.join(myPath, ZELCASH_LOCK_FILE)));
    return !cannotAccess;
  } catch (err) {
    return false;
  }
};
