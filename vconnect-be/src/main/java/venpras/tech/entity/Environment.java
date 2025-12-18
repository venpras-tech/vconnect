package venpras.tech.entity;

import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@Data
public class Environment extends  BasicEntity{
    private String variables;
}
