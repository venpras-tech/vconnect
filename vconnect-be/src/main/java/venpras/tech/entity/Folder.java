package venpras.tech.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "folders")
@EqualsAndHashCode(callSuper = true)
public class Folder extends BasicEntity {

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Folder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Folder> children = new ArrayList<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<HttpRequest> requests = new ArrayList<>();

    public Folder() {
        this.type = "folder";
    }
}