package venpras.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import venpras.tech.entity.Folder;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, String> {
    List<Folder> findAllByRequestTypeAndParent(String requestType, Folder parent);

    List<Folder> findAllByType(String type);

    List<Folder> findAllByParentId(String id);

    Folder getByNameIgnoreCase(String name);
}