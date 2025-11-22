import { defineDashboardExtension } from '@vendure/dashboard';
import { z } from 'zod';
import '../ui/global.css';
import { ViewProducts } from '../ui/modules/products/components/view-products';
import { CreateProductPage } from '../ui/modules/products/components/create-product';
import { ViewProduct } from '../ui/modules/products/components/view-product';
import '../ui/styles.css';
defineDashboardExtension({
    routes: [

        {
            path: '/products-extend',
            loader: () => ({ breadcrumb: 'Test Page' }),
            validateSearch: z.object({
                page: z.coerce.number().int().positive().catch(1),
                limit: z.coerce.number().int().positive().catch(10),
                key: z.string().optional().catch(''),
                status: z.enum(['all', 'enabled', 'disabled']).optional().catch('all'),
            }),
            navMenuItem: {
                id: '',
                title: 'Products Extend',
                sectionId: 'catalog',
            },
            component: route => <ViewProducts route={route} />,
        },
        {
            path: '/products-extend-list/create',
            loader: () => ({ breadcrumb: 'Tạo sản phẩm' }),
            component: route => <CreateProductPage route={route} />,
        },
        {
            path: '/products-extend-list/$id',
            loader: () => ({ breadcrumb: 'Product Detail' }),
            component: route => <ViewProduct route={route} />,
        },
    ],
    // The following extension points are only listed here
    // to give you an idea of all the ways that the Dashboard
    // can be extended. Feel free to delete any that you don't need.
    pageBlocks: [],
    navSections: [],
    actionBarItems: [],
    alerts: [],
    widgets: [],
    customFormComponents: {},
    dataTables: [],
    detailForms: [],
    login: {},
    historyEntries: [],
});
