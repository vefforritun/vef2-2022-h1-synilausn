-- Allir foreign key constraints eru skilgreindir með „ON DELETE CASCADE“ þ.a. þeim færslum sem
-- vísað er í verður *eytt* þegar gögnum sem vísa í þær er eytt

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) UNIQUE NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) UNIQUE NOT NULL,
  price INTEGER CHECK (price > 0),
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  category INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  CONSTRAINT fk_products_categories FOREIGN KEY (category) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

CREATE TABLE carts_lines (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,
  cart_id UUID,
  quantity INTEGER CHECK (quantity > 0) NOT NULL,
  CONSTRAINT fk_cartline_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_cartline_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

CREATE TABLE orders_lines (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,
  order_id UUID,
  quantity INTEGER CHECK (quantity > 0) NOT NULL,
  CONSTRAINT fk_orders_lines_products FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_lines_orders FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TYPE states AS ENUM ('NEW', 'PREPARE', 'COOKING', 'READY', 'FINISHED');

CREATE TABLE orders_states (
  order_id UUID,
  state states NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  CONSTRAINT fk_order_states_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

-- Stored procedure sem færir cart yfir í order
CREATE OR REPLACE PROCEDURE create_order(id UUID, name VARCHAR(255)) AS $$
BEGIN
  INSERT INTO orders (id, name) VALUES ($1, $2);
  INSERT INTO orders_lines (product_id, order_id, quantity)
    SELECT product_id, cart_id, quantity FROM carts_lines WHERE cart_id = $1;
  INSERT INTO orders_states (order_id, state) VALUES ($1, 'NEW');
  DELETE FROM carts_lines WHERE cart_id = $1;
  DELETE FROM carts WHERE carts.id = $1;
END;
$$ LANGUAGE plpgsql;
