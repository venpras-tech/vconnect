package venpras.tech.controller.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import venpras.tech.model.NatsRequest;
import venpras.tech.service.NatsClientService;

@RestController
public class NatsClientController {

    @Autowired
    public NatsClientService natsClientService;

    @PostMapping("/nats/publish")
    public String publishNatsMessage(@RequestBody NatsRequest request) {
        try {
            natsClientService.publishMessage(request);
            return "Message published successfully!";
        } catch (Exception ex) {
            return "Error: " + ex.getMessage();
        }
    }
}
