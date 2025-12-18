package venpras.tech.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FolderReqDTO {

    private String name;
    @JsonProperty("parent_id")
    private String parentId;
    private String type;

}
