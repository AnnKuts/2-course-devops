import { Router } from "express";
import * as taskController from "../controllers/taskController";

const router = Router();

router.get("/", taskController.getAll);
router.post("/", taskController.create);
router.post("/:id/done", taskController.markDone);

export default router;
