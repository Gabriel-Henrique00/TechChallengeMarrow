CREATE TABLE IF NOT EXISTS clientes (
                                        id           CHAR(36)     PRIMARY KEY,
    nome         VARCHAR(150) NOT NULL,
    email        VARCHAR(200) NOT NULL UNIQUE,
    telefone     VARCHAR(20),
    documento    VARCHAR(14),
    criado_em    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS pagamentos (
                                          id              CHAR(36)       PRIMARY KEY,
    cliente_id      CHAR(36)       NOT NULL,
    nome            VARCHAR(200)   NOT NULL,
    descricao       VARCHAR(500),
    valor           DECIMAL(10,2)  NOT NULL,
    valor_pago      DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    status          ENUM('AGUARDANDO_PAGAMENTO','PAGO','NAO_AUTORIZADO','CANCELADO','VENCIDO')
    DEFAULT 'AGUARDANDO_PAGAMENTO',
    id_externo      VARCHAR(100),
    data_vencimento DATETIME,
    criado_em       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

CREATE TABLE IF NOT EXISTS tentativas_transacao (
                                                    id                  CHAR(36)      PRIMARY KEY,
    pagamento_id        CHAR(36)      NOT NULL,
    status              ENUM('PROCESSANDO','SUCESSO','FALHA','NAO_AUTORIZADO')
    DEFAULT 'PROCESSANDO',
    id_banco            VARCHAR(100),
    banco_nome          VARCHAR(150),
    referencia_externa  VARCHAR(100),
    motivo_falha        VARCHAR(500),
    valor_tentativa     DECIMAL(10,2),
    resposta_webhook    JSON,
    data_tentativa      DATETIME,
    criado_em           DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id)
    );