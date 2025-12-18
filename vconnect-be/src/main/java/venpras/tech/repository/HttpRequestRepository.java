package venpras.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import venpras.tech.entity.Folder;
import venpras.tech.entity.HttpRequest;

import java.util.List;

@Repository
public interface HttpRequestRepository extends JpaRepository<HttpRequest, String> {
    List<HttpRequest> findByFolder(Folder folder);

    List<HttpRequest> findByFolderId(String id);

    @Transactional
    void deleteAllByFolderId(String folderId);
}