package venpras.tech.controller.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import venpras.tech.enums.MessageType;

@Data
public class RequestDTO {
    @JsonProperty("message_id")
    private String messageId;

    @JsonProperty("message_type")
    private MessageType messageType;

    @JsonProperty("request_type")
    private String requestType;

    @JsonProperty("folder_id")
    private String folderId;
}
