/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { NAMESPACE } from './locale';
import { ManagementList } from './Management';
export class PluginNotificationCoreClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);
    this.app.pluginSettingsManager.add(NAMESPACE, {
      title: this.t('Notification Management'),
      icon: 'NotificationOutlined',
    });
    this.app.pluginSettingsManager.add(`${NAMESPACE}.notifications`, {
      title: '通知',
      Component: ManagementList,
      icon: 'NotificationOutlined',
      aclSnippet: 'pm.notification.core',
      sort: 1,
    });
    this.app.pluginSettingsManager.add(`${NAMESPACE}.notifrecords`, {
      title: '通知记录',
      Component: ManagementList,
      icon: 'NotificationOutlined',
      aclSnippet: 'pm.notification.core',
      sort: 2,
    });

    this.app.pluginSettingsManager.add(`${NAMESPACE}.channels`, {
      title: '渠道管理',
      Component: ManagementList,
      icon: 'NotificationOutlined',
      aclSnippet: 'pm.notification.core',
      sort: 3,
    });
    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginNotificationCoreClient;
