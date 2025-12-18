package venpras.tech.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NatsRequest {
    @NotNull
    private String url;

    @NotNull
    private String subject;
    
    @NotNull
    private String payload;
}
