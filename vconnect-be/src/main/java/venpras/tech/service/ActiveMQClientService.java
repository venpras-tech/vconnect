package venpras.tech.service;

import venpras.tech.model.ActiveMQRequest;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.stereotype.Service;

import javax.jms.*;

@Service
public class ActiveMQClientService {

    public String publishMessage(ActiveMQRequest request) {
        ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory(request.getUsername(), request.getPassword(), request.getHost());
        Connection connection = null;
        Session session = null;
        try {
            connection = (Connection) factory.createConnection();
            connection.start();
            session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Destination destination = session.createQueue(request.getQueue());
            MessageProducer producer = session.createProducer(destination);
            TextMessage message = session.createTextMessage(request.getMessage());
            producer.send(message);
            return "Message sent successfully.";
        } catch (Exception e) {
            return "Failed to send message: " + e.getMessage();
        }  finally {
            try {
                if (session != null) session.close();
                if (connection != null) connection.close();
            } catch (JMSException e) {
                // Ignore cleanup errors
            }
        }
    }
}