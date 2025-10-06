package in.cybervisible.repositories;

import in.cybervisible.models.OperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperationLogRepo extends JpaRepository<OperationLog,Long> {

}
