CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE role AS ENUM ('INVENTORY_MANAGER', 'WAREHOUSE_STAFF');
CREATE TYPE document_status AS ENUM ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED');
CREATE TYPE move_type AS ENUM ('RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT', 'INITIAL');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (warehouse_id, name)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  unit_of_measure TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  UNIQUE (product_id, location_id)
);

CREATE TABLE reorder_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE RESTRICT,
  min_qty NUMERIC(18, 3) NOT NULL CHECK (min_qty >= 0),
  reorder_to_qty NUMERIC(18, 3) NOT NULL CHECK (reorder_to_qty >= min_qty),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  destination_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE TABLE receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 3) NOT NULL CHECK (quantity > 0),
  UNIQUE (receipt_id, product_id)
);

CREATE TABLE delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  source_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE TABLE delivery_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 3) NOT NULL CHECK (quantity > 0),
  UNIQUE (delivery_order_id, product_id)
);

CREATE TABLE internal_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no TEXT NOT NULL UNIQUE,
  source_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  destination_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  CHECK (source_location_id <> destination_location_id)
);

CREATE TABLE internal_transfer_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES internal_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 3) NOT NULL CHECK (quantity > 0),
  UNIQUE (transfer_id, product_id)
);

CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no TEXT NOT NULL UNIQUE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE TABLE stock_adjustment_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  recorded_quantity NUMERIC(18, 3),
  counted_quantity NUMERIC(18, 3) NOT NULL CHECK (counted_quantity >= 0),
  UNIQUE (adjustment_id, product_id)
);

CREATE TABLE stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  from_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT,
  to_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 3) NOT NULL CHECK (quantity > 0),
  move_type move_type NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_location_id IS NOT NULL OR to_location_id IS NOT NULL)
);

CREATE INDEX locations_warehouse_id_idx ON locations(warehouse_id);
CREATE INDEX product_stock_product_id_idx ON product_stock(product_id);
CREATE INDEX product_stock_location_id_idx ON product_stock(location_id);
CREATE INDEX receipts_status_idx ON receipts(status);
CREATE INDEX delivery_orders_status_idx ON delivery_orders(status);
CREATE INDEX internal_transfers_status_idx ON internal_transfers(status);
CREATE INDEX stock_adjustments_status_idx ON stock_adjustments(status);
CREATE INDEX stock_moves_product_id_created_at_idx ON stock_moves(product_id, created_at DESC);
CREATE INDEX stock_moves_created_at_idx ON stock_moves(created_at DESC);
