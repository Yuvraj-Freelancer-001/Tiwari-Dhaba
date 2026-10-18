import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dhabaRouter from "./dhaba";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dhabaRouter);
router.use(storageRouter);

export default router;
