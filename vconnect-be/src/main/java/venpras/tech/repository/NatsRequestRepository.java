package venpras.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import venpras.tech.entity.Folder;
import venpras.tech.entity.NatsRequest;

import java.util.List;

@Repository
public interface NatsRequestRepository extends JpaRepository<NatsRequest, String> {
    List<NatsRequest> findByFolder(Folder folder);

    @Transactional
    void deleteAllByFolderId(String folderId);
}