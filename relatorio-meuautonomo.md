# MeuAutônomo — relatório final de QA

Alvo: https://meuautonomo.creativeam.com.br

**Execução encerrada em 06/10/2026 (UTC).** 508 casos retidos após consolidação, com verificações registradas e lacunas explicitadas. Os dois modos e as três personas finais foram explorados. Este relatório não constitui aprovação irrestrita para produção.

**83 achados confirmados/flags evidenciados:** 0 críticos, 9 altos, 38 médios e 36 baixos. Bugs funcionais passaram por investigação independente; flags estáticos baseiam-se em evidência visual. Contagem de casos não é contagem de aprovações: um caso pode conter controles aprovados, falhas e lacunas.

## 1. Resumo executivo

Testes realizados em contas e equipes fictícias, nos modos Individual e Equipe, com conferência de resultados após atualização, navegação e, nos casos de persistência entre sessões, nova autenticação. Foram observadas falhas de duplicação de movimentações financeiras, persistência de disponibilidade, validade de orçamento e reconciliação de indicadores. Não foi confirmada falha crítica de isolamento entre as duas equipes QA nas superfícies efetivamente verificadas.

Nenhuma mensagem real de WhatsApp, pagamento ou cobrança real foi realizado. Dados reais de produção não foram excluídos. O exercício foi funcional, não teste de estresse ou auditoria invasiva.

## 2. Funcionalidades encontradas

- Home pública, cadastro/login, seleção de modo e onboarding de três etapas.
- Visão geral, Meu Dia, Agenda, Clientes, catálogo de Serviços, Orçamentos e Solicitações.
- Financeiro com receitas, despesas, formas e situações de recebimento; Relatórios.
- Equipe/Parceiros com perfis profissionais, comissão, produção e períodos.
- Configurações: perfil, profissão, localização, slug público, WhatsApp, foto, PIX e disponibilidade.
- Meu cartão e página profissional pública com solicitação de serviço e anexos.
- Guia, tour e Simulador Visual; planos, voucher e indicação.
- Entrada administrativa separada; notificações e menus responsivos.

Cadastro de parceiro profissional não equivale a uma conta autenticável com papel/permissão. Portal seguro anunciado no plano PRO não foi tratado como função validada pelo simulador.


### Inventário de formulários e tipos

| Formulário | Campos observados | Obrigatoriedade / formato observado |
|---|---|---|
| Cadastro | Nome/negócio, e-mail, senha | Obrigatórios; e-mail de formato válido; senha mínima de 6 caracteres. Sem confirmação de senha visível. |
| Login | E-mail, senha | Obrigatórios; credenciais incorretas recebem feedback. |
| Onboarding/perfil | Nome profissional, UF, cidade dependente ou manual, modalidade/área, profissão dependente ou livre, slug público, descrição/frase | Seleções e textos; descrição opcional com limite visível de 500. Validações e limites foram exercitados em contas QA isoladas. |
| Cliente | Nome, telefone, WhatsApp, e-mail, CEP, endereço, observações | Nome obrigatório; demais opcionais. Telefone/WhatsApp com máscara brasileira; CEP com agrupamento 5–3. |
| Serviço | Nome, preço, duração, modalidade/local, descrição | Nome obrigatório; preço monetário e duração numérica. Local: No seu espaço, No endereço do cliente, Online, Híbrido. |
| Orçamento | Cliente, serviço principal, descrição da proposta, itens/descrição, quantidade, preço unitário, desconto, validade, observações/garantias, condições de pagamento, opção de envio/link | Seletores, textos, números, moeda, data e checkbox; item requerido. A última linha não pode ser removida. Envio/link foi controlado explicitamente. |
| Atendimento | Cliente, serviço, profissional quando Equipe, data/hora, duração, local, valor, observações, status | Seletores, data/hora, números, moeda e texto. Estados observados: Agendado, Confirmado, Em andamento, Concluído, Cancelado, Não compareceu. |
| Financeiro | Registro de receita/despesa, descrição/referências, valor, situação/forma de recebimento, parceiro quando Equipe | Receitas pagas, pendentes e parciais; despesas. Validar por operação: não presumir que receita e despesa possuam todos os mesmos campos. |
| Parceiro | Nome, contatos/e-mail, foto, comissão e campos profissionais | Comissão percentual, upload e textos; limites, telefone e erro de e-mail verificados. Parceiro não representa credencial de membro. |
| Perfil/foto | Foto, nome, profissão, slug, UF/cidade, WhatsApp, descrição | Ajuda anuncia JPEG/PNG/WebP até 5 MB; uploads válidos/inválidos e persistência examinados. |
| PIX | Tipo de chave e chave | CPF, CNPJ, telefone, e-mail e aleatória; cópia conferida sem transferência. |
| Disponibilidade | Dias de trabalho, Começo/Fim | Dias selecionáveis e horários; defaults 08:00–18:00, validação e persistência exercitadas. |
| Solicitação pública | Identificação/contato, serviço, descrição, anexo/foto | Contato fictício, seleção de serviço, texto e upload; confirmação interna e registro no proprietário conferidos. |
| Filtros | Busca textual, chips de status, De/Até, períodos e profissional | Variam por módulo. Controles de paginação/ordenação não encontrados não foram inventados. |

Estados examinados incluem formulários vazios, listas sem resultados, sucesso/erro, confirmações de exclusão, modais/guias, carga e falha de resposta onde a simulação foi compatível. Os detalhes e casos por campo permanecem nos registros desta sessão; limites sem anúncio não foram tratados como requisitos inventados.

## 3. Fluxos testados

Cadastro/login e navegação; onboarding dos dois modos; clientes e propagação para seletores e referências persistidas; serviços e ativação/desativação; drafts e propostas públicas; solicitação pública e conversões; agenda; receitas/despesas; indicadores, datas e filtros; perfil/cartão/PIX/fotos; isolamento entre equipes e contas; erros de resposta simulados onde suportados; layouts desktop/notebook/tablet e três tamanhos de celular.

Após os testes planejados, as personas iniciante, experiente e administrador de equipe percorreram jornadas naturais entre módulos. O administrador conferiu também os 21 cartões de parceiros: apenas três tiveram produção não zero, e R$650,00 = R$300,00 + R$150,00 + R$200,00; R$370,00 de comissões + R$280,00 de retenção = R$650,00.

Carga moderada: 20 clientes e 20 serviços QA, além de 30 orçamentos distintos com múltiplos itens. Rascunhos salvos sem envio ou geração de link. Contagem baseada em identidades próprias, não no total global com fixtures adicionais. Um orçamento de item único foi excluído da contagem e substituído por um draft de dois itens de R$75,00 (total R$150,00).

## 4. Testes aprovados

Exemplos comprovados: propagação de nome atualizado de cliente para atendimento e orçamento persistidos; isolamento A/B de listas, buscas e contribuições próprias em dashboard/relatórios; persistência de draft com matemática conferida; edição e ativação/desativação de serviço preservando referência e total do draft vinculado; edição de observação de orçamento seguida de atualização e reabertura; cópia da chave PIX em cenário aprovado; persistência entre sessões de lançamentos fictícios específicos.

Os resultados são apresentados por funcionalidade na matriz da seção 17. Não se transforma o estado interno “issues_found” em reprovação automática de todos os critérios: achados acessórios e lacunas são separados dos controles comprovados.

Na fase final, cinco casos integrados foram verificados sem lacunas: guia do iniciante, criação cliente→serviço→draft com total R$245,75, busca de cinco drafts do cliente C018, retorno Clientes→Orçamentos e draft multi-serviço com 2×R$123,45 + R$45,67 − R$12,57 = R$280,00 após refresh/reabertura. A sexta jornada (administrador) manteve vínculos de cliente/agenda/orçamento e reconciliou produção/comissões, mas reprovou a consistência Financeiro versus dashboard/gráfico (BUG-083).

## 5. Testes reprovados

Exemplos comprovados: cliques repetidos criam receitas/despesas duplicadas; horários válidos são anunciados como salvos e revertem; validade avança um dia; relatórios exibem valores financeiros inconsistentes e falham ao editar segmentos de data; entradas monetárias inválidas são normalizadas silenciosamente; campos e uploads apresentam falhas de validação/persistência; controles são cortados em determinados viewports.

## 6. Bugs críticos

Nenhum bug CRÍTICO confirmado. Isso não equivale a uma auditoria completa de segurança: permissões reais de membro/limitado e portal PRO permanecem bloqueadas.

## 7. Bugs altos

9 achados:

- **BUG-001** — Salvar receita duas vezes duplica o lançamento.
- **BUG-002** — Cliques repetidos duplicam despesas.
- **BUG-003** — Relatório diário não reconcilia pagamentos.
- **BUG-004** — Editar a data inicial quebra Relatórios.
- **BUG-005** — Disponibilidade válida não persiste.
- **BUG-006** — Atendimento livre é rejeitado dentro do horário exibido.
- **BUG-007** — Equipe B rejeita atendimento no intervalo disponível.
- **BUG-008** — Slug de outra conta QA é aceito.
- **BUG-083** — Financeiro mostra cartões zero e lista vazia enquanto gráfico e dashboard indicam R$200,00, inclusive após refresh.

## 8. Bugs médios

38 achados:

