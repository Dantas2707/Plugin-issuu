# Plugin-issuu
Este plugin foi desenvolvido para baixar revistas hospedadas no Issuu.

ISSUU → PDF Downloader

Ferramenta que pega uma publicação do ISSUU via URL parcial, extrai os IDs necessários, baixa as páginas uma a uma (com delays para contornar rate-limits e formatos inesperados como WebP), e monta um único PDF usando PDF-Lib.

Visão geral:
1. O usuário fornece o complemento da URL do ISSUU (ex: jornalcana/docs/jornalcana_358_agosto_setembro_2025_) e o número total de páginas.
2. O sistema consulta a página via proxy (AllOrigins) para contornar CORS.
3. Extrai publicationId e revisionId com regex.
4. Monta URLs de imagens (page_{n}.jpg), baixa sequencialmente com delay de 2 segundos entre elas.
5. Converte WebP para PNG quando necessário e embute cada imagem no PDF.
6. Aplica delay de 2 segundos entre adições de páginas e antes do salvamento final.
7. Gera e dispara o download do PDF consolidado.

Pré-requisitos:
- Navegador moderno (Chrome, Firefox, etc.).
- Rodar via servidor HTTP local (não usar file://). Exemplo:
  python -m http.server 8000
- Ter o arquivo pdf-lib.min.js em js/pdf-lib.min.js (baixado de https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js).

Instalação / Setup:
1. Coloque os arquivos conforme a estrutura abaixo.
2. Inicie um servidor local na raiz do projeto:
   python -m http.server 8000
3. Abra no navegador: http://localhost:8000

Estrutura de arquivos:
projeto/
├── index.html            # Interface do usuário
├── js/
│   ├── pdf-lib.min.js    # Biblioteca PDF-Lib local
│   ├── utils.js          # Funções auxiliares (ex: showOutput)
│   ├── pdfGenerator.js   # Lógica de montar o PDF (conversão WebP, delays, embutir)
│   ├── api.js            # Extração de IDs, montagem de URLs e orquestração
│   └── main.js           # Captura do clique e início do fluxo
└── style.css (opcional)  # Estilo da interface

Uso:
1. Insira o complemento da URL após issuu.com/, por exemplo:
   jornalcana/docs/jornalcana_358_agosto_setembro_2025_
2. Informe o número de páginas que deseja incluir.
3. Clique em "Baixar PDF".
4. O sistema irá buscar os IDs, montar os URLs, baixar as imagens com delays, converter WebP se necessário, gerar o PDF e baixar automaticamente.

Detalhes técnicos:
Proxy / CORS:
A página do ISSUU é consultada via:
https://api.allorigins.win/get?url=<URL_ENCODED_DO_ISSUU>
Isso encapsula o HTML e adiciona cabeçalhos que permitem leitura no navegador.

Extração de IDs:
Usa-se a regex:
/publicationId\\\":\\\"([a-f0-9]+)\\\".*?revisionId\\\":\\\"(\d+)\\\"/
para capturar publicationId e revisionId na ordem correta.
A base da URL de imagem é:
https://image.isu.pub/{revisionId}-{publicationId}/jpg/page_{pagina}.jpg

Conversão WebP → PNG:
Apesar da extensão .jpg, o servidor pode responder com image/webp. O sistema detecta pelo content-type e, se for WebP, converte para PNG via canvas (quando permitido por CORS) antes de embutir no PDF.

Geração de PDF:
Usa PDF-Lib para criar o documento. Cada imagem válida é embutida com delay de 2 segundos entre adições. Após um delay final de 2 segundos, o PDF é salvo e o download é iniciado automaticamente.
