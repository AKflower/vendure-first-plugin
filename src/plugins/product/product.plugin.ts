import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PRODUCT_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { Product } from '@vendure/core';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PRODUCT_PLUGIN_OPTIONS, useFactory: () => ProductPlugin.options }],
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
export class ProductPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ProductPlugin> {
        this.options = options;
        return ProductPlugin;
    }
}