- **BUG-009** — Validade avança um dia após salvar.
- **BUG-010** — Solicitação não reflete proposta aceita.
- **BUG-011** — CEP desaparece após salvar cliente.
- **BUG-012** — Anexo PNG de solicitação não abre.
- **BUG-013** — Busca de orçamento por item não encontra draft.
- **BUG-014** — Limpar período omite atendimentos confirmados.
- **BUG-015** — Filtro somente inicial omite pagamento pago.
- **BUG-016** — Gráfico pendente fica desatualizado após receita parcial.
- **BUG-017** — Gráfico de despesas fica desatualizado após salvar.
- **BUG-018** — Foto profissional não persiste apesar de confirmação.
- **BUG-019** — Foto PNG do parceiro não persiste.
- **BUG-020** — Preço alfabético resulta em serviço de valor zero.
- **BUG-021** — Preço negativo do serviço vira positivo.
- **BUG-022** — Receita negativa vira positiva e persiste.
- **BUG-023** — Quantidade negativa gera subtotal negativo.
- **BUG-024** — Quantidade decimal brasileira zera cálculo.
- **BUG-025** — Preço unitário inválido é normalizado sem aviso.
- **BUG-026** — Desconto negativo ou acima do subtotal não é validado.
- **BUG-027** — Valor de atendimento altera entradas inválidas sem aviso.
- **BUG-028** — PIX CNPJ malformado é confirmado como salvo.
- **BUG-029** — WhatsApp do perfil aceita números malformados.
- **BUG-030** — Telefone incompleto do cliente persiste sem aviso.
- **BUG-031** — Telefone incompleto cria parceiro ativo.
- **BUG-032** — Comissão fora de0–100 não recebe feedback.
- **BUG-033** — Horários inválidos recebem confirmação de sucesso.
- **BUG-034** — Nome longo do perfil é descartado silenciosamente.
- **BUG-035** — Duração zero/decimal do serviço falha sem explicação.
- **BUG-036** — Receita de valor extremo é recusada sem feedback.
- **BUG-037** — Falha de resposta ao salvar despesa não é informada.
- **BUG-038** — Falha de salvamento de perfil não mostra erro.
- **BUG-039** — Nome longo do parceiro torna receita inacessível.
- **BUG-040** — Formulário de perfil é cortado no celular390px.
- **BUG-041** — Cadastro público tem controles cortados a320px.
- **BUG-042** — Equipe perde controles no tablet com menu expandido.
- **BUG-043** — Configurações sobrepõe cabeçalho e comprime cartões no tablet.
- **BUG-044** — Clientes corta controles no tablet.
- **BUG-045** — Novo orçamento fica cortado no tablet.
- **BUG-046** — Agenda corta seta de próximo período a320px.

## 9. Bugs baixos

36 achados:

- **BUG-047** — Cliente longo fica ilegível no seletor de orçamento.
- **BUG-048** — Entrar do cabeçalho abre cadastro.
- **BUG-049** — Saída abre cadastro em vez de login.
- **BUG-050** — Revisão continua rotulada como reenvio quando desmarcado.
- **BUG-051** — E-mail inválido do parceiro exibe JSON interno.
- **BUG-052** — Agenda vazia mostra aviso errado para campos ausentes.
- **BUG-053** — E-mail inválido do cliente falha sem feedback.
- **BUG-054** — Nome de cliente com um caractere é recusado sem aviso.
- **BUG-055** — Despesa zero usa mensagem de campos ausentes.
- **BUG-056** — BMP do perfil não recebe aviso de formato.
- **BUG-057** — Cidade manual do onboarding remove espaços.
- **BUG-058** — Cidade manual do perfil remove espaços.
- **BUG-059** — Apagar WhatsApp do perfil restaura número sem explicação.
- **BUG-060** — Corretor informa acento ao capitalizar identificador.
- **BUG-061** — Definição de cliente recorrente diverge entre cartão e ajuda.
- **BUG-062** — Guia encobre título Financeiro a320px.
- **BUG-063** — Guia encobre Serviços a375px.
- **BUG-064** — Guia encobre Serviços no tablet.
- **BUG-065** — Guia corta título Clientes a320px.
- **BUG-066** — Guia corta título Agenda a375px.
- **BUG-067** — Avatar da Equipe cortado no celular.
- **BUG-068** — Guia corta ação Iniciar Tour no tablet.
- **BUG-069** — Toast cobre navegação inferior a320px.
- **BUG-070** — Texto do plano PRO é cortado no tablet.
- **BUG-071** — Seletores de telas do simulador truncados.
- **BUG-072** — Simulador corta ação do Meu Dia a390px.
- **BUG-073** — Próxima semana do simulador não indica mudança.
- **BUG-074** — Busca do simulador não filtra clientes.
- **BUG-075** — Simulador promete Maps sem mostrar atalho.
- **BUG-076** — Pedido de ajuste do simulador perde motivo/novo horário.
- **BUG-077** — Ticket médio do simulador calculado incorretamente.
- **BUG-078** — Previews divergem no repasse e lucro.
- **BUG-079** — Agenda demonstrativa de Carla conta4 e mostra2.
- **BUG-080** — Simulador usa plural para1atendimento.
- **BUG-081** — Profissão personalizada Casa recebe sugestõesPets.
- **BUG-082** — Guia de migração Equipe tem título Individual.

## 10. Responsividade

Há cortes/overflow em formulários e controles específicos de Clientes, Serviços, Agenda, Equipe, Configurações, Orçamentos, Guia, planos e simulador. Falhas foram associadas ao viewport e estado do menu; não se presume que todos os tamanhos ou páginas falhem. Ellipsis intencional isolada sem obstrução não foi mantida como bug.

## 11. UX

Mensagens de erro ausentes em submissões recusadas; JSON de validação exposto ao cadastrar parceiro com e-mail inválido; ação de revisão rotulada como reenvio mesmo com reenvio desmarcado; entrada de login abre cadastro em determinados caminhos; demonstrações contêm inconsistências de dados e textos.

## 12. Permissões

Equipes A e B foram verificadas com identidades proprietárias distintas. Marcadores privados da outra equipe não apareceram nas buscas/listas e verificações atribuíveis de dashboard/relatórios. Portal PRO, membro e papel limitado permanecem não verificados sem contexto autorizado compatível; a visualização demonstrativa de parceira não comprova autorização real. Identificadores/URLs privados de detalhes não expostos não foram inventados.

## 13. Persistência de dados

Defeitos observados incluem horários, validade, CEP, fotos e determinadas alterações de perfil. Outros registros QA específicos persistiram após refresh e nova entrada. Uma confirmação visual de sucesso, por si só, não foi aceita como aprovação.

## 14. WhatsApp

Somente preparação/simulação e conferência de dados, links e destinatário; nenhuma confirmação de envio real. Foram encontrados problemas de validação/persistência do número do perfil. Orçamento sem itens e estado Cancelado não foram presumidos: formulário exige item e não expõe ação separada de cancelamento no fluxo examinado.

## 15. Funcionalidades não testadas / não aplicáveis

- Pagamentos, cobranças, mensagens reais, compra PRO, resgate de voucher, zerar dados e ações destrutivas: excluídos por segurança/instrução.
- Portal PRO e permissões de membro/limitado: contexto/plano requerido indisponível; não validado por simulação.
- Recuperação/confirmar senha, produtos, ordem de serviço independente, controles específicos de ordenação/paginação/exclusão de serviço: não encontrados nas superfícies inventariadas; não inventar recursos.
- Alguns cenários de rede/fechamento integral do navegador dependem de capacidade da ferramenta; registrar lacuna, não aprovação.
- Ausência de controle de exclusão em movimentações: distinguir função não encontrada de falha ao excluir.

## 16. Recomendações prioritárias

1. Garantir idempotência e proteção contra múltiplos cliques nos lançamentos financeiros.
2. Reconciliar fonte, período e definição dos indicadores financeiros e relatórios.
3. Corrigir persistência/uso de disponibilidade e tratamento de datas de validade.
4. Aplicar validação explícita de valores, quantidades, contatos, PIX e limites, com mensagens compreensíveis.
5. Corrigir uploads e anexos; não confirmar sucesso quando parte do salvamento falha.
6. Verificar unicidade e resolução dos slugs públicos.
7. Corrigir overflow e acesso aos controles nos tamanhos afetados.
8. Executar avaliação real de papéis/portal PRO com contas autorizadas antes de afirmar cobertura de permissões.

## 17. Matriz final de cobertura

A matriz é descritiva por funcionalidade: a coluna APROVADOS enumera controles efetivamente comprovados, REPROVADOS referencia achados confirmados, e NÃO TESTADOS separa lacunas de funções não aplicáveis. As linhas transversais se sobrepõem; não somá-las como número de casos. O catálogo deduplicado da sessão possui 508 casos; não foi calculado um percentual global de aprovação, pois resultados mistos não admitem inferência segura apenas pelo status resumido.

