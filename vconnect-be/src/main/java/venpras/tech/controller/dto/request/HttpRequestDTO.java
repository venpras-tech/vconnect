package venpras.tech.controller.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.web.bind.annotation.RequestMethod;
import venpras.tech.controller.dto.VariableDTO;

import java.util.List;

@Data
public class HttpRequestDTO extends RequestDTO {

    private String name;

    private String url;

    private RequestMethod method;

    private String body;
    
    @JsonProperty("folder_id")
    private String folderId;

    @JsonProperty("headers")
    private List<VariableDTO> header;

    @JsonProperty("params")
    private List<VariableDTO> params;
}
