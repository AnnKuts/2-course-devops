import { Router } from "express";
import * as rootController from "../controllers/rootController";

const router = Router();

router.get("/", rootController.index);

export default router;
