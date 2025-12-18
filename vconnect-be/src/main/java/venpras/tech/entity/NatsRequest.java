package venpras.tech.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "nats_req")
public class NatsRequest extends BasicEntity{
    @OneToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name="folder_id", referencedColumnName = "id")
    private Folder folder;

    private String url;

    private String subject;

    private String payload;

}
