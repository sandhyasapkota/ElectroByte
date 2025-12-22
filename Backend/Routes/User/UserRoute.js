import express from 'express';
import { getAllUsers,updateUserById,deleteUserById,createUser,getUserById } from '../../Controller/index.js';

const router = express.Router();
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);

export {router as UserRoute};