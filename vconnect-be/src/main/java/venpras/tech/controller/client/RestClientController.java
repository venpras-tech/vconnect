package venpras.tech.controller.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.Disposable;
import venpras.tech.model.RestRequest;
import venpras.tech.service.RestClientService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/rest")
public class RestClientController {

    @Autowired
    private RestClientService restClientService;

    private final Map<String, Disposable> activeRequests = new ConcurrentHashMap<>();

    @PostMapping("/send")
    public Mono<Object> sendRequest(@RequestBody RestRequest request) {
        return restClientService.sendRequest(request);
    }
}