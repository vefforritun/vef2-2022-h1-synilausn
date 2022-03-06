import express from 'express';
import patch from 'express-ws/lib/add-ws-method.js';
import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { jwtOptions, requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../lib/catchErrors.js';
import { withMulter } from '../lib/with-multer.js';
import { validationCheck } from '../validation/helpers.js';
import {
  adminValidator,
  atLeastOneBodyValueValidator,
  categoryQuerystringValidator,
  nameValidator,
  pagingQuerystringValidator,
  productIdValidator,
  productValidator,
  quantityValidator,
  searchQuerystringValidator,
  titleValidator,
  validateCartExists,
  validateResourceExists,
  validateStatus,
} from '../validation/validators.js';
import {
  addToCart,
  createCart,
  deleteCart,
  deleteCartLine,
  listCart,
  listCartLine,
  updateCartLine,
} from './cart.js';
import {
  createCategory,
  deleteCategory,
  listCategories,
  listCategory,
  updateCategory,
} from './categories.js';
import {
  createProduct,
  deleteProduct,
  listMenu,
  listProduct,
  updateProduct,
} from './menu.js';
import {
  createOrderFromCart,
  getOrder,
  listOrder,
  listOrders,
  listOrderStatus,
  updateOrderStatus,
} from './orders.js';
import { listUser, listUsers, updateUser } from './users.js';

patch.default(express.Router);

export const router = express.Router();

const orderConnections = new Map();
const adminConnections = [];

function returnResource(req, res) {
  return res.json(req.resource);
}

router.get('/', async (req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  const indexJson = await readFile(join(path, './index.json'));
  res.json(JSON.parse(indexJson));
});

router.ws('/orders/:id', async (ws, req) => {
  const { id } = req.params;

  const order = await getOrder(id);

  if (!order) {
    ws.send(JSON.stringify({ error: 'order does not exist' }));
    return ws.close();
  }

  if (!orderConnections.has(id)) {
    orderConnections.set(id, []);
  }

  const connections = orderConnections.get(id);
  connections.push(ws);
  orderConnections.set(id, connections);

  ws.on('close', () => {
    const cns = orderConnections.get(id);
    const index = cns.indexOf(ws);
    cns.splice(index, 1);
    orderConnections.set(id, cns);
  });

  return ws.send(JSON.stringify({ order }));
});

function broadcastToChannel(channel, msg) {
  const connections = orderConnections.get(channel) || [];
  connections.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

router.ws('/admin', (ws, req) => {
  const auth = req.headers.authorization;
  const token = auth.replace(/bearer /i, '');

  try {
    jwt.verify(token, jwtOptions.secretOrKey);
  } catch (e) {
    // throws if not valid
    ws.send(JSON.stringify({ error: 'invalid token' }));
    ws.close();
  }

  adminConnections.push(ws);
  ws.on('close', () => {
    const index = adminConnections.indexOf(ws);
    adminConnections.splice(index, 1);
  });

  ws.send(JSON.stringify({ status: 'loggedin' }));
});

function broadcastToAdmins(msg) {
  adminConnections.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

router.get(
  '/menu',
  pagingQuerystringValidator,
  categoryQuerystringValidator,
  searchQuerystringValidator,
  validationCheck,
  (req, res, next) => {
    const c = orderConnections.get('x');
    if (c && c.length > 0) {
      c.forEach((client) => {
        client.send('HI!');
      });
    }
    next();
  },
  catchErrors(listMenu)
);

router.get(
  '/menu/:id',
  validateResourceExists(listProduct),
  validationCheck,
  returnResource
);

router.post(
  '/menu',
  requireAdmin,
  withMulter,
  // TODO name does not exist
  productValidator,
  validationCheck,
  catchErrors(createProduct)
);

router.patch(
  '/menu/:id',
  requireAdmin,
  validateResourceExists(listProduct),
  withMulter,
  productValidator,
  atLeastOneBodyValueValidator([
    'title',
    'price',
    'description',
    'image',
    'category',
  ]),
  validationCheck,
  catchErrors(updateProduct)
);

router.delete(
  '/menu/:id',
  requireAdmin,
  validateResourceExists(listProduct),
  validationCheck,
  catchErrors(deleteProduct)
);

router.get(
  '/categories',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listCategories)
);

router.post(
  '/categories',
  requireAdmin,
  titleValidator,
  validationCheck,
  catchErrors(createCategory)
);

router.get(
  '/categories/:id',
  validateResourceExists(listCategory),
  validationCheck,
  returnResource
);

router.patch(
  '/categories/:id',
  requireAdmin,
  validateResourceExists(listCategory),
  titleValidator,
  validationCheck,
  catchErrors(updateCategory)
);

router.delete(
  '/categories/:id',
  requireAdmin,
  validateResourceExists(listCategory),
  validationCheck,
  catchErrors(deleteCategory)
);

router.post('/cart', catchErrors(createCart));

router.get(
  '/cart/:id',
  validateResourceExists(listCart),
  validationCheck,
  returnResource
);

router.delete(
  '/cart/:id',
  validateResourceExists(listCart),
  validationCheck,
  catchErrors(deleteCart)
);

router.post(
  '/cart/:id',
  validateResourceExists(listCart),
  productIdValidator,
  quantityValidator,
  validationCheck,
  catchErrors(addToCart)
);

router.get(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine),
  validationCheck,
  returnResource
);

router.patch(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine),
  quantityValidator,
  validationCheck,
  catchErrors(updateCartLine)
);

router.delete(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine, 'lineid'),
  validationCheck,
  catchErrors(deleteCartLine)
);

router.get(
  '/orders',
  requireAdmin,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listOrders)
);

router.post(
  '/orders',
  validateCartExists,
  nameValidator,
  validationCheck,
  catchErrors(createOrderFromCart(broadcastToAdmins))
);

router.get(
  '/orders/:id',
  requireAdmin,
  validateResourceExists(listOrder),
  validationCheck,
  returnResource
);

router.get(
  '/orders/:id/status',
  requireAdmin,
  validateResourceExists(listOrderStatus),
  validationCheck,
  returnResource
);

router.post(
  '/orders/:id/status',
  requireAdmin,
  validateStatus,
  validateResourceExists(listOrderStatus),
  validationCheck,
  catchErrors(updateOrderStatus(broadcastToChannel))
);

router.get(
  '/users',
  requireAdmin,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listUsers)
);

router.get(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  validationCheck,
  returnResource
);

router.patch(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  adminValidator,
  validationCheck,
  catchErrors(updateUser)
);
