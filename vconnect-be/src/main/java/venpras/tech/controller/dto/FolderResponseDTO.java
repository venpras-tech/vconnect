package venpras.tech.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import venpras.tech.entity.BasicEntity;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class FolderResponseDTO extends BasicEntity {

    private List<FolderResponseDTO> children = new ArrayList<>();

    private List<? extends BasicEntity> requests = new ArrayList<>();

}