| FUNCIONALIDADE | TESTES EXECUTADOS | APROVADOS (controles específicos) | REPROVADOS (bugs confirmados) | NÃO TESTADOS / NÃO APLICÁVEIS |
|---|---|---|---|---|
| Acesso, cadastro e sessão | Cadastro obrigatório/formato/limites/duplicidade; login correto/incorreto; logout; rotas internas | Campos obrigatórios e senha mínima bloqueiam; acesso administrativo exige credenciais | BUG-048, BUG-049 | Recuperação e confirmação de senha não encontradas; fechamento integral do navegador não integralmente comprovado |
| Onboarding e seleção de modo | Perfil, profissão, cidade, serviço; Individual/Equipe; navegação | Troca de modo e menus coerentes; avanço das etapas nas contas QA | BUG-057, BUG-060, BUG-081, BUG-082 | Nenhum papel real de membro criado pelo onboarding |
| Clientes | CRUD QA, cancelar exclusão, contatos, limites, busca, referências, refresh | Nome obrigatório; opcionais vazios; textos completos; busca por nome/e-mail/telefone; cancelamento e remoção QA | BUG-011, BUG-030, BUG-047, BUG-053, BUG-054 | Ordenação/paginação específica não encontrada |
| Serviços | Criar/editar; preço/duração; ativo/inativo; catálogo em orçamento; concorrência; refresh/relogin | Valores válidos persistem; serviço vinculado preserva referência/total; ativação/desativação | BUG-020, BUG-021, BUG-035 | Exclusão definitiva não encontrada |
| Orçamentos | Itens, quantidades/preços/desconto; cálculo; edição; excluir/cancelar; status/respostas públicas; persistência | Drafts persistem; exclusão e link excluído; aceite/recusa/ajuste; edição antes de compartilhamento | BUG-009, BUG-013, BUG-023, BUG-024, BUG-025, BUG-026, BUG-050 | Estado Cancelado e duplicação específica não encontrados; sem itens bloqueado pelo formulário |
| Agenda e Meu Dia | Criar; vistas/períodos; status; vínculos; refresh; concorrência; datas | Atendimento e status persistem; vistas mantêm vínculos; conversão de orçamento aceito; retry compatível sem duplicidade | BUG-006, BUG-007, BUG-014, BUG-027, BUG-052 | Simulação específica 503 teve limitação da ferramenta; virada de ano fora da disponibilidade não comprovou salvamento |
| Financeiro | Receita paga/pendente/parcial; despesa; valores; repetir cliques; refresh/relogin; gráficos | Lançamentos QA válidos específicos persistem; formas e estados consultados | BUG-001, BUG-002, BUG-016, BUG-017, BUG-022, BUG-036, BUG-037, BUG-055, BUG-083 | Nenhuma cobrança/pagamento real; exclusão de movimentação não encontrada |
| Relatórios | Datas/períodos; pagamentos conhecidos; ranking; novos clientes; isolamento A/B | Ranking e novos clientes nos cenários examinados; contribuição própria por equipe | BUG-003, BUG-004, BUG-015, BUG-061 | Não extrapolar isolamento observado para todos os papéis PRO |
| Equipe/Parceiros | Criar/editar parceiro; contatos/foto/comissão; filtro profissional; agenda; produção | Parceiro vinculado ao atendimento; produção mensal 650 = 300+150+200; comissão 370 e retenção 280 | BUG-019, BUG-031, BUG-032, BUG-039, BUG-051 | Parceiro não é usuário autenticável; membro/limitado/portal PRO indisponíveis sem plano compatível |
| Isolamento e autorização | Duas equipes e contas QA; buscas/listas/dashboard/relatórios; acesso direto exposto; /admin | Marcadores privados A/B não misturados nas superfícies testadas; /admin não expõe painel | BUG-008 (unicidade de slug; não prova invasão de conta) | Permissões reais de membro/limitado; recursos/IDs não expostos não inventados |
| Configurações, perfil e disponibilidade | Salvar/editar limites; slug; UF/cidade; WhatsApp; horários; refresh | Campos válidos específicos e navegação testados; não aprovar apenas toast | BUG-005, BUG-029, BUG-033, BUG-034, BUG-038, BUG-058, BUG-059 | Configurações permanentes não alteradas para facilitar testes |
| Cartão público e PIX | Copiar/abrir URL sem login; chave PIX; divulgação simulada; proteção de dados privados | URL copiada corresponde ao perfil; cópia PIX; ausência de campos privados no cartão examinado | BUG-028 | Transferências PIX e postagem externa excluídas; entrega de recibo por e-mail não comprovada |
| Solicitações, fotos e anexos | Pedido público QA; confirmação e localização interna; conversão; formatos e persistência | Solicitação localizada no proprietário; upload e limites exercitados sem dados reais | BUG-010, BUG-012, BUG-018, BUG-019, BUG-056 | Alguns formatos/limites sem suporte não equivalem a aprovação universal |
| WhatsApp (simulação) | Texto/destinatário/link/cliente/valor; alterações; ausência e formato de telefone | Handoff/preparação interceptados; nenhuma mensagem real; valores e referência conferidos nos cenários compatíveis | BUG-029, BUG-030, BUG-059 | Envio real excluído; cancelado/sem itens não criados artificialmente |
| Busca, filtros e carga moderada | 20 clientes, 20 serviços, 30 drafts multi-item; busca/status; editar/excluir QA adicional; retorno | Baseline preservada; totais multi-item conferidos; busca cliente C018 retorna cinco drafts; filtros e retorno verificados | BUG-013, BUG-014, BUG-015 | Não é benchmark nem teste de estresse; sem alegação quantitativa de desempenho |
| Responsividade | Desktop/notebook/tablet; celulares pequeno/médio/grande; menus/formulários/modais | Controles utilizáveis em diversos viewports; cartão público seis tamanhos; Agenda desktop/notebook/tablet/grande | BUG-040–BUG-046, BUG-062–BUG-072 | Não equivale a teste em aparelhos físicos ou todos os navegadores |
| Guias, simulador, planos e notificações | Tour/dicas/atalhos; simulador Individual/Equipe; voucher vazio; notificações vazias | Guia abre/reabre; atalho Serviços; notificações vazias e entradas de planos | BUG-060–BUG-082 conforme área; bugs demonstrativos separados dos dados reais | Compra PRO, resgate de voucher e configurações destrutivas excluídos |
| Rede, repetição e concorrência | Falha/atraso onde compatível; refresh; retry; duas abas; salvar repetido | Clientes e Agenda não duplicaram nos casos verificados; estado final entre abas conferido | BUG-001, BUG-002, BUG-037, BUG-038 | Condições de rede não suportadas e fechamento integral permanecem lacunas |
| Três personas finais | Iniciante: guia→cliente→serviço→draft; experiente: busca/retorno/cálculo multi-item; administrador: agenda→cliente→draft→financeiro→produção | Cinco casos integrados aprovados: guia; draft245,75 persistido; cinco drafts C018; retorno após Clientes; multi-item292,57−12,57=280 persistido. Administrador: vínculos e comissões conferidos. | BUG-083: cartões/lista financeiros não reconciliam gráfico e dashboard após refresh/retorno | Não repetir unidade já coberta como prova nova; isolamento de fixtures mantido |

## Apêndice — matriz de bugs

Os registros de evidência referem-se aos achados desta sessão, com reprodução independente para bugs funcionais e evidência de tela para flags estáticos. Não são links públicos de capturas. O CSV anexo permite triagem por severidade e área.

### BUG-001 — Salvar receita duas vezes duplica o lançamento

- **Severidade / tipo:** ALTO / Dados/financeiro.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Receita QA paga R$137,42.
- **Passos:** Abrir Registrar receita; preencher fixture QA; clicar rapidamente duas vezes em Salvar; atualizar e localizar as movimentações.
- **Esperado:** Uma submissão deve produzir uma receita.
- **Obtido:** Duas receitas persistem; Recebido aumenta R$274,84.
- **Evidência:** Registro de achado nesta sessão: Clique duplo em Salvar receita cria receitas duplicadas.
- **Reprodução:** Reprodução independente registrada.

### BUG-002 — Cliques repetidos duplicam despesas

- **Severidade / tipo:** ALTO / Dados/financeiro.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Despesa QA R$47,83.
- **Passos:** Abrir Nova despesa; preencher dados QA; clicar Salvar três vezes rapidamente; atualizar e localizar.
- **Esperado:** Uma submissão deve produzir uma despesa.
- **Obtido:** Três despesas idênticas persistem.
- **Evidência:** Registro de achado nesta sessão: Repeated Salvar despesa clicks create duplicate expense entries.
- **Reprodução:** Reprodução independente registrada.

### BUG-003 — Relatório diário não reconcilia pagamentos

- **Severidade / tipo:** ALTO / Dados/cálculo.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /relatorios.
- **Dados:** Fixture c35e: Pago100; Pendente50,50; atendimento1234,56; 05/10/2026.
- **Passos:** Abrir Relatórios; filtrar 05/10/2026; comparar os indicadores com os pagamentos fictícios conhecidos; repetir.
- **Esperado:** Indicadores devem seguir as definições de pagamentos e reconciliar valores do período.
- **Obtido:** Exibe Faturamento1285,06, Recebido0 e Pendente1285,06; esperado pelos pagamentos150,50/100/50,50.
- **Evidência:** Registro de achado nesta sessão: Reports miscalculates same-day payment totals and omits paid amount from Recebido.
- **Reprodução:** Reprodução independente registrada.

### BUG-004 — Editar a data inicial quebra Relatórios

- **Severidade / tipo:** ALTO / Funcional/estabilidade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /relatorios.
- **Dados:** Campo De, entrada segmentada.
- **Passos:** Abrir Relatórios; editar segmentos do campo De como no registro; recarregar e repetir.
- **Esperado:** Editar data não deve quebrar a página.
- **Obtido:** RangeError visível; falha repetida após recarga.
- **Evidência:** Registro de achado nesta sessão: Relatórios crashes with RangeError when editing De date segments.
- **Reprodução:** Reprodução independente registrada.

### BUG-005 — Disponibilidade válida não persiste

