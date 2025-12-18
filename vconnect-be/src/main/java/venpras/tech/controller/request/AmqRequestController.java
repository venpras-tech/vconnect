package venpras.tech.controller.request;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import venpras.tech.controller.dto.ResponseDTO;
import venpras.tech.controller.dto.request.AMQRequestDTO;
import venpras.tech.controller.dto.request.HttpRequestDTO;
import venpras.tech.controller.dto.request.NatsRequestDTO;
import venpras.tech.service.RequestService;

@RestController
@RequestMapping("/requests")
public class AmqRequestController {

    @Autowired
    private RequestService requestService;

    @PostMapping("/amq")
    public ResponseDTO createAMQRequest(@RequestBody AMQRequestDTO requestDTO) {
        return requestService.createAmqRequest(requestDTO);
    }
}