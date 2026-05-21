package com.lapremier.canchas;

import com.lapremier.canchas.repository.CanchaRepository;
import com.lapremier.canchas.repository.ReservaRepository;
import com.lapremier.canchas.repository.UsuarioRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = "com.lapremier.canchas")
@EnableMongoRepositories(basePackageClasses = {
        CanchaRepository.class,
        ReservaRepository.class,
        UsuarioRepository.class
})
public class CanchasApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanchasApplication.class, args);
    }
}