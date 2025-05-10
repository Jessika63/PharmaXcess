import net.ttddyy.dsproxy.listener.QueryExecutionListener;
import net.ttddyy.dsproxy.ExecutionInfo;
import net.ttddyy.dsproxy.QueryInfo;
import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.sql.DataSource;
import java.util.List;

@Configuration
public class DataSourceProxyConfig {

    @Bean
    public DataSource dataSource(DataSource originalDataSource) {
        return ProxyDataSourceBuilder
                .create(originalDataSource)
                .name("Audit-Logger")
                .listener(new QueryExecutionListener() {
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

                    @Override
                    public void afterQuery(ExecutionInfo execInfo, List<QueryInfo> queryInfoList) {
                        // TODO
                    }
                })
                .build();
    }
}
