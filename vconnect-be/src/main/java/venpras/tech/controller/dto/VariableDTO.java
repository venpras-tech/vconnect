package venpras.tech.controller.dto;

import lombok.Data;

@Data
public class VariableDTO {
    private long id;
    private String enabled;
    private String key;
    private String value;
}
