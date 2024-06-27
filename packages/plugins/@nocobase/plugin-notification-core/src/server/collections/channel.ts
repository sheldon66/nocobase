/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';
import { COLLECTION_NAME } from '../../constant';
export default defineCollection({
  name: COLLECTION_NAME.channels,
  fields: [
    { type: 'string', name: 'title' },
    { type: 'json', name: 'config' },
  ],
});
