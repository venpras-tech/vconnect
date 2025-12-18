package venpras.tech.controller.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AMQRequestDTO extends RequestDTO {

    private String url;

    private String queue;

    private String payload;
}
