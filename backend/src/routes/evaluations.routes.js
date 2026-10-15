const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evaluations.controller');
const { auth } = require('../middleware/auth.middleware');

router.get('/', auth, ctrl.getAll);
router.get('/groupe/:groupeId', auth, ctrl.getByGroupe);
router.get('/nageur/:nageurId', auth, ctrl.getByNageur);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
