package venpras.tech.model;

import lombok.Data;

@Data
public class ActiveMQRequest {
    private String host;
    private String username;
    private String password;
    private String queue;
    private String message;
}