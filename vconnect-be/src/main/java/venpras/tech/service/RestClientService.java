package venpras.tech.service;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import venpras.tech.model.RestRequest;

@Service
public class RestClientService {

    private final WebClient webClient;

    public RestClientService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<Object> sendRequest(RestRequest request) {
        return webClient.method(HttpMethod.valueOf(request.getMethod().toUpperCase()))
                .uri(request.getUrl())
                .headers(headers -> addHeaders(headers, request.getHeaders()))
                .bodyValue(request.getPayload())
                .retrieve()
                .bodyToMono(Object.class);
    }

    private void addHeaders(HttpHeaders headers, java.util.Map<String, String> requestHeaders) {
        if (requestHeaders != null) {
            requestHeaders.forEach(headers::add);
        }
    }
}