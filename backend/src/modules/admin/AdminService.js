import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { UserStatus } from "../../constants/constants.js";

/**
 * Service: Toggle user status
 */
export const ToggleUserStatusService = async (userId) => {
    // Fetch current user status
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let updatedStatus;

    if (user.status === UserStatus.Active) {
        //  If currently ACTIVE, set to INACTIVE and revoke all sessions
        updatedStatus = UserStatus.Inactive;

        await prisma.users.update({
            where: { id: userId },
            data: { status: updatedStatus },
        });

        // Revoke all sessions of this user
        await prisma.sessions.updateMany({
            where: {
                user_id: userId,
                is_active: true,
            },
            data: {
                is_active: false,
            },
        });

    } else {
        //  If currently INACTIVE, set to ACTIVE (no session revocation needed)
        updatedStatus = UserStatus.Active;

        await prisma.users.update({
            where: { id: userId },
            data: { status: updatedStatus },
        });
    }

    //  Return updated status
    return { userId, status: updatedStatus };
};