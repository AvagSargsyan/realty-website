import * as migration_20261106_172835_initial from './20261106_172835_initial';
import * as migration_20261107_162125_content_model from './20261107_162125_content_model';

export const migrations = [
  {
    up: migration_20261106_172835_initial.up,
    down: migration_20261106_172835_initial.down,
    name: '20261106_172835_initial',
  },
  {
    up: migration_20261107_162125_content_model.up,
    down: migration_20261107_162125_content_model.down,
    name: '20261107_162125_content_model'
  },
];
