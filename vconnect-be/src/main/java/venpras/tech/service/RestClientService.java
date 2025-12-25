package venpras.tech.service;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import venpras.tech.model.RestRequest;

import java.util.HashMap;
import java.util.Map;

@Service
public class RestClientService {

    private final WebClient webClient;

    public RestClientService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<Object> sendRequest(RestRequest request) {
        final long startTime = System.currentTimeMillis();
        return webClient.method(HttpMethod.valueOf(request.getMethod().toUpperCase()))
                .uri(request.getUrl())
                .headers(headers -> addHeaders(headers, request.getHeaders()))
                .bodyValue(request.getPayload() != null ? request.getPayload() : "")
                .exchangeToMono(response -> {
                    Map<String, Object> responseDetails = new HashMap<>();
                    responseDetails.put("status", response.statusCode().value());

                    Map<String,String> headerMap = new HashMap<>();
                    response.headers().asHttpHeaders().forEach((name,values)->{
                        headerMap.put(name,String.join(",",values));
                    });
                    long duration = System.currentTimeMillis() - startTime;
                    headerMap.put("request-duration",String.valueOf(duration));

                    responseDetails.put("headers",headerMap);

                    return response.bodyToMono(Object.class)
                            .map(body->{
                                responseDetails.put("data",body);
                                return (Object)responseDetails;
                            }).defaultIfEmpty(responseDetails).onErrorResume(ex->{
                                Map<String,Object> errorResponse = new HashMap<>();
                                errorResponse.put("status",503);
                                errorResponse.put("error",ex.fillInStackTrace().toString());
                                errorResponse.put("details",ex.getMessage());
                                return Mono.just(errorResponse);
                            });
                }).onErrorResume(ex->{
                    Map<String,Object> errorResponse = new HashMap<>();
                    errorResponse.put("status",503);
                    errorResponse.put("error",ex.fillInStackTrace().toString());
                    errorResponse.put("details",ex.getMessage());
                    return Mono.just(errorResponse);
                });
    }

    private void addHeaders(HttpHeaders headers, java.util.Map<String, String> requestHeaders) {
        if (requestHeaders != null) {
            requestHeaders.forEach(headers::add);
        }
    }
}
