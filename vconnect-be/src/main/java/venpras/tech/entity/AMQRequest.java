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
@Table(name="amq_req")
public class AMQRequest extends BasicEntity{
    @OneToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name="folder_id", referencedColumnName = "id")
    private Folder folder;

    private String hostUrl;

    private String queue;

    private String payload;
}
