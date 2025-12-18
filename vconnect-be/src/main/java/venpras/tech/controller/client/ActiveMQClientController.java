package venpras.tech.controller.client;

import venpras.tech.model.ActiveMQRequest;
import venpras.tech.service.ActiveMQClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/activemq")
public class ActiveMQClientController {

    @Autowired
    private ActiveMQClientService activeMQClientService;

    @PostMapping("/publish")
    public String publishMessage(@RequestBody ActiveMQRequest request) {
        return activeMQClientService.publishMessage(request);
    }
}