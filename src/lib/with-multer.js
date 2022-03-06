import multer from 'multer';

// TODO færa í .env
const MULTER_TEMP_DIR = './temp';

/**
 * Hjálparfall til að bæta multer við route.
 */
export function withMulter(req, res, next) {
  multer({ dest: MULTER_TEMP_DIR }).single('image')(req, res, (err) => {
    if (err) {
      if (err.message === 'Unexpected field') {
        const errors = [
          {
            field: 'image',
            error: 'Unable to read image',
          },
        ];
        return res.status(400).json({ errors });
      }

      return next(err);
    }

    return next();
  });
}
