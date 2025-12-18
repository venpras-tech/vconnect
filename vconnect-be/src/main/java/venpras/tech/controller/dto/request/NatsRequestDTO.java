package venpras.tech.controller.dto.request;

import lombok.Data;

@Data
public class NatsRequestDTO extends RequestDTO{

    private String url;

    private String subject;

    private String payload;
}
