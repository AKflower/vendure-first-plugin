import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PRODUCT_EXTEND_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PRODUCT_EXTEND_PLUGIN_OPTIONS, useFactory: () => ProductExtendPlugin.options }],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    dashboard: './dashboard/index.tsx',
})
export class ProductExtendPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ProductExtendPlugin> {
        this.options = options;
        return ProductExtendPlugin;
    }
}
