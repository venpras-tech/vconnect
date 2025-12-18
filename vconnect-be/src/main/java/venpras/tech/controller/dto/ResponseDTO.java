package venpras.tech.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ResponseDTO {
    private String status;

    private Object body;

    @JsonProperty("error_message")
    private String errorMsg;
}
