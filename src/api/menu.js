import xss from 'xss';
import { addPageMetadata } from '../lib/addPageMetadata.js';
import { uploadImage } from '../lib/cloudinary.js';
import {
  conditionalUpdate,
  deleteQuery,
  pagedQuery,
  query,
  singleQuery,
} from '../lib/db.js';
import { isString } from '../lib/isString.js';
import { logger } from '../lib/logger.js';

export async function listMenu(req, res) {
  const { offset = 0, limit = 10, category, search } = req.query;

  const shared = `
    SELECT
      id, title, price, description, image, category, created, updated
    FROM
      products`;

  let products;

  // TODO compress ifs?
  if (category && search) {
    products = await pagedQuery(
      `${shared}
        WHERE
          category = $1
          AND
          (
            to_tsvector('english', title) @@ plainto_tsquery('english', $2)
            OR
            to_tsvector('english', description) @@ plainto_tsquery('english', $2)
          )
        ORDER BY updated ASC`,
      [category, search],
      { offset, limit }
    );
  } else if (category) {
    products = await pagedQuery(
      `${shared}
        WHERE
          category = $1
        ORDER BY updated ASC`,
      [category],
      { offset, limit }
    );
  } else if (search) {
    products = await pagedQuery(
      `${shared}
        WHERE
          to_tsvector('english', title) @@ plainto_tsquery('english', $1)
          OR
          to_tsvector('english', description) @@ plainto_tsquery('english', $1)
        ORDER BY updated ASC`,
      [search],
      { offset, limit }
    );
  } else {
    products = await pagedQuery(
      `${shared}
          products
        ORDER BY updated ASC`,
      [],
      { offset, limit }
    );
  }

  const productsWithPage = addPageMetadata(products, req.path, {
    offset,
    limit,
    length: products.items.length,
  });

  return res.json(productsWithPage);
}

export async function listProduct(_, req) {
  const { id } = req.params;

  const product = await singleQuery(
    `
      SELECT
        id, title, price, description, image, category, created, updated
      FROM
        products
      WHERE
        id = $1
    `,
    [id]
  );

  if (!product) {
    return null;
  }

  return product;
}

export async function insertProduct({
  title,
  price,
  description,
  image,
  category,
}) {
  const q = `
    INSERT INTO
      products
      (title, price, description, image, category)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id, title, price, description, image, category
  ;`;
  const values = [xss(title), price, xss(description), xss(image), category];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting product', e);
  }

  return null;
}

export async function createProduct(req, res) {
  const { title, price, description, category } = req.body;
  const { path: imagePath } = req.file;

  let image;
  try {
    const uploadResult = await uploadImage(imagePath);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('no secure_url from cloudinary upload');
    }
    image = uploadResult.secure_url;
  } catch (e) {
    logger.error('Unable to upload file to cloudinary', e);
    return res.status(500).end();
  }

  const insertProductResult = await insertProduct({
    title,
    price,
    description,
    image,
    category,
  });

  if (insertProductResult) {
    return res.status(201).json(insertProductResult);
  }

  return res.status(500).end();
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  const fields = [
    isString(body.title) ? 'title' : null,
    isString(body.price) ? 'price' : null,
    isString(body.description) ? 'description' : null,
    typeof body.category === 'number' ? 'category' : null,
  ];

  const values = [
    isString(body.title) ? xss(body.title) : null,
    isString(body.price) ? xss(body.price) : null,
    isString(body.description) ? xss(body.description) : null,
    typeof body.category === 'number' ? xss(body.category) : null,
  ];

  if (imagePath) {
    let image;
    try {
      const uploadResult = await uploadImage(imagePath);
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('no secure_url from cloudinary upload');
      }
      image = uploadResult.secure_url;
    } catch (e) {
      logger.error('Unable to upload file to cloudinary', e);
      return res.status(500).end();
    }

    fields.push('image');
    values.push(image);
  }

  const result = await conditionalUpdate('products', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM products WHERE id = $1;',
      [id]
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    logger.error(`unable to delete product "${id}"`, e);
  }

  return res.status(500).json(null);
}
