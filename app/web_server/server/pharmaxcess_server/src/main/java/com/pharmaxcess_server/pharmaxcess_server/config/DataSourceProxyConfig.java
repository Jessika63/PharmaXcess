package com.pharmaxcess_server.pharmaxcess_server.config;
import net.ttddyy.dsproxy.listener.QueryExecutionListener;
import net.ttddyy.dsproxy.ExecutionInfo;
import net.ttddyy.dsproxy.QueryInfo;
import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.sql.DataSource;
import java.util.List;

/**
 * Spring configuration class for setting up a proxy DataSource
 * that logs executed SQL queries for auditing purposes.
 *
 * The proxy captures and logs each query along with the currently
 * authenticated user's name, if available.
 */
@Configuration
public class DataSourceProxyConfig {

    /**
     * Creates a proxy for the original DataSource that intercepts SQL queries
     * and logs them with the associated authenticated user.
     *
     * @param originalDataSource the original DataSource managed by Spring (e.g., HikariDataSource)
     * @return a proxied DataSource with query logging enabled
     */
    @Bean
    public DataSource dataSource(DataSource originalDataSource) {
        return ProxyDataSourceBuilder
                .create(originalDataSource)
                .name("Audit-Logger")
                .listener(new QueryExecutionListener() {
                    /**
                     * Logs SQL queries before they are executed,
                     * including the name of the authenticated user (if any).
                     *
                     * @param execInfo      metadata about the execution
                     * @param queryInfoList list of queries to be executed
                     */
                    @Override
                    public void beforeQuery(ExecutionInfo execInfo, List<QueryInfo> queryInfoList) {
                        String username = "ANONYMOUS";

                        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                            SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
                            username = SecurityContextHolder.getContext().getAuthentication().getName();
                        }

                        for (QueryInfo query : queryInfoList) {
                            System.out.println("[DB AUDIT] User: " + username + " | SQL: " + query.getQuery());
                        }
                    }

                    /**
                     * Callback after query execution.
                     * Currently not implemented.
                     *
                     * @param execInfo      metadata about the execution
                     * @param queryInfoList list of queries that were executed
                     */
                    @Override
                    public void afterQuery(ExecutionInfo execInfo, List<QueryInfo> queryInfoList) {
                        // TODO
                    }
                })
                .build();
    }
}
