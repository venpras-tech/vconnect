package venpras.tech.controller.request;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import venpras.tech.controller.dto.ResponseDTO;
import venpras.tech.controller.dto.request.HttpRequestDTO;
import venpras.tech.service.RequestService;

@RestController
@RequestMapping("/rest/requests")
public class RestRequestController {

    @Autowired
    private RequestService requestService;

    @PostMapping
    public ResponseDTO createHttpRequest(@RequestBody HttpRequestDTO requestDTO) {
        return requestService.createHttpRequest(requestDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseDTO deleteHttpRequest(@PathVariable String id) {
        return requestService.deleteHttpRequest(id);
    }
}