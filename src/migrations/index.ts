import * as migration_20261106_172835_initial from './20261106_172835_initial';

export const migrations = [
  {
    up: migration_20261106_172835_initial.up,
    down: migration_20261106_172835_initial.down,
    name: '20261106_172835_initial'
  },
];
