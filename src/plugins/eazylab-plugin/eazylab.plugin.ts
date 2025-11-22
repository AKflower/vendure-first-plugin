import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { EAZYLAB_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: EAZYLAB_PLUGIN_OPTIONS, useFactory: () => EazyLabPlugin.options }],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    adminApiExtensions: {
    },
    dashboard: './dashboard/index.tsx',

})
export class EazyLabPlugin {
      static options: PluginInitOptions;

      static init(options: PluginInitOptions): Type<EazyLabPlugin> {
        this.options = options;
        return EazyLabPlugin;
    }

}
