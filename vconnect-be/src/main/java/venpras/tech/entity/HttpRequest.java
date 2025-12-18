package venpras.tech.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.springframework.web.bind.annotation.RequestMethod;

@Data
@Entity
@Table(name="http_req")
public class HttpRequest extends BasicEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="folder_id")
    @JsonBackReference
    private Folder folder;

    private String url;

    private RequestMethod method;

    private String body;

    private String header;

    private String params;
}