- **Severidade / tipo:** ALTO / Persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Intervalo QA09:15–17:45 na verificação entre sessões.
- **Passos:** Alterar horários para intervalo válido; salvar; atualizar; sair e entrar no caso de persistência; conferir.
- **Esperado:** Horários confirmados como salvos permanecem.
- **Obtido:** Toast Horários salvos; intervalo anterior08–18 retorna.
- **Evidência:** Registro de achado nesta sessão: Valid availability hours revert after a successful save and refresh.
- **Reprodução:** Reprodução independente registrada.

### BUG-006 — Atendimento livre é rejeitado dentro do horário exibido

- **Severidade / tipo:** ALTO / Regra de negócio.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /agenda.
- **Dados:** 06/10 às11:30; duração60; disponibilidade08–18.
- **Passos:** Conferir disponibilidade e slot livre; preencher Novo atendimento com fixtures QA; salvar; repetir e atualizar.
- **Esperado:** Atendimento dentro da disponibilidade deve ser aceito.
- **Obtido:** Fora da disponibilidade nas duas tentativas; nenhum registro criado.
- **Evidência:** Registro de achado nesta sessão: Free appointment within configured availability is rejected as outside availability.
- **Reprodução:** Reprodução independente registrada.

### BUG-007 — Equipe B rejeita atendimento no intervalo disponível

- **Severidade / tipo:** ALTO / Regra de negócio.
- **Modo / perfil:** Equipe B / Proprietário QA.
- **Página:** /agenda.
- **Dados:** 07/10/2026 10:30;60min; disponibilidade08–18.
- **Passos:** Conferir Configurações; selecionar parceiro/cliente/serviço QA; preencher horário; salvar; repetir e conferir semana.
- **Esperado:** Permitir o horário compatível com a disponibilidade exibida.
- **Obtido:** Formulário fica aberto com aviso de indisponibilidade; não cria atendimento.
- **Evidência:** Registro de achado nesta sessão: Agenda rejeita atendimento dentro do horário de disponibilidade exibido para a Equipe B.
- **Reprodução:** Reprodução independente registrada.

### BUG-008 — Slug de outra conta QA é aceito

- **Severidade / tipo:** ALTO / Dados/identidade pública.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Duas contas QA; slug previamente atribuído à outra.
- **Passos:** Identificar slug público da segunda conta QA; salvar esse slug no perfil da primeira; atualizar; conferir prévia; restaurar.
- **Esperado:** Rejeitar colisão ou assegurar identidade pública única.
- **Obtido:** Slug persiste e prévia aponta para o mesmo URL; não foi comprovada exposição privada.
- **Evidência:** Registro de achado nesta sessão: Profile settings save a slug already assigned to another QA account without rejecting the collision.
- **Reprodução:** Reprodução independente registrada.

### BUG-009 — Validade avança um dia após salvar

- **Severidade / tipo:** MÉDIO / Dados/data.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** 31/12/2027.
- **Passos:** Criar draft QA com validade31/12/2027; desmarcar envio; salvar; reabrir revisão; atualizar e reabrir.
- **Esperado:** Validade mantém31/12/2027.
- **Obtido:** Reabertura mostra01/01/2028.
- **Evidência:** Registro de achado nesta sessão: Validade do orçamento avança um dia após salvar e reabrir rascunho.
- **Reprodução:** Reprodução independente registrada.

### BUG-010 — Solicitação não reflete proposta aceita

- **Severidade / tipo:** MÉDIO / Funcional/sincronização.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /solicitacoes.
- **Dados:** Solicitação/proposta fictícia aceita publicamente.
- **Passos:** Preparar solicitação QA; gerar proposta segura; aceitar no contexto público QA; voltar a Solicitações e atualizar.
- **Esperado:** Status deve refletir aprovação.
- **Obtido:** Badge e seletor permanecem Orçamento enviado.
- **Evidência:** Registro de achado nesta sessão: Accepted public proposal remains at Orçamento enviado in Solicitações.
- **Reprodução:** Reprodução independente registrada.

### BUG-011 — CEP desaparece após salvar cliente

- **Severidade / tipo:** MÉDIO / Persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** 01001-000.
- **Passos:** Criar cliente QA com CEP; salvar; reabrir Editar; atualizar e reabrir.
- **Esperado:** CEP informado continua salvo.
- **Obtido:** CEP fica vazio embora tenha sido formatado e preenchido endereço.
- **Evidência:** Registro de achado nesta sessão: Client CEP is not persisted and disappears from edit form.
- **Reprodução:** Reprodução independente registrada.

### BUG-012 — Anexo PNG de solicitação não abre

- **Severidade / tipo:** MÉDIO / Arquivos/funcional.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /solicitacoes.
- **Dados:** Imagem geométrica QA-RequestImage-766485.png.
- **Passos:** Submeter solicitação pública QA com PNG sintética; abrir Solicitações do proprietário; clicar arquivo; atualizar e repetir.
- **Esperado:** Abrir imagem anexada.
- **Obtido:** Cannot GET no link /api/attachments/temp/...png.
- **Evidência:** Registro de achado nesta sessão: Public request PNG attachment link opens Cannot GET instead of displaying the image.
- **Reprodução:** Reprodução independente registrada.

### BUG-013 — Busca de orçamento por item não encontra draft

- **Severidade / tipo:** MÉDIO / Busca.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** Serviço QA presente em item de draft.
- **Passos:** Criar draft próprio com serviço identificável; salvar sem envio; buscar nome exato do item; limpar; reabrir o draft.
- **Esperado:** Busca anunciada para itens encontra o orçamento.
- **Obtido:** Busca vazia; limpar mostra draft e editor confirma item.
- **Evidência:** Registro de achado nesta sessão: Quote search by item name does not return a draft that includes the searched service.
- **Reprodução:** Reprodução independente registrada.

### BUG-014 — Limpar período omite atendimentos confirmados

- **Severidade / tipo:** MÉDIO / Dados/filtro.
- **Modo / perfil:** Equipe B / Proprietário QA.
- **Página:** /relatorios.
- **Dados:** Atendimento QA confirmado em08/10/2026.
- **Passos:** Filtrar dia conhecido com atendimento; clicar Limpar; esperar; atualizar e repetir; conferir Agenda.
- **Esperado:** Sem filtro incluir registros conforme ajuda.
- **Obtido:** Relatório fica0 e serviços vazios; atendimento continua Confirmado na Agenda.
- **Evidência:** Registro de achado nesta sessão: Reports omits confirmed appointments when the date range is cleared.
- **Reprodução:** Reprodução independente registrada.

### BUG-015 — Filtro somente inicial omite pagamento pago

- **Severidade / tipo:** MÉDIO / Dados/filtro.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /relatorios.
- **Dados:** PagoR$100 em05/10/2026.
- **Passos:** Usar somente De05/10/2026; comparar com somente Até06/10/2026; limpar e repetir.
- **Esperado:** Pagamento dentro do intervalo aberto deve ser incluído.
- **Obtido:** De sozinho omiteR$100; Até sozinho inclui.
- **Evidência:** Registro de achado nesta sessão: Relatórios omite pagamento pago na data inicial quando apenas data inicial está definida.
- **Reprodução:** Reprodução independente registrada.

### BUG-016 — Gráfico pendente fica desatualizado após receita parcial

- **Severidade / tipo:** MÉDIO / Sincronização visual/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Receita fictícia Parcial.
- **Passos:** Observar tooltip Pendentes; salvar receita Parcial; comparar movimento/KPI/tooltip; atualizar.
- **Esperado:** Gráfico e KPI atualizam juntos.
- **Obtido:** Movimento/KPI atualizam; tooltip só muda após refresh.
- **Evidência:** Registro de achado nesta sessão: Financeiro daily pending-revenue chart remains stale after saving a partial receipt.
- **Reprodução:** Reprodução independente registrada.

### BUG-017 — Gráfico de despesas fica desatualizado após salvar

- **Severidade / tipo:** MÉDIO / Sincronização visual/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Despesas QA únicas.
- **Passos:** Observar gráfico; salvar despesas QA; comparar resumo e movimentos; atualizar; repetir com sufixo novo.
- **Esperado:** Gráfico acompanha lançamentos salvos.
- **Obtido:** Resumo/movimentos atualizam; tooltip despesas conserva total anterior até refresh.
- **Evidência:** Registro de achado nesta sessão: Financeiro expense chart remains stale after successful expense saves until the page is refreshed.
- **Reprodução:** Reprodução independente registrada.

### BUG-018 — Foto profissional não persiste apesar de confirmação

- **Severidade / tipo:** MÉDIO / Upload/persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Foto sintética em formato permitido.
- **Passos:** Selecionar foto QA válida; salvar perfil; conferir avatar; atualizar e reabrir.
- **Esperado:** Foto é aplicada/persistida ou erro explicado.
- **Obtido:** Foto ausente; interface confirma salvamento.
- **Evidência:** Registro de achado nesta sessão: Foto do perfil profissional não é aplicada nem persiste após salvar.
- **Reprodução:** Reprodução independente registrada.

### BUG-019 — Foto PNG do parceiro não persiste

- **Severidade / tipo:** MÉDIO / Upload/persistência.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** PNG QA válida.
- **Passos:** Cadastrar parceiro fictício com PNG válida; atualizar; reabrir perfil.
- **Esperado:** Foto fica associada ao parceiro.
- **Obtido:** Avatar Q e foto não associada após reabertura; campo vazio sozinho não foi usado como prova.
- **Evidência:** Registro de achado nesta sessão: PNG válido do perfil do parceiro não persiste após cadastrar.
- **Reprodução:** Reprodução independente registrada.

### BUG-020 — Preço alfabético resulta em serviço de valor zero

