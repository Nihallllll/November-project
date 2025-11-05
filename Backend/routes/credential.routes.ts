import { Router } from 'express';
import { CredentialController } from '../controllers/credential.controller';

const credentailRouter = Router();

// Save credential
credentailRouter.post("/users/:userId/credentials", CredentialController.create);

// List user's credentials
credentailRouter.get("/users/:userId/credentials", CredentialController.list);

// Get one credential
credentailRouter.get("/users/:userId/credentials/:id", CredentialController.getOne);

// Update credential
// credentailRouter.put("/users/:userId/credentials/:id", CredentialController.update);
// Delete credential
credentailRouter.delete("/users/:userId/credentials/:id", CredentialController.delete);

export default credentailRouter;
