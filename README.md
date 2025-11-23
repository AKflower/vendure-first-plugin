# Product Extend Plugin - Vendure Dashboard Extension

Plugin mở rộng cho Vendure Admin Dashboard, giúp quản lý sản phẩm một cách trực quan và dễ dàng hơn với các tính năng nâng cao.

## 📋 Mục lục

- [Cài đặt & Chạy dự án](#-c%C3%A0i-%C4%91%E1%BA%B7t--ch%E1%BA%A1y-d%E1%BB%B1-%C3%A1n)
- [Kiến trúc dự án](#%EF%B8%8F-ki%E1%BA%BFn-tr%C3%BAc-d%E1%BB%B1-%C3%A1n)
- [Quyết định UI/UX](#-quy%E1%BA%BFt-%C4%91%E1%BB%8Bnh-uiux)
- [Tính năng đã hoàn thành](#-t%C3%ADnh-n%C4%83ng-%C4%91%C3%A3-ho%C3%A0n-th%C3%A0nh)
- [Định hướng mở rộng](#-%C4%91%E1%BB%8Bnh-h%C6%B0%E1%BB%9Bng-m%E1%BB%9F-r%E1%BB%99ng)


## 🚀 Cài đặt & Chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL (hoặc database khác mà Vendure hỗ trợ)
- npm hoặc yarn

### Cài đặt

1. **Clone repository và cài đặt dependencies:**

```bash
npm install
```

2. **Cấu hình database:**

Sử dụng lệnh
```bash
docker-compose up
```
để khởi tạo database

3. **Build Tailwind CSS:**

```bash
npm run build:tailwind
```

Hoặc chạy watch mode để tự động build khi có thay đổi:

```bash
npm run dev:tailwind
```

### Chạy dự án

**Chế độ development (chạy tất cả services):**

```bash
npm run dev
```

Lệnh này sẽ chạy đồng thời:
- **Server**: Vendure API server (port 3000)
- **Worker**: Background job worker
- **Tailwind**: Watch mode cho CSS

**Chạy từng service riêng lẻ:**

```bash
# Chỉ chạy server
npm run dev:server

# Chỉ chạy worker
npm run dev:worker

# Chỉ build Tailwind
npm run build:tailwind
```

**Chế độ production:**

```bash
# Build toàn bộ dự án
npm run build

# Chạy production
npm start
```

### Truy cập Dashboard

Sau khi chạy thành công, truy cập:
- **Admin Dashboard**: http://localhost:3000/dashboard
- **GraphQL Playground**: http://localhost:3000/admin-api

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục

```
src/plugins/product-extend/
├── ui/                          # Frontend code
│   ├── feature/                 # Feature modules
│   │   ├── product/             # Product management
│   │   │   ├── components/      # React components
│   │   │   │   ├── pages/        # Page components
│   │   │   │   ├── forms/        # Form components
│   │   │   │   ├── tables/       # Table components
│   │   │   │   └── dialogs/      # Dialog components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── graphql/          # GraphQL queries & mutations
│   │   │   └── utils/            # Feature-specific utilities
│   │   └── variant/             # Variant management
│   ├── utils/                   # Shared utilities
│   │   ├── date.ts              # Date formatting
│   │   ├── translation.ts       # Translation helpers
│   │   ├── format.ts            # Price/currency formatting
│   │   ├── array.ts             # Array utilities
│   │   ├── data-transform.ts    # Data transformation
│   │   └── drag-drop.ts         # Drag & drop utilities
│   └── components/              # Shared components
├── dashboard/                   # Dashboard entry point
└── product-extend.plugin.ts     # Plugin definition
```

### Kiến trúc Component

Dự án tuân theo nguyên tắc **Feature-based architecture** với separation of concerns rõ ràng:

#### 1. **Pages** (Trang chính)
- `ProductListPage`: Danh sách sản phẩm với bảng, filter, search
- `ProductDetailPage`: Chi tiết sản phẩm với form chỉnh sửa
- `ProductCreatePage`: Tạo sản phẩm mới

#### 2. **Forms** (Form components)
- `ProductForm`: Form chính để edit product (name, slug, description, enabled)
- `ProductAssetsCard`: Quản lý assets với drag & drop
- `ProductOptionsCard`: Hiển thị product options
- `FacetValuesCard`: Quản lý facet values

#### 3. **Tables** (Bảng dữ liệu)
- `ProductTable`: Bảng hiển thị danh sách sản phẩm
- `ProductTableColumns`: Định nghĩa các cột của bảng
- `ProductRowActions`: Menu actions cho từng row

#### 4. **Dialogs** (Hộp thoại)
- `BaseAlertDialog`: Dialog xác nhận tái sử dụng
- `AssignFacetValuesDialog`: Gán facet values cho products/variants
- `ProductAssetDialog`: Chọn assets cho product

### State Management

#### React Query (Data Fetching)
- **useProductQuery**: Fetch danh sách products với filters, pagination, sorting
- Tự động cache và refetch khi cần
- Optimistic updates cho các thao tác nhanh (như toggle enabled)

#### Custom Hooks (Business Logic)
- **useProductFilters**: Quản lý filters, pagination, sorting từ URL params
- **useProductMutations**: Xử lý các mutations (create, update, delete, duplicate)
- **useProductActions**: Kết hợp mutations và dialogs cho UI
- **useDialog**: Hook tái sử dụng để quản lý dialog state
- **useURLParams**: Quản lý URL search params

#### Local State (UI State)
- Form state: `react-hook-form` cho form validation và state
- Dialog state: `useDialog` hook
- Loading states: Từ React Query mutations
- Drag & drop state: Local state trong component

### Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook (Business Logic)
    ↓
GraphQL Mutation/Query
    ↓
Vendure API
    ↓
React Query Cache Update
    ↓
UI Re-render
```

## 🎨 Quyết định UI/UX

### 1. **Sử dụng Vendure Native Components**

Thay vì tự build từ đầu, dự án tận dụng tối đa các components có sẵn của Vendure:
- `DataTable`: Bảng dữ liệu với sorting, filtering, pagination
- `Page`, `PageTitle`, `PageBlock`: Layout components
- `AssetPickerDialog`: Dialog chọn assets
- `RichTextInput`, `SlugInput`: Form inputs chuyên dụng
- `Switch`, `Button`, `Card`: UI components

**Lý do**: Đảm bảo consistency với Vendure Admin, giảm maintenance cost, tận dụng các tính năng đã được test kỹ. Đồng thời học và hiểu hơn về Vendure. Tuy nhiên, việc phát triển theo UI của vendure vẫn còn gò bó nhất là với bảng (Table)

### 2. **Skeleton Loading States**

Thay vì spinner đơn giản, sử dụng skeleton loading phù hợp với layout thực tế:
- Skeleton cho form fields
- Skeleton cho table rows
- Skeleton cho cards

**Lý do**: Giúp user hiểu được cấu trúc trang sắp load, giảm cảm giác "giật" khi data load xong.

### 3. **URL-based Filtering**

Tất cả filters, pagination, sorting được lưu trong URL:
- Share được link với filters đã áp dụng
- Browser back/forward hoạt động đúng
- Refresh page không mất filters

**Lý do**: Better UX, SEO-friendly, dễ debug.

### 4. **Debounced Search**

Search input có debounce 500ms để tránh gọi API quá nhiều:
- User gõ → debounce → gọi API
- Giảm số lượng API calls
- Vẫn responsive với user input

### 5. **Optimistic Updates**

Một số thao tác có optimistic update (như toggle enabled):
- UI update ngay lập tức
- Nếu API fail → rollback
- Nếu API success → confirm

**Lý do**: Cảm giác mượt, responsive hơn cho user.

### 6. **Drag & Drop cho Assets**

Assets có thể kéo thả để reorder:
- Asset đầu tiên tự động là featured asset
- Visual feedback khi drag
- Smooth animation

**Lý do**: Không cần click nhiều lần để reorder và xác định ảnh nổi bật (featured asset).

### 7. **Bulk Actions**

Hỗ trợ thao tác hàng loạt:
- Delete multiple products
- Duplicate multiple products
- Edit facet values cho nhiều products

**Lý do**: Tiết kiệm thời gian khi cần xử lý nhiều items.

### 8. **Confirmation Dialogs**

Các thao tác nguy hiểm (delete) có confirmation dialog:
- `BaseAlertDialog` tái sử dụng
- Clear messaging về hậu quả
- Destructive variant cho delete actions

**Lý do**: Tránh xóa nhầm, user có cơ hội suy nghĩ lại.

## ✅ Tính năng đã hoàn thành

### Product Management
- ✅ Danh sách sản phẩm với pagination
- ✅ Search theo tên/slug
- ✅ Filter theo status (enabled/disabled)
- ✅ Filter theo category (faceted filter)
- ✅ Sort theo các cột (name, slug, createdAt, enabled)
- ✅ Toggle enabled/disabled nhanh trong bảng
- ✅ Chỉnh sửa assets nhanh ngay trong bảng
- ✅ Xem chi tiết sản phẩm
- ✅ Tạo sản phẩm mới
- ✅ Chỉnh sửa sản phẩm (name, slug, description, enabled)
- ✅ Xóa sản phẩm (với confirmation)
- ✅ Duplicate sản phẩm
- ✅ Bulk actions (delete, duplicate, edit facet values)

### Asset Management
- ✅ Xem danh sách assets
- ✅ Thêm assets mới
- ✅ Xóa assets
- ✅ Drag & drop để reorder assets
- ✅ Asset đầu tiên tự động là featured asset
- ✅ Edit asset cho từng product (row action)

### Facet Values
- ✅ Xem facet values của product
- ✅ Gán facet values cho product (dialog)
- ✅ Gán facet values cho nhiều products (bulk action)
- ✅ Gán facet values cho variants

### Variant Management
- ✅ Xem danh sách variants của product
- ✅ Bảng variants với pagination, filter, sort
- ✅ Xem chi tiết variant (navigate đến Vendure default page)
- ✅ Xóa variant (row action & bulk action)
- ✅ Gán facet values cho variants

### UI/UX Enhancements
- ✅ Skeleton loading states
- ✅ Error states với retry
- ✅ Toast notifications cho success/error
- ✅ Tooltip hiển thị thông tin product (ID, createdAt, updatedAt)
- ✅ Responsive layout (2-column cho detail page)
- ✅ Loading states cho mutations
- ✅ Disabled states khi đang xử lý

## 🚧 Định hướng mở rộng

### Tính năng chưa làm

1. **Product Options Management**
   - Hiện tại chỉ hiển thị, chưa có UI để edit options
   - Cần thêm form để tạo/sửa/xóa product options

2. **Remove Facet Values**
   - Hiện tại chỉ có "Add", chưa có "Remove" từ UI
   - Cần thêm chức năng remove facet value từ product

3. **Advanced Filters**
   - Filter theo price range
   - Filter theo collections
   - Filter theo date range (createdAt, updatedAt)
   - Filter theo stock status

4. **Export/Import**
   - Export products ra CSV/Excel
   - Import products từ file
   - Bulk update từ file


7. **Product Relationships**
   - Related products
   - Upsell/Cross-sell products
   - Product bundles

8. **Advanced Search**
   - Full-text search
   - Search trong description
   - Search với operators (AND, OR, NOT)



10. **Product Variants Management**
    - Tạo variant mới từ UI
    - Edit variant từ UI (hiện tại navigate đến Vendure default)
    - Bulk edit variants

### Cải thiện kỹ thuật

1. **Testing**
   - Unit tests cho utils
   - Integration tests cho hooks
   - E2E tests cho user flows

2. **Performance**
   - Virtual scrolling cho bảng lớn
   - Lazy load images
   - Code splitting tốt hơn

3. **Structure**
   - Tạo base table của riêng mình để tăng khả năng tùy biến

4. **Accessibility**
   - ARIA labels đầy đủ
   - Keyboard navigation
   - Screen reader support

5. **Internationalization**
   - Multi-language support
   - Date/time formatting theo locale
   - Currency formatting theo locale

6. **Error Handling**
   - Error boundaries
   - Retry mechanisms
   - Better error messages



## 📝 Ghi chú

### Cấu trúc Utils

Dự án có hệ thống utils được tổ chức rõ ràng:
- **date.ts**: Format dates theo nhiều format khác nhau
- **translation.ts**: Helpers để lấy translations từ products
- **format.ts**: Format price, currency, numbers
- **array.ts**: Utilities cho arrays (slice, reorder, format)
- **data-transform.ts**: Transform data cho GraphQL mutations
- **drag-drop.ts**: Utilities cho drag & drop functionality

Tất cả utils đều có TypeScript types đầy đủ và có thể tái sử dụng.

### GraphQL Queries & Mutations

Tất cả GraphQL operations được định nghĩa trong:
- `feature/product/graphql/graphql.ts`
- `feature/variant/graphql/graphql.ts`


### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Vendure Components**: Sử dụng components từ `@vendure/dashboard`
- **Custom Styles**: Trong `ui/global.css` và `ui/styles.css`

### Development Tips

1. **Hot Reload**: Dashboard tự động reload khi có thay đổi trong `ui/` folder
2. **GraphQL Playground**: Sử dụng để test queries/mutations

# 