- **Severidade / tipo:** MÉDIO / Validação/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** Texto alfabético no preço.
- **Passos:** Preencher novo serviço QA válido; digitar letras em preço; salvar; atualizar.
- **Esperado:** Avisar entrada inválida, sem gravar valor involuntário.
- **Obtido:** Letras descartadas e serviço ativoR$0,00 persiste sem aviso.
- **Evidência:** Registro de achado nesta sessão: Alphabetic service price is silently ignored and saved as R$ 0,00.
- **Reprodução:** Reprodução independente registrada.

### BUG-021 — Preço negativo do serviço vira positivo

- **Severidade / tipo:** MÉDIO / Validação/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** Preço negativo QA.
- **Passos:** Criar serviço QA; informar preço negativo; salvar; atualizar e conferir.
- **Esperado:** Rejeitar negativo ou explicar normalização.
- **Obtido:** Preço positivo salvo e persistido silenciosamente.
- **Evidência:** Registro de achado nesta sessão: Negative service prices are silently converted to positive amounts and saved.
- **Reprodução:** Reprodução independente registrada.

### BUG-022 — Receita negativa vira positiva e persiste

- **Severidade / tipo:** MÉDIO / Validação/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** -1,00.
- **Passos:** Abrir Registrar receita; preencher fixture QA; informar-1,00; salvar; atualizar.
- **Esperado:** Validar valor negativo explicitamente.
- **Obtido:** Campo vira1,00 e receita pendente positiva persiste.
- **Evidência:** Registro de achado nesta sessão: Negative revenue amount silently becomes positive and is saved.
- **Reprodução:** Reprodução independente registrada.

### BUG-023 — Quantidade negativa gera subtotal negativo

- **Severidade / tipo:** MÉDIO / Validação/cálculo.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** Item80; quantidade-1.
- **Passos:** Abrir novo draft; inserir item80; quantidade-1; desfocar e esperar; fechar sem salvar.
- **Esperado:** Impedir quantidade inválida e apresentar feedback.
- **Obtido:** Subtotal-80, total0 e nenhum aviso.
- **Evidência:** Registro de achado nesta sessão: Negative orçamento item quantity produces negative subtotal without validation.
- **Reprodução:** Reprodução independente registrada.

### BUG-024 — Quantidade decimal brasileira zera cálculo

- **Severidade / tipo:** MÉDIO / Cálculo/formato.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** Quantidade decimal com vírgula e equivalente com ponto.
- **Passos:** Inserir item em orçamento QA; usar quantidade decimal com vírgula; comparar com ponto; conferir subtotal/total.
- **Esperado:** Entrada brasileira válida calcula de forma consistente.
- **Obtido:** Vírgula dá subtotal/total0; ponto calcula corretamente.
- **Evidência:** Registro de achado nesta sessão: Orçamento zera subtotal e total ao usar vírgula na quantidade decimal.
- **Reprodução:** Reprodução independente registrada.

### BUG-025 — Preço unitário inválido é normalizado sem aviso

- **Severidade / tipo:** MÉDIO / Validação/cálculo.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** -25,50;12,34.56.
- **Passos:** Abrir novo draft QA; editar preço; desfocar; conferir cálculo; repetir negativo em novo formulário; não salvar.
- **Esperado:** Rejeitar ou explicar entrada inválida.
- **Obtido:** -25,50 vira25,50;12,34.56 vira12,35 sem feedback.
- **Evidência:** Registro de achado nesta sessão: Preço unitário do orçamento converte valores negativos e formatos inválidos sem validação.
- **Reprodução:** Reprodução independente registrada.

### BUG-026 — Desconto negativo ou acima do subtotal não é validado

- **Severidade / tipo:** MÉDIO / Validação/cálculo.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** Subtotal80; desconto-10 e100.
- **Passos:** Abrir draft QA subtotal80; inserir-10; depois100; desfocar e esperar; fechar sem salvar.
- **Esperado:** Validar intervalo do desconto.
- **Obtido:** -10 vira10 e total70;100 aceito e total0 sem aviso.
- **Evidência:** Registro de achado nesta sessão: Orçamento accepts out-of-range discount values without validation.
- **Reprodução:** Reprodução independente registrada.

### BUG-027 — Valor de atendimento altera entradas inválidas sem aviso

- **Severidade / tipo:** MÉDIO / Validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /agenda.
- **Dados:** -100,00;abc,12.
- **Passos:** Abrir Novo atendimento; editar Valor; desfocar e esperar5s; não salvar.
- **Esperado:** Feedback para valor inválido.
- **Obtido:** -100 vira100 eabc,12 vira0,12 sem aviso.
- **Evidência:** Registro de achado nesta sessão: Agenda: campo Valor converte entradas negativas e malformadas silenciosamente.
- **Reprodução:** Reprodução independente registrada.

### BUG-028 — PIX CNPJ malformado é confirmado como salvo

- **Severidade / tipo:** MÉDIO / Validação/persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** TipoCNPJ; chaveabc.
- **Passos:** Selecionar CNPJ; informarabc; salvar; atualizar; restaurar baseline QA.
- **Esperado:** Validar chave conforme tipo.
- **Obtido:** Configurações salvas eabc persiste.
- **Evidência:** Registro de achado nesta sessão: Malformed PIX key is accepted and reported as saved.
- **Reprodução:** Reprodução independente registrada.

### BUG-029 — WhatsApp do perfil aceita números malformados

- **Severidade / tipo:** MÉDIO / Validação/WhatsApp.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** 000;12345;12abc45.
- **Passos:** Editar WhatsApp com cada valor inválido; salvar; atualizar; restaurar número QA.
- **Esperado:** Rejeitar ou informar formato incompleto.
- **Obtido:** Valores inválidos persistem com sucesso anunciado.
- **Evidência:** Registro de achado nesta sessão: Incomplete and malformed WhatsApp numbers are accepted and persisted in the Individual profile.
- **Reprodução:** Reprodução independente registrada.

### BUG-030 — Telefone incompleto do cliente persiste sem aviso

- **Severidade / tipo:** MÉDIO / Validação/contato.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** 123.
- **Passos:** Criar cliente QA com telefone123; salvar; atualizar e buscar.
- **Esperado:** Avisar telefone incompleto.
- **Obtido:** Card mantém(12)3 sem feedback.
- **Evidência:** Registro de achado nesta sessão: Client incomplete telephone number is accepted and saved.
- **Reprodução:** Reprodução independente registrada.

### BUG-031 — Telefone incompleto cria parceiro ativo

- **Severidade / tipo:** MÉDIO / Validação/contato.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** (11)9876.
- **Passos:** Cadastrar parceiro QA com telefone incompleto; conferir registro; repetir com fixture nova.
- **Esperado:** Validar telefone informado.
- **Obtido:** Parceiro ativo salvo com sucesso; não atribuir contagem global a fixtures próprias.
- **Evidência:** Registro de achado nesta sessão: Incomplete partner phone number is accepted and creates an active profile.
- **Reprodução:** Reprodução independente registrada.

### BUG-032 — Comissão fora de0–100 não recebe feedback

- **Severidade / tipo:** MÉDIO / Validação/regra.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** -1%;101%.
- **Passos:** Abrir parceiro novo; selecionar comissão personalizada; inserir valores; desfocar e esperar; fechar sem salvar.
- **Esperado:** Avisar comissão fora do limite anunciado.
- **Obtido:** Valores permanecem destacados como selecionados sem aviso; não se afirma persistência.
- **Evidência:** Registro de achado nesta sessão: Out-of-range custom partner commissions remain displayed as the selected commission without understandable user-facing validation.
- **Reprodução:** Reprodução independente registrada.

### BUG-033 — Horários inválidos recebem confirmação de sucesso

- **Severidade / tipo:** MÉDIO / Validação/persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Incompleto; iguais;09:00–08:00.
- **Passos:** Informar intervalos inválidos; salvar; conferir toast; atualizar; restaurar baseline.
- **Esperado:** Rejeitar intervalos inválidos com explicação.
- **Obtido:** Horários salvos mesmo inválidos; refresh retorna intervalo original.
- **Evidência:** Registro de achado nesta sessão: Salvar horários confirma intervalos de disponibilidade inválidos sem feedback de validação.
- **Reprodução:** Reprodução independente registrada.

### BUG-034 — Nome longo do perfil é descartado silenciosamente

- **Severidade / tipo:** MÉDIO / Validação/persistência.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Nome QA239caracteres.
- **Passos:** Inserir nome longo; salvar; atualizar; repetir; restaurar.
- **Esperado:** Persistir ou informar limite/erro.
- **Obtido:** Sem aviso e nome anterior retorna após refresh.
- **Evidência:** Registro de achado nesta sessão: Saving a long profile name fails silently and the field reverts after refresh.
- **Reprodução:** Reprodução independente registrada.

### BUG-035 — Duração zero/decimal do serviço falha sem explicação

- **Severidade / tipo:** MÉDIO / Validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** 0 e2,5min; preço0,00 explícito na repetição.
- **Passos:** Criar serviço QA com duração0/2,5; salvar; fechar; buscar antes/depois refresh; repetir.
- **Esperado:** Explicar duração inválida.
- **Obtido:** Formulário fica aberto sem feedback e registro não existe.
- **Evidência:** Registro de achado nesta sessão: Salvar serviço deixa o formulário aberto sem feedback nem resultado para durações zero ou decimal.
- **Reprodução:** Reprodução independente registrada.

### BUG-036 — Receita de valor extremo é recusada sem feedback

