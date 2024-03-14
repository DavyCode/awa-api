import { AccessControl } from "accesscontrol";
import { RolesType } from "../../../common/constant";

const ac: AccessControl = new AccessControl();

const USER = String(RolesType.USER);
const SUPPORT = String(RolesType.SUPPORT);
const ADMIN = String(RolesType.ADMIN);

export default (() => {
	ac.grant(USER).readOwn("User").updateOwn("User").updateOwn("User");

	ac.grant(SUPPORT)
		.extend(USER)
		.readAny("User")
		.readAny("User")
		.updateAny("User");

	ac.grant(ADMIN).extend(SUPPORT).deleteAny("User").createAny("User");

	return ac as any;
})();
