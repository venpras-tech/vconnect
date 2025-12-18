package venpras.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import venpras.tech.entity.AMQRequest;
import venpras.tech.entity.Folder;

import java.util.List;

@Repository
public interface AmqRequestRepository extends JpaRepository<AMQRequest, String> {
    List<AMQRequest> findByFolder(Folder folder);

    @Transactional
    void deleteAllByFolderId(String folderId);
}