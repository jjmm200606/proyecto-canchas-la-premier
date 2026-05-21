package com.lapremier.canchas;

import com.lapremier.canchas.repository.CanchaRepository;
import com.lapremier.canchas.repository.ReservaRepository;
import com.lapremier.canchas.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration"
})
class CanchasApplicationTests {

	@MockitoBean
	private CanchaRepository canchaRepository;

	@MockitoBean
	private ReservaRepository reservaRepository;

	@MockitoBean
	private UsuarioRepository usuarioRepository;

	@Test
	void contextLoads() {
	}

}
