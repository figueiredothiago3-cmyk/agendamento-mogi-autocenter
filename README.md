Este é o meu projeto para o desafio técnico da vaga de Desenvolvedor Júnior. 

Criei um sistema de agendamento focado no cenário real de uma oficina mecânica. Meu objetivo foi entregar um código limpo, funcional e que resolvesse o problema do cliente de forma direta, controlando perfeitamente as entradas de novos agendamentos e a gestão desse fluxo pelo administrador.

##  Tecnologias Utilizadas

Para mostrar minha base em programação, escolhi fazer o projeto "na mão" (Vanilla), sem atalhos:

*   **HTML5 e CSS3:** Para construir e organizar as telas.
*   **JavaScript:** Toda a inteligência do sistema (como bloquear horários, formatar telefone e salvar os dados) foi programada diretamente, sem usar frameworks prontos.
*   **Tailwind CSS:** Para deixar o design moderno e responsivo (funcionando bem no celular e no computador) de forma rápida.
*   **LocalStorage:** Usei a memória do próprio navegador para guardar os dados dos clientes. Funciona como uma prateleira de estoque para o sistema, gravando as informações sem precisar configurar um banco de dados externo agora.

##  Uso de Inteligência Artificial

Acredito que a IA é uma ótima ferramenta para ajudar no dia a dia. Neste projeto, usei o **Google Gemini** como um assistente de programação. Ele me ajudou a:
*   Organizar as ideias para separar a parte visual (HTML) da lógica (JavaScript).
*   Encontrar a melhor forma de escrever as regras que bloqueiam horários repetidos.
*   Ajustar pequenos detalhes de design no Tailwind para garantir que a tela ficasse perfeita no celular.
*   *Nota:* Todas as sugestões da IA foram revisadas e testadas por mim para garantir que atendiam exatamente ao que o desafio pedia.

##  Como executar o projeto

Fiz questão de criar um projeto leve e simples de testar. Você não precisa instalar nada (como Node.js) no seu computador.

1. Acesse o Link do Projeto em Produção (Deploy).
2. **Para rodar localmente:** Baixe os arquivos deste repositório, abra a pasta e dê dois cliques no arquivo `index.html`. O site vai abrir no seu navegador na mesma hora.
3. Use o botão no topo da página para navegar entre a Visão do Cliente e o Painel do Administrador.

##  Credenciais de Acesso
O sistema é aberto para avaliação. Não é necessário nenhum login ou senha para testar a Área do Cliente ou a Área Administrativa.

##  Decisões Técnicas Adotadas

*   **Foco na Simplicidade:** Escolhi não usar ferramentas pesadas para que qualquer pessoa pudesse abrir o projeto em qualquer computador imediatamente, sem erros de instalação.
*   **Regras de Negócio Reais:** Programei o sistema pensando no dia a dia da oficina. O código sabe que domingo é fechado e que de sábado o expediente é mais curto, ajustando os horários automaticamente.
*   **Prevenção de Erros (Viagem no tempo):** Se um cliente tentar agendar uma revisão para o dia de hoje, o sistema verifica a hora do relógio e bloqueia as horas que já passaram.
*   **Experiência do Usuário (UX):** Para deixar o sistema mais amigável, coloquei notificações visuais na tela (ao invés daqueles alertas antigos do navegador) e uma máscara que formata o número do WhatsApp enquanto o usuário digita.



---
*Desenvolvido com dedicação para o início de uma grande jornada na tecnologia.*
