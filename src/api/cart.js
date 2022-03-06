import xss from 'xss';
import {
  conditionalUpdate,
  deleteQuery,
  query,
  singleQuery,
} from '../lib/db.js';
import { logger } from '../lib/logger.js';

export async function insertCart() {
  const q = 'INSERT INTO carts DEFAULT VALUES RETURNING id, created;';

  try {
    const result = await query(q);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting cart', e);
  }

  return null;
}

export async function createCart(req, res) {
  const insertCartResult = await insertCart();

  if (insertCartResult) {
    return res.status(201).json(insertCartResult);
  }

  return res.status(500).end();
}

export async function listCartLines(cartId) {
  const lines = await query(
    `
      SELECT
        carts_lines.id as id,
        products.id as product_id, products.title as title,
        products.description as description, products.image as image,
        products.category as category,
        carts_lines.quantity as quantity, products.price as price,
        carts_lines.quantity * products.price as total
      FROM
        carts_lines
      JOIN
        products AS products ON products.id = carts_lines.product_id
      WHERE
        carts_lines.cart_id = $1
    `,
    [cartId]
  );

  if (!lines) {
    return null;
  }

  return lines.rows;
}

export async function getCart(id) {
  const cart = await singleQuery(
    `
      SELECT
        id, created
      FROM
        carts
      WHERE
        id = $1
    `,
    [id]
  );

  if (!cart) {
    return null;
  }

  const lines = await listCartLines(id);

  cart.lines = lines || [];

  return cart;
}

export async function listCart(_, req) {
  const { id } = req.params;

  return getCart(id);
}

export async function listCartLine(_, req) {
  const { id, lineid } = req.params;

  const cartLine = await singleQuery(
    `
    SELECT
      carts_lines.id as id,
      products.id as product_id, products.title as title,
      products.description as description, products.image as image,
      products.category as category,
      carts_lines.quantity as quantity, products.price as price,
      carts_lines.quantity * products.price as total
    FROM
      carts_lines
    JOIN
      products AS products ON products.id = carts_lines.product_id
    WHERE
      carts_lines.cart_id = $1 AND carts_lines.id = $2
    `,
    [id, lineid]
  );

  if (!cartLine) {
    return null;
  }

  return cartLine;
}

export async function updateCartLine(req, res) {
  const { lineid } = req.params;
  const { body } = req;

  const fields = ['quantity'];

  const values = [xss(body.quantity)];

  const result = await conditionalUpdate('carts_lines', lineid, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteCartLine(req, res) {
  const { lineid } = req.params;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM carts_lines WHERE id = $1;',
      [lineid]
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    logger.error(`unable to delete cart line "${lineid}"`, e);
  }

  return res.status(500).json(null);
}

export async function deleteCart(req, res) {
  const { id } = req.params;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM carts WHERE id = $1;',
      [id]
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    logger.error(`unable to delete cart "${id}"`, e);
  }

  return res.status(500).json(null);
}

export async function insertCartLine({ id, product, quantity }) {
  const q = `
    INSERT INTO
      carts_lines
      (cart_id, product_id, quantity)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, product_id, cart_id, quantity;
  ;`;
  const values = [xss(id), xss(product), xss(quantity)];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('error inserting cart line', e);
  }

  return null;
}

export async function addToCart(req, res) {
  const { id } = req.params;
  const { product, quantity } = req.body;

  const insertCategoryResult = await insertCartLine({
    id,
    product,
    quantity,
  });

  if (insertCategoryResult) {
    return res.status(201).json(insertCategoryResult);
  }

  return res.status(500).end();
}
