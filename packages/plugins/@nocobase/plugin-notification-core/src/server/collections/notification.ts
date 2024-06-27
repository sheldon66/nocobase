/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'notifications',
  fields: [
    {
      type: 'string',
      name: 'title',
      interface: 'input',
      uiSchemaa: {
        title: '{{t("Title")}}',
        type: 'string',
        'x-component': 'Input',
        required: true,
      },
    },
    { type: 'belongsTo', name: 'channel', target: 'channels', foreignKey: 'channelId' },
  ],
});