- **Severidade / tipo:** MÉDIO / Validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** 999.999.999.999,99.
- **Passos:** Registrar receita fictícia com valor extremo; salvar duas vezes; atualizar e procurar.
- **Esperado:** Informar limite/erro compreensível.
- **Obtido:** Dialog permanece sem sucesso/erro; nenhuma movimentação correspondente.
- **Evidência:** Registro de achado nesta sessão: Extreme revenue amount is silently rejected without feedback.
- **Reprodução:** Reprodução independente registrada.

### BUG-037 — Falha de resposta ao salvar despesa não é informada

- **Severidade / tipo:** MÉDIO / Rede/recuperação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Resposta503 simulada localmente.
- **Passos:** Preencher despesa QA; simular503 no salvamento; conferir feedback; remover simulação e tentar novamente.
- **Esperado:** Mostrar erro e permitir tentativa segura.
- **Obtido:** Sem aviso de falha; retry normal salva uma vez.
- **Evidência:** Registro de achado nesta sessão: Failed expense submission shows no user-visible failure feedback.
- **Reprodução:** Reprodução independente registrada.

### BUG-038 — Falha de salvamento de perfil não mostra erro

- **Severidade / tipo:** MÉDIO / Rede/recuperação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Resposta500 simulada; descrição QA.
- **Passos:** Simular falha de salvamento; salvar descrição; conferir tela; restaurar resposta; retry; restaurar descrição.
- **Esperado:** Mostrar falha/recovery.
- **Obtido:** Nenhum erro visível; retry funciona.
- **Evidência:** Registro de achado nesta sessão: Failed profile save shows no user-facing error feedback.
- **Reprodução:** Reprodução independente registrada.

### BUG-039 — Nome longo do parceiro torna receita inacessível

- **Severidade / tipo:** MÉDIO / Responsividade/funcional.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Parceiro QA com nome longo.
- **Passos:** Abrir Registrar receita; selecionar parceiro longo; conferir largura e açãoSalvar.
- **Esperado:** Dialog deve conter controles alcançáveis.
- **Obtido:** Conteúdo ultrapassa borda eSalvar não aparece na área visível.
- **Evidência:** Registro de achado nesta sessão: Selecting a long-named partner in Registrar receita overflows and clips the dialog content.
- **Reprodução:** Reprodução independente registrada.

### BUG-040 — Formulário de perfil é cortado no celular390px

- **Severidade / tipo:** MÉDIO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** 390×844.
- **Passos:** Abrir Configurações nesse viewport; percorrer formulário e tentar revelar área direita por rolagem.
- **Esperado:** Campos completos e acessíveis.
- **Obtido:** Foto/nome/profissão/link/localização cortados; rolagem não revela conteúdo.
- **Evidência:** Registro de achado nesta sessão: Professional profile form is clipped at the right edge on 390px mobile viewport.
- **Reprodução:** Reprodução independente registrada.

### BUG-041 — Cadastro público tem controles cortados a320px

- **Severidade / tipo:** MÉDIO / Responsividade.
- **Modo / perfil:** Público / Visitante sem login.
- **Página:** /.
- **Dados:** 320×640.
- **Passos:** Abrir cadastro; inspecionar controles; alternar login e voltar.
- **Esperado:** Formulário cabe no modal.
- **Obtido:** Controles de cadastro cortados de forma estável.
- **Evidência:** Registro de achado nesta sessão: Registration modal form controls are clipped at the right edge on 320px mobile viewport.
- **Reprodução:** Reprodução independente registrada.

### BUG-042 — Equipe perde controles no tablet com menu expandido

- **Severidade / tipo:** MÉDIO / Responsividade.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** 768×1024;sidebar expandida.
- **Passos:** Abrir Equipe com menu expandido; conferir cabeçalho/filtroGeral; recolher e comparar.
- **Esperado:** Controles cabem no estado padrão.
- **Obtido:** Geral parcialmente fora; avatar cortado; rótulos quebram.
- **Evidência:** Registro de achado nesta sessão: Tablet: cabeçalho e seletor de período de Equipe / Parceiros ficam cortados a 768×1024.
- **Reprodução:** Reprodução independente registrada.

### BUG-043 — Configurações sobrepõe cabeçalho e comprime cartões no tablet

- **Severidade / tipo:** MÉDIO / Responsividade.
- **Modo / perfil:** Individual/Equipe / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** 768×1024;sidebar expandida.
- **Passos:** Abrir Configurações; conferir barra e cartões; aguardar; comparar menu recolhido.
- **Esperado:** Informações legíveis sem sobreposição.
- **Obtido:** Guia encobre título e cartões comprimidos; recolher melhora parcialmente.
- **Evidência:** Registro de achado nesta sessão: Tablet Configurações header overlaps actions and compresses mode cards.
- **Reprodução:** Reprodução independente registrada.

### BUG-044 — Clientes corta controles no tablet

- **Severidade / tipo:** MÉDIO / Visual estático.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** 768×1024.
- **Passos:** Abrir Clientes nesse viewport com navegação padrão; inspecionar borda direita.
- **Esperado:** Controles dentro da tela.
- **Obtido:** Controles à direita cortados.
- **Evidência:** Registro de achado nesta sessão: A página de Clientes corta controles à direita em viewport tablet de 768 px.
- **Reprodução:** Flag estático com evidência visual.

### BUG-045 — Novo orçamento fica cortado no tablet

- **Severidade / tipo:** MÉDIO / Visual estático.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** 768×1024.
- **Passos:** Abrir Orçamentos nesse viewport; inspecionar ação principal.
- **Esperado:** Ação principal completamente acessível.
- **Obtido:** Botão cortado pela borda direita.
- **Evidência:** Registro de achado nesta sessão: No tablet em 768×1024, o botão principal “Novo orçamento” fica cortado pela borda direita da tela..
- **Reprodução:** Flag estático com evidência visual.

### BUG-046 — Agenda corta seta de próximo período a320px

- **Severidade / tipo:** MÉDIO / Visual estático.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /agenda.
- **Dados:** 320px;Semana.
- **Passos:** Abrir Agenda; selecionar Semana; inspecionar próxima seta.
- **Esperado:** Controle de período visível.
- **Obtido:** Seta cortada na borda direita.
- **Evidência:** Registro de achado nesta sessão: Agenda's “Próximo período” arrow is clipped at the right edge on 320px-wide mobile view in Semana..
- **Reprodução:** Flag estático com evidência visual.

### BUG-047 — Cliente longo fica ilegível no seletor de orçamento

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** 375×812;nome QA longo.
- **Passos:** Abrir Novo orçamento; abrir seletorCliente; localizar nome longo.
- **Esperado:** Identificar opção completa ou oferecer alternativa de leitura.
- **Obtido:** Nome cortado sem tooltip/rolagem para revelá-lo.
- **Evidência:** Registro de achado nesta sessão: Long client name is clipped in the new quote client picker at 375×812.
- **Reprodução:** Reprodução independente registrada.

### BUG-048 — Entrar do cabeçalho abre cadastro

- **Severidade / tipo:** BAIXO / UX/navegação.
- **Modo / perfil:** Público / Visitante sem login.
- **Página:** /.
- **Dados:** Sem credenciais.
- **Passos:** ClicarEntrar no cabeçalho; conferir aba/formulário.
- **Esperado:** Abrir login.
- **Obtido:** AbreCriarConta; login exige seleção manual.
- **Evidência:** Registro de achado nesta sessão: Header Entrar opens the access dialog on the Criar Conta tab.
- **Reprodução:** Reprodução independente registrada.

### BUG-049 — Saída abre cadastro em vez de login

- **Severidade / tipo:** BAIXO / UX/navegação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /?login=true.
- **Dados:** Conta QA modalidade.
- **Passos:** Sair da conta QA; conferir URL e aba inicial do diálogo.
- **Esperado:** Entrada de login após saída.
- **Obtido:** URLlogin=true abreCriarConta persistentemente.
- **Evidência:** Registro de achado nesta sessão: Logout with ?login=true opens account creation instead of sign-in.
- **Reprodução:** Reprodução independente registrada.

### BUG-050 — Revisão continua rotulada como reenvio quando desmarcado

- **Severidade / tipo:** BAIXO / UX.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /orcamentos.
- **Dados:** Draft QA;Reenviar desmarcado.
- **Passos:** Abrir revisão; desmarcarReenviar; conferir ação; salvar draft seguro; refresh/repetir.
- **Esperado:** Rótulo corresponde ao salvamento sem envio.
- **Obtido:** Reenviar proposta revisada apesar de salvar como draft sem reenvio.
- **Evidência:** Registro de achado nesta sessão: Primary quote-edit action still says resend when resend is unchecked.
- **Reprodução:** Reprodução independente registrada.

### BUG-051 — E-mail inválido do parceiro exibe JSON interno

- **Severidade / tipo:** BAIXO / UX/validação.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** E-mail QA inválido.
- **Passos:** Preencher parceiro fictício com e-mail inválido; cadastrar; repetir.
- **Esperado:** Mensagem curta e compreensível.
- **Obtido:** Toast contémJSON code/format/regex; parceiro não criado.
- **Evidência:** Registro de achado nesta sessão: Partner email validation toast exposes raw JSON instead of user-facing error.
- **Reprodução:** Reprodução independente registrada.

### BUG-052 — Agenda vazia mostra aviso errado para campos ausentes

