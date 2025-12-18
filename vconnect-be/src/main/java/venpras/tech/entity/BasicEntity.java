package venpras.tech.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import venpras.tech.utils.SnowflakeIdGenerator;

import java.io.Serializable;
import java.sql.Timestamp;

@Data
@MappedSuperclass
public abstract class BasicEntity implements Serializable {

    @Id
    @Column(unique = true, nullable = false)
    private String id;

    private String strid;

    public String getStrid() {
        return String.valueOf(id);
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    protected String name="default";

    protected String type = "request";

    protected String requestType;


    public final <T extends BasicEntity> T generateId() {
        id =String.valueOf((new SnowflakeIdGenerator()).nextId());
        return (T) this;
    }
}