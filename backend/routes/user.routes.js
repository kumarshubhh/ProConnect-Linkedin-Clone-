import { Router } from "express";
import { acceptConnectionRequest, downloadProfile, getAllUserProfile, getMyConnectionsRequests, getUserAndProfile, getUserProfileAndUserBasedOnUsername,  login, register, sendConnectionRequest, updateProfileData, updateUserProfile, uploadProfilePicture, whatAreMyConnections } from "../controllers/user.controller.js";
import { uploadMemory } from "../middleware/memoryUpload.js";

const router = Router();

router.route("/update_profile_picture")
.post(uploadMemory.single("profile_picture"), uploadProfilePicture)


router.route('/register').post(register)
router.route('/login').post(login)
router.route('/user_update').post(updateUserProfile)
router.route('/get_user_and_profile').get(getUserAndProfile)
router.route('/update_profile_data').post(updateProfileData)
router.route("/user/get_all_users").get(getAllUserProfile)
router.route("/user/download_resume").get(downloadProfile)
router.route('/user/send_connection_request').post(sendConnectionRequest)
router.route('/user/getConnectionRequest').get(getMyConnectionsRequests)
router.route('/user/user_connection_request').get(whatAreMyConnections)

router.route('/user/accept_connection_request').post(acceptConnectionRequest)

  router.route('/user/get_profile_based_on_username').get(getUserProfileAndUserBasedOnUsername)

  export default router;