- **Severidade / tipo:** BAIXO / UX/validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /agenda.
- **Dados:** Cliente/Serviço vazios.
- **Passos:** Abrir Novo atendimento; salvar semCliente/Serviço; repetir.
- **Esperado:** Identificar campos ausentes.
- **Obtido:** SomenteFora da disponibilidade; nenhum atendimento criado.
- **Evidência:** Registro de achado nesta sessão: Empty appointment form reports only availability warning, not missing Cliente and Serviço.
- **Reprodução:** Reprodução independente registrada.

### BUG-053 — E-mail inválido do cliente falha sem feedback

- **Severidade / tipo:** BAIXO / UX/validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** email-sem-formato.
- **Passos:** Editar cliente QA; informar e-mail inválido; salvar; esperar; repetir.
- **Esperado:** Explicar formato inválido.
- **Obtido:** Dialog aberto sem feedback; e-mail inválido não persiste.
- **Evidência:** Registro de achado nesta sessão: Malformed client email save gives no validation feedback.
- **Reprodução:** Reprodução independente registrada.

### BUG-054 — Nome de cliente com um caractere é recusado sem aviso

- **Severidade / tipo:** BAIXO / UX/validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** Z.
- **Passos:** Criar cliente de nomeZ; salvar; esperar; repetir; pesquisar após refresh.
- **Esperado:** Explicar mínimo de caracteres.
- **Obtido:** Nenhuma mensagem; formulário aberto e cliente ausente.
- **Evidência:** Registro de achado nesta sessão: New client silently rejects one-character name without validation feedback.
- **Reprodução:** Reprodução independente registrada.

### BUG-055 — Despesa zero usa mensagem de campos ausentes

- **Severidade / tipo:** BAIXO / UX/validação.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** Descrição QA preenchida;valor0.
- **Passos:** Enviar despesa com descrição e0; repetir com outrafixture; conferirlista.
- **Esperado:** Identificar valor zero como motivo.
- **Obtido:** Informe descrição e valor apesar de descrição preenchida; nada salvo.
- **Evidência:** Registro de achado nesta sessão: Zero-value expense validation reports populated description as missing.
- **Reprodução:** Reprodução independente registrada.

### BUG-056 — BMP do perfil não recebe aviso de formato

- **Severidade / tipo:** BAIXO / UX/upload.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** BMP sintético.
- **Passos:** SelecionarBMP em Foto; conferir nome/feedback/avatar.
- **Esperado:** Informar formato não suportado.
- **Obtido:** Nome do arquivo aparece, avatarplaceholder e nenhum aviso claro.
- **Evidência:** Registro de achado nesta sessão: BMP selecionado em Foto do perfil não mostra feedback de rejeição.
- **Reprodução:** Reprodução independente registrada.

### BUG-057 — Cidade manual do onboarding remove espaços

- **Severidade / tipo:** BAIXO / Dados/formulário.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** Onboarding.
- **Dados:** Cidade QA Águas-SP.
- **Passos:** Abrir cidade manual; digitar nome com espaços; esperar; repetir incluindo teclaSpace.
- **Esperado:** Manter espaços internos do nome.
- **Obtido:** CidadeQAÁguas-SP.
- **Evidência:** Registro de achado nesta sessão: Digitação normal no campo de cidade manual remove espaços do nome informado.
- **Reprodução:** Reprodução independente registrada.

### BUG-058 — Cidade manual do perfil remove espaços

- **Severidade / tipo:** BAIXO / Dados/formulário.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Vila Árvore Azul QA-RJ.
- **Passos:** Digitar cidade manual com espaços; conferircampo/indicador; salvarQAconforme registro.
- **Esperado:** Manter nome da cidade.
- **Obtido:** VilaÁrvoreAzulQA-RJ.
- **Evidência:** Registro de achado nesta sessão: Manual city entry strips spaces in professional profile settings.
- **Reprodução:** Reprodução independente registrada.

### BUG-059 — Apagar WhatsApp do perfil restaura número sem explicação

- **Severidade / tipo:** BAIXO / UX/WhatsApp.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /configuracoes.
- **Dados:** Número QA baseline.
- **Passos:** Selecionar conteúdoWhatsApp; apagar; conferir antes de salvar.
- **Esperado:** Permitir limpeza ou explicar obrigatoriedade.
- **Obtido:** Número anterior reaparece imediatamente semfeedback.
- **Evidência:** Registro de achado nesta sessão: WhatsApp profile number silently reverts when cleared.
- **Reprodução:** Reprodução independente registrada.

### BUG-060 — Corretor informa acento ao capitalizar identificador

- **Severidade / tipo:** BAIXO / UX/dados.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** bb-quotes-edit-clean-repro-QA7K4M Serviço;preço10.
- **Passos:** Digitar nome com prefixobb-; desfocar; conferirtoast; salvarQA;refresh.
- **Esperado:** Mensagem deve descrever correção real e preservar identificador quando apropriado.
- **Obtido:** PrefixoBb-;toastAcentuação corrigida automaticamente; alteração persiste.
- **Evidência:** Registro de achado nesta sessão: Service spell checker capitalizes lowercase identifier and falsely reports accent correction.
- **Reprodução:** Reprodução independente registrada.

### BUG-061 — Definição de cliente recorrente diverge entre cartão e ajuda

- **Severidade / tipo:** BAIXO / UX/copy.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /relatorios.
- **Dados:** Cartão eComo funciona.
- **Passos:** AbrirRelatórios; lerdescriçãoClientesrecorrentes; abrirajuda;refresh.
- **Esperado:** Uma definição consistente.
- **Obtido:** Cartão pelo menos1;ajuda maisde1 atendimento.
- **Evidência:** Registro de achado nesta sessão: Divergent definitions for Clientes recorrentes in Reports card and help.
- **Reprodução:** Reprodução independente registrada.

### BUG-062 — Guia encobre título Financeiro a320px

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /financeiro.
- **Dados:** 320×568.
- **Passos:** AbrirFinanceiro nesseviewport;esperar;atualizar.
- **Esperado:** Título legível.
- **Obtido:** SóFinan visível.
- **Evidência:** Registro de achado nesta sessão: Financeiro header title is obscured by Guia at 320px viewport.
- **Reprodução:** Reprodução independente registrada.

### BUG-063 — Guia encobre Serviços a375px

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** 375×812.
- **Passos:** AbrirServiços nesseviewport; esperar estabilizar.
- **Esperado:** Título legível.
- **Obtido:** Final deServiços encoberto.
- **Evidência:** Registro de achado nesta sessão: Serviços header title is obscured by Guia at 375px mobile viewport.
- **Reprodução:** Reprodução independente registrada.

### BUG-064 — Guia encobre Serviços no tablet

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /servicos.
- **Dados:** 768×1024.
- **Passos:** AbrirServiços; conferirGuia/título;refresh.
- **Esperado:** Título legível.
- **Obtido:** SomenteServi visível.
- **Evidência:** Registro de achado nesta sessão: Rótulo Serviços é cortado pelo Guia Passo a Passo em viewport tablet de 768 px.
- **Reprodução:** Reprodução independente registrada.

### BUG-065 — Guia corta título Clientes a320px

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /clientes.
- **Dados:** 320×568.
- **Passos:** AbrirClientes; esperar;refresh.
- **Esperado:** Título legível.
- **Obtido:** SomenteClie visível.
- **Evidência:** Registro de achado nesta sessão: Rótulo Clientes é cortado pelo Guia no cabeçalho a 320px.
- **Reprodução:** Reprodução independente registrada.

### BUG-066 — Guia corta título Agenda a375px

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /agenda.
- **Dados:** 375×812.
- **Passos:** AbrirAgenda e inspecionar barra superior.
- **Esperado:** Título legível.
- **Obtido:** Agenda cortada peloGuia.
- **Evidência:** Registro de achado nesta sessão: At 375×812, the Agenda label in the app header is clipped by the adjacent Guia control.
- **Reprodução:** Flag estático com evidência visual.

### BUG-067 — Avatar da Equipe cortado no celular

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Equipe / Proprietário QA.
- **Página:** /equipe.
- **Dados:** 375×812.
- **Passos:** AbrirEquipe nesseviewport; inspecionaravatar.
- **Esperado:** Avatar dentro da tela.
- **Obtido:** Avatar cortado à direita.
- **Evidência:** Registro de achado nesta sessão: At 375 × 812 px, the mobile Equipe header clips the account avatar at the right viewport edge..
- **Reprodução:** Flag estático com evidência visual.

### BUG-068 — Guia corta ação Iniciar Tour no tablet

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /guia.
- **Dados:** 768×1024;sidebar expandida.
- **Passos:** AbrirGuia; conferirIniciarTour; tentarrolagemhorizontal.
- **Esperado:** Rótulo completo.
- **Obtido:** Texto cortado e rolagem não revela restante.
- **Evidência:** Registro de achado nesta sessão: Guia & Tutorial cuts off the Iniciar Tour Interativo button at 768px.
- **Reprodução:** Reprodução independente registrada.

### BUG-069 — Toast cobre navegação inferior a320px

- **Severidade / tipo:** BAIXO / Responsividade/UX.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /guia.
- **Dados:** 320×568.
- **Passos:** AbrirGuia; observarnotificação inferior enquanto visível.
- **Esperado:** Toast não obstrui navegação.
- **Obtido:** Ícones/rótulos inferiores cobertos temporariamente.
- **Evidência:** Registro de achado nesta sessão: Guia notification toast overlays fixed bottom navigation at 320px.
- **Reprodução:** Reprodução independente registrada.

### BUG-070 — Texto do plano PRO é cortado no tablet

