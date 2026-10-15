const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nageurs.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/import', auth, ctrl.importNageurs);
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getById);
router.post('/', ctrl.create);        // public — inscription libre
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
