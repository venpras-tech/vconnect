package venpras.tech.controller.request;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import venpras.tech.controller.dto.FolderReqDTO;
import venpras.tech.controller.dto.FolderResponseDTO;
import venpras.tech.entity.Folder;
import venpras.tech.service.FolderService;

import java.util.List;

@RestController
@RequestMapping("/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @GetMapping("/tree/{requestType}")
    public List<FolderResponseDTO> getFolders(@PathVariable String requestType) {
        return folderService.getFolders(requestType);
    }

    @PostMapping
    public Folder createFolder(@RequestBody FolderReqDTO folderReqDTO) {
        return folderService.createFolder(folderReqDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteFolder(@PathVariable String id) {
        folderService.deleteFolder(id);
    }
}