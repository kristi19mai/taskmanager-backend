import express from "express";
const router = express.Router();
import {
  authentication,
  authorizePermissions,
} from "../middleware/authentication.js";
import {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateUserPassword,
  updateUser,
} from "../controllers/userController.js";

router.get("/", authentication, authorizePermissions("admin"), getAllUsers);
router.get("/showMe", authentication, getCurrentUser);
router.patch("/updateUser", authentication, updateUser);
router.patch("/updateUserPassword", authentication, updateUserPassword);
router.get(
  "/:id",
  authentication,
  authorizePermissions("admin"),
  getSingleUser
);

export default router;
