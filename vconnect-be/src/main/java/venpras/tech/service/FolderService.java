package venpras.tech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import venpras.tech.controller.dto.FolderReqDTO;
import venpras.tech.controller.dto.FolderResponseDTO;
import venpras.tech.entity.BasicEntity;
import venpras.tech.entity.Folder;
import venpras.tech.entity.HttpRequest;
import venpras.tech.enums.RequestType;
import venpras.tech.repository.AmqRequestRepository;
import venpras.tech.repository.FolderRepository;
import venpras.tech.repository.HttpRequestRepository;
import venpras.tech.repository.NatsRequestRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private HttpRequestRepository httpRequestRepository;

    @Autowired
    private NatsRequestRepository natsRequestRepository;

    @Autowired
    private AmqRequestRepository amqRequestRepository;

    public List<FolderResponseDTO> getFolders(String requestType) {
        List<Folder> rootFolders = folderRepository.findAllByRequestTypeAndParent(requestType, null);
        List<FolderResponseDTO> folderResponseDTOS = rootFolders.stream().map(this::buildFolderTree).collect(Collectors.toList());
        if (RequestType.REST.name().equalsIgnoreCase(requestType)) {
            httpRequestRepository.findByFolder(null).forEach(request -> {
                folderResponseDTOS.add(createResponseFromRequest(request));
            });
        } else if (RequestType.NATS.name().equalsIgnoreCase(requestType)) {
            natsRequestRepository.findByFolder(null).forEach(request -> {
                folderResponseDTOS.add(createResponseFromRequest(request));
            });
        } else if (RequestType.AMQ.name().equalsIgnoreCase(requestType)) {
            amqRequestRepository.findByFolder(null).forEach(request -> {
                folderResponseDTOS.add(createResponseFromRequest(request));
            });
        }
        return folderResponseDTOS;
    }

    private FolderResponseDTO buildFolderTree(Folder folder) {
        FolderResponseDTO folderResponseDTO = new FolderResponseDTO();
        folderResponseDTO.setCreatedAt(folder.getCreatedAt());
        folderResponseDTO.setCreatedBy(folder.getCreatedBy());
        folderResponseDTO.setUpdatedAt(folder.getUpdatedAt());
        folderResponseDTO.setUpdatedBy(folder.getUpdatedBy());
        folderResponseDTO.setType(folder.getType());
        folderResponseDTO.setName(folder.getName());
        folderResponseDTO.setId(folder.getId());
        List<Folder> children = folderRepository.findAllByRequestTypeAndParent(folder.getRequestType(), folder);
        if (!children.isEmpty()) {
            folderResponseDTO
                    .setChildren(children.stream().map(this::buildFolderTree).collect(Collectors.toList()));
        }
        if (RequestType.REST.name().equalsIgnoreCase(folder.getRequestType())) {
            folderResponseDTO.setRequests(httpRequestRepository.findByFolder(folder));
        } else if (RequestType.NATS.name().equalsIgnoreCase(folder.getRequestType())) {
            folderResponseDTO.setRequests(natsRequestRepository.findByFolder(folder));
        } else if (RequestType.AMQ.name().equalsIgnoreCase(folder.getRequestType())) {
            folderResponseDTO.setRequests(amqRequestRepository.findByFolder(folder));
        }
        return folderResponseDTO;
    }

    private FolderResponseDTO createResponseFromRequest(BasicEntity request) {
        FolderResponseDTO folderResponseDTO = new FolderResponseDTO();
        folderResponseDTO.setCreatedAt(request.getCreatedAt());
        folderResponseDTO.setCreatedBy(request.getCreatedBy());
        folderResponseDTO.setUpdatedAt(request.getUpdatedAt());
        folderResponseDTO.setUpdatedBy(request.getUpdatedBy());
        folderResponseDTO.setName(request.getName());
        folderResponseDTO.setId(request.getId());
        folderResponseDTO.setStrid(request.getStrid());
        return folderResponseDTO;
    }

    public Folder createFolder(FolderReqDTO folderReqDTO) {
        Folder folder = new Folder();
        if(folderReqDTO.getParentId()!=null){
            Folder parentFolder = folderRepository.findById(folderReqDTO.getParentId())
                    .orElse(null);
            folder.setParent(parentFolder);
        }
        folder.setName(folderReqDTO.getName());
        folder.setRequestType(folderReqDTO.getType());
        folder.generateId();
        return folderRepository.save(folder);
    }

    public void deleteFolder(String id) {
        Folder folder = folderRepository.findById(id).orElse(null);
        if (folder != null) {
            deleteFolderRecursively(folder);
        }
    }

    private void deleteFolderRecursively(Folder folder) {
        List<Folder> children = folderRepository.findAllByRequestTypeAndParent(folder.getRequestType(), folder);
        for (Folder child : children) {
            deleteFolderRecursively(child);
        }
        if (RequestType.REST.name().equalsIgnoreCase(folder.getRequestType())) {
            httpRequestRepository.deleteAllByFolderId(folder.getId());
        } else if (RequestType.NATS.name().equalsIgnoreCase(folder.getRequestType())) {
            natsRequestRepository.deleteAllByFolderId(folder.getId());
        } else if (RequestType.AMQ.name().equalsIgnoreCase(folder.getRequestType())) {
            amqRequestRepository.deleteAllByFolderId(folder.getId());
        }

        folderRepository.delete(folder);
    }
}