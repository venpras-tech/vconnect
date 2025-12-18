package venpras.tech.service;

import venpras.tech.model.NatsRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import io.nats.client.Connection;
import io.nats.client.Nats;

@Service
@Slf4j
public class NatsClientService {

    public void publishMessage(NatsRequest request) {
        try {
            Connection nc = Nats.connect(request.getUrl());
            nc.publish(request.getSubject(), request.getPayload().getBytes());
            nc.close();
        } catch (Exception e) {
            log.error("Error publishing message: " + e.getMessage() + "successfully..");
        }
    }

}
