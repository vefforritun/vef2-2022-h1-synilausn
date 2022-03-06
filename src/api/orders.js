import xss from 'xss';
import { addPageMetadata } from '../lib/addPageMetadata.js';
import { pagedQuery, query, singleQuery } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { ORDER_STATUS } from '../validation/validators.js';

export async function getOrderLines(orderId) {
  const lines = await query(
    `
      SELECT
        orders_lines.id as id,
        products.id as product_id, products.title as title,
        products.description as description, products.image as image,
        products.category as category,
        orders_lines.quantity as quantity, products.price as price,
        orders_lines.quantity * products.price as total
      FROM
        orders_lines
      JOIN
        products AS products ON products.id = orders_lines.product_id
      WHERE
        orders_lines.order_id = $1
    `,
    [orderId]
  );

  if (!lines) {
    return null;
  }

  return lines.rows;
}

export async function getOrderStates(orderId) {
  const lines = await query(
    `
      SELECT
        state, created
      FROM
        orders_states
      WHERE
        order_id = $1
      ORDER BY created DESC;
    `,
    [orderId]
  );

  if (!lines) {
    return null;
  }

  return lines.rows;
}

export async function getOrder(id) {
  const order = await singleQuery(
    `
      SELECT
        orders.id AS id, orders.created AS created
      FROM
        orders
      WHERE
        orders.id = $1
    `,
    [id]
  );

  if (!order) {
    return null;
  }

  const lines = await getOrderLines(id);
  const status = await getOrderStates(id);

  order.lines = lines || [];
  order.status = status || [];

  order.current_status = order.status[0] ? order.status[0].state : undefined;
  order.current_status_created = order.status[0]
    ? order.status[0].created
    : undefined;

  return order;
}

export function createOrderFromCart(broadcastToAdmins) {
  return async function wrappedCreateOrderFromCart(req, res) {
    const { cart, name } = req.body;

    const q = 'CALL create_order($1, $2);';
    const values = [xss(cart), xss(name)];

    const result = await query(q, values);

    if (!result) {
      logger.error('error creating order from cart');
      return res.status(500).end();
    }

    const order = await getOrder(cart);

    broadcastToAdmins({ order });

    return res.status(200).json(order);
  };
}

export async function listOrders(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const users = await pagedQuery(
    `
    SELECT
      orders.id AS id, orders.created AS created,
      orders_states.state AS current_state, orders_states.created AS current_state_created
    FROM
      orders
    LEFT JOIN
      orders_states ON orders.id = orders_states.order_id
    ORDER BY orders_states.created DESC
    `,
    [],
    { offset, limit }
  );

  const usersWithPage = addPageMetadata(users, req.path, {
    offset,
    limit,
    length: users.items.length,
  });

  return res.json(usersWithPage);
}

export async function listOrder(id) {
  const order = await getOrder(id);

  if (!order) {
    return null;
  }

  return order;
}

export async function listOrderStatus(id) {
  const status = await getOrderStates(id);

  if (!status) {
    return null;
  }

  return status;
}

function isLegalNextStatus(current, next) {
  if (typeof current !== 'string' || typeof next !== 'string') {
    return false;
  }

  const currentIndex = ORDER_STATUS.indexOf(current.toUpperCase());
  const nextIndex = ORDER_STATUS.indexOf(next);

  return currentIndex >= 0 && nextIndex >= 0 && nextIndex === currentIndex + 1;
}

async function setOrderStatus(id, status) {
  const q = `
    INSERT INTO orders_states
    (order_id, state) VALUES ($1, $2);`;
  const values = [xss(id), xss(status)];

  return query(q, values);
}

export function updateOrderStatus(broadcastToChannel) {
  return async function wrappedCreateOrderFromCart(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const order = await getOrder(id);

    if (!order) {
      logger.error(`missing order ${id}`);
      return res.status(500).end();
    }

    const currentStatus = order.current_status;

    if (!isLegalNextStatus(currentStatus, status)) {
      return res.status(400).json({
        error: 'illegal status',
        message: `can not go to ${status} from ${currentStatus}`,
      });
    }

    const result = await setOrderStatus(id, status);

    if (!result) {
      logger.error('error setting order status');
      return res.status(500).end();
    }

    broadcastToChannel(id, { newStatus: status, order });

    return res.status(200).json(order);
  };
}
