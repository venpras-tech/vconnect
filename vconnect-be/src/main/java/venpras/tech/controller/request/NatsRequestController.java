package venpras.tech.controller.request;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import venpras.tech.controller.dto.ResponseDTO;
import venpras.tech.controller.dto.request.NatsRequestDTO;
import venpras.tech.service.RequestService;

@RestController
@RequestMapping("/requests")
public class NatsRequestController {

    @Autowired
    private RequestService requestService;

    @PostMapping("/nats")
    public ResponseDTO createNatsRequest(@RequestBody NatsRequestDTO requestDTO) {
        return requestService.createNatsRequest(requestDTO);
    }

}