- **Severidade / tipo:** BAIXO / Responsividade.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** /planos.
- **Dados:** 768×1024;sidebar expandida.
- **Passos:** AbrirPlanos;conferirCTA PRO;refresh;compararrecolhido; não comprar.
- **Esperado:** CTA legível.
- **Obtido:** Garantir Acesso VitalícioR$59,90 cortado;recolher menu remove.
- **Evidência:** Registro de achado nesta sessão: PRO plan purchase CTA text is clipped at 768px with expanded sidebar.
- **Reprodução:** Reprodução independente registrada.

### BUG-071 — Seletores de telas do simulador truncados

- **Severidade / tipo:** BAIXO / Responsividade/demonstração.
- **Modo / perfil:** Simulador Solo / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** 1024×768;sidebar expandida.
- **Passos:** AbrirSimulador;conferirseletores;recolher/retornar estado padrão.
- **Esperado:** Legendas completas.
- **Obtido:** Várias legendas truncadas.
- **Evidência:** Registro de achado nesta sessão: Simulator screen-selector labels are truncated at 1024px viewport.
- **Reprodução:** Reprodução independente registrada.

### BUG-072 — Simulador corta ação do Meu Dia a390px

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Simulador / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** 390px;MeuDia.
- **Passos:** AbrirSimulador;selecionarMeuDia;conferirprimeirobotão.
- **Esperado:** Ação inteira visível.
- **Obtido:** Lado direito do botão cortado.
- **Evidência:** Registro de achado nesta sessão: At 390px width, the Simulador Visual's embedded Meu Dia preview clips the right side of the first appointment's action button..
- **Reprodução:** Flag estático com evidência visual.

### BUG-073 — Próxima semana do simulador não indica mudança

- **Severidade / tipo:** BAIXO / Funcional/demonstração.
- **Modo / perfil:** Simulador Equipe / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** AgendaSemanal.
- **Passos:** AbrirSimuladorAgenda;cliquepróximo;Hoje;repetir e esperar.
- **Esperado:** Indicar avanço ou explicar limitação demonstrativa.
- **Obtido:** Nenhuma indicação de mudança.
- **Evidência:** Registro de achado nesta sessão: Simulated Agenda next-week control gives no visible indication of advancing the weekly view.
- **Reprodução:** Reprodução independente registrada.

### BUG-074 — Busca do simulador não filtra clientes

- **Severidade / tipo:** BAIXO / Funcional/demonstração.
- **Modo / perfil:** Simulador Solo / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** Maria.
- **Passos:** AbrirSimuladorClientes;buscarMaria;conferirlista.
- **Esperado:** Filtrar ou informar demonstração não funcional.
- **Obtido:** Clientes sem correspondência permanecem.
- **Evidência:** Registro de achado nesta sessão: Simulator client search does not filter unrelated demo clients.
- **Reprodução:** Reprodução independente registrada.

### BUG-075 — Simulador promete Maps sem mostrar atalho

- **Severidade / tipo:** BAIXO / UX/demonstração.
- **Modo / perfil:** Simulador / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** PrimeiroatendimentoMeuDia.
- **Passos:** LerpromessaMeuDia; abrirprévia;conferircontroles; nãoabrirMaps externo.
- **Esperado:** Atalho prometido ou descrição coerente.
- **Obtido:** Endereço/WhatsApp/Concluir apenas;Maps ausente.
- **Evidência:** Registro de achado nesta sessão: Meu Dia simulator promises Google Maps shortcut but omits the control.
- **Reprodução:** Reprodução independente registrada.

### BUG-076 — Pedido de ajuste do simulador perde motivo/novo horário

- **Severidade / tipo:** BAIXO / Dados/demonstração.
- **Modo / perfil:** Simulador Solo / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** Trilha6passos;pedidomudardata/horário.
- **Passos:** Executartrilha simulada;pedirajuste;selecionarmotivo;avançarPasso6;repetir.
- **Esperado:** Notificação identifica negociação e detalhes.
- **Obtido:** Mostra dados originais sem motivo/negociação.
- **Evidência:** Registro de achado nesta sessão: Simulador Visual omits schedule-change request details in Passo 6 notification.
- **Reprodução:** Reprodução independente registrada.

### BUG-077 — Ticket médio do simulador calculado incorretamente

- **Severidade / tipo:** BAIXO / Cálculo/demonstração.
- **Modo / perfil:** Simulador Equipe / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** Juliana3030/42.
- **Passos:** AbrirRelatóriosPorProfissional;conferirJuliana;dividir3030por42;refresh/refazer.
- **Esperado:** R$72,14 com2casas.
- **Obtido:** R$72,00.
- **Evidência:** Registro de achado nesta sessão: Relatório Por Profissional mostra o ticket médio de Juliana como R$ 72,00 em vez de R$ 72,14.
- **Reprodução:** Reprodução independente registrada.

### BUG-078 — Previews divergem no repasse e lucro

- **Severidade / tipo:** BAIXO / Dados/demonstração.
- **Modo / perfil:** Simulador Equipe / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** Faturamento18250.
- **Passos:** AlternarFinanceiro eRelatóriosGeraldaCasa;comparar;repetir.
- **Esperado:** Totais correspondentes consistentes.
- **Obtido:** Financeiro10950/7300;Relatórios10200,50/8049,50.
- **Evidência:** Registro de achado nesta sessão: Totais de repasses e lucro divergem entre os previews Financeiro e Relatórios do Estúdio.
- **Reprodução:** Reprodução independente registrada.

### BUG-079 — Agenda demonstrativa de Carla conta4 e mostra2

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Simulador Equipe / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** Carla;10hCamila;14:30Renata.
- **Passos:** SimuladorEquipe/Parceiros;CelulardaParceiraCarla;inspecionarpréviacompleta.
- **Esperado:** Contagem corresponde à lista ou informa amostra parcial.
- **Obtido:** 4ClientesMarcados;2cartões;semindicadorparcial.
- **Evidência:** Registro de achado nesta sessão: Carla's simulated agenda says 4 clients are booked today but displays only two appointments.
- **Reprodução:** Flag estático com evidência visual.

### BUG-080 — Simulador usa plural para1atendimento

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Simulador / Demonstração, sem papel autenticado real.
- **Página:** /guia.
- **Dados:** 1atendimentos.
- **Passos:** AbrirpréviaClientes noSimulador;lercontagemsingular.
- **Esperado:** 1atendimento.
- **Obtido:** 1atendimentos.
- **Evidência:** Registro de achado nesta sessão: Clientes simulator preview uses incorrect singular grammar: “1 atendimentos”.
- **Reprodução:** Flag estático com evidência visual.

### BUG-081 — Profissão personalizada Casa recebe sugestõesPets

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Individual / Proprietário QA.
- **Página:** Onboarding.
- **Dados:** CasaManutenção;profissãoQA personalizada.
- **Passos:** SelecionarCasaManutenção;informarprofissãopersonalizada;avançarsugestões.
- **Esperado:** Sugestões compatíveis ou neutras.
- **Obtido:** ServiçosPets no painel.
- **Evidência:** Registro de achado nesta sessão: O painel “Sugestões prontas para QA Profissao f26a” exibe serviços de cuidados com pets após selecionar a área Casa e Manutenção e informar uma profissão personalizada..
- **Reprodução:** Flag estático com evidência visual.

### BUG-082 — Guia de migração Equipe tem título Individual

- **Severidade / tipo:** BAIXO / Visual estático.
- **Modo / perfil:** Equipe/guia / Proprietário QA.
- **Página:** /guia.
- **Dados:** GuiamigraçãoEquipe.
- **Passos:** AbrirguiaMigraçãoparaEquipe;ler título.
- **Esperado:** Título descreveEquipe.
- **Obtido:** Título afirmaModoIndividual.
- **Evidência:** Registro de achado nesta sessão: O título do guia de migração para Equipe afirma que explica o Modo Individual.
- **Reprodução:** Flag estático com evidência visual.


### BUG-083 — Financeiro mostra saldo zero e lista vazia com gráfico positivo

- **Severidade:** ALTO.
- **Tipo:** Dados/financeiro.
- **Modo:** Equipe.
- **Perfil:** Proprietário QA (Equipe A).
- **Página:** /financeiro e /app.
- **Dados:** Equipe A Teste QA: recebido mensal200; gráfico dia02=100 e dia05=200; filtros De/Até vazios..
- **Passos:** Abrir Visão geral e anotar Recebido no mês200; abrir Financeiro com filtros vazios; conferir cartões e Movimentações; passar sobre gráfico Saldo acumulado nos dias02 e05; atualizar; ir à Visão geral e Voltar..
- **Esperado:** Cartões, movimentações e gráfico devem reconciliar os lançamentos representados no período..
- **Obtido:** Recebido/Pendente/Despesas/Saldo=0; Nenhuma movimentação registrada; gráfico saldo100/200 e dashboard recebido200. Inconsistência persiste após refresh e retorno..
- **Evidência:** Registro de achado nesta sessão: Financeiro summary cards and movements show zero while accumulated-balance chart shows R$ 200,00.
- **Reprodução:** Reprodução independente registrada; causa de código não verificada..

## Conclusão

Não recomendo tratar a aplicação como aprovada sem corrigir e retestar primeiro duplicidades financeiras, reconciliação de indicadores, disponibilidade/datas e unicidade de slug. As principais jornadas foram verificadas nos dois modos; permissões reais de membro/limitado e portal PRO seguem explicitamente não verificadas. Simulador, dados reais da aplicação e limitações de ferramenta foram diferenciados. Nenhuma mensagem, cobrança ou pagamento real foi executado.
