import xss from 'xss';
import { addPageMetadata } from '../lib/addPageMetadata.js';
import {
  conditionalUpdate,
  deleteQuery,
  pagedQuery,
  query,
  singleQuery,
} from '../lib/db.js';
import { logger } from '../lib/logger.js';

export async function listCategories(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const categories = await pagedQuery(
    `SELECT
        id, title
      FROM
        categories
      ORDER BY updated ASC`,
    [],
    { offset, limit }
  );

  const categoriesWithPage = addPageMetadata(categories, req.path, {
    offset,
    limit,
    length: categories.items.length,
  });

  return res.json(categoriesWithPage);
}

export async function insertCategory({ title }) {
  const q = `
    INSERT INTO
      categories
      (title)
    VALUES
      ($1)
    RETURNING
      id, title
  ;`;
  const values = [xss(title)];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting category', e);
  }

  return null;
}

export async function createCategory(req, res) {
  const { title } = req.body;

  const insertCategoryResult = await insertCategory({
    title,
  });

  if (insertCategoryResult) {
    return res.status(201).json(insertCategoryResult);
  }

  return res.status(500).end();
}

export async function listCategory(_, req) {
  const { id } = req.params;

  const category = await singleQuery(
    `
      SELECT
        id, title, created, updated
      FROM
        categories
      WHERE
        id = $1
    `,
    [id]
  );

  if (!category) {
    return null;
  }

  return category;
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { body } = req;

  const fields = ['title'];

  const values = [xss(body.title)];

  const result = await conditionalUpdate('categories', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const deletionRowCount = await deleteQuery(
      'DELETE FROM categories WHERE id = $1;',
      [id]
    );

    if (deletionRowCount === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (e) {
    logger.error(`unable to delete category "${id}"`, e);
  }

  return res.status(500).json(null);
}
