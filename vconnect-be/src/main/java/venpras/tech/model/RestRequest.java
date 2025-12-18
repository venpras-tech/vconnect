package venpras.tech.model;

import lombok.Data;
import java.util.Map;

@Data
public class RestRequest {
    private String url;
    private String method;
    private Map<String, String> headers;
    private String payload;
}
