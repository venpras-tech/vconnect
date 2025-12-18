package venpras.tech.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import venpras.tech.controller.dto.ResponseDTO;
import venpras.tech.controller.dto.request.AMQRequestDTO;
import venpras.tech.controller.dto.request.HttpRequestDTO;
import venpras.tech.controller.dto.request.NatsRequestDTO;
import venpras.tech.entity.AMQRequest;
import venpras.tech.entity.Folder;
import venpras.tech.entity.HttpRequest;
import venpras.tech.entity.NatsRequest;
import venpras.tech.repository.AmqRequestRepository;
import venpras.tech.repository.FolderRepository;
import venpras.tech.repository.HttpRequestRepository;
import venpras.tech.repository.NatsRequestRepository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class RequestService {

    @Autowired
    private HttpRequestRepository httpRequestRepository;

    @Autowired
    private NatsRequestRepository natsRequestRepository;

    @Autowired
    private AmqRequestRepository amqRequestRepository;

    @Autowired
    private FolderRepository folderRepository;

    public ResponseDTO getAllRequests(String requestType) {
        ResponseDTO responseDTO = new ResponseDTO();
        switch (requestType) {
            case "HTTP":
                List<HttpRequest> httpRequests = httpRequestRepository.findAll();
                responseDTO.setBody(httpRequests);
                break;
            case "NATS":
                List<NatsRequest> natsRequests = natsRequestRepository.findAll();
                responseDTO.setBody(natsRequests);
                break;
            case "AMQ":
                List<AMQRequest> amqRequests = amqRequestRepository.findAll();
                responseDTO.setBody(amqRequests);
                break;
        }
        return responseDTO;
    }

    @Autowired
    private ObjectMapper objectMapper;

    public ResponseDTO createHttpRequest(HttpRequestDTO requestDTO) {
        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        ResponseDTO responseDTO = new ResponseDTO();
        if (requestDTO.getFolderId() == null) {
            Folder defaultFolder = folderRepository.getByNameIgnoreCase("default");
            if (defaultFolder != null) {
                requestDTO.setFolderId(defaultFolder.getId());
            }else{
                Folder f = new Folder();
                f.setRequestType("HTTP");
                f.generateId();
                f.setName("default");
                f.setCreatedBy("system");
                folderRepository.save(f);
                requestDTO.setFolderId(f.getId());
            }
        }
        try {
            Folder folder = checkAndValidateFolder(requestDTO.getFolderId());
            HttpRequest httpRequest = new HttpRequest();
            String headerArray = objectMapper.writeValueAsString(requestDTO.getHeader());
            String paramsArray = objectMapper.writeValueAsString(requestDTO.getParams());
            BeanUtils.copyProperties(requestDTO, httpRequest);
            httpRequest.setHeader(headerArray);
            httpRequest.setParams(paramsArray);
            httpRequest.setFolder(folder);
            httpRequest.generateId();
            httpRequest.setRequestType("REST");
            responseDTO.setStatus("200");
            httpRequestRepository.save(httpRequest);
        } catch (Exception e) {
            log.info("error while creating HttpRequest with messageId:", e);
            responseDTO.setStatus("500");
            responseDTO.setBody(e.getMessage());
        }

        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        return responseDTO;
    }

    public ResponseDTO createNatsRequest(NatsRequestDTO requestDTO) {
        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Folder folder = checkAndValidateFolder(requestDTO.getFolderId());
            NatsRequest natsRequest = new NatsRequest();
            BeanUtils.copyProperties(requestDTO, natsRequest);
            natsRequest.setFolder(folder);
            natsRequestRepository.save(natsRequest);
            responseDTO.setStatus("200");
            responseDTO.setBody("Request Saved Successfully");
        } catch (Exception e) {
            log.info("error while creating HttpRequest with messageId:", e);
            responseDTO.setStatus("500");
            responseDTO.setBody(e.getMessage());
        }
        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        return responseDTO;
    }

    public ResponseDTO createAmqRequest(AMQRequestDTO requestDTO) {
        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Folder folder = checkAndValidateFolder(requestDTO.getFolderId());
            AMQRequest natsRequest = new AMQRequest();
            BeanUtils.copyProperties(requestDTO, natsRequest);
            natsRequest.setFolder(folder);
            amqRequestRepository.save(natsRequest);
            responseDTO.setStatus("200");
            responseDTO.setBody("Request Saved Successfully");
        } catch (Exception e) {
            log.info("error while creating HttpRequest with messageId:", e);
            responseDTO.setStatus("500");
            responseDTO.setBody(e.getMessage());
        }
        log.info("createHttpRequest called with requestDTO messageId: {} - started", requestDTO.getMessageId());
        return responseDTO;
    }

    public Folder checkAndValidateFolder(String folderId) {
        Optional<Folder> folder = folderRepository.findById(folderId);
        return folder.isPresent() ? folder.get() : null;

    }

    public ResponseDTO deleteHttpRequest(String id) {
        log.info("deleteHttpRequest called with id: {} - started", id);
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            httpRequestRepository.deleteById(id);
            responseDTO.setStatus("200");
            responseDTO.setBody("Request Deleted Successfully");
        } catch (Exception e) {
            log.info("error while deleting HttpRequest with id:", e);
            responseDTO.setStatus("500");
            responseDTO.setBody(e.getMessage());
        }
        log.info("deleteHttpRequest called with id: {} - ended", id);
        return responseDTO;
    }
}