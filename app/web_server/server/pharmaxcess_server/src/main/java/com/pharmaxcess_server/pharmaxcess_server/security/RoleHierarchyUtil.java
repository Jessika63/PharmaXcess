package com.pharmaxcess_server.pharmaxcess_server.security;

import java.util.HashMap;
import java.util.Map;

public class RoleHierarchyUtil {

    private static final Map<String, Integer> roleHierarchy = new HashMap<>();

    static {
        roleHierarchy.put("ROLE_USER", 1);
        roleHierarchy.put("ROLE_MEDIC", 2);
        roleHierarchy.put("ROLE_ADMIN", 10);
    }

    public static boolean hasSufficientRole(String userRole, String requiredRole) {
        return roleHierarchy.getOrDefault(userRole, 0) >= roleHierarchy.getOrDefault(requiredRole, 0);
    }
}
