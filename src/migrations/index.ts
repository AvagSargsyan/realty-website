import * as migration_20261106_172835_initial from './20261106_172835_initial';
import * as migration_20261107_162125_content_model from './20261107_162125_content_model';
import * as migration_20261111_133018_home_page from './20261111_133018_home_page';
import * as migration_20261111_133757_lead_ip_hash from './20261111_133757_lead_ip_hash';
import * as migration_20261113_183435_pages from './20261113_183435_pages';
import * as migration_20261113_184337_reviews from './20261113_184337_reviews';

export const migrations = [
  {
    up: migration_20261106_172835_initial.up,
    down: migration_20261106_172835_initial.down,
    name: '20261106_172835_initial',
  },
  {
    up: migration_20261107_162125_content_model.up,
    down: migration_20261107_162125_content_model.down,
    name: '20261107_162125_content_model',
  },
  {
    up: migration_20261111_133018_home_page.up,
    down: migration_20261111_133018_home_page.down,
    name: '20261111_133018_home_page',
  },
  {
    up: migration_20261111_133757_lead_ip_hash.up,
    down: migration_20261111_133757_lead_ip_hash.down,
    name: '20261111_133757_lead_ip_hash',
  },
  {
    up: migration_20261113_183435_pages.up,
    down: migration_20261113_183435_pages.down,
    name: '20261113_183435_pages',
  },
  {
    up: migration_20261113_184337_reviews.up,
    down: migration_20261113_184337_reviews.down,
    name: '20261113_184337_reviews'
  },
];
