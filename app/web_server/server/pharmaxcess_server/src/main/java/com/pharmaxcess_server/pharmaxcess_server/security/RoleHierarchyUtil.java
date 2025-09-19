package com.pharmaxcess_server.pharmaxcess_server.security;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for managing role hierarchy and checking role permissions.
 */
public class RoleHierarchyUtil {

    /**
     * A static map defining the hierarchy of roles.
     * The higher the value, the higher the authority level.
     */
    private static final Map<String, Integer> roleHierarchy = new HashMap<>();

    static {
        roleHierarchy.put("ROLE_USER", 1);
        roleHierarchy.put("ROLE_MEDIC", 2);
        roleHierarchy.put("ROLE_ADMIN", 10);
    }

    /**
     * Checks if a user has a sufficient role level compared to a required role.
     *
     * @param userRole     the role of the user
     * @param requiredRole the required role to perform an action
     * @return {@code true} if the user's role level is greater than or equal to the required role level, otherwise {@code false}
     */
    public static boolean hasSufficientRole(String userRole, String requiredRole) {
        return roleHierarchy.getOrDefault(userRole, 0) >= roleHierarchy.getOrDefault(requiredRole, 0);
    